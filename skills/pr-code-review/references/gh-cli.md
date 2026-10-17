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

## CI evidence

Checks follow the live PR. Confirm its head matches the snapshot before attributing results to the reviewed code. If the head moved, inspect checks for the captured commit or refresh the snapshot. Assess skipped, cancelled, and missing expected checks before calling CI green.

```bash
gh pr checks "<PR>" --repo "<OWNER/REPO>" --json name,state,bucket,link,workflow
```

For GitHub Actions failures, read the actual logs:

```bash
gh run view "<RUN_ID>" --repo "<OWNER/REPO>" --log-failed
```

For external CI, follow the check's link with available provider tools or authenticated browser/API access. Distinguish infrastructure/deployment failures from code defects.

When waiting for checks is part of the requested task, use asynchronous execution/wait support so progress updates remain possible:

```bash
gh pr checks "<PR>" --repo "<OWNER/REPO>" --watch --interval 30
```

## Existing discussion

Read complete review bodies and PR issue comments, with pagination:

```bash
gh api --paginate "repos/<OWNER/REPO>/pulls/<PR>/reviews"
gh api --paginate "repos/<OWNER/REPO>/issues/<PR>/comments"
```

Read inline threads through GraphQL; flat REST review comments do not include resolution state. This query returns each thread's state with its replies:

```bash
gh api graphql --paginate -f owner="<OWNER>" -f name="<REPO>" -F number=<PR> -f query='
query($owner:String!, $name:String!, $number:Int!, $endCursor:String) {
  repository(owner:$owner, name:$name) {
    pullRequest(number:$number) {
      reviewThreads(first:100, after:$endCursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id isResolved isOutdated path line originalLine
          comments(first:100) {
            pageInfo { hasNextPage endCursor }
            nodes { databaseId author { login } body createdAt updatedAt }
          }
        }
      }
    }
  }
}'
```

`--paginate` follows the first `pageInfo` in the response, so keep the thread `pageInfo` ahead of `nodes`. Nested comment connections paginate separately. For any thread with `comments.pageInfo.hasNextPage`, retrieve the remaining replies, starting from its returned cursor:

```bash
gh api graphql --paginate -F id="<THREAD_NODE_ID>" -F endCursor="<COMMENTS_CURSOR>" -f query='
query($id:ID!, $endCursor:String) {
  node(id:$id) {
    ... on PullRequestReviewThread {
      comments(first:100, after:$endCursor) {
        pageInfo { hasNextPage endCursor }
        nodes { databaseId author { login } body createdAt updatedAt }
      }
    }
  }
}'
```

A comment's `databaseId` is the `<COMMENT_ID>` used by the REST reply and edit endpoints below. Refresh thread state and replies before posting. Treat resolved/outdated flags as discussion context, and verify fixes against current code.

## Batched review

Before selecting an event, compare the authenticated login with `author.login` and refresh the reviewed revisions:

```bash
gh api user --jq .login
gh pr view "<PR>" --repo "<OWNER/REPO>" --json author,headRefOid,baseRefOid
```

Use `COMMENT` by default for both self-authored and other PRs, including merge-blocking findings; state the verdict in the body. Use `APPROVE` or `REQUEST_CHANGES` only when explicitly requested. GitHub disallows those events on self-authored PRs; report an unavailable requested event instead of silently substituting it.

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
gh api -X POST "repos/<OWNER/REPO>/pulls/<PR>/comments/<ROOT_COMMENT_ID>/replies" \
  --input "<REPLY_JSON_FILE>"
gh api -X PATCH "repos/<OWNER/REPO>/pulls/comments/<COMMENT_ID>" \
  --input "<COMMENT_JSON_FILE>"
```

Both payloads contain `{"body": "<TEXT>"}`. Replies use the thread's root comment database ID; edits use the selected comment's database ID. For one new inline comment, POST to `repos/<OWNER/REPO>/pulls/<PR>/comments` with `body`, `commit_id`, `path`, numeric `line`, and `side`.

Resolve a fixed finding only after verifying the repair at the current pushed SHA and receiving authorization to resolve threads. Use the thread's GraphQL node ID:

```bash
gh api graphql -F threadId="<THREAD_NODE_ID>" -f query='
mutation($threadId:ID!) {
  resolveReviewThread(input:{threadId:$threadId}) {
    thread { id isResolved }
  }
}'
```

Confirm the returned resolution state. Top-level comments have no resolvable thread; track their disposition in the finding record when present.

If the author pushed, review `git diff <OLD_SHA>..<NEW_SHA>` and revalidate earlier findings. To dismiss a stale review, first identify the exact review ID, author, and current state; do not select the first CHANGES_REQUESTED review.

```bash
gh api -X PUT "repos/<OWNER/REPO>/pulls/<PR>/reviews/<REVIEW_ID>/dismissals" \
  --input "<DISMISSAL_JSON_FILE>"
```

The dismissal payload contains `{"message": "<REASON>"}`. Dismissal is a separate review-state change and needs authorization.

If a publication request fails or times out, inspect existing reviews, replies, or thread state before retrying or posting an alternative; it may already have succeeded.
