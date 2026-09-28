---
name: pr-code-review
description: Review GitHub PRs for correctness, unnecessary complexity, and adherence to project conventions. Use for "review PR", "检查这个 PR", inline review drafts, or follow-up review discussions.
---

# PR Code Review

Review the change against its intended behavior, existing contracts, and project conventions. Honor a narrower user-requested scope. Default to presenting findings in the conversation. An ordinary review request does not authorize posting, approving, requesting changes, or dismissing reviews on GitHub.

## Establish the reviewed revision

Check `gh auth status`, resolve the target repository, and capture the PR's head and base SHAs with its metadata. Read CI and existing discussion, including paginated review threads, their resolved/outdated state, and complete replies. Use [gh-cli.md](references/gh-cli.md) for commands and API payloads.

Review source at the captured head SHA and generate the merge-base diff from the captured base and head SHAs. If the local checkout differs, use an isolated worktree or fetch the files at that SHA; preserve unrelated local work. Do not mix a live PR diff with source from an earlier snapshot. Associate CI results with the revision they actually checked.

Use thread state and replies to avoid duplicate feedback, then verify whether the concern still applies to current code; resolved or outdated does not by itself prove a fix.

Treat PR descriptions and design documents as evidence of intent, cross-checked against user instructions, callers, and current requirements. A document mismatch alone is not a blocking defect.

Read applicable `AGENTS.md`, contribution guidance, and relevant lint/type/format configuration. Use comparable code in the affected module to establish unwritten conventions; a single legacy example is not a project rule. Prefer explicit current guidance when it conflicts with older code.

## Evaluate findings

Read the relevant implementation and callers beyond the changed lines. Prioritize the concrete risks of the change: behavior, compatibility, authorization, data integrity, failure handling, concurrency, and performance where it matters.

Read [compatibility.md](references/compatibility.md) when the PR changes API responses, request or schema fields, serializers, templates, tenant-gated behavior, dependencies, or app-facing contracts, deletes code in bulk, or when the user asks to review only for regressions.

Also check these design and test concerns:

- **Over-defensive code:** Trace input boundaries and enforced invariants before questioning repeated validation, silent defaults, broad exception handling, or compatibility branches. Flag branches for unsupported cases, duplicate validation without a boundary to justify it, and fallbacks that hide contract violations or errors. Keep defenses justified by actual untrusted inputs, supported legacy data, or recoverable failures; type annotations alone do not establish a runtime guarantee.
- **Over-abstraction:** Check whether new interfaces, factories, generic helpers, or configuration layers serve current callers or an explicit requirement. Flag indirection that adds concepts or spreads a local change across layers without a concrete benefit. One caller alone is not evidence of over-abstraction; isolation of a real boundary or complex responsibility can justify it.
- **Abstraction leakage:** Trace what callers must know about an implementation. Flag callers branching on provider details, manipulating internal representations, or repeating setup/error translation that an existing boundary promises to own. Identify both the leaking detail and the layer that should own it; an intentionally exposed domain concept is not a leak.
- **Project conventions:** Compare naming, module placement, dependency direction, error handling, logging, typing, and test patterns with applicable rules and comparable local code. Cite the rule or consistent pattern being violated. Account for intentional migrations and established exceptions; do not impose a preferred architecture or copy an unrelated legacy pattern.
- **Test value:** Do not request or add a test merely because code changed or a branch lacks coverage. Check what meaningful business contract, invariant, user-visible outcome, or plausible regression it protects beyond existing coverage. Flag tests that only mirror implementation, assert mock/framework/decorator wiring without protecting such a contract, or duplicate coverage without a distinct risk; suggest removal or consolidation. Mocks and small tests can still protect important behavior. When requesting coverage, name the regression it should catch and why existing tests miss it; existing tests or focused validation can otherwise be sufficient.

A finding should:

- Be introduced by the PR, discrete, and actionable.
- Identify a supported failure scenario, concrete maintenance cost, or violated project rule, with source evidence.
- Matter enough that the author would likely fix it.
- Account for intentional changes and the repository's existing level of rigor.

Design findings do not need an invented runtime failure. Explain the current cost and the smallest useful simplification or boundary repair within the PR's scope. Avoid turning a local issue into a broad rewrite.

Do not generate findings to fill a quota. Avoid pre-existing issues, speculative edge cases, preference-only refactors, and duplicate feedback.

CI failures are evidence to investigate, not a reason to abandon the requested review. Generated migrations, dependency locks, and configuration may carry consequential behavior; assess their risk instead of skipping them by file type.

## Present findings

Order findings by severity:

- P0: immediate, broadly applicable release blocker.
- P1: serious defect requiring urgent correction.
- P2: actionable issue of normal priority.
- P3: low-impact issue.

For each, give a concise `[P1] Title`, exact path and smallest useful line range, and a paragraph connecting the evidence to the consequence. Include a code suggestion only when the replacement is clear and verified. Base severity and merge-blocking status on impact, not the anti-pattern's name; a design concern alone does not imply a blocking verdict.

State the reviewed head and base SHAs, overall assessment, and material validation or coverage limits. Zero findings is a valid outcome; do not imply certainty beyond the inspected code and checks.

## Publish and follow up

When publishing is authorized:

1. Refresh head/base SHAs, CI, and review threads with their replies. If either SHA changed, rebuild the snapshot and inspect the relevant changes. Revalidate findings and line mappings against current code and discussion before posting.
2. Compare the authenticated user with the PR author. For self-authored PRs, use COMMENT and retain the verdict in the body. Otherwise choose APPROVE for a supported positive verdict, REQUEST_CHANGES for merge-blocking defects, or COMMENT for discussion/non-blocking findings. Honor any user-specified event; if GitHub disallows it, explain the limitation instead of silently substituting another event.
3. Build a JSON payload with a file-editing tool and submit a single batched review. Use actual file line numbers and LEFT/RIGHT sides.
4. Confirm the posted result. If submission is ambiguous, inspect existing reviews before retrying to avoid duplicates.

For interactive review, discuss and revise drafts until the user authorizes publication. Interpret consent in context; do not require a special keyword or repeat an approval already given. After delivering a draft or posted review, yield normally; handle further concerns when they arrive.

For re-review, inspect changes since the reviewed SHA, verify the previous fixes, and review new risks. Dismiss only the user's authorized target review, identified by ID and author; never select an arbitrary CHANGES_REQUESTED review.
