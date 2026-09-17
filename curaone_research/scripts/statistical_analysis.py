import pandas as pd, numpy as np, json
from pathlib import Path
OUT=Path('/mnt/data/curaone_research')
df=pd.read_csv(OUT/'results/benchmark_metrics_long.csv')
rows=[]
rng=np.random.default_rng(20260917)
for k in sorted(df.k.unique()):
    for metric in ['precision','recall','mrr','unauthorized_rate']:
        a=df[(df.method=='unrestricted')&(df.k==k)].set_index('query_id')[metric]
        b=df[(df.method=='authorization_first')&(df.k==k)].set_index('query_id')[metric]
        common=a.index.intersection(b.index)
        diff=(b.loc[common]-a.loc[common]).to_numpy()
        boots=[]
        for _ in range(5000):
            boots.append(np.mean(rng.choice(diff,size=len(diff),replace=True)))
        lo,hi=np.percentile(boots,[2.5,97.5])
        rows.append({'k':k,'metric':metric,'n_queries':len(diff),'unrestricted_mean':float(a.loc[common].mean()),'authorization_first_mean':float(b.loc[common].mean()),'paired_difference':float(diff.mean()),'bootstrap_ci_low':float(lo),'bootstrap_ci_high':float(hi)})
out=pd.DataFrame(rows)
out.to_csv(OUT/'results/paired_bootstrap_analysis.csv',index=False)
print(out.to_string(index=False))
