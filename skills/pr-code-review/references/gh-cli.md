# GitHub review commands

Check `gh auth status` before network calls. Supply the target repository explicitly when fork or checkout context is ambiguous.

## Metadata and diff

```bash
gh pr view "<PR>" --repo "<OWNER/REPO>" \
  --json number,title,body,headRefOid,baseRefOid,baseRefName,headRefName,author,files
```

Record `headRefOid` as `<HEAD_SHA>` and `baseRefOid` as `<BASE_SHA>`. In the target repository's clone, fetch those commits and use them for both the patch and source. `<REMOTE>` must point to the PR-owning repository; it may be `upstream` when the checkout's `origin` is a fork.

```bash
git fetch "<REMOTE>" "<BASE_SHA>" "<HEAD_SHA>"
git diff "<BASE_SHA>...<HEAD_SHA>"
git show "<HEAD_SHA>:<PATH>"
```

`gh pr diff` follows the live PR rather than the captured SHAs. To inspect a snapshot file without a local clone:

```bash
gh api "repos/<OWNER/REPO>/contents/<PATH>?ref=<HEAD_SHA>" --jq .content | base64 -d
```

For a quick CI view, use `gh pr checks "<PR>" --repo "<OWNER/REPO>"`; it follows the live PR. Confirm its head matches the snapshot before attributing those results to the reviewed code. If the head moved, inspect checks for the captured commit or refresh the snapshot.

## Existing discussion

Read complete review and comment bodies, with pagination:

```bash
gh api --paginate "repos/<OWNER/REPO>/pulls/<PR>/reviews"
gh api --paginate "repos/<OWNER/REPO>/pulls/<PR>/comments"
gh api --paginate "repos/<OWNER/REPO>/issues/<PR>/comments"
```

Fetch thread state separately; flat REST comments do not include resolution state:

```bash
gh api graphql --paginate \
  -f owner="<OWNER>" -f name="<REPO>" -F number="<PR>" \
  -f query='
query($owner: String!, $name: String!, $number: Int!, $endCursor: String) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      reviewThreads(first: 100, after: $endCursor) {
        nodes {
          id isResolved isOutdated path line
          comments(first: 1) { nodes { id } }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
}'
```

Match each thread's first comment `id` to the REST comment's `node_id`, then follow `in_reply_to_id` to read all replies from the paginated REST list. `comments(first: 1)` identifies the thread root; it is not the full conversation. Refresh both thread state and comments before posting. Treat resolved/outdated flags as discussion context, and verify fixes against current code.

## Batched review

Before selecting an event, compare the authenticated login with `author.login` and refresh the reviewed revisions:

```bash
gh api user --jq .login
gh pr view "<PR>" --repo "<OWNER/REPO>" --json author,headRefOid,baseRefOid
```

For self-authored PRs, use `COMMENT` and put the positive or blocking verdict in the body. Otherwise choose `APPROVE`, `REQUEST_CHANGES`, or `COMMENT` according to the findings. Honor an explicit user-requested event; if unavailable, report the limitation instead of silently changing it.

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
      "body": "[P2] <TITLE>\n\n<EVIDENCE_AND_CONSEQUENCE>"
    }
  ]
}
```

Replace placeholders and line numbers with verified values and use the event selected above within the user's authorization.

If either SHA changed, rebuild the snapshot and revalidate findings and line mappings. After refreshing discussion and checking for duplicate submissions:

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
