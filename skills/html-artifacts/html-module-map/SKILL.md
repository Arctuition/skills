---
name: html-module-map
description: Produce a single-file HTML "module map" artifact that breaks down a business module, feature, subsystem, or end-to-end workflow — inline-SVG architecture diagram with the hot path highlighted, a key-files panel, a numbered callstack walkthrough in execution order, a gotchas callout, and a glossary. Use this skill whenever the user asks to break down a module, explain how a feature works, document a business workflow, draw an architecture diagram, onboard a teammate, "explain X to me", "map out the auth flow", "walk me through the order pipeline", or "document this subsystem". Trigger even without the word "HTML" — the artifact format is the whole point. For PR review use html-pr-review; for authoring a PR use html-pr-writeup.
---

# Module / workflow breakdown → HTML artifact

You are helping the user produce one self-contained HTML file that explains a module or workflow well enough that a teammate (or their future self in three months) can get oriented in five minutes. The artifact replaces the README that nobody updates with a document that's actually pleasant to open.

This works for two flavours of subject:

- **Code module / subsystem** — a folder, a service, a feature in a codebase. Output focuses on architecture and code paths.
- **Business workflow** — checkout, refund, onboarding, an approval process. Output focuses on actors, states, and decisions.

The same visual vocabulary serves both; the difference is what goes in the boxes.

## Inputs you should gather

1. **The subject's scope** — what's in, what's out. A "checkout" map for an e-commerce backend isn't useful if it secretly includes the email sender. Pin the boundary.
2. **The entry points** — the URL, the function, the cron, the user action that kicks the thing off.
3. **The major nodes** — services, modules, classes, queues, tables, external systems.
4. **The hot path** — the one execution path that handles 90% of the traffic. Lots of breakdowns get muddied trying to show every branch.
5. **The edges** — function calls, message-bus topics, DB writes, HTTP requests. Annotate them with what actually flows over them ("cookie", "job_id", "Stripe webhook").
6. **Gotchas** — the things a newcomer always trips on. Caches that are per-process. Retries that aren't idempotent. Names that lie. The `// HACK:` comment from 2022.
7. **Glossary candidates** — domain terms that aren't obvious to an outsider. "Birchline session", "settled order", "cohort 7", etc.

If the user has access to a real codebase, do the legwork: `git ls-files`, `rg <symbol>`, read the entry-point file. If it's a workflow described in prose, ask one focused clarifying question about boundary and hot path before drawing.

## Structure of the artifact

Adapt to the subject; this is a default.

1. **Header** — eyebrow (`<repo or product> · architecture note`), `h1` naming what this document explains (e.g. "How authentication flows through birchline/web"), one-paragraph summary that names the trust boundary or the invariant the system protects.
2. **Architecture diagram** — inline SVG, boxes and arrows, hot-path node coloured `--clay`. Don't draw every box; draw the ones that matter to the explanation.
3. **Callstack walkthrough** — numbered steps. Each step has a file:range (or actor name for workflows), a paragraph that explains what happens there in execution order, and a collapsible source snippet for code modules. This is the heart of the document.
4. **Side panel: Key files / Key actors** — mono filenames or actor names with one-line descriptions. The reader uses this as their map back into the codebase.
5. **Side panel: Gotchas** — colour-callout box listing the things that surprise people. One sentence each.
6. **Optional: Sequence diagram** — for time-ordered interactions across multiple actors (request → worker → DB → reply). Inline SVG with vertical lifelines.
7. **Optional: State machine** — for workflows with discrete states (pending → captured → settled → refunded). Inline SVG with rounded boxes and labelled transitions.
8. **Optional: Glossary** — only if there are domain terms a newcomer wouldn't know. Definition list, mono term + sentence definition.

## Drawing diagrams

Don't reach for D3 or mermaid. Hand-rolled inline SVG with simple rounded rectangles and arrows is enough for almost everything you'd want to draw. The patterns to use are in `references/design-tokens.md` under "Architecture / flow diagram":

- Rounded `rect` for nodes
- A single `<marker id="arrowHead">` referenced from each `<line>` for arrows
- `.box.hot` for the *one* important node (`--clay` outline)
- Labels in serif/sans, sub-labels (filename / address / table name) in mono `--gray-500`
- Edge labels go above the line in mono small text and describe what flows over the edge ("cookie", "session_id", not "calls")

Three real rules:

1. **Fewer boxes than you think you need.** A diagram with twelve boxes is unread. Aim for four to seven.
2. **One hot box, not three.** The colour means "look here first". If everything is hot, nothing is.
3. **Edge labels describe the cargo, not the verb.** "Stripe webhook" beats "sends event".

For sequence diagrams (time on the y-axis), draw vertical lifelines and label arrows with what's in flight. For state machines, draw rounded boxes for states and arrows labelled with the event that triggers the transition.

## Writing the walkthrough

The walkthrough is what the reader will actually read. Treat it like a tour, not a reference.

- **Step in execution order**, not file order or alphabetical.
- Each step opens with the file path or the actor, then a paragraph that explains *what happens here and why it has to happen here*.
- Reference back to the diagram. "After verifyToken returns the Session, control returns to the route handler we drew above." Spatial language pays off when the diagram is right there.
- Inline a code snippet *only when the code is the explanation*. Don't paste the whole function; paste the eight lines that show the seam.

## Gotchas section

This is what makes the document trusted. Put what newcomers actually trip on:

- Behaviours that contradict the file's name
- Caches whose scope is non-obvious (per-process, per-region)
- Retries that aren't idempotent
- "We tried X and it failed because Y" lessons that no comment captures
- Time-of-day or load-dependent behaviour

One sentence each. If a gotcha needs three paragraphs, it should be its own section.

## Visual style

Apply the tokens and components in `references/design-tokens.md`. The visual language matches `html-pr-writeup` and `html-pr-review` so a team produces a coherent set of artifacts.

## Output

Save as `<subject-name>-breakdown.html` in the user's outputs directory (e.g. `auth-flow-breakdown.html`, `checkout-breakdown.html`) and surface a `computer://` link. Ask whether they want to (a) deepen any section, (b) add a sequence diagram or state machine, or (c) move on. Don't dump the HTML source into chat.

## Output language

Match the user's prose language. Code, file paths, table names, and node labels can stay in English even if the prose is Chinese — they're identifiers in the codebase.

## When *not* to use this skill

- The user wants a real architecture decision record (ADR) — that's a markdown / docs format with a specific template, not an explainer.
- The user wants to review or pitch a *change* — use `html-pr-review` or `html-pr-writeup`.
- The subject is a single function. A diagram would be silly; explain in chat.

## Reference

- `references/design-tokens.md` — full CSS/component vocabulary including the `flow` SVG diagram pattern, callstack walkthrough, key files panel, and gotchas callout.
- `assets/template.html` — runnable starting point with placeholder diagram and walkthrough. Copy and modify.
