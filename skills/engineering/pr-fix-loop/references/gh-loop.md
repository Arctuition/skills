# gh CLI reference for the PR fix loop

Every gh command the loop uses, in workflow order. Self-contained — verify flags with
`gh <command> --help` if unsure.

## Context every round needs

```bash
OWNER_REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
OWNER=${OWNER_REPO%/*}; REPO=${OWNER_REPO#*/}                    # for the GraphQL variables below
ME=$(gh api user --jq .login)                                   # to find our own "addressed in" replies
HEAD_SHA=$(gh pr view <pr> --json headRefOid --jq .headRefOid)  # refresh every round — others may push
```

## Push-permission preflight

The loop only commits/pushes when you can write to the repo. Check before checkout:

```bash
gh api repos/$OWNER_REPO --jq .permissions.push   # true / false
```

`false` → drop to **advise-only** mode: scan + triage + print fixes, never commit/push/reply.

```bash
gh pr checkout <pr>     # work on the PR branch in the current repo
```

## CI status

```bash
# Human-readable
gh pr checks <pr>

# Structured — bucket is one of: pass | fail | pending | skipping | cancel
gh pr checks <pr> --json name,state,bucket,link,workflow
```

`gh pr checks <pr> --watch --interval 30` **blocks** until every check finishes, then exits
non-zero if any failed. This is the between-rounds wait. The `link` field tells you where a
failure lives:

- **GitHub Actions** (`link` → `github.com/<owner>/<repo>/actions/runs/<id>`): fetch the log.
  ```bash
  RUN_ID=<id from link>
  gh run view $RUN_ID --log-failed        # only the failed steps
  ```
- **External CI** (`link` → e.g. `ci.arcsitedev.com/...` Jenkins): gh **cannot** fetch the log.
  Surface the `link` and stop for the user to paste the relevant log (see stop guards in SKILL.md).

## Inline review comments + thread resolution state (GraphQL)

REST `/pulls/<pr>/comments` does **not** expose whether a thread is resolved. Use GraphQL so the
loop can skip resolved/outdated threads and read the full reply chain:

```bash
gh api graphql -F owner="$OWNER" -F repo="$REPO" -F pr=<pr> -f query='
query($owner:String!, $repo:String!, $pr:Int!) {
  repository(owner:$owner, name:$repo) {
    pullRequest(number:$pr) {
      reviewThreads(first:100) {
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          originalLine
          comments(first:50) {
            nodes { databaseId author { login } body createdAt isMinimized minimizedReason }
          }
        }
      }
    }
  }
}'
```

(`-F pr=<pr>` passes an int; `$OWNER` / `$REPO` come from the Context block above.)

Per thread, the loop derives state from this payload:

- **skip** if `isResolved` is true.
- **already addressed by us** if the *last* comment is authored by `$ME` and its body starts with
  `addressed in ` — and no later comment from someone else reopened the thread.
- otherwise it's an **open** thread → triage it (SKILL.md step 3).

## Bot findings

Bot reviewers often have logins ending in `[bot]`, but connector accounts may not. Treat these as
bot-like reviewers even without a `[bot]` suffix: `chatgpt-codex-connector`, `claude`,
`coderabbitai`, and `copilot`. Their finding bodies usually carry a priority badge (`P0`–`P3`);
parse it to seed the triage priority.

Do not use PR mergeability, review decision, or check status as a proxy for whether bot findings
remain. For example, a PR can be clean/ready to merge while still having unresolved
`chatgpt-codex-connector` review threads. The thread's `isResolved` state is the source of truth.

## Top-level bot comments (reviews + issue comments)

Some bots — `claude` especially — post findings as **one global comment**, not inline. These never
appear in `reviewThreads`, so the inline scan misses them entirely. Fetch them from two places: PR
**review bodies** and PR **issue comments**. Both implement `Reactable`, so a `$ME` reaction is a
durable "handled" marker (no thread to resolve), and both expose `lastEditedAt` to detect re-edits.

```bash
gh api graphql -F owner="$OWNER" -F repo="$REPO" -F pr=<pr> -f query='
query($owner:String!, $repo:String!, $pr:Int!) {
  repository(owner:$owner, name:$repo) {
    pullRequest(number:$pr) {
      reviews(first:100) {
        nodes {
          id author { login } body state submittedAt lastEditedAt
          reactions(first:100, content: THUMBS_UP) { nodes { user { login } createdAt } }
        }
      }
      comments(first:100) {
        nodes {
          id databaseId author { login } body createdAt lastEditedAt
          reactions(first:100, content: THUMBS_UP) { nodes { user { login } createdAt } }
        }
      }
    }
  }
}'
```

Keep only nodes whose `author.login` is a bot-like account (same list as inline bot findings) and
whose body has non-empty content. A node is **handled** if its `reactions` includes one by `$ME` —
unless `lastEditedAt` is later than that reaction's `createdAt`, in which case re-triage it. Parse
each actionable finding out of the body (often several, with `P0`–`P3` badges).

### Mark a top-level bot comment handled

After the fix is pushed and every actionable finding from the comment is fixed-or-skipped, add the
reaction marker on its node `id` (works for both review bodies and issue comments):

```bash
gh api graphql -f query='
mutation($subjectId:ID!) {
  addReaction(input:{subjectId:$subjectId, content: THUMBS_UP}) { reaction { content } }
}' -F subjectId="<review or comment node id>"
```

Optionally cite the sha once for traceability (issue comments have no inline thread to reply on):

```bash
gh pr comment <pr> --body "addressed in $HEAD_SHA: <one line per finding from the bot's comment>"
```

## Reply and resolve a thread (loop's write-back)

After the fix commit has been pushed, reply to the thread that a comment belongs to —
`<comment_id>` is the thread's top-level comment `databaseId`. Then resolve the same thread with
its GraphQL node `id`.

```bash
gh api -X POST repos/$OWNER_REPO/pulls/<pr>/comments/<comment_id>/replies \
  -f body="addressed in $HEAD_SHA: <one line on what changed>"
```

```bash
gh api graphql -f query='
mutation($threadId:ID!) {
  resolveReviewThread(input:{threadId:$threadId}) {
    thread { id isResolved }
  }
}' -F threadId="<thread node id>"
```

Resolve only after the fix commit was pushed and the reply was posted. Resolve only bucket-①
threads that were actually fixed in this round; never resolve needs-confirm or skipped threads.

## Commit & push (per round)

Stage only files you changed this round, by path; never `git add -A`/`.`/`-a` — on a shared
branch, sweeping up someone else's uncommitted work is the worst failure mode.

```bash
git add <only the files this round touched>
git commit -m "<summary of findings addressed this round>" \
  -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
git push        # plain push to the PR branch; never force-push a shared branch
HEAD_SHA=$(git rev-parse HEAD)   # the sha to cite in replies this round
```
