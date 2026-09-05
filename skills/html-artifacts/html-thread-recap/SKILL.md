---
name: html-thread-recap
description: Create an HTML conversation recap or visual handoff of decisions and remaining work. A routine "总结一下" does not require this skill.
---

# HTML Thread Recap

Give a colleague enough context to continue the work. Use the current conversation or supplied transcript; disclose gaps if earlier context is unavailable.

## Extract and compose

Prioritize the topic and current outcome, consequential decisions and their stated rationale, abandoned approaches, open work, and useful artifacts/source links. Organize by importance rather than reproducing each turn.

Preserve distinctions between a proposal, an accepted decision, an implemented change, and a verified result. Keep constraints and corrections that still govern the work.

Use [decisions.md](references/components/decisions.md) for decision cards, dead ends, and open questions. Include alternatives or tradeoffs only when the source supports them. A consequential decision without an explicit alternative can be recorded in prose; do not omit it merely because it does not fit a card.

If a rationale is missing, label it unstated and continue unless it is essential to the handoff. Include short quotes, code, or error excerpts only when their exact wording matters. Do not invent owners, dates, turn counts, or completion status.

## Build and verify

<!-- shared:html-workflow-start -->
Read [design-tokens.md](references/design-tokens.md) for the base style, then only the component references needed for this artifact. Adapt structure to the material and the user's requested format or style. Match the user's prose language and preserve source identifiers.

Assemble one self-contained HTML file. Render it in an available browser and inspect wide and narrow layouts, diagrams, and interactive controls. Fix overlap, overflow, or broken navigation before delivery; if rendering is unavailable, state the verification limit.
<!-- shared:html-workflow-end -->

## Deliver

Default filename: `<TOPIC>-recap.html`.

<!-- shared:save-conventions-start -->
Save in `~/artifacts/` unless the user specified another path. Return a file link supported by the current environment, not the HTML source. Opening a browser for local verification is part of building the artifact; opening the final file for the user or sharing it externally requires a request or existing authorization.
<!-- shared:save-conventions-end -->
