---
name: pr-code-review
description: Perform GitHub pull request code reviews using the gh CLI. Use when asked to review a PR, inspect PR diffs, leave inline review comments on specific lines, or produce a priority-based summary (P0-P3) of findings with an overall correctness verdict. Also use for "interactive review" / "manual review" flows where the user wants to discuss findings before anything is posted to GitHub.
---

# PR Code Review

Review GitHub PRs using the gh CLI. Post inline comments tied to specific code lines, use GitHub suggestion blocks for trivial fixes, and submit everything as a single batched review with a verdict. All gh CLI patterns — repo context, PR metadata, diff inspection, Reviews API payload, suggestion syntax, line-number mapping, fallback commands — live in [references/gh-cli.md](references/gh-cli.md).

## Workflow overview

0. Pick a mode — auto-post or interactive.
1. Understand the PR and run pre-checks.
2. Get the diff and identify high-risk areas.
3. Read changed files in full context.
4. Analyze using the structured checklist.
5. Draft findings with proper tone.
6. Submit a single batched review — or, in interactive mode, draft → discuss → post, then stay engaged for follow-up comments until the user closes the session.
7. Output a severity summary (in interactive mode, re-rendered after each post).

## 0) Mode selection

Pick a mode before reading code; tell the user which one in one sentence.

**Interactive mode (manual / "手动挡")** — draft locally, discuss, post on approval, then stay engaged so the human can surface more issues that you (when you both agree) post as follow-ups. Ends only when the user says so. Trigger phrases: "interactive", "manual / 手动 / 手动挡", "discuss / 讨论 / 商量", "don't post / 先别 post", "draft", "preview", "ask me before posting". Default to interactive whenever the user implies any preview or approval step.

**Auto-post mode (default)** — only when the user clearly wants a one-shot review with no preview step. When in doubt, ask one short clarifying question.

## Step-by-step

### 1) Understand the PR and run pre-checks

Capture repo context and the head commit SHA — referenced throughout:

```bash
OWNER_REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
COMMIT_SHA=$(gh pr view <pr> --json headRefOid --jq .headRefOid)
```

Read PR metadata (title, body, linked issue, file list, churn) — commands in [references/gh-cli.md](references/gh-cli.md#pr-metadata). Capture:

- **What/Why** the PR claims to do (title, body, linked issue).
- **Scope** — file count, lines added/removed. Calibrate scrutiny: a typo fix needs less than a new auth middleware.
- **Spec docs in the PR** — does the diff include a plan / spec / ARD / design doc (e.g. `*.md` under `docs/`, `plans/`, `specs/`, `adr/`, `ard/`, or files named `PLAN.md`, `SPEC.md`, `DESIGN.md`)? If so, treat them as the **source of truth** for intent and flag drift in step 4. Read them in full before reading the code.

**Pre-checks:**
- `gh pr checks <pr>` — if CI is failing, focus on the failure cause rather than a full review.
- Fetch existing reviews/comments (see references) so you don't duplicate feedback.

### 2) Get the diff and prioritize

```bash
gh pr diff <pr> --name-only
gh pr diff <pr> --patch --color=never > /tmp/pr.diff  # for large PRs
```

**Prioritize:** business logic, auth, payments, data mutations; high-churn files; new files (need full design review); config/infra/CI/permissions.

**Deprioritize/skip:** auto-generated files (lock files, snapshots, generated migrations); pure formatting/rename; vendor updates (unless pinning matters).

### 3) Read changed files in context

For non-trivial changes, read the full file (or surrounding function/class) — not just the diff — to understand the before-state, broader module, and any new inconsistencies with nearby code.

If already on the PR branch, use Read directly. Otherwise `gh pr checkout <pr>`, or fetch one file at HEAD:
```bash
gh api repos/$OWNER_REPO/contents/<path>?ref=$COMMIT_SHA --jq '.content' | base64 -d
```

### 4) Analyze using the review checklist

**Before flagging an issue, apply the "should I flag this?" test:**

1. Meaningfully impacts correctness, performance, security, or maintainability.
2. Discrete and actionable — not vague, not bundled.
3. Introduced in this PR — don't flag pre-existing issues (mention in review body if important).
4. Doesn't demand a level of rigor absent from the rest of the codebase.
5. The author would likely fix it if aware.
6. Doesn't rely on unstated assumptions about codebase or author intent.
7. Provably a problem — identify the affected code, not "this *may* break".
8. Clearly not an intentional choice.

If a finding fails any test, don't post it. If there are no findings a person would definitely want to fix, output zero — an empty review is better than a noisy one.

For each changed file, systematically check:

**Correctness**
- Does the logic match the stated intent?
- **Spec drift (when the PR includes a plan / spec / ARD / design doc)** — walk every requirement, API shape, and decision against the code; missing/renamed/extra behavior is itself a P1/P2 finding, cite the doc section. If the doc was edited in this PR, check whether the edit is justified or was back-fitted to match the code.
- Edge cases (nulls, empty collections, boundary values).
- Error paths (not swallowed, not leaking internals).

**Security**
- Input validation on trust boundaries.
- No secrets, credentials, or PII in code.
- Safe handling of auth tokens, sessions, permissions.
- No injection (SQL, XSS, command, path traversal).

**Reliability**
- Concurrency safety (races, shared mutable state).
- Resource cleanup (connections, file handles, subscriptions).
- Retry/timeout behavior (infinite loops, missing backoff).
- Failure modes (what happens when a dependency is down?).

**Performance**
- N+1 queries, missing indexes for new query patterns.
- Unnecessary allocations in hot paths.
- Missing pagination for unbounded result sets.

**API design & contracts**
- Breaking changes to public APIs.
- Consistent naming and parameter ordering.
- Backward compatibility where expected.

**Tests**
- Are new code paths covered?
- Do tests assert meaningful behavior, not just "no crash"?
- Are correctness-check edge cases tested?

**Clarity**
- Could a teammate understand this in 6 months?
- Descriptive names, consistent abstraction level.
- Only flag style if it causes genuine confusion.

### 5) Draft findings

For each issue, record:
- **Priority** — P0 / P1 / P2 / P3.
- **File path** and **line number** — see [line-number mapping](references/gh-cli.md#unified-diff-line-number-mapping) for converting diff hunks to absolute lines.
- **Title** — imperative, ≤80 chars, priority-tag prefix (e.g. `[P1] Add max-attempts guard to retry loop`).
- **Body** — one paragraph explaining *why* and the scenarios/inputs that trigger it.
- **Suggestion** — `suggestion` block for concrete replacements.

**Priority definitions:**
- **P0** — Drop everything. Blocks release. Universal issues only — no input-dependent assumptions.
- **P1** — Urgent. Correctness bugs, security, data loss. Address next cycle.
- **P2** — Normal. Reliability, performance, missing error handling, API design.
- **P3** — Low. Clarity, minor style, optional refactors.

**Comment writing rules:**
1. Body ≤ one paragraph. No unnecessary line breaks.
2. State the scenarios/inputs needed for the issue to manifest — severity depends on these.
3. No code chunks >3 lines in the body. Use `suggestion` blocks for concrete fixes.
4. `suggestion` blocks contain ONLY replacement code, no commentary. Preserve exact leading whitespace.
5. Keep line ranges short (≤5–10). Pick the subrange that pinpoints the problem.
6. Matter-of-fact tone — not accusatory, not flattering. No "Great job", "Thanks for".
7. The author should grasp the issue without close reading.

Also briefly note things done well — one sentence, no flattery.

### 6) Submit (or, in interactive mode, present the draft)

Both modes build the same JSON payload as a temp file (use `$COMMIT_SHA` from step 1) — only the final step differs. **Build the payload via the Write tool**, not heredocs — backticks in suggestion blocks break shell escaping. Payload shape, `gh api` command, and event semantics live in [references/gh-cli.md](references/gh-cli.md#submitting-a-batched-review-preferred).

**Review verdicts:**
- `APPROVE` — no P0/P1, patch is correct.
- `REQUEST_CHANGES` — has P0/P1 blocking merge.
- `COMMENT` — only P2/P3, or you want discussion without blocking.

#### Auto-post mode

```bash
gh api -X POST repos/$OWNER_REPO/pulls/<pr>/reviews --input /tmp/review-payload.json
```

#### Interactive mode (manual / "手动挡")

Runs in two phases. **Both must happen** — do not end the skill after Phase 1.

**Phase 1 — initial draft cycle**
- Tell the user the payload path (`/tmp/review-payload-<pr>.json`) and show a preview of every comment (priority, `file:line`, body, suggestion) plus the proposed verdict and summary. State nothing has been posted.
- Iterate by editing `/tmp/review-payload-<pr>.json` in place via Read + Write. Do not POST between iterations.
- POST only on explicit approval ("post it", "ship it", "post 吧", "可以了"). Treat "looks good" / "ok" as ambiguous — confirm once more.
- After posting, render the summary (step 7) and immediately enter Phase 2.

**Phase 2 — ongoing discussion (follow-up comments)**
- **Don't be a stenographer.** Apply the should-I-flag-this test — push back briefly on pre-existing, speculative, or pure-preference concerns. Only proceed when you both agree.
- **Refresh `$COMMIT_SHA`** (author may have pushed) and re-verify the target `file:line` at HEAD still says what you think.
- **Draft** per step 5 rules, show it, wait for explicit approval.
- **POST in the smallest sensible unit:**
  - One finding → inline comment via `gh api -X POST repos/$OWNER_REPO/pulls/<pr>/comments --input <file>` with `{body, commit_id, path, line, side: "RIGHT"}`.
  - Several at once → mini-review with `event: "COMMENT"` (no verdict change), same payload shape as Phase 1.
  - Continuing a thread → `gh api -X POST repos/$OWNER_REPO/pulls/<pr>/comments/<comment_id>/replies -f body='...'`.
  - Correcting your own comment → `gh api -X PATCH repos/$OWNER_REPO/pulls/comments/<comment_id> -f body='...'`.
- Render a per-batch summary (step 7) and stay open. Phase 2 ends only when the user says so ("done", "可以了", "收工").

If re-invoked mid-discussion without history, list what's already posted (existing reviews/comments — see references) before drafting.

**Fallback:** if the Reviews API fails, post inline comments individually; last resort, post a general comment summarizing findings. Commands in [references/gh-cli.md](references/gh-cli.md#individual-comments-fallback).

### 7) Output summary

Render a summary for the user (not posted to GitHub) after each post. Include an **overall correctness verdict** — does the patch break existing code/tests or introduce bugs (ignore style/formatting/nits).

- **Auto-post**: render once, skill ends.
- **Interactive**: render after Phase 1's post and after each Phase 2 batch. Follow-up summaries are smaller — what was just posted plus a running tally — and end with a reminder you're still waiting for the next concern.

Skeleton:
```
## Review posted
**Verdict**: <APPROVE | REQUEST_CHANGES | COMMENT>
**Overall correctness**: <one sentence — does the patch break things, with the specific failure mode>
**Findings**: <counts by priority>

### P0 / P1 / P2 / P3
- <file:line — short title>

### Positive
- <one-sentence acknowledgments>

### Not reviewed
- <files skipped and why>
```

---

## Tone and noise control

**Matter-of-fact, not adversarial.** Avoid flattery ("Great job...") and vague negativity ("This is wrong.").

**Lead with the scenario** — state the conditions under which the issue manifests so the author can assess severity. Good: "If the upstream service returns transient errors for >5s, this retries indefinitely, exhausting the connection pool." Bad: "Infinite retry."

**Ask when intent is ambiguous.** Frame as a question: "Is this intentionally unbounded? If a caller passes a large dataset, this could OOM."

**Distinguish blocking from non-blocking.** Use priority tags consistently. Prefix optional suggestions with `nit:`.

**One comment per issue.** Each must be independently addressable.

**Don't comment on:**
- Style a linter/formatter should catch (indentation, import order). If tooling doesn't enforce it, don't review it.
- Things another reviewer already flagged. At most "+1" if critical.
- Obvious or trivial code. Silence means approval.

The should-I-flag-this test at step 4 already covers pre-existing issues, speculation, and pure preferences — apply it before posting anything.

## Re-review workflow

When the author pushes fixes:

1. Diff `<old-sha>..HEAD` to see what changed since your last review.
2. Verify each prior issue is **actually resolved** — not just that the code changed.
3. Scan new changes for regressions using the same checklist.
4. Submit a follow-up review with verdict per step 6. Optionally dismiss your stale `CHANGES_REQUESTED` review (commands in [references/gh-cli.md](references/gh-cli.md#re-review-commands)).

## Handling large PRs (>500 lines changed)

Classify each file by risk tier using step 2 prioritization. Review high-risk files thoroughly (full context + checklist). Scan medium-risk for high-severity issues only. Skip low-risk (generated, lock files) and list as "not reviewed." If the PR is too large to review effectively, say so and suggest splitting.

## References

- [references/gh-cli.md](references/gh-cli.md) — repo/PR metadata commands, diff inspection, Reviews API payload, suggestion block syntax, unified-diff line-number mapping, re-review commands, individual-comment fallback.
