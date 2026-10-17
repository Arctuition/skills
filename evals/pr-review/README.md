# PR review development cases

Ten scoped historical cases from `Arctuition/cloudservice`: four defects, four
repair re-reviews, one accepted operational tradeoff, and one clean cleanup scope.
They cover five PR families. This is a small development set, not evidence that
the reviewer is ready for unattended merge or a statistically representative
benchmark. Cases from the same PR are correlated.

## Inputs and answers

- `cases.json` contains immutable base/head SHAs, neutral requests, focus paths,
  and, for re-review, the previous head and original finding. User context is
  supplied only where the task depends on an explicit operational decision.
- `expectations.json` is **scorer-only**: root causes, expected dispositions,
  source/test evidence, verification dates and limits. Do not send it to the
  reviewer or copy it into an installed skill.
- `prepare_case.py` exports tracked source snapshots, diffs, the candidate skill
  and a request into a new directory. It does not include Git history, PR comments
  or the answer file, and never replaces a missing historical commit with HEAD.
  Snapshots contain private repository source; keep the packets local.

## Run a case

Use Python 3.9+, Git and tar, with a local cloudservice clone that contains the
listed commits. No database, credentials or network access is needed to prepare
a packet. Runtime reproductions may need the historical application's dependencies.

```bash
python3 evals/pr-review/prepare_case.py case-002 \
  --repo /path/to/cloudservice \
  --output /tmp/pr-review-case-002
```

Give an independent reviewer only that packet and this request:

> Read request.md and complete the review using skill/SKILL.md. Return your
> findings, evidence, reviewed revisions and validation limits.

The first review receives no suspected bug or repair hint. Re-review cases receive
the original finding because verifying it is the task. Keep the answer file,
this guide and results from other cases out of the reviewer's context. The packet
contains a full diff and source so a reviewer can trace relevant callers; its
request deliberately limits which contracts are scored.

To compare candidates, export an older skill into a separate folder and supply
`--skill /path/to/candidate/pr-code-review`. Use the same cases, available tools,
runtime, model settings and resource budget. Record the model/settings, packet's
skill fingerprints, raw answer, elapsed time and any tool/runtime failures.
An evaluator may use a separately supplied Python interpreter for installed third-party
dependencies, while application source must still come only from the packet.
Run each case in fresh context; do not let a defect's answer prime its repair case.
Keep all cases from one PR family together when splitting tuning and held-out
sets. These ten cases are for development; collect fresh families for a holdout.

## Score decisions, not wording

After the answer is saved, have a scorer read `expectations.json`:

1. For defect cases, require the root cause, reachable consequence and useful
   source evidence. A vague suspicion or unrelated style complaint is not a hit.
2. For repair cases, require verification of the original contract and no stale
   repetition. Source reasoning can be valid evidence; claiming an unrun
   reproduction passed is a separate failure. Record unavailable checks.
3. For clean/accepted-tradeoff cases, count unsupported actionable findings and
   whether they would prompt unnecessary or harmful code changes. A residual
   risk explicitly kept non-blocking is not the same as a requested fix.
4. Adjudicate additional findings against the source before calling them false
   positives; this answer set is not an exhaustive proof of correctness.

Report defect recall (out of four), stale repeats on repairs (out of four),
false-positive cases on the two controls, harmful/unnecessary fix requests,
unsupported validation claims, human adjudication time and reviewer time/cost.
Report raw counts alongside rates. Do not combine the four correlated KS cases
into evidence of broad domain coverage.

For a live fix-loop pilot, also record completed fix/re-review rounds, duplicate
root causes and human decisions. This static set does **not** measure convergence
over an autonomous multi-round run. At round three, verify the strategy is
reassessed while authorized work and genuine unresolved findings remain active;
the checkpoint must not silently grant approval, stop, or claim completion.

## Curation evidence and limits

On 2026-10-17, all case SHAs, focus paths, merge-base diffs and repair references
were checked against local Git objects. The PDF case's unchanged historical
`flatten_pdf` functions were executed with real PDF libraries: base and repair
flattened the stamp; the defective head left it unflattened. The migration graph
was reconstructed from each historical tree and changed from two heads to one.
The merge revision is introduced by `31ea69a...`, not the later `d3266fba...` cleanup.

KS and cleanup labels were checked against source and the relevant regression
tests/registrations; their application/database tests were not rerun during
curation. The alert case includes the owner's accepted tradeoff rather than
pretending the injected failure is impossible. No current GitHub CI, mergeability,
production state or reviewer benchmark score is asserted by this dataset.

Two independent forward checks were also run on cases 002 and 004. The first
found the PDF reader-disagreement regression through a different synthetic input.
The second respected the accepted enqueue-failure decision and independently
reproduced a separate Redis test-isolation defect. Case 004's expectations now
allow that supported finding; its zero-finding target applies to the accepted
concern, not the entire PR. These are smoke checks, not an old/new candidate
comparison or a complete ten-case benchmark.
