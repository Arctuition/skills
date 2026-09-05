---
name: html-pr-review
description: Create a self-contained HTML companion for reviewing a GitHub PR, with a risk map and annotated changes. Use when a reviewer requests an HTML or visual review handoff; a plain "review PR" request does not require an HTML artifact.
---

# HTML PR Review Companion

Orient a reviewer to what changed, where the risks are, and which questions remain. This artifact does not post a GitHub review.

## Ground the review

Read the actual PR diff at a captured head SHA, its description, affected callers, tests, and current CI. For local branches, use the merge-base diff so base advancement is not mistaken for PR changes.

Tie concerns to supported scenarios and source locations. Distinguish defects from unanswered questions, and do not manufacture a quota of findings. Assess risk from behavior: type-only changes, migrations, dependency bumps, and generated files can affect existing contracts.

## Compose

Default to a brief explanation, a file risk map, the consequential hunks with annotations, and relevant questions/validation limits. Group mechanical files where that improves reading; add a call graph only when it explains an important relationship.

Risk colors retain their shared meanings: olive = safe, oat = worth a look, clay = needs attention. Explain the reason for each material risk and never use color as the sole signal.

Use [reviews.md](references/components/reviews.md) for diff rows and blocking/question/nit bubbles. Keep line numbers accurate for old and new code. Include actual code where it helps assess a finding; do not reproduce the full PR by default.

State the reviewed SHA and which checks were actually run or observed, distinct from suggested test coverage.

## Build and verify

<!-- shared:html-workflow-start -->
Read [design-tokens.md](references/design-tokens.md) for the base style, then only the component references needed for this artifact. Adapt structure to the material and the user's requested format or style. Match the user's prose language and preserve source identifiers.

Assemble one self-contained HTML file. Render it in an available browser and inspect wide and narrow layouts, diagrams, and interactive controls. Fix overlap, overflow, or broken navigation before delivery; if rendering is unavailable, state the verification limit.
<!-- shared:html-workflow-end -->

## Deliver

Default filename: `pr-<NUMBER>-review.html`.

<!-- shared:save-conventions-start -->
Save in `~/artifacts/` unless the user specified another path. Return a file link supported by the current environment, not the HTML source. Open or share the artifact only when requested.
<!-- shared:save-conventions-end -->
