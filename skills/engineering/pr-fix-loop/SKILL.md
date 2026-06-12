---
name: pr-fix-loop
description: Iteratively detect and fix everything outstanding on a GitHub PR — CI failures, bot review findings, and human inline comments — then push, wait for CI, and re-scan until nothing actionable remains. Use when asked to "fix the remaining issues on a PR", "address PR feedback", "loop until CI is green", "auto-fix PR comments", or 检查 PR 状态和 comment 自动修复 / 修到没有新 finding 为止. Author-side by default; runs on any PR branch you have push access to.
---

# PR Fix Loop

Drive a PR to "done" by looping: scan for findings → triage → fix the clear ones → quick-check
locally → commit → reply → push → wait for CI → re-scan. Stop when CI is green and no actionable
finding remains, or when something needs your call.

This is the **author-side counterpart** to `pr-code-review`. It reuses that skill's gh patterns —
repo context, PR metadata, inline-comment fetch, the Reviews API, line-number mapping all live in
[`../pr-code-review/references/gh-cli.md`](../pr-code-review/references/gh-cli.md). Loop-specific
commands — `checks --watch`, the GraphQL thread query, the reply API, CI-log fetch, the per-round
commit — live in [references/gh-loop.md](references/gh-loop.md). The commit step follows the
`signoff` discipline (stage only your own files).

**Prerequisite:** `gh` installed and authenticated (`gh auth status`).

## Workflow overview

0. Preflight — repo context, head SHA, **push permission**, checkout.
1. Scan three finding sources — CI, bot findings, human inline comments.
2. Triage into three buckets — auto-fix / needs-confirm / skip.
3. **First round only:** show the plan and wait for "go".
4. Fix the auto-fix bucket.
5. Quick-check locally before push.
6. Commit (one per round) and reply `addressed in <sha>`.
7. Push, then `gh pr checks --watch`.
8. Re-scan and repeat until a stop condition fires.

## 0) Preflight

```bash
OWNER_REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
ME=$(gh api user --jq .login)
```

Check **push permission** (`gh api repos/$OWNER_REPO --jq .permissions.push`). If `false`, run in
**advise-only** mode: do steps 1–2 every pass, print the fixes you *would* make, never
commit/push/reply. Otherwise `gh pr checkout <pr>` and continue. Commands: [gh-loop.md](references/gh-loop.md#push-permission-preflight).

Note who you are relative to the PR: you may be the author, or (as on real review PRs) the
reviewer stepping in to fix — both are fine, replies just post under `$ME`.

## 1) Scan finding sources

Refresh `HEAD_SHA` each pass (others may have pushed). Scan exactly these three; **ignore**
top-level review bodies and issue comments (too discussion-heavy to act on safely):

1. **CI failures** — `gh pr checks <pr> --json name,state,bucket,link`. Any `bucket: fail`.
2. **Bot findings** — inline comments from `*[bot]` logins (codex, claude, coderabbit, copilot),
   usually carrying a `P0`–`P3` badge.
3. **Human inline comments** — open review threads from the GraphQL query.

Use the GraphQL `reviewThreads` query (not REST) so you get `isResolved` and the full reply chain.
Per the dedup rule (below), drop threads that are resolved or already carry our `addressed in <sha>`
reply at/under HEAD. Commands: [gh-loop.md](references/gh-loop.md#inline-review-comments--thread-resolution-state-graphql).

## 2) Triage into three buckets

For every candidate, sort into exactly one bucket. **Only bucket ① is ever auto-applied.**

- **① auto-fix** — clear and mechanical, intent unambiguous: a CI failure with a diagnosable cause,
  a bot nit, "add a guard / null-check", "rename X", "extract this", "use library Y instead of the
  hand-rolled thing" when the swap is obvious and low-risk.
- **② needs-confirm** — a design trade-off, an open question, or ambiguity: "should we use sonner
  or radix here?", "is this object or string?", anything where a reasonable engineer could pick
  differently. List it for the user; do not touch it.
- **③ skip** — explicitly deferred or out of scope: "separate PR", "historical issue, unrelated",
  "TODO, handle later", or a thread already concluded in its replies. List it with the one-line
  reason you skipped it.

When unsure between ① and ②, it is **②**. Fixing the wrong thing on a shared PR is worse than asking.

## 3) First-round gate

On the **first** round, before any push:

- Print the plan: bucket ① (what you'll change, file:line), bucket ② (needs your call), bucket ③
  (skipped + why), and the current CI state.
- Wait for an explicit "go" ("go", "改吧", "可以"). Treat "looks good"/"ok" as ambiguous — confirm once.

After the first push, run **autonomously** — no gate per round — **except** when a *new*
needs-confirm finding appears in a later round (stop guard below).

## 4) Fix the auto-fix bucket

Read each target file in full context before editing (the inline comment's `line` may be stale).
Make the smallest change that genuinely resolves the finding — not a change that merely makes the
comment look addressed. For a CI failure, fix the root cause; don't paper over a failing test.

## 5) Quick-check locally before push

Slow external CI (e.g. Jenkins) makes blind pushes expensive — catch what you can locally first.
Detect the repo's commands (e.g. `package.json` scripts, `Makefile`, `turbo`/`pnpm`/`nx`) and run,
scoped to what you touched where possible:

1. typecheck (e.g. `tsc --noEmit`, `pnpm typecheck`)
2. lint (e.g. `eslint <changed files>`, `pnpm lint`)
3. the tests covering the files you changed

If a command can't be discovered, say so and skip it — don't invent one. Only proceed to commit
when the checks you *could* run pass. If a local check fails, fix it before pushing (it counts as
the same round, not a new finding).

## 6) Commit and reply

**One commit per round.** Stage only the files you changed this round, by path — never `git add -A`,
`.`, or `-a` (the `signoff` golden rule; on a shared branch this matters most). Message summarizes
the findings addressed; include the co-author trailer. Then capture the new sha and reply on each
addressed thread with `addressed in <sha>: <one line>` — **do not resolve** the thread.
Commands: [gh-loop.md](references/gh-loop.md#commit--push-per-round) and
[reply](references/gh-loop.md#reply-on-a-thread-loops-write-back).

## 7) Push and wait for CI

```bash
git push                                    # plain push; never force-push a shared branch
gh pr checks <pr> --watch --interval 30     # blocks until all checks finish
```

Then go to step 1 and re-scan (CI result + any new comments that arrived meanwhile).

## Stop conditions

End the loop and report when **any** fires:

- **Done** — CI green **and** no bucket-① finding remains. (The success case.)
- **Max rounds** — default **5**. Stop and summarize what's left.
- **No progress** — the same finding survives two consecutive rounds (CI still failing on the same
  cause, or the same comment still open after a fix attempt). Stop and escalate it.
- **CI undiagnosable** — a check failed but the log isn't reachable (external/Jenkins `link` gh
  can't fetch). Surface the `link` and stop for the user to paste the relevant log.
- **New needs-confirm** — a bucket-② finding appears in a later round. Pause and ask, consistent
  with the first-round gate.

## Dedup — how "new" is decided

No local state file. Every round re-scans from scratch; the markers live on GitHub, so the loop
survives interruption and re-invocation:

- A **thread** is handled if `isResolved`, or its last comment is `$ME`'s `addressed in <sha>` with
  `<sha>` an ancestor of HEAD and no later reply reopening it.
- A **CI check** is a finding only while it's `bucket: fail` at the current HEAD.
- A finding seen-but-unfixed across rounds trips the no-progress guard rather than looping forever.

## Per-round and final output

Each round, print a compact status: round number, what was fixed + pushed (with sha), what's in
buckets ② / ③, and the CI verdict you're now waiting on.

On stop, render a summary:

```
## PR fix loop — <done | stopped: <reason>>
**Rounds**: <n>   **CI**: <green | failing: <check>>
**Fixed**: <count> — <one line each, file + sha>
**Needs your call (②)**: <list, or none>
**Skipped (③)**: <list + reason, or none>
**Still open**: <anything left and why>
```
