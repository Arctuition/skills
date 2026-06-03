---
name: html-artifact
description: Produce a single self-contained HTML knowledge artifact for one-off deliverables — status reports, incident timelines, slide decks, concept explainers, design comparisons, dashboards, clickable prototypes, weekly digests, post-mortems. Trigger when the user asks for "an HTML for X", "a one-pager", "a status report", "an incident timeline", or describes a spatially-organized document (diff, diagram, side-by-side, time-axis, clickable flow) that would lose its value as flat markdown — even when they don't say "HTML" explicitly.
---

# HTML artifact

Produce one self-contained HTML file using the shared design system.

## Use the design tokens

Read `references/design-tokens.md` and use its colours, typography, page shell, and component CSS exactly. Don't introduce new colours, fonts, or shadows — the shared design system is what keeps team artifacts feeling like a coherent set, and drift here is the failure mode to avoid. If you genuinely need a component the tokens don't cover, build it inline from the existing colours / typography / borders so it still belongs to the family.

The reference components (TL;DR block, ba-grid, principle list, callout-dark, panel, file index, etc.) are a vocabulary, not a checklist — pull in whatever the content needs and skip the rest.

## Everything else is the user's call

Content, sections, ordering, length, what goes first, how many screens — that's for the user and the material to decide, not this skill. Don't impose a template or a required shape; build what the content in front of you needs.

Match the user's prose language: Chinese ask → Chinese prose, English ask → English prose. Code, file paths, identifiers, ticket keys, and CSS class names stay English.

<!-- shared:save-conventions-start -->
Save in `~/artifacts/`, creating the directory if it doesn't exist. If the user specified a directory or filename, honor that instead. Surface a `computer://` link so the user can open it themselves — don't auto-open. Don't dump the HTML source into chat — the artifact is the deliverable.
<!-- shared:save-conventions-end -->

## Reference

- `references/design-tokens.md` — the colour / typography / page-shell / component CSS to use verbatim. Read this before assembling the HTML.
