---
name: html-artifact
description: Produce a single-file HTML knowledge artifact for one-off needs that don't fit one of the specialized html-* skills. Use this skill ONLY when none of html-pr-review (someone else's PR), html-pr-writeup (your own PR), html-module-map (architecture/workflow explainers), or html-thread-recap (conversation summaries) matches the user's request. Use when the user asks for things like a status report, incident timeline, slide deck, concept explainer, design comparison, implementation plan, ticket triage board, feature flag editor, prompt tuner, animation sandbox, SVG figure sheet, clickable mockup flow, weekly digest, post-mortem, technical brief, research summary, or any other single self-contained HTML deliverable that doesn't have a dedicated html-* skill. Trigger phrases include "make me an HTML for X", "I want a one-pager about Y", "build a status report", "incident timeline", "clickable prototype", "concept explainer", "weekly digest", "implementation plan as HTML", and similar — even when the user doesn't say "HTML" explicitly. The signal is that what the user describes is a spatially-organized document that benefits from being interactive HTML rather than linear markdown (a diff, a diagram, a side-by-side comparison, a toggle, a time-axis, a clickable flow). When in doubt, prefer this skill over generating freeform HTML.
---

# General HTML artifact

You are helping the user produce one self-contained HTML file for a need that doesn't have its own specialized skill. The artifact must look like it came from the same designer as `html-pr-review`, `html-pr-writeup`, `html-module-map`, and `html-thread-recap` — same colour palette, same typography, same components — even though the document type is novel.

The artifact is judged on two axes: **does the layout earn the HTML format** (i.e., would markdown have been just as good?), and **does it look like a designed document** (not auto-generated). If either fails, scrap and restart.

## Step 1 — make sure this is the right skill

Before drafting, verify that none of the four specialized html-* skills fits better:

| If the user wants… | Use |
|---|---|
| To review someone else's PR (risk map, diff with margin notes, questions for the author) | `html-pr-review` |
| To explain their own PR to reviewers (motivation, before/after, file tour, test plan) | `html-pr-writeup` |
| An architecture / workflow explainer for a module or feature (boxes-and-arrows, callstack walk-through) | `html-module-map` |
| A conversation/session recap (decisions, dead ends, open questions) | `html-thread-recap` |
| Anything else | This skill |

If a specialized skill matches, **stop and use it**. This skill is for the long tail. Don't reinvent what another skill already does well.

## Step 2 — name the shape

Most one-off artifacts fall into one of five shapes. Identifying the shape early is the most important judgment call you make — it determines the structure, components, and how you'll fill it.

| Shape | What it does | Typical sections | Best when |
|---|---|---|---|
| **Report** | Linear, time-ordered, factual | TL;DR → findings → details → references | Status updates, post-mortems, incident timelines, weekly digests |
| **Comparison** | Multiple options side-by-side, verdict at end | Header → options grid → criteria table → verdict + tradeoffs | Three-approach exploration, vendor/library evaluation, design directions |
| **Explainer** | Concept → visualization → table → "what next" | TL;DR → concept (prose) → diagram (inline SVG) → comparison table → glossary | Concept explainers, feature briefs, API tours |
| **Dashboard** | Top-line metrics + per-section breakdowns | Header → metrics row → section panels → notes | Weekly status, project health, traffic / cost / error budget summaries |
| **Prototype** | Interactive playground, clickable mockup, parameter tuner | Controls panel → live preview → reset/share | Animation sandbox, prompt tuner, feature-flag editor, clickable flow, SVG figure sheet |

If the request doesn't fit cleanly into one shape, ask the user one focused question about audience and structure before drafting. Don't guess.

## Step 3 — gather inputs

Whatever the shape, you need:

1. **The audience.** Who reads this and what do they do with it? A status report for an exec is different from one for the team that wrote the code.
2. **The "spatial" hook** — what about this content benefits from HTML over markdown? Diff? Diagram? Side-by-side? Toggle? Time-axis? Live controls? **If you can't name it, push back on whether HTML is the right format at all** — sometimes the answer is "actually, markdown would be better".
3. **The data / source material.** What fills the artifact? Numbers, screenshots, file paths, ticket links, narrative. If something is missing and findable from the repo or external systems, find it. If still missing, ask one focused question.
4. **The boundary.** What's out of scope? An incident timeline that secretly grew into "everything that happened in March" is unreadable. Pin the edges.

## Step 4 — assemble

Use this default skeleton unless the user's chosen shape strongly suggests another layout:

1. **Header** — eyebrow (`<source-or-topic> · <ARTIFACT-TYPE>`), `h1` naming what this is, meta line with date / source / scope. Use the `eyebrow + title` and `.meta` patterns from `references/design-tokens.md`.
2. **Optional prompt box** — the user's original ask, when reproducing it helps the reader.
3. **TL;DR** — 3–5 sentences a busy reader can absorb. Lead with the headline, not the methodology. Use the `.tldr` block.
4. **Main content** — the actual artifact body. The structure here depends on the shape (see "Step 2"). Pick components from the shared vocabulary; don't invent new ones unless absolutely necessary.
5. **References / artifacts** — files, links, tickets the artifact depends on or produced. Use the `.ref-badge` component for external links.

For documents above ~3 screens, add a right-side TOC sidebar (`.layout` + `.toc`).

## Step 5 — pick components from the shared vocabulary

`references/design-tokens.md` has the full component list. Don't invent new components — find the closest existing one. Common matches by shape:

- **Report**: `.tldr` for the lead, `.section` headings, `.code` blocks for log excerpts, `.dead-end` for "things that didn't work" (post-mortems), `.ref-badge` for ticket links, `.open-list` for open questions.
- **Comparison**: `.decision` card (option ✓ / ✗ + because + tradeoff) is perfect for two-or-three way option compare. `.ba-grid` for two-column "before / after" or "approach A / approach B".
- **Explainer**: `.flow` SVG for the concept diagram, `.step` walkthrough for step-by-step, `.ba-grid` for side-by-side comparison tables.
- **Dashboard**: `.panel` for each metric block, `.chip` for status tags, `.code-caption` for small labels above figures.
- **Prototype**: ad-hoc — most prototypes need a small inline `<script>` for interactivity. Keep it small (one `<script>` tag, no libraries). Use `.panel` for control areas and the page shell for the live preview area.

If you genuinely need a new component (e.g., a draggable kanban for a triage board), build it inline using the existing tokens (colours, typography, borders) so it matches the aesthetic. Don't add a new colour or font.

## Step 6 — escalate if you discover the user wanted a specialized skill

If during work it becomes obvious the user actually wants one of the four specialized skills (e.g., they asked for a "concept explainer" but the concept is a code module — that's `html-module-map`), stop and recommend switching. Don't half-replicate the specialized skill's structure here.

## Visual style

Use the tokens and components in `references/design-tokens.md` exactly. Do not introduce new colours, fonts, or component patterns. The whole point of a shared design system is that artifacts from different skills feel like a coherent set.

If you find yourself wanting a component that doesn't exist:

1. Try harder to use the closest existing one — most "I need a new component" feelings turn into "actually `.panel` works".
2. If you genuinely need something new, note it in chat after the artifact is delivered so the user can decide whether to add it to `_shared/design-tokens.md`.

## Output

Default filename: `<topic>-<shape>.html` (e.g. `q2-roadmap-report.html`, `incident-2026-05-09-timeline.html`, `caching-strategies-comparison.html`).

<!-- shared:save-conventions-start -->
Save in `~/artifacts/`, creating the directory if it doesn't exist. If the user specified a directory or filename, honor that instead. Surface a `computer://` link so the user can open it themselves — don't auto-open. Don't dump the HTML source into chat — the artifact is the deliverable.
<!-- shared:save-conventions-end -->

After saving, offer to (a) iterate on a specific section, (b) try a different shape, or (c) move on. Don't auto-share.

## Output language

Match the user's prose language. Code, file paths, ticket keys, URLs, and component labels stay in English even if the prose is Chinese — they're identifiers, not prose.

## When *not* to use this skill

- A specialized html-* skill matches — use the specialized one (see Step 1 table).
- The content is a paragraph or two. HTML overhead isn't worth it; answer in chat.
- The "spatial" hook fails — if there's no diff, diagram, comparison, time-axis, or live element, markdown is probably the right format.
- The user wants a real document for a tool that only renders markdown (e.g., GitHub PR description). Produce markdown.
- The artifact would just be a wall of prose with no interactive or spatial element. The artifact format is the value; without it, you're producing dressed-up text.

## Reference

- `references/design-tokens.md` — full CSS/component vocabulary (auto-synced from `_shared/`). The single source for colours, typography, page chrome, eyebrow, prompt box, chips, TOC sidebar, code blocks, annotated diff, before/after grid, flow diagram, callstack walkthrough, TL;DR, decision card, dead-end callout, open questions, reference badge, sidebar panels, inline excerpt. Read it before assembling the HTML — it has the full CSS and component markup you need to drop into the document's `<style>` and body.
