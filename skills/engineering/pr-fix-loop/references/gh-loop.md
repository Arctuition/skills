# gh CLI reference for the PR fix loop

Loop-specific commands only. Shared patterns — repo context, PR metadata, inline-comment
fetch, the Reviews API, line-number mapping — live in
[`../../pr-code-review/references/gh-cli.md`](../../pr-code-review/references/gh-cli.md).
Verify flags with `gh <command> --help` if unsure.

## Context every round needs

```bash
OWNER_REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
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
          comments(first:50) {
            nodes { databaseId author { login } body createdAt }
          }
        }
      }
    }
  }
}'
```

(`-F pr=<pr>` passes an int; `-F owner=… -F repo=…` after splitting `$OWNER_REPO` on `/`.)

Per thread, the loop derives state from this payload:

- **skip** if `isResolved` is true.
- **already addressed by us** if the *last* comment is authored by `$ME` and its body starts with
  `addressed in ` — and no later comment from someone else reopened the thread.
- otherwise it's an **open** thread → triage it (SKILL.md step 3).

## Bot findings

Bot reviewers have logins ending in `[bot]` — `chatgpt-codex-connector[bot]`, `claude[bot]`,
`coderabbitai[bot]`, `copilot`. Their finding bodies usually carry a priority badge
(`P0`–`P3`); parse it to seed the triage priority.

## Reply on a thread (loop's write-back)

Reply to the thread that a comment belongs to — `<comment_id>` is the thread's top-level comment
`databaseId`:

```bash
gh api -X POST repos/$OWNER_REPO/pulls/<pr>/comments/<comment_id>/replies \
  -f body="addressed in $HEAD_SHA: <one line on what changed>"
```

The loop **does not resolve threads** — that's left to the reviewer. For reference only, resolving
is a GraphQL mutation `resolveReviewThread(input:{threadId:"<thread node id>"})`; the loop never
calls it by default.

## Commit & push (per round)

Follow the `signoff` discipline — stage only files you changed this round, by path; never
`git add -A`/`.`/`-a`.

```bash
git add <only the files this round touched>
git commit -m "<summary of findings addressed this round>" \
  -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
git push        # plain push to the PR branch; never force-push a shared branch
HEAD_SHA=$(git rev-parse HEAD)   # the sha to cite in replies this round
```
