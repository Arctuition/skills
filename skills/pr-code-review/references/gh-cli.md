# gh CLI reference for PR review

Verify flags with `gh <command> --help` if unsure.

## PR metadata

```bash
# Basic view
gh pr view <pr>

# JSON fields (commit SHA, file list, stats)
gh pr view <pr> --json number,title,body,headRefOid,baseRefName,headRefName,author,labels,changedFiles,additions,deletions

# File list with churn
gh pr view <pr> --json files --jq '.files[] | {path,additions,deletions}'
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

```bash
COMMIT_SHA=$(gh pr view $PR --json headRefOid --jq .headRefOid)

gh api \
  -X POST \
  repos/$OWNER_REPO/pulls/$PR/reviews \
  --input - <<'EOF'
{
  "commit_id": "<COMMIT_SHA>",
  "event": "REQUEST_CHANGES",
  "body": "Review summary here",
  "comments": [
    {
      "path": "src/service/retry.ts",
      "line": 42,
      "side": "RIGHT",
      "body": "**[HIGH]** Infinite retry loop — add max-attempts guard."
    }
  ]
}
EOF
```

**`event` values:**
- `APPROVE` — no blocking issues
- `REQUEST_CHANGES` — has issues that must be fixed before merge
- `COMMENT` — informational, no verdict

**Comment fields:**
- `path` — file path relative to repo root
- `line` — line number on the RIGHT (new) side of the diff
- `side` — always `RIGHT` for new-code comments
- `body` — comment text (supports full markdown including suggestion blocks)

**Multi-line comments** — span a range of lines:
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

## Individual comments (fallback)

If the Reviews API is unavailable, post comments individually.

**Endpoint:** `POST /repos/{owner}/{repo}/pulls/{pull_number}/comments`

```bash
gh api \
  -X POST \
  repos/$OWNER_REPO/pulls/$PR/comments \
  -f body='[MEDIUM] Missing input validation.' \
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
