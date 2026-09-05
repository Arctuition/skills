---
name: html-module-map
description: Create a self-contained HTML module or workflow map with diagrams and an execution walkthrough. Use for an HTML architecture explainer or visual onboarding handoff; ordinary "explain this function" requests can be answered in chat.
---

# HTML Module Map

Help a reader understand the module's boundary, entry points, main flow, and where to make changes.

## Source and structure

Trace actual source and callers when a repository is available. For a business workflow, identify actors, events, and states from the supplied material. Ask only when missing scope or behavior would materially change the map.

A useful default is:
- Scope and the main invariant or responsibility.
- A diagram of the important nodes and data/event flow.
- A walkthrough in execution order, with source locations or actors.
- Key files and supported gotchas; include a glossary or state/sequence diagram when useful.

Do not invent traffic percentages, hidden dependencies, or undocumented gotchas. Distinguish inferred behavior from verified code paths.

Use [diagrams.md](references/components/diagrams.md) for SVG and walkthrough components. Preserve real branches and cycles; split diagrams for readability rather than enforcing a fixed node count. Highlight the main path and inspect arrow endpoints and labels.

Keep code excerpts limited to what explains the behavior. Put long signatures or queries in code blocks. For file lists, use the sidebar panel in narrow columns and the main-column file index in the body.

## Build and verify

<!-- shared:html-workflow-start -->
Read [design-tokens.md](references/design-tokens.md) for the base style, then only the component references needed for this artifact. Adapt structure to the material and the user's requested format or style. Match the user's prose language and preserve source identifiers.

Assemble one self-contained HTML file. Render it in an available browser and inspect wide and narrow layouts, diagrams, and interactive controls. Fix overlap, overflow, or broken navigation before delivery; if rendering is unavailable, state the verification limit.
<!-- shared:html-workflow-end -->

## Deliver

Default filename: `<SUBJECT>-breakdown.html`.

<!-- shared:save-conventions-start -->
Save in `~/artifacts/` unless the user specified another path. Return a file link supported by the current environment, not the HTML source. Open or share the artifact only when requested.
<!-- shared:save-conventions-end -->
