# GitHub commands for the fix loop

Check `gh auth status` before network calls. PR scans target the base repository; push permission and pushes target the actual head repository.

## Context and checks

```bash
gh pr view "<PR>" --repo "<BASE_OWNER/REPO>" \
  --json headRefOid,headRefName,headRepository,headRepositoryOwner,baseRefName,url
gh api "repos/<HEAD_OWNER/REPO>" --jq .permissions.push
gh pr checks "<PR>" --repo "<BASE_OWNER/REPO>" --json name,state,bucket,link,workflow
```

Capture the head before scanning and recheck it after validation. `bucket` can be pass, fail, pending, skipping, or cancel; assess missing or non-passing checks instead of treating them all as success.

Wait using the environment's asynchronous execution/wait support so progress updates remain possible:

```bash
gh pr checks "<PR>" --repo "<BASE_OWNER/REPO>" --watch --interval 30
```

For GitHub Actions failures:

```bash
gh run view "<RUN_ID>" --repo "<OWNER/REPO>" --log-failed
```

For external CI, follow the check's link with available provider tools or authenticated browser/API access. Report an access gap only after checking available in-scope alternatives.

## Inline review threads

REST review comments do not include thread resolution state. This GraphQL query paginates the thread connection:

```bash
gh api graphql --paginate -F owner="<OWNER>" -F name="<REPO>" -F number=<PR_NUMBER> -f query='
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

Nested comment connections paginate separately. For any thread with `comments.pageInfo.hasNextPage`, retrieve the remaining replies, starting from its returned cursor:

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

Read the full reply chain before triage. `isOutdated` only indicates stale diff context. An unresolved thread with an "addressed" reply still needs code verification and accurate reporting of its resolution state.

## Top-level findings

Fetch both review bodies and PR issue comments; bots may put all their findings in one global comment:

```bash
gh api --paginate "repos/<OWNER/REPO>/pulls/<PR>/reviews"
gh api --paginate "repos/<OWNER/REPO>/issues/<PR>/comments"
```

Extract individual findings and deduplicate against inline threads. Use IDs and current body content to detect edits, then verify against source. A reaction is not proof that a finding was fixed.

## Authorized replies and resolution

Only after a fix is verified and pushed, and the user authorized write-back:

```bash
gh api -X POST "repos/<OWNER/REPO>/pulls/<PR>/comments/<ROOT_COMMENT_ID>/replies" \
  --input "<REPLY_JSON_FILE>"
```

Write `{"body": "addressed in <PUSHED_SHA>: <REASON>"}` with a file-editing tool. Use the thread's root comment database ID for the reply, and its GraphQL node ID to resolve:

```bash
gh api graphql -F threadId="<THREAD_NODE_ID>" -f query='
mutation($threadId:ID!) {
  resolveReviewThread(input:{threadId:$threadId}) {
    thread { id isResolved }
  }
}'
```

Confirm the returned resolution state. Top-level comments have no resolvable thread; an authorized summary can use `gh pr comment "<PR>" --repo "<OWNER/REPO>" --body-file "<SUMMARY_FILE>"`. Inspect existing write-back before retrying an ambiguous response.
