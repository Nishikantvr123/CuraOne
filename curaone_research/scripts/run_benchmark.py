import os, re, json, time, random
from collections import Counter, defaultdict
import numpy as np
import pandas as pd

ROOT = '/mnt/data/curaone_work/CuraOne-2-branch/dataset/csv'
OUT = '/mnt/data/curaone_research'
SEED = 20260917
rng = random.Random(SEED)
K_VALUES = [3, 5, 7, 10]
TARGET_PATIENTS = 69
QUERIES_PER_PATIENT = 10

STOP = set('''a an and are as at be been by for from has have in is it its of on or that the their this to was were with without patient patients history current long term use unspecified other due no not encounter care plan procedure medication medications diagnosis diagnosis of'''.split())

def tokens(text):
    text = str(text).lower()
    return re.findall(r'[a-z][a-z0-9-]{2,}', text)

def load_events():
    enc = pd.read_csv(os.path.join(ROOT, 'encounters.csv'), usecols=['Id','PATIENT','ORGANIZATION','START','DESCRIPTION','REASONDESCRIPTION'])
    stats = enc.groupby('PATIENT').agg(hospitals=('ORGANIZATION','nunique'), encounters=('ORGANIZATION','size')).reset_index()
    cohort = stats[(stats.hospitals >= 2) & (stats.encounters >= 5)].sort_values(['hospitals','encounters'], ascending=[False,False]).head(TARGET_PATIENTS).PATIENT.tolist()
    cohort_set = set(cohort)
    frames=[]
    for fname, etype in [
        ('conditions.csv','CONDITION'),('medications.csv','MEDICATION'),('allergies.csv','ALLERGY'),
        ('procedures.csv','PROCEDURE'),('careplans.csv','CAREPLAN'),('immunizations.csv','IMMUNIZATION')]:
        df = pd.read_csv(os.path.join(ROOT, fname))
        df = df[df.PATIENT.isin(cohort_set)].copy()
        if 'ENCOUNTER' not in df.columns: continue
        df = df[df.ENCOUNTER.notna()]
        date_col = 'START' if 'START' in df.columns else ('DATE' if 'DATE' in df.columns else None)
        df['event_type'] = etype
        df['description'] = df['DESCRIPTION'].fillna('').astype(str)
        df['date'] = pd.to_datetime(df[date_col], errors='coerce') if date_col else pd.NaT
        frames.append(df[['PATIENT','ENCOUNTER','DESCRIPTION','event_type','date']])
    events = pd.concat(frames, ignore_index=True)
    events = events.merge(enc[['Id','ORGANIZATION']], left_on='ENCOUNTER', right_on='Id', how='left')
    events = events.rename(columns={'ORGANIZATION':'hospital'})
    events = events.reset_index(drop=True)
    events['event_id'] = np.arange(len(events))
    return events, enc, cohort

def build_queries(events, enc, cohort):
    # Queries are derived from the source encounter's documented reason when available.
    # This avoids invented clinical facts while keeping query construction deterministic.
    queries=[]
    # Map encounter -> reason from the original Synthea encounter table.
    reason_map = enc.set_index('Id')['REASONDESCRIPTION'].to_dict()
    by_patient = events.groupby('PATIENT')
    for pid in cohort:
        pe = by_patient.get_group(pid)
        hosp_counts = pe.groupby('hospital').size().sort_values(ascending=False)
        if len(hosp_counts) < 2: continue
        requesting = hosp_counts.index[0]
        external = list(hosp_counts.index[1:])
        # One active external grant per patient mirrors a concrete cross-hospital grant.
        authorized_external = set(external[:1])
        authorized_hospitals = {requesting} | authorized_external
        eligible_enc = pe[pe.hospital.isin(authorized_hospitals)].groupby('ENCOUNTER').size()
        # Select encounters that have a documented reason and at least one clinical event.
        candidates=[]
        for enc_id in eligible_enc.index:
            reason = str(reason_map.get(enc_id) or '').strip()
            if reason and reason.lower() != 'nan':
                candidates.append((enc_id, reason))
        if len(candidates) < QUERIES_PER_PATIENT:
            continue
        # Deterministic spread across the patient's eligible encounters.
        picks = [candidates[i] for i in np.linspace(0, len(candidates)-1, QUERIES_PER_PATIENT, dtype=int)]
        for enc_id, reason in picks:
            eh = pe[pe.ENCOUNTER==enc_id].iloc[0]
            query = f"clinical history related to {reason}"
            queries.append({
                'query_id': f"Q{len(queries)+1:04d}",
                'patient_id': pid,
                'query_event_id': int(eh.event_id),
                'query_encounter_id': enc_id,
                'query_hospital': eh.hospital,
                'requesting_hospital': requesting,
                'authorized_external_hospitals': sorted(authorized_external),
                'query': query,
            })
    return queries

def make_corpus(events):
    # TF-IDF vectors computed per patient using NumPy. This is a reproducible lexical baseline, not an LLM.
    corpora={}
    for pid, g in events.groupby('PATIENT'):
        docs=[]; ids=[]
        for _, r in g.iterrows():
            txt = f"{r.event_type} {r.DESCRIPTION}"
            toks = [t for t in tokens(txt) if t not in STOP]
            docs.append(toks); ids.append(int(r.event_id))
        vocab=sorted(set(t for d in docs for t in d))
        vi={t:i for i,t in enumerate(vocab)}
        X=np.zeros((len(docs),len(vocab)),dtype=np.float32)
        for i,d in enumerate(docs):
            c=Counter(d)
            for t,n in c.items(): X[i,vi[t]]=n
        df=(X>0).sum(axis=0)
        idf=np.log((len(docs)+1)/(df+1))+1
        X*=idf
        norms=np.linalg.norm(X,axis=1,keepdims=True); norms[norms==0]=1
        X/=norms
        corpora[pid]={'ids':np.array(ids,dtype=np.int64),'X':X,'vocab':vi}
    return corpora

def query_vector(query, vocab, idf=None):
    q=np.zeros(len(vocab),dtype=np.float32)
    ts=[t for t in tokens(query) if t not in STOP]
    c=Counter(ts)
    for t,n in c.items():
        if t in vocab: q[vocab[t]]=n
    norm=np.linalg.norm(q)
    return q/norm if norm else q

def authorized_mask(events_pid, requesting, authorized_external):
    auth_h = {requesting} | set(authorized_external)
    return events_pid.hospital.isin(auth_h).to_numpy()

def metrics_for_ranked(ranked_ids, relevant_ids, authorized_ids, k):
    top=ranked_ids[:k]
    rel=[x for x in top if x in relevant_ids]
    prec=len(rel)/k
    recall=len(rel)/len(relevant_ids) if relevant_ids else 0.0
    rr=0.0
    for rank,x in enumerate(top,1):
        if x in relevant_ids:
            rr=1.0/rank; break
    unauth=sum(x not in authorized_ids for x in top)/k
    return prec, recall, rr, unauth

def run():
    events, enc, cohort = load_events()
    queries=build_queries(events, enc, cohort)
    corpora=make_corpus(events)
    event_by_id=events.set_index('event_id')
    rows=[]
    for q in queries:
        pid=q['patient_id']; g=events[events.PATIENT==pid]
        c=corpora[pid]
        qv=query_vector(q['query'], c['vocab'])
        scores=c['X']@qv
        order=np.argsort(-scores, kind='stable')
        all_ids=c['ids'][order].tolist()
        authmask=authorized_mask(g, q['requesting_hospital'], q['authorized_external_hospitals'])
        auth_ids=set(g.loc[authmask,'event_id'].astype(int))
        # Relevant evidence = events belonging to the same encounter as the query event, restricted to authorized scope.
        rel_ids=set(g[g.ENCOUNTER==q['query_encounter_id']]['event_id'].astype(int)) & auth_ids
        if not rel_ids: continue
        auth_order=[i for i in all_ids if i in auth_ids]
        for method, ranked in [('unrestricted',all_ids),('authorization_first',auth_order)]:
            for k in K_VALUES:
                p,r,mrr,ur=metrics_for_ranked(ranked, rel_ids, auth_ids, k)
                rows.append({
                    'query_id':q['query_id'],'patient_id':pid,'method':method,'k':k,
                    'precision':p,'recall':r,'mrr':mrr,'unauthorized_rate':ur,
                    'candidate_count':len(all_ids) if method=='unrestricted' else len(auth_ids),
                    'authorized_candidate_count':len(auth_ids),
                })
    result=pd.DataFrame(rows)
    # Timing benchmark separately to avoid mixing vectorization cost with per-query ranking latency.
    timing=[]
    for q in queries:
        pid=q['patient_id']; g=events[events.PATIENT==pid]; c=corpora[pid]
        qv=query_vector(q['query'], c['vocab'])
        t0=time.perf_counter(); scores=c['X']@qv; order=np.argsort(-scores,kind='stable'); unrestricted=c['ids'][order]; t1=time.perf_counter()
        t2=time.perf_counter(); mask=authorized_mask(g,q['requesting_hospital'],q['authorized_external_hospitals']); auth_ids=set(g.loc[mask,'event_id'].astype(int)); t3=time.perf_counter()
        auth_order=np.array([i for i in unrestricted if i in auth_ids],dtype=np.int64); t4=time.perf_counter()
        timing.append({'query_id':q['query_id'],'patient_id':pid,'unrestricted_ms':(t1-t0)*1000,'authorization_ms':(t3-t2)*1000,'authorization_first_ms':(t4-t3)*1000,'total_auth_first_ms':(t4-t2)*1000,'all_candidates':len(unrestricted),'authorized_candidates':len(auth_ids)})
    timing=pd.DataFrame(timing)
    summary=result.groupby(['method','k'])[['precision','recall','mrr','unauthorized_rate']].mean().reset_index()
    timing_summary=timing[['unrestricted_ms','authorization_ms','authorization_first_ms','total_auth_first_ms','all_candidates','authorized_candidates']].mean().to_dict()
    os.makedirs(os.path.join(OUT,'results'),exist_ok=True)
    events.to_csv(os.path.join(OUT,'results','cohort_events.csv'),index=False)
    pd.DataFrame(queries).to_csv(os.path.join(OUT,'results','benchmark_queries.csv'),index=False)
    result.to_csv(os.path.join(OUT,'results','benchmark_metrics_long.csv'),index=False)
    summary.to_csv(os.path.join(OUT,'results','benchmark_summary.csv'),index=False)
    timing.to_csv(os.path.join(OUT,'results','benchmark_timing.csv'),index=False)
    with open(os.path.join(OUT,'results','benchmark_metadata.json'),'w') as f:
        json.dump({'seed':SEED,'cohort_patients':len(cohort),'event_count':len(events),'query_count':len(queries),'k_values':K_VALUES,'query_definition':'Query generated from an authorized event description; relevant set is events from the same encounter intersected with the authorization scope.','authorization_policy':'Requesting hospital plus first two external hospitals by event volume are authorized; remaining hospitals are unauthorized experimental annotations.','note':'This benchmark uses Synthea data already included in the CuraOne repository. Authorization labels are experimental annotations and are not source-dataset facts.'},f,indent=2)
    print('EVENTS',len(events),'PATIENTS',len(cohort),'QUERIES',len(queries),'ROWS',len(result))
    print(summary.to_string(index=False))
    print('TIMING',json.dumps(timing_summary,indent=2))

if __name__=='__main__': run()
