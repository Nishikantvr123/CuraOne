import pandas as pd, numpy as np, matplotlib.pyplot as plt, os
from pathlib import Path
OUT=Path('/mnt/data/curaone_research')
FIG=OUT/'figures'; FIG.mkdir(exist_ok=True)
summary=pd.read_csv(OUT/'results/benchmark_summary.csv')
events=pd.read_csv(OUT/'results/cohort_events.csv')
timing=pd.read_csv(OUT/'results/benchmark_timing.csv')

# 1. Clinical event composition
counts=events['event_type'].value_counts().sort_values(ascending=True)
plt.figure(figsize=(7.2,4.6))
plt.barh(counts.index, counts.values)
plt.xlabel('Number of clinical events')
plt.ylabel('Event type')
plt.title('CuraOne research cohort: clinical event composition')
plt.tight_layout(); plt.savefig(FIG/'fig1_event_composition.png',dpi=300,bbox_inches='tight'); plt.close()

# 2. Precision@K
for metric,title,ylabel,file in [
    ('precision','Precision@K by retrieval condition','Precision','fig2_precision_at_k.png'),
    ('recall','Recall@K by retrieval condition','Recall','fig3_recall_at_k.png'),
    ('mrr','Mean reciprocal rank by retrieval condition','MRR','fig4_mrr.png'),
    ('unauthorized_rate','Unauthorized retrieval rate by retrieval condition','Unauthorized retrieval rate','fig5_unauthorized_rate.png')]:
    plt.figure(figsize=(7.2,4.6))
    for method in ['unrestricted','authorization_first']:
        d=summary[summary.method==method].sort_values('k')
        plt.plot(d.k, d[metric], marker='o', label=method.replace('_',' ').title())
    plt.xticks([3,5,7,10]); plt.xlabel('Top-K')
    plt.ylabel(ylabel)
    plt.title(title)
    plt.grid(True,alpha=.25); plt.legend(); plt.tight_layout()
    plt.savefig(FIG/file,dpi=300,bbox_inches='tight'); plt.close()

# 6. Timing / candidate set
means=timing[['unrestricted_ms','authorization_ms','authorization_first_ms','total_auth_first_ms']].mean()
labels=['Unrestricted\nranking','Authorization\nfilter','Authorized\nranking','Auth-first\ntotal']
vals=means.values
plt.figure(figsize=(7.2,4.6))
plt.bar(labels,vals)
plt.ylabel('Execution time (ms)')
plt.title('Offline benchmark execution timing')
plt.tight_layout(); plt.savefig(FIG/'fig6_timing.png',dpi=300,bbox_inches='tight'); plt.close()

# Candidate-set reduction chart
all_c=timing.all_candidates.to_numpy(); auth_c=timing.authorized_candidates.to_numpy()
reduction=(1-auth_c/all_c)*100
plt.figure(figsize=(7.2,4.6))
plt.hist(reduction,bins=15)
plt.xlabel('Candidate-set reduction (%)')
plt.ylabel('Number of queries')
plt.title('Authorization-first candidate-set reduction')
plt.tight_layout(); plt.savefig(FIG/'fig7_candidate_reduction.png',dpi=300,bbox_inches='tight'); plt.close()

print('Created', len(list(FIG.glob('*.png'))), 'figures in', FIG)
print('Mean candidate reduction:', reduction.mean())
