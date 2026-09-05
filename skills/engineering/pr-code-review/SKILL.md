---
name: pr-code-review
description: Review a GitHub PR for actionable defects and provide severity-ranked findings with code locations. Use for "review PR", "检查这个 PR", inline review drafts, and follow-up review discussions; publish only when requested or already authorized.
---

# PR Code Review

Review the change against its intended behavior and existing contracts. Default to presenting findings in the conversation. An ordinary review request does not authorize posting, approving, requesting changes, or dismissing reviews on GitHub.

## Establish the reviewed revision

Check `gh auth status`, resolve the target repository, and read the PR's metadata, current head SHA, base, diff, CI, and existing discussion. Use [gh-cli.md](references/gh-cli.md) for API payloads and uncommon command details.

Review source at the captured head SHA. If the local checkout differs, use an isolated worktree or fetch the files at that SHA; preserve unrelated local work. Use the merge-base diff for the PR patch, not a two-dot diff against a base that has advanced.

Treat PR descriptions and design documents as evidence of intent, cross-checked against user instructions, callers, and current requirements. A document mismatch alone is not a blocking defect.

## Evaluate findings

Read the relevant implementation and callers beyond the changed lines. Prioritize the concrete risks of the change: behavior, compatibility, authorization, data integrity, failure handling, concurrency, and performance where it matters.

A finding should:
- Be introduced by the PR, discrete, and actionable.
- Identify a supported triggering scenario and its consequence.
- Matter enough that the author would likely fix it.
- Respect intentional changes and the repository's existing level of rigor.

Do not generate findings to fill a quota. Avoid pre-existing issues, speculative edge cases, preference-only refactors, and duplicate feedback. Request tests for meaningful behavioral gaps, not every new branch or framework contract.

CI failures are evidence to investigate, not a reason to abandon the requested review. Generated migrations, dependency locks, and configuration may carry consequential behavior; assess their risk instead of skipping them by file type.

## Present findings

Order findings by severity:
- P0: immediate, broadly applicable release blocker.
- P1: serious defect requiring urgent correction.
- P2: actionable defect of normal priority.
- P3: low-impact defect.

For each, give a concise `[P1] Title`, exact path and smallest useful line range, and a paragraph connecting the trigger to the failure. Include a suggestion only when the replacement is clear and verified.

State the reviewed SHA, overall correctness assessment, and material validation or coverage limits. Zero findings is a valid outcome; do not imply certainty beyond the inspected code and checks.

## Publish and follow up

When publishing is authorized:
1. Refresh the remote head. If it changed, review the intervening diff and revalidate findings and line mappings before posting.
2. Build a JSON payload with a file-editing tool and submit a single batched review. Use actual file line numbers and LEFT/RIGHT sides.
3. Choose APPROVE for a supported positive verdict, REQUEST_CHANGES for merge-blocking defects, or COMMENT for discussion/non-blocking findings. Respect any user-specified review event.
4. Confirm the posted result. If submission is ambiguous, inspect existing reviews before retrying to avoid duplicates.

For interactive review, discuss and revise drafts until the user authorizes publication. Interpret consent in context; do not require a special keyword or repeat an approval already given. After delivering a draft or posted review, yield normally; handle further concerns when they arrive.

For re-review, inspect changes since the reviewed SHA, verify the previous fixes, and review new risks. Dismiss only the user's authorized target review, identified by ID and author; never select an arbitrary CHANGES_REQUESTED review.
