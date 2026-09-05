---
name: pr-fix-loop
description: Fix outstanding CI failures and review findings on a GitHub PR, push changes, and re-scan until no actionable work remains. Use for "address PR feedback", "loop until CI is green", "final fix pass", or "修到没有新 finding 为止", including already-green PRs.
---

# PR Fix Loop

Scan → evaluate → fix → validate → push → re-scan. A green or mergeable PR still needs a complete scan when the user requests a final pass.

## Scope and preflight

Check `gh auth status`, the PR's head/base repositories and branches, current head SHA, and local worktree state. Verify push permission on the actual head repository, which may be a fork. Prepare an isolated worktree if checkout would disturb unrelated work.

Use the existing request as authorization for the requested fix/push workflow; announce the first-pass findings and intended changes without requiring another "go". Honor plan-only requests. Posting replies or resolving threads requires explicit authorization from the user, including any already given for this session. Missing write-back authorization does not block code fixes or read-only verification.

Commands for scans and authorized write-back are in [gh-loop.md](references/gh-loop.md).

## Scan every round

Capture the remote head SHA and inspect all relevant pages of:
- CI checks for that head, including pending, failed, cancelled, and skipped states.
- Unresolved inline review threads, with full replies and resolution state.
- Top-level review bodies and PR issue comments, including bot findings posted as a single global comment.

Treat connector accounts such as `claude`, `chatgpt-codex-connector`, `coderabbitai`, and `copilot` as bot-like even without a `[bot]` suffix. Evaluate human top-level feedback when it contains an actionable request; discussion is not automatically an instruction to change code.

Use GraphQL `reviewThreads.isResolved` for thread state. CI green, mergeability, an outdated line, an "addressed" reply, or a thumbs-up reaction does not prove a finding is fixed. Verify it against current source.

## Evaluate and fix

For each finding, determine whether it is:
- **Actionable within scope:** evidence supports the defect and the intended correction. Fix it.
- **Needs a decision:** missing intent or a material product/API/design choice changes the result. Surface the choice; continue independent in-scope work.
- **Not actionable:** already fixed, incorrect, pre-existing, explicitly deferred, or outside scope. Record the reason.

Do not implement a bot suggestion merely because it is mechanical. Trace the relevant code and validate its premise first. Resolve routine implementation choices autonomously; seek input only for substantive ambiguity or additional authority.

For failing checks, read the actual logs. Use available CI tools, authenticated APIs, or browser access for external providers such as Jenkins; lack of `gh run` support alone is not a blocker. Distinguish infrastructure/deployment failures from code defects.

Make the smallest supported correction. Run repository-required checks and proportionate validation; do not invent commands or rewrite tests to conceal a failure.

## Commit and push

Keep task changes separate from pre-existing edits, including already staged files. Stage explicit task paths; for wholly task-owned files use a path-scoped commit:

```bash
git add -- "<TASK_FILE>"
git -c commit.gpgsign=false commit --only -m "<ROUND_SUMMARY>" -- "<TASK_FILE>"
```

`--only` commits the working-tree contents of the selected paths. For files with mixed ownership, isolate the task hunks in a separate index or worktree. Inspect the commit before pushing to the PR head branch. Never force-push a shared branch.

If the remote advanced, integrate the new head safely and revalidate before a normal push. Do not overwrite another contributor's work.

## Verify and write back

After a successful push, record the pushed SHA. If authorized, reply `addressed in <SHA>: <reason>` and resolve only the threads whose findings were verified fixed. Do not resolve skipped, undecided, or unsuccessfully pushed fixes.

Top-level comments have no thread to resolve. Track findings by comment ID, body version, and current code evidence; do not use reactions as durable completion markers. Re-evaluate edited comments and later replies.

Wait for CI and any requested automated reviews using the available wait mechanism; keep the user updated. Re-scan after checks finish and confirm the head is still the one validated.

## Completion and stopping

Report **done** only when relevant checks/reviews have completed successfully and no actionable or undecided finding remains. If code is fixed but a thread remains unresolved, report both states accurately.

Do not present skipped/cancelled checks, absent expected checks, or an unscanned source as green. Inspect whether those gaps matter and state the verification limit.

Pause dependent work when user input, inaccessible evidence, or additional authority is essential. If repeated attempts make no progress, report the cause and remaining work instead of repeating the same action. Honor explicit user time/round limits; otherwise do not stop solely because an arbitrary round count was reached.

Return the PR link, pushed commits, validation status, and any remaining decisions or limitations.
