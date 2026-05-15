---
name: html-artifact
description: Produce a single self-contained HTML knowledge artifact for one-off deliverables — status reports, incident timelines, slide decks, concept explainers, design comparisons, dashboards, clickable prototypes, weekly digests, post-mortems. Trigger when the user asks for "an HTML for X", "a one-pager", "a status report", "an incident timeline", or describes a spatially-organized document (diff, diagram, side-by-side, time-axis, clickable flow) that would lose its value as flat markdown — even when they don't say "HTML" explicitly.
---

# HTML artifact

Produce one self-contained HTML file using the shared design system. **Visual tokens are locked; structure is yours.**

## What's locked

Read `references/design-tokens.md` and use its colours, typography, page shell, and component CSS exactly. Don't introduce new colours, fonts, or shadows. The shared design system is what keeps team artifacts feeling like a coherent set — drift here is the failure mode to avoid. If you genuinely need a component the tokens don't cover, build it inline from the existing colours / typography / borders so it still belongs to the family.

The reference components in `design-tokens.md` (TL;DR block, ba-grid, principle list, callout-dark, panel, file index, etc.) are a **vocabulary, not a checklist**. Pick the ones the content needs, skip the rest, and arrange them however the story reads best.

## What's not

Sections, ordering, length, what goes first, whether to include a TL;DR or a TOC or a hero, whether the artifact is one screen or ten — your call. **Don't reach for a default template.** Design for the content in front of you. If two artifacts in a row come out structurally identical, you're filling a template instead of thinking about what each one needs.

There is no canonical "shape" taxonomy and no required skeleton. A weekly digest, an incident timeline, a clickable prototype, and a concept explainer are nothing alike — let the structure follow the content, not a recipe.

## What you still need to get right

**Does the content earn HTML?** The whole point is the spatial hook — diagram, side-by-side, diff, time-axis, clickable element, anything markdown can't do well. If you can't name the hook for *this particular piece*, push back: "this might be better as markdown." Don't dress flat prose up in HTML for the sake of it.

**Match the user's prose language.** Chinese ask → Chinese prose. English ask → English prose. Code, file paths, identifiers, ticket keys, and CSS class names stay English regardless.

<!-- shared:save-conventions-start -->
Save in `~/artifacts/`, creating the directory if it doesn't exist. If the user specified a directory or filename, honor that instead. Surface a `computer://` link so the user can open it themselves — don't auto-open. Don't dump the HTML source into chat — the artifact is the deliverable.
<!-- shared:save-conventions-end -->

After saving, offer to iterate on a specific part or move on. Don't auto-share.

## Reference

- `references/design-tokens.md` — the full colour / typography / page-shell / component CSS that you must use verbatim. Read this before assembling the HTML.
