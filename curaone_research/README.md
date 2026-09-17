# CuraOne Research Benchmark Package

## Purpose
This package contains a reproducible offline retrieval benchmark built from the Synthea dataset already shipped with the CuraOne repository. It is intended to support the research paper's empirical section and to provide source-backed figures rather than AI-generated numerical charts.

## Important scope
- Clinical records in this benchmark come from the project's Synthea CSV files.
- The 69-patient cohort follows the cohort rule already documented in the project: at least 2 distinct hospitals and at least 5 encounters, ranked by hospital count and encounter count.
- Authorization labels are **experimental annotations**, not source-dataset facts.
- For each patient, the requesting hospital is the patient's highest-volume hospital and one external hospital is treated as having an active approved grant. Remaining hospitals are treated as unauthorized for the trial.
- Queries are deterministic templates built from the source encounter's documented `REASONDESCRIPTION` when available; no synthetic diagnosis/medication/lab values are created.
- The retrieval baseline is a NumPy TF-IDF lexical retriever. It is not an LLM and should be described as a lexical baseline.
- The benchmark compares unrestricted ranking against authorization-first candidate filtering.
- Timing values are offline Python benchmark timings, not production PostgreSQL/API latency.

## Current benchmark
- 69 patients
- 19,657 clinical events from the six event families used by CuraOne
- 370 deterministic benchmark queries
- Top-K = 3, 5, 7, 10
- Metrics: Precision@K, Recall@K, MRR, unauthorized-retrieval rate

## Reproducibility
Run:

```bash
python scripts/run_benchmark.py
python scripts/statistical_analysis.py
python scripts/make_figures.py
```

## Results
The CSV files in `results/` are the source of the plotted figures. Do not manually edit the numerical values in the paper.

## Publication caution
These results support an **offline research benchmark**. Before claiming that the deployed CuraOne application itself achieved these values, the same benchmark logic should be integrated with the actual database/retrieval implementation and rerun against the deployed stack.
