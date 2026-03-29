---
name: pr-code-review
description: Perform GitHub pull request code reviews using the gh CLI. Use when asked to review a PR, inspect PR diffs, leave inline review comments on specific lines, or produce a priority-based summary (P0-P3) of findings with an overall correctness verdict.
---

# PR Code Review

Review GitHub PRs using the gh CLI. Post inline comments tied to specific code lines, use GitHub suggestion blocks for trivial fixes, and submit everything as a single batched review with a verdict.

## Workflow overview

1. Understand the PR and run pre-checks.
2. Get the diff and identify high-risk areas.
3. Read changed files in full context.
4. Analyze using a structured checklist.
5. Draft findings with proper tone.
6. Submit a single batched review with inline comments and verdict.
7. Output a severity summary.

## Step-by-step

### 1) Understand the PR and run pre-checks

First, auto-detect the repo context so you don't need hardcoded owner/repo values:

```bash
OWNER_REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
```

Read the PR description and metadata to understand intent before looking at code:

```bash
gh pr view <pr> --json number,title,body,headRefOid,baseRefName,headRefName,author,labels,changedFiles,additions,deletions

gh pr view <pr> --json files --jq '.files[] | {path,additions,deletions}'

# Capture the head commit SHA — used throughout the review
COMMIT_SHA=$(gh pr view <pr> --json headRefOid --jq .headRefOid)
```

Capture:
- **What** the PR claims to do (from title and body).
- **Why** it exists (linked issue, motivation in the description).
- **Scope** — how many files changed, total lines added/removed.

Use this context to calibrate your review: a one-line typo fix needs different scrutiny than a new auth middleware.

**Pre-checks — before reading code:**

Check CI status. Don't spend time reviewing code that doesn't build:
```bash
gh pr checks <pr>
```
If CI is failing, mention it in the review and focus on the failure cause rather than a full review.

Check for existing reviews to avoid duplicating feedback:
```bash
gh api repos/$OWNER_REPO/pulls/<pr>/reviews \
  --jq '.[] | {user: .user.login, state: .state, submitted_at: .submitted_at}'
```
If other reviewers have already left comments, read them and avoid repeating the same points.

### 2) Get the diff and prioritize

```bash
gh pr diff <pr> --name-only

gh pr diff <pr> --patch --color=never

# For large PRs, save to file to avoid flooding context
gh pr diff <pr> --patch --color=never > /tmp/pr.diff
```

**Prioritize high-risk files first:**
- Business logic, auth, payments, data mutations
- Files with high churn (many additions/deletions)
- New files (need full design review)
- Config changes (infra, CI, permissions)

**Deprioritize or skip:**
- Auto-generated files (lock files, snapshots, migrations with no custom SQL)
- Pure formatting/rename changes
- Vendor/dependency updates (unless pinning matters)

### 3) Read changed files in context

Don't review diffs in isolation. For non-trivial changes, read the full file (or at minimum the surrounding function/class) to understand:
- What the code looked like before the change
- How the change fits into the broader module
- Whether the change introduces inconsistencies with nearby code

If already on the PR branch, use the Read tool directly. Otherwise, either check out the branch first:
```bash
gh pr checkout <pr>
```
Or fetch a specific file via the API without switching branches:
```bash
gh api repos/$OWNER_REPO/contents/<path>?ref=$COMMIT_SHA --jq '.content' | base64 -d
```

### 4) Analyze using the review checklist

**Before flagging an issue, apply the "should I flag this?" test:**

1. It meaningfully impacts correctness, performance, security, or maintainability.
2. It is discrete and actionable — not a vague concern or multiple issues bundled together.
3. It was introduced in this PR — do not flag pre-existing issues (mention them in the review body if important).
4. The fix does not demand a level of rigor absent from the rest of the codebase.
5. The original author would likely fix it if they were aware of it.
6. It does not rely on unstated assumptions about the codebase or author's intent.
7. It is provably a problem — speculation that a change *may* break something else is not enough; you must identify the affected code.
8. It is clearly not an intentional choice by the author.

If a potential finding fails any of these tests, do not post it. If there are no findings that a person would definitely want to see and fix, prefer outputting zero findings over forcing low-value comments.

For each changed file, systematically check:

**Correctness**
- Does the logic match the stated intent from the PR description?
- Are edge cases handled (nulls, empty collections, boundary values)?
- Are error paths correct (not swallowed, not leaking internals)?

**Security**
- Input validation on trust boundaries (user input, API params)
- No secrets, credentials, or PII in code
- Safe handling of auth tokens, sessions, permissions
- No injection vulnerabilities (SQL, XSS, command, path traversal)

**Reliability**
- Concurrency safety (race conditions, shared mutable state)
- Resource cleanup (connections, file handles, subscriptions)
- Retry/timeout behavior (infinite loops, missing backoff)
- Failure modes (what happens when a dependency is down?)

**Performance**
- N+1 queries, missing indexes for new query patterns
- Unnecessary allocations in hot paths
- Missing pagination for unbounded result sets

**API design & contracts**
- Breaking changes to public APIs
- Consistent naming and parameter ordering
- Backward compatibility where expected

**Tests**
- Are new code paths covered by tests?
- Do tests assert meaningful behavior (not just "no crash")?
- Are edge cases from the correctness check tested?

**Clarity**
- Could a team member understand this in 6 months?
- Are names descriptive? Is the abstraction level consistent?
- Only flag naming/style if it causes genuine confusion — don't nitpick.

### 5) Draft findings

For each issue, record:
- **Priority**: P0 / P1 / P2 / P3
- **File path** and **line number** (see [line number mapping](#diff-line-number-mapping) below)
- **Title**: imperative, ≤80 chars, prefixed with priority tag (e.g. `[P1] Add max-attempts guard to retry loop`)
- **Body**: one paragraph explaining *why* this is a problem and the scenarios/inputs that trigger it
- **Suggestion**: recommended fix (use a `suggestion` block for concrete replacements)

**Priority definitions:**
- **P0** — Drop everything. Blocking release or operations. Only use for universal issues that do not depend on assumptions about inputs.
- **P1** — Urgent. Correctness bugs, security vulnerabilities, data loss risk. Should be addressed in the next cycle.
- **P2** — Normal. Reliability concerns, performance issues, missing error handling, API design problems. To be fixed eventually.
- **P3** — Low. Clarity improvements, minor style issues, optional refactors. Nice to have.

**Comment writing rules:**
1. The body must be at most one paragraph. No unnecessary line breaks.
2. Clearly state the scenarios, environments, or inputs required for the issue to manifest. Communicate that severity depends on these factors.
3. Do not include code chunks longer than 3 lines in the body. Use `suggestion` blocks for concrete fixes instead.
4. Use `suggestion` blocks ONLY for concrete replacement code — no commentary inside the block.
5. In suggestion blocks, preserve the exact leading whitespace of the replaced lines.
6. Keep line ranges as short as possible (≤5–10 lines). Pick the subrange that pinpoints the problem.
7. Tone should be matter-of-fact — not accusatory, not flattering. Avoid "Great job...", "Thanks for...".
8. The author should be able to immediately grasp the issue without close reading.

Also note things done well — good patterns, thorough edge-case handling, clean abstractions. Keep it brief: one sentence, no flattery, just acknowledgment.

Follow the [comment tone guidelines](#comment-tone) and [noise control rules](#when-not-to-comment) below.

### 6) Submit as a single batched review

**Always use the Reviews API** to submit all comments as one review. This creates a single notification and a proper review record with a verdict.

**Build the JSON payload as a temp file** to avoid shell escaping issues (backticks in suggestion blocks break heredocs).

Write the review payload to a temp file using the Write tool (use the `$COMMIT_SHA` captured in step 1):

```json
{
  "commit_id": "<COMMIT_SHA value>",
  "event": "REQUEST_CHANGES",
  "body": "## Review summary\n\nPatch is incorrect. 1 P1, 1 P2 found.\n\n### Positive\n- Clean separation of retry logic into its own module.",
  "comments": [
    {
      "path": "src/service/retry.ts",
      "line": 42,
      "side": "RIGHT",
      "body": "**[P1]** Add max-attempts guard to retry loop\n\nIf the upstream service is down, this retries indefinitely, exhausting the connection pool and cascading to all other requests. This triggers whenever the service returns a transient error for longer than a few seconds.\n\n```suggestion\nfor (let attempt = 0; attempt < MAX_RETRIES; attempt++) {\n```"
    },
    {
      "path": "src/api/handler.ts",
      "line": 15,
      "side": "RIGHT",
      "body": "**[P2]** Validate `userId` parameter before use\n\nIf a caller passes a non-numeric string, `parseInt` returns `NaN` which propagates silently through the query, returning an empty result instead of a 400 error."
    }
  ]
}
```

Then submit:
```bash
gh api -X POST repos/$OWNER_REPO/pulls/<pr>/reviews --input /tmp/review-payload.json
```

**Review verdicts:**
- `APPROVE` — no P0/P1 issues, the patch is correct
- `REQUEST_CHANGES` — has P0 or P1 issues that must be fixed before merge
- `COMMENT` — only P2/P3 issues, or you want discussion without blocking

**Permission requirement** — submitting a review requires write/collaborator access to the repo. If you get a 403/422 error, you lack the necessary permissions.

**Fallback** — if the Reviews API fails, degrade gracefully:

1. Post each inline comment individually (preserves line-level feedback):
```bash
gh api -X POST repos/$OWNER_REPO/pulls/<pr>/comments \
  -f body='...' \
  -f commit_id="$COMMIT_SHA" \
  -f path='src/handler.ts' \
  -f line=15 \
  -f side='RIGHT'
```

2. Last resort — if inline comments are also unavailable, post a general comment summarizing all findings:
```bash
gh pr review <pr> --comment -b "..."
```

See [references/gh-cli.md](references/gh-cli.md) for multi-line comments, suggestion syntax, and API details.

### 7) Output summary

End with a summary for the user (not posted to GitHub). Include an **overall correctness verdict** — a binary assessment of whether the patch is correct (existing code and tests will not break, no bugs or blocking issues; ignore style, formatting, and nits).

```
## Review posted

**Verdict**: REQUEST_CHANGES
**Overall correctness**: patch is incorrect — the unbounded retry loop will exhaust the connection pool under sustained upstream failures.
**Findings**: 1 P1, 2 P2, 1 P3

### P1
- retry.ts:42 — Unbounded retry loop exhausts connection pool

### P2
- handler.ts:15 — Missing userId validation returns empty result instead of 400
- auth.ts:88 — Token expiry not checked before downstream call

### P3
- utils.ts:7 — Ambiguous variable name `d` could be `durationMs`

### Positive
- Clean separation of retry logic into its own module

### Not reviewed
- package-lock.json (auto-generated)
```

---

## Comment tone

**Matter-of-fact, not adversarial.** Read as a helpful assistant — not a human reviewer trying to prove a point. Avoid excessive flattery ("Great job...") and vague negativity ("This is wrong.").

**Lead with the scenario.** State the conditions under which the issue manifests so the author can immediately assess severity:
- Good: "**[P1]** If the upstream service returns transient errors for >5s, this retries indefinitely, exhausting the connection pool and cascading to all other requests."
- Bad: "**[P1]** Infinite retry."

**Ask when the intent is ambiguous.** If the code might be intentional, frame as a question:
- "Is this intentionally unbounded? If a caller passes a large dataset, this could OOM."

**Distinguish blocking from non-blocking.** Use priority tags consistently. Prefix optional suggestions with `nit:` so the author knows they can skip them.

**One comment per issue.** Don't pile multiple unrelated concerns into a single comment. Each comment should be independently addressable.

## When NOT to comment

Noisy reviews dilute the important feedback. Every finding must pass the [should-I-flag-this test](#4-analyze-using-the-review-checklist). Beyond that, avoid commenting on:

- **Style that a linter/formatter should catch** — indentation, trailing whitespace, import order. If it's not enforced by tooling, it's not worth a review comment.
- **Pre-existing issues** — do not flag bugs that were not introduced in this PR. Mention them in the review body if critical, never as inline comments.
- **Speculative breakage** — "this *might* break X" is not a finding. You must identify the specific code path that is provably affected.
- **Pure preference disagreements** — "I would have used X instead of Y" is not a finding unless Y has a concrete, demonstrable downside.
- **Obvious or trivial code** — don't add "this looks fine" comments. Silence means approval.
- **Things another reviewer already flagged** — don't pile on. At most, "+1" if you think it's critical.

**Rule of thumb:** if the original author would not fix the issue upon reading your comment, don't post it. If you have zero qualifying findings, output zero findings — an empty review is better than a noisy one.

## Diff line number mapping

Getting line numbers right is critical for inline comments. The GitHub API `line` field refers to **absolute line numbers in the file**, not positions within the diff hunk.

From unified diff output:
```
@@ -10,5 +12,6 @@ function example() {
  context line        ← line 12 in new file
  context line        ← line 13
+ added line          ← line 14 (this is a RIGHT side line)
+ added line          ← line 15
  context line        ← line 16
- deleted line        ← (LEFT side only, line 13 in old file)
  context line        ← line 17
```

- The `+12,6` means this hunk starts at **line 12** in the new file and spans 6 lines.
- Count from the start through context lines (` `) and added lines (`+`) to get the absolute line number for RIGHT side comments.
- Lines starting with `-` exist only in the old file (LEFT side) — skip them when counting new-file line numbers.

When in doubt, use the Read tool to open the file and verify the line number matches the code you want to comment on.

## Re-review workflow

When the author pushes fixes and requests a re-review:

1. **Check what changed since your last review:**
```bash
# Compare the old review commit to the current HEAD
gh pr view <pr> --json headRefOid --jq .headRefOid
# Then diff between the old and new HEAD
git diff <old-commit-sha>..<new-commit-sha>
```

2. **Verify each previous issue was addressed.** Go through your prior comments and check if the fix is correct — not just that the code changed, but that the fix actually resolves the concern.

3. **Check for regressions.** Sometimes fixes introduce new problems. Scan the new changes with the same checklist.

4. **Submit a follow-up review** with the appropriate verdict:
   - `APPROVE` if all P0/P1 issues are resolved and the patch is correct
   - `REQUEST_CHANGES` if P0/P1 issues remain or new ones were introduced
   - `COMMENT` if you want to acknowledge progress but aren't ready to approve

5. **Dismiss your stale review** if it's no longer relevant:
```bash
REVIEW_ID=$(gh api repos/$OWNER_REPO/pulls/<pr>/reviews \
  --jq '[.[] | select(.state == "CHANGES_REQUESTED")][0].id')
gh api -X PUT repos/$OWNER_REPO/pulls/<pr>/reviews/$REVIEW_ID/dismissals \
  -f message="Issues addressed in latest push"
```

## Handling large PRs (>500 lines changed)

1. Classify each file by risk tier using the prioritization criteria from step 2.
2. Review high-risk files thoroughly (full context, full checklist).
3. Scan medium-risk files for high-severity issues only.
4. Skip low-risk files (generated, lock files, etc.) — list them as "not reviewed."
5. If the PR is too large to review effectively, say so and suggest the author split it.

## References

- [references/gh-cli.md](references/gh-cli.md) for command patterns, Reviews API, and suggestion block syntax.
