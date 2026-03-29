# gh CLI reference for PR review

Verify flags with `gh <command> --help` if unsure.

## Auto-detect repo context

Always resolve the owner/repo dynamically instead of hardcoding:

```bash
OWNER_REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
```

## PR metadata

```bash
# Basic view
gh pr view <pr>

# JSON fields (commit SHA, file list, stats)
gh pr view <pr> --json number,title,body,headRefOid,baseRefName,headRefName,author,labels,changedFiles,additions,deletions

# File list with churn
gh pr view <pr> --json files --jq '.files[] | {path,additions,deletions}'
```

## Pre-checks

```bash
# CI status
gh pr checks <pr>

# Existing reviews (avoid duplicate feedback)
gh api repos/$OWNER_REPO/pulls/<pr>/reviews \
  --jq '.[] | {user: .user.login, state: .state, submitted_at: .submitted_at}'

# Existing review comments
gh api repos/$OWNER_REPO/pulls/<pr>/comments \
  --jq '.[] | {user: .user.login, path: .path, line: .line, body: .body[0:100]}'
```

## Diff inspection

```bash
# File names only
gh pr diff <pr> --name-only

# Full patch
gh pr diff <pr> --patch

# Save to file for large PRs
gh pr diff <pr> --patch --color=never > /tmp/pr.diff
```

## Submitting a batched review (preferred)

Use the Reviews API to submit all comments as a single review with a verdict. This is strongly preferred over individual comments — it creates one notification and a proper review record.

**Endpoint:** `POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews`

### Safe JSON construction

Shell escaping is fragile when comment bodies contain backticks (suggestion blocks), quotes, or newlines. **Use a temp file instead of heredocs:**

1. Write the JSON payload to `/tmp/review-payload.json` using the Write tool.
2. Submit with:
```bash
gh api -X POST repos/$OWNER_REPO/pulls/$PR/reviews --input /tmp/review-payload.json
```

Payload structure:
```json
{
  "commit_id": "abc123...",
  "event": "REQUEST_CHANGES",
  "body": "Review summary here",
  "comments": [
    {
      "path": "src/service/retry.ts",
      "line": 42,
      "side": "RIGHT",
      "body": "**[P1]** Add max-attempts guard to retry loop\n\nIf the upstream service returns transient errors for >5s, this retries indefinitely, exhausting the connection pool.\n\n```suggestion\nfor (let attempt = 0; attempt < MAX_RETRIES; attempt++) {\n```"
    }
  ]
}
```

This avoids all escaping issues — the Write tool handles the content as-is.

### Alternative: jq construction

If you need to build the payload dynamically in bash:

```bash
COMMENT_BODY=$(cat <<'BODY'
**[P1]** Add max-attempts guard to retry loop

If the upstream service is down, this retries indefinitely, exhausting the connection pool.

```suggestion
for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
```
BODY
)

jq -n \
  --arg commit "$COMMIT_SHA" \
  --arg body "$COMMENT_BODY" \
  '{
    commit_id: $commit,
    event: "REQUEST_CHANGES",
    body: "Review summary",
    comments: [{path: "src/retry.ts", line: 42, side: "RIGHT", body: $body}]
  }' \
| gh api -X POST repos/$OWNER_REPO/pulls/$PR/reviews --input -
```

`jq --arg` handles all JSON escaping automatically.

### Event values

- `APPROVE` — no blocking issues
- `REQUEST_CHANGES` — has issues that must be fixed before merge
- `COMMENT` — informational, no verdict

### Comment fields

- `path` — file path relative to repo root
- `line` — absolute line number in the new file (RIGHT side) or old file (LEFT side)
- `side` — `RIGHT` for new-code comments, `LEFT` for deleted-code comments
- `body` — comment text (supports full markdown including suggestion blocks)

### Multi-line comments

Span a range of lines:
```json
{
  "path": "src/handler.ts",
  "start_line": 10,
  "line": 15,
  "start_side": "RIGHT",
  "side": "RIGHT",
  "body": "This entire block should be extracted into a helper."
}
```

## GitHub suggestion blocks

Use suggestion syntax in comment bodies for trivial fixes. Authors can accept with one click in the GitHub UI.

**Single-line suggestion** (replaces the line specified by `line`):
````markdown
```suggestion
const MAX_RETRIES = 3;
```
````

**Multi-line suggestion** (replaces lines from `start_line` to `line`):
````markdown
```suggestion
const config = loadConfig();
const client = createClient(config);
```
````

The suggestion replaces the exact lines in the range, so the replacement code must be complete.

## Unified diff line number mapping

The `line` field in the API uses **absolute file line numbers**, not positions within the diff hunk.

```
@@ -10,6 +12,8 @@ function example() {
 context line        → new file line 12
 context line        → new file line 13
+added line          → new file line 14  ← use this for RIGHT side comment
+added line          → new file line 15
 context line        → new file line 16
-deleted line        → old file line 15  ← use this for LEFT side comment
 context line        → new file line 17
```

- `+12,8` means the hunk starts at line 12 in the new file.
- Count through context (` `) and added (`+`) lines. Skip `-` lines when counting new-file lines.
- When in doubt, open the file with the Read tool and verify the line number matches the code.

## Re-review commands

```bash
# Fetch the current head SHA
gh pr view <pr> --json headRefOid --jq .headRefOid

# Diff between the old review commit and current head
git diff <old-sha>..<new-sha>

# Dismiss a stale review
REVIEW_ID=$(gh api repos/$OWNER_REPO/pulls/<pr>/reviews \
  --jq '[.[] | select(.state == "CHANGES_REQUESTED")][0].id')
gh api -X PUT repos/$OWNER_REPO/pulls/<pr>/reviews/$REVIEW_ID/dismissals \
  -f message="Issues addressed in latest push"
```

## Individual comments (fallback)

If the Reviews API is unavailable, post comments individually.

**Endpoint:** `POST /repos/{owner}/{repo}/pulls/{pull_number}/comments`

```bash
gh api \
  -X POST \
  repos/$OWNER_REPO/pulls/$PR/comments \
  -f body='[P2] Validate userId parameter before use' \
  -f commit_id="$COMMIT_SHA" \
  -f path='src/handler.ts' \
  -f line=15 \
  -f side='RIGHT'
```

## General comments (last resort)

Use only when you cannot tie the comment to a specific file/line.

```bash
# Review comment
gh pr review <pr> --comment -b "<comment>"

# PR comment (non-review)
gh pr comment <pr> -b "<comment>"
```
