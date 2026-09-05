---
name: html-artifact
description: Create self-contained HTML reports, explainers, or comparisons when a shareable visual document is requested. Excludes application UI work and ordinary chat or Markdown answers.
---

# HTML Artifact

Create a portable visual document shaped by its audience and purpose. Prefer an available specialized HTML skill for a PR review companion, PR writeup, module map, or conversation recap; this skill can handle those documents when installed alone.

Choose the smallest structure that explains the material. Use diagrams, comparisons, or interaction where they improve understanding; sections and component counts are not prescribed. Preserve the distinction between sourced facts, estimates, and proposals.

## Build and verify

<!-- shared:html-workflow-start -->
Read [design-tokens.md](references/design-tokens.md) for the base style, then only the component references needed for this artifact. Adapt structure to the material and the user's requested format or style. Match the user's prose language and preserve source identifiers.

Assemble one self-contained HTML file. Render it in an available browser and inspect wide and narrow layouts, diagrams, and interactive controls. Fix overlap, overflow, or broken navigation before delivery; if rendering is unavailable, state the verification limit.
<!-- shared:html-workflow-end -->

## Deliver

Choose a descriptive `<SUBJECT>.html` filename.

<!-- shared:save-conventions-start -->
Save in `~/artifacts/` unless the user specified another path. Return a file link supported by the current environment, not the HTML source. Opening a browser for local verification is part of building the artifact; opening the final file for the user or sharing it externally requires a request or existing authorization.
<!-- shared:save-conventions-end -->
