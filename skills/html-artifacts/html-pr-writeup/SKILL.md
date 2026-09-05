---
name: html-pr-writeup
description: Create an author's HTML PR writeup or visual change handoff. Ordinary GitHub PR descriptions do not require this skill.
---

# HTML PR Writeup

Explain the final change to a reviewer who has not seen the development conversation. This is an author-facing artifact, not a request to publish or edit the GitHub PR.

## Ground the writeup

Read the actual change at the intended source/base revisions, relevant PR or issue context, and available validation results. Use the merge-base diff for a branch comparison. Distinguish observed behavior and measurements from proposed outcomes.

## Compose

A useful default is motivation → observable before/after → the key implementation changes → review focus → validation and rollout considerations.

Scale the structure to the change. Group files by reading order and responsibility; show only source excerpts that clarify the change. Include migrations, flags, or deployment order when relevant. Do not fill empty sections, manufacture performance numbers, or describe unrun checks as passed.

Use shared before/after, code, and risk components when helpful. Explain material tradeoffs and point reviewers to the places that need judgment.

## Build and verify

<!-- shared:html-workflow-start -->
Read [design-tokens.md](references/design-tokens.md) for the base style, then only the component references needed for this artifact. Adapt structure to the material and the user's requested format or style. Match the user's prose language and preserve source identifiers.

Assemble one self-contained HTML file. Render it in an available browser and inspect wide and narrow layouts, diagrams, and interactive controls. Fix overlap, overflow, or broken navigation before delivery; if rendering is unavailable, state the verification limit.
<!-- shared:html-workflow-end -->

## Deliver

Default filename: `pr-<NUMBER>-writeup.html`, or `pr-<BRANCH>-writeup.html` if no PR number exists.

<!-- shared:save-conventions-start -->
Save in `~/artifacts/` unless the user specified another path. Return a file link supported by the current environment, not the HTML source. Opening a browser for local verification is part of building the artifact; opening the final file for the user or sharing it externally requires a request or existing authorization.
<!-- shared:save-conventions-end -->
