# gh CLI reference for PR review

Keep this file short. Verify flags with `gh <command> --help` if you are unsure.

## Discover PR metadata

- View PR basics:
  - `gh pr view <pr>`
- JSON fields (use for commit SHA and file list):
  - `gh pr view <pr> --json headRefOid,baseRefName,headRefName,author,changedFiles,additions,deletions`
  - `gh pr view <pr> --json files --jq '.files[] | {path,additions,deletions}'`

## Diff inspection

- File list:
  - `gh pr diff <pr> --name-only`
- Patch output with line numbers:
  - `gh pr diff <pr> --patch`

## General review comments

- Add a review comment:
  - `gh pr review <pr> --comment -b "<comment>"`
- Add a PR comment (non-review):
  - `gh pr comment <pr> -b "<comment>"`

## Inline review comments via GitHub API

Use this when you need to attach a comment to a specific file and line.

Endpoint (REST v3):
- `POST /repos/{owner}/{repo}/pulls/{pull_number}/comments`

Required fields (typical):
- `body`: comment text
- `commit_id`: PR head commit SHA (`headRefOid` from `gh pr view --json headRefOid`)
- `path`: file path in the repo
- `line`: line number in the diff hunk (RIGHT side)
- `side`: `RIGHT`

Example:
```
PR=123
OWNER_REPO=owner/repo
COMMIT_SHA=$(gh pr view $PR --repo $OWNER_REPO --json headRefOid --jq .headRefOid)

gh api \
  -X POST \
  repos/$OWNER_REPO/pulls/$PR/comments \
  -f body='[MEDIUM] The retry loop can spin forever; add a max-attempts guard.' \
  -f commit_id="$COMMIT_SHA" \
  -f path='src/service/retry.ts' \
  -f line=42 \
  -f side='RIGHT'
```

Notes:
- Use the line number from the diff hunk for the new line (RIGHT side).
- For multi-line comments, consult the GitHub API docs to use `start_line` and `start_side`.
- If inline comment fails, fall back to `gh pr review --comment` or `gh pr comment`.
