# GitHub review commands

Check `gh auth status` before network calls. Supply the target repository explicitly when fork or checkout context is ambiguous.

## Metadata and diff

```bash
gh pr view "<PR>" --repo "<OWNER/REPO>" \
  --json number,title,body,headRefOid,baseRefName,headRefName,author,files
gh pr checks "<PR>" --repo "<OWNER/REPO>"
gh pr diff "<PR>" --repo "<OWNER/REPO>" --color=never
```

Capture the head SHA before reviewing. To inspect a file without switching the local checkout:

```bash
gh api "repos/<OWNER/REPO>/contents/<PATH>?ref=<HEAD_SHA>" --jq .content | base64 -d
```

Existing discussion (read complete bodies, with pagination):

```bash
gh api --paginate "repos/<OWNER/REPO>/pulls/<PR>/reviews"
gh api --paginate "repos/<OWNER/REPO>/pulls/<PR>/comments"
gh api --paginate "repos/<OWNER/REPO>/issues/<PR>/comments"
```

## Batched review

Use a file-editing tool to write a JSON payload to a unique temporary file. Preserve literal backticks and newlines through JSON serialization, rather than shell interpolation.

```json
{
  "commit_id": "<REVIEWED_HEAD_SHA>",
  "event": "COMMENT",
  "body": "<SUMMARY>",
  "comments": [
    {
      "path": "<PATH>",
      "line": 42,
      "side": "RIGHT",
      "body": "[P2] <TITLE>\n\n<TRIGGER_AND_CONSEQUENCE>"
    }
  ]
}
```

Replace placeholders and line numbers with verified values. Event is `APPROVE`, `REQUEST_CHANGES`, or `COMMENT`; choose it according to the reviewed findings and user authorization.

After refreshing the remote head and checking for duplicate submissions:

```bash
gh api -X POST "repos/<OWNER/REPO>/pulls/<PR>/reviews" --input "<PAYLOAD_FILE>"
```

## Line mapping and suggestions

`line` is an absolute file line, not a position inside the diff. RIGHT refers to new code; LEFT refers to removed code. For a range, add numeric `start_line` and the matching `start_side`.

In a hunk header `@@ -10,5 +12,6 @@`, old lines start at 10 and new lines at 12. Context increments both counters, deletions only the old counter, additions only the new counter. Verify the selected lines at the reviewed revision.

A Markdown `suggestion` fence contains only replacement code, preserving indentation. Its replacement covers exactly the comment's line range.

## Follow-up operations

Use these only when the corresponding publication or edit is authorized.

```bash
gh api -X POST "repos/<OWNER/REPO>/pulls/<PR>/comments/<COMMENT_ID>/replies" \
  --input "<REPLY_JSON_FILE>"
gh api -X PATCH "repos/<OWNER/REPO>/pulls/comments/<COMMENT_ID>" \
  --input "<COMMENT_JSON_FILE>"
```

Both payloads contain `{"body": "<TEXT>"}`. For one new inline comment, POST to `repos/<OWNER/REPO>/pulls/<PR>/comments` with `body`, `commit_id`, `path`, numeric `line`, and `side`.

If the author pushed, review `git diff <OLD_SHA>..<NEW_SHA>` and revalidate earlier findings. To dismiss a stale review, first identify the exact review ID, author, and current state; do not select the first CHANGES_REQUESTED review.

```bash
gh api -X PUT "repos/<OWNER/REPO>/pulls/<PR>/reviews/<REVIEW_ID>/dismissals" \
  --input "<DISMISSAL_JSON_FILE>"
```

The dismissal payload contains `{"message": "<REASON>"}`. Dismissal is a separate review-state change and needs authorization.

If a batched submission fails, inspect existing reviews before attempting individual comments or a general comment. A timed-out request may already have succeeded.
