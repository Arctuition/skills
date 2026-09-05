---
name: html-artifact
description: Create a self-contained HTML report, explainer, comparison, or interactive handoff using the team's visual style. Use when the user requests HTML or a shareable visual document; ordinary chat answers, Markdown summaries, and application UI work do not require this skill.
---

# HTML Artifact

Create a portable visual document shaped by its audience and purpose. Use the specialized HTML skills for a PR review companion, PR writeup, module map, or conversation recap when that is the requested deliverable.

Choose the smallest structure that explains the material. Use diagrams, comparisons, or interaction where they improve understanding; sections and component counts are not prescribed. Preserve the distinction between sourced facts, estimates, and proposals.

## Build and verify

<!-- shared:html-workflow-start -->
Read [design-tokens.md](references/design-tokens.md) for the base style, then only the component references needed for this artifact. Adapt structure to the material and the user's requested format or style. Match the user's prose language and preserve source identifiers.

Assemble one self-contained HTML file. Render it in an available browser and inspect wide and narrow layouts, diagrams, and interactive controls. Fix overlap, overflow, or broken navigation before delivery; if rendering is unavailable, state the verification limit.
<!-- shared:html-workflow-end -->

## Deliver

Choose a descriptive `<SUBJECT>.html` filename.

<!-- shared:save-conventions-start -->
Save in `~/artifacts/` unless the user specified another path. Return a file link supported by the current environment, not the HTML source. Open or share the artifact only when requested.
<!-- shared:save-conventions-end -->
