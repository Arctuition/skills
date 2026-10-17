---
name: pr-fix-loop
description: Fix CI and review findings on a GitHub PR through push and re-scan. Use for "address PR feedback", "final fix pass", or "修到没有新 finding 为止".
---

# PR Fix Loop

Scan → evaluate → fix → validate → push → re-scan. A green or mergeable PR still needs a complete feedback/CI scan when the user requests a final pass; code re-review follows the changed behavior and earlier findings.

## Scope and preflight

Check `gh auth status`, the PR's head/base repositories and branches, current head and base SHAs, and local worktree state. Read applicable `AGENTS.md` and root/path-specific `REVIEW.md` when present for domain risks, accepted tradeoffs, and required validation. Verify push permission on the actual head repository, which may be a fork. Prepare an isolated worktree if checkout would disturb unrelated work.

Use the existing request as authorization for the requested fix/push workflow; announce the first-pass findings and intended changes without requiring another "go". Honor plan-only requests. Posting replies or resolving threads requires explicit authorization from the user, including any already given for this session. Missing write-back authorization does not block code fixes or read-only verification.

Commands for scans and authorized write-back are in [gh-loop.md](references/gh-loop.md).

## Scan every round

Capture the remote head and base SHAs and inspect all relevant pages of:
- CI checks for that head, including pending, failed, cancelled, and skipped states.
- Unresolved inline review threads, with full replies and resolution state.
- Top-level review bodies and PR issue comments, including bot findings posted as a single global comment.

Treat connector accounts such as `claude`, `chatgpt-codex-connector`, `coderabbitai`, and `copilot` as bot-like even without a `[bot]` suffix. Evaluate human top-level feedback when it contains an actionable request; discussion is not automatically an instruction to change code.

Use GraphQL `reviewThreads.isResolved` for thread state. CI green, mergeability, an outdated line, an "addressed" reply, or a thumbs-up reaction does not prove a finding is fixed. Verify it against current source.

Update any existing shared record after each scan; line movement or a reworded duplicate does not reset a finding. Re-evaluate edited comments and replies for new evidence, but reopen an accepted tradeoff or rejected finding only when that evidence changes its premise.

After the first pass, review the delta since the last reviewed head, the original fixes, and affected callers; refresh the full feedback/CI surface every round. Recheck merge interactions if the base advances. Expand code review when new evidence, risk, or the user requests it, rather than repeatedly mining unchanged code. A newly evidenced material defect introduced by the PR still needs evaluation even if earlier passes missed it.

## Shared evidence and handoff

Reuse an existing `review.md`; create one only to retain a useful repro or hand off work. Default to `$HOME/.local/state/pr-review/<HOST>/<OWNER>/<REPO>/<PR>/review.md`, outside temporary directories and worktrees. Take all four path segments from the canonical PR web URL: web host, base repository owner/name, and numeric PR number; never use an SSH alias or the head fork. Copy temporary records and repro artifacts there and update their links.

Treat the record as historical context. Before reuse, match its PR URL to the current PR and confirm its reviewed head is the current PR head or an ancestor of it. Archive a mismatched record with its artifacts and restart as a first pass. Always refresh live CI and discussion. A new or explicitly full review performs the full first pass; only a continuation uses delta review. One agent writes each record at a time; collaborators return evidence to that writer.

Keep the record to:

- **Revision:** canonical PR URL and reviewed head/base.
- **Checks:** command or CI link, tested SHA, result, and remaining validation.
- **Findings:** root cause + affected contract, comment IDs/body versions when relevant, first-seen SHA, status/reason, and evidence links.

Retain useful repro scripts and minimal sanitized inputs and outputs beside the record through follow-up; remove redundant raw captures created for this work. Include command/setup, tested SHAs and observed results. Verify repairs with the same scenario; a regression test counts only if it fails on the pre-fix code for the claimed bug and passes after. Label source-only or unrun evidence; promote probes to permanent tests only when their regression value warrants it.

Share absolute paths to handoff artifacts only with the user or the next local agent. Keep handoff files and their local filesystem paths out of commits, PR bodies, reviews and replies, even when publication is authorized; use PR URLs, SHAs and comment IDs as public handoff references.

## Evaluate and fix

When collaboration tools are available, delegate independent findings against the same captured head if it saves time or improves coverage. Reconcile results before editing shared files or pushing.

For each finding, determine whether it is:
- **Actionable within scope:** evidence supports the defect and the intended correction. Fix it.
- **Needs a decision:** missing intent or a material product/API/design choice changes the result. Surface the choice; continue independent in-scope work.
- **Not actionable:** already fixed, incorrect, pre-existing, explicitly deferred, or outside scope. Record the reason.

On a bug-fix PR, a finding that is a regression in code this PR added outside the originally failing branch, or whose fix needs a new helper, model, lookup path, or contract, is **Needs a decision** rather than another patch: offer narrowing the PR back to the failing branch, with the current size from `gh pr view --json additions,deletions`.

Do not implement a bot suggestion merely because it is mechanical. Try to disprove its premise against actual callers, boundary guarantees, and existing detection/recovery. Establish a reachable failure and material impact, or a concrete maintenance cost for design feedback; distinguish merge-blocking defects from non-blocking improvements. Use a focused reproduction or independent check when it would resolve consequential uncertainty. Resolve routine implementation choices autonomously; seek input only for substantive ambiguity or additional authority.

For failing checks, read the actual logs. Use available CI tools, authenticated APIs, or browser access for external providers such as Jenkins; lack of `gh run` support alone is not a blocker. Distinguish infrastructure/deployment failures from code defects.

Make the smallest supported correction, checking other instances of the same root cause within scope so the repair is complete. Run repository-required checks and proportionate validation; do not invent commands or rewrite tests to conceal a failure.

## Commit and push

Keep task changes separate from pre-existing edits, including already staged files. Stage explicit task paths; for wholly task-owned files use a path-scoped commit:

```bash
git add -- "<TASK_FILE>"
git -c commit.gpgsign=false commit --only -m "<ROUND_SUMMARY>" -- "<TASK_FILE>"
```

`--only` commits the working-tree contents of the selected paths. For files with mixed ownership, isolate the task hunks in a separate index or worktree. Inspect the commit before pushing to the PR head branch. Never force-push a shared branch.

If the remote advanced, integrate the new head safely and revalidate before a normal push. Do not overwrite another contributor's work.

## Verify and write back

After a successful push, record the pushed SHA. Replay the original failure or check the original contract against that SHA before marking a finding fixed. If authorized, reply `addressed in <SHA>: <reason>` and resolve only the threads whose findings were verified fixed. Do not resolve skipped, undecided, or unsuccessfully pushed fixes.

Top-level comments have no thread to resolve. Use the finding record and current code evidence; do not use reactions as durable completion markers.

Wait for CI and any requested automated reviews using the available wait mechanism; keep the user updated. Re-scan after checks finish and confirm the head is still the one validated.

## Convergence checkpoint

After three fix/re-review rounds without convergence, use the finding record to distinguish an incomplete root-cause fix, unclear intended behavior, regressions introduced by fixes, and repeated review noise. Adjust the approach and continue authorized work. This checkpoint does not declare success or require another approval. Surface only decisions that genuinely need the user; honor explicit time/round limits.

## Completion and stopping

Report **done** only when relevant checks/reviews have completed successfully and no actionable or undecided finding remains. If code is fixed but a thread remains unresolved, report both states accurately.

Do not present skipped/cancelled checks, absent expected checks, or an unscanned source as green. Inspect whether those gaps matter and state the verification limit.

Pause dependent work when user input, inaccessible evidence, or additional authority is essential. If repeated attempts make no progress, report the cause and remaining work instead of repeating the same action. Honor explicit user time/round limits; otherwise do not stop solely because an arbitrary round count was reached.

Return the PR link, pushed commits, validation status, and any remaining decisions or limitations.
