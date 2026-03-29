---
name: pr-code-review
description: Perform GitHub pull request code reviews using the gh CLI. Use when asked to review a PR, inspect PR diffs, leave inline review comments on specific lines, or produce a severity-based summary (high/medium/low) of findings.
---

# PR Code Review

Review GitHub PRs using the gh CLI. Post inline comments tied to specific code lines, use GitHub suggestion blocks for trivial fixes, and submit everything as a single batched review with a verdict.

## Workflow overview

1. Understand the PR (description, linked issues, scope).
2. Get the diff and identify high-risk areas.
3. Read changed files in full context.
4. Analyze using a structured checklist.
5. Submit a single batched review with inline comments and verdict.
6. Output a severity summary.

## Step-by-step

### 1) Understand the PR

Read the PR description and metadata to understand intent before looking at code.

```bash
# PR metadata and description
gh pr view <pr> --json number,title,body,headRefOid,baseRefName,headRefName,author,labels,changedFiles,additions,deletions

# File list with churn
gh pr view <pr> --json files --jq '.files[] | {path,additions,deletions}'
```

Capture:
- **What** the PR claims to do (from title and body).
- **Why** it exists (linked issue, motivation in the description).
- **Scope** — how many files changed, total lines added/removed.

Use this context to calibrate your review: a one-line typo fix needs different scrutiny than a new auth middleware.

### 2) Get the diff and prioritize

```bash
# File list only
gh pr diff <pr> --name-only

# Full patch
gh pr diff <pr> --patch --color=never
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

Use the Read tool on files checked out at the PR head, or read them via the GitHub API.

### 4) Analyze using the review checklist

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
- **Severity**: High / Medium / Low
- **File path** and **line number** (from the diff RIGHT side)
- **Summary**: one-line description
- **Reasoning**: why this matters
- **Suggestion**: recommended fix (use a GitHub suggestion block for trivial fixes)

**Severity definitions:**
- **High**: correctness bugs, security vulnerabilities, data loss risk, outage potential
- **Medium**: reliability concerns, performance issues, missing error handling, API design problems
- **Low**: clarity improvements, minor style issues, optional refactors

Also note things done well — good patterns, thorough edge-case handling, clean abstractions. A review with only criticism is less effective.

### 6) Submit as a single batched review

**Always use the Reviews API** to submit all comments as one review. This creates a single notification and a proper review record with a verdict.

```bash
COMMIT_SHA=$(gh pr view <pr> --json headRefOid --jq .headRefOid)

gh api \
  -X POST \
  repos/{owner}/{repo}/pulls/<pr>/reviews \
  --input - <<'EOF'
{
  "commit_id": "<COMMIT_SHA>",
  "event": "REQUEST_CHANGES",
  "body": "## Review summary\n\n...",
  "comments": [
    {
      "path": "src/service/retry.ts",
      "line": 42,
      "side": "RIGHT",
      "body": "**[HIGH]** The retry loop can spin forever.\n\nAdd a max-attempts guard to prevent infinite retries.\n\n```suggestion\nfor (let attempt = 0; attempt < MAX_RETRIES; attempt++) {\n```"
    },
    {
      "path": "src/api/handler.ts",
      "line": 15,
      "side": "RIGHT",
      "body": "**[MEDIUM]** Missing input validation on `userId` parameter."
    }
  ]
}
EOF
```

**Review verdicts:**
- `APPROVE` — no high-severity issues, the PR is ready to merge
- `REQUEST_CHANGES` — has high-severity issues that must be fixed
- `COMMENT` — only medium/low issues, or you want discussion without blocking

**Use GitHub suggestion blocks** for trivial fixes (typos, simple renames, one-line changes). Authors can accept these with one click in the GitHub UI:

````
```suggestion
replacement code here
```
````

**Fallback** — if the Reviews API fails (permissions, etc.), fall back to:
```bash
gh pr review <pr> --comment -b "..."
```

See [references/gh-cli.md](references/gh-cli.md) for full API details and multi-line comment syntax.

### 7) Output summary

End with a summary for the user (not posted to GitHub):

```
## Review posted

**Verdict**: REQUEST_CHANGES
**Comments**: 2 high, 3 medium, 1 low

### High
- retry.ts:42 — Infinite retry loop
- auth.ts:88 — Token not validated before use

### Medium
- handler.ts:15 — Missing input validation
- ...

### Low
- utils.ts:7 — Could use more descriptive variable name

### Positive
- Good test coverage for the new parser edge cases

### Not reviewed
- package-lock.json (auto-generated)
```

## Handling large PRs (>500 lines changed)

1. Classify each file by risk tier using the prioritization criteria from step 2.
2. Review high-risk files thoroughly (full context, full checklist).
3. Scan medium-risk files for high-severity issues only.
4. Skip low-risk files (generated, lock files, etc.) — list them as "not reviewed."
5. If the PR is too large to review effectively, say so and suggest the author split it.

## References

- [references/gh-cli.md](references/gh-cli.md) for command patterns, Reviews API, and suggestion block syntax.
