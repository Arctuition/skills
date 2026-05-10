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
4. **Side panel: Key files / Key actors** — mono filenames or actor names with one-line descriptions. The reader uses this as their map back into the codebase. **Choose the right component for location**: the sidebar `aside.panel` uses `.kf` (compact, narrow); the main-column "where to make changes" / "怎么找回自己写的东西" section uses `.file-index` (3-column grid with optional line-count chip). Don't use `.kf` in the main column — `display: block` on the filename makes the row stack badly when the column is wider than ~280px.
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

### Hard rules (not soft suggestions)

These are the rules that the model breaks most often. Each one has a failure mode that's been observed in the wild — the diagram looks "OK" while you're drawing it and reads as decoration when the user opens the file.

1. **Cap at 7 nodes per diagram.** If you have 9 boxes, **split into two diagrams** ("shell + page composition" and "page + data layer", or "happy path" and "error path"). Don't keep cramming. A 12-node spaghetti graph with arrows criss-crossing the canvas is the single most common reason a module map gets ignored.
2. **One hot box per diagram, not three.** The clay color says "look here first". If everything is hot, nothing is.
3. **No crossing arrows.** If two arrows would cross, the layout is wrong — move boxes until they don't, or split the diagram. Crossings make the eye lose the path.
4. **No labels on top of boxes.** Edge-label text must sit in *empty space* between nodes, never overlapping a `rect` or `text` element. After laying out, eyeball each label position. If "create" or "edit row" is partially behind a box, move it.
5. **Snap arrows to box edges.** A line that ends inside a node reads as "this arrow ends inside the box," which is meaningless. Compute the endpoint to land on the rect's perimeter.
6. **Group with `<rect class="group">` when nodes share a context.** Three loose boxes labelled "Shell", "Page", "Data" beat thirteen boxes drifting on a blank canvas.
7. **Edge labels describe the cargo, not the verb.** "session_id", "Stripe webhook", "products / categories" — not "calls", "sends", "uses".

Before you finalize a diagram, do this 30-second check:

- Count the boxes. If it's >7, split.
- Trace each arrow with your eye from tail to head. If any arrow crosses another, or ends inside a box, or has a label on top of a `rect`, fix it before moving on.
- Check that exactly one box has `.box.hot`.

For sequence diagrams (time on the y-axis), draw vertical lifelines and label arrows with what's in flight. For state machines, draw rounded boxes for states and arrows labelled with the event that triggers the transition.

## Writing the walkthrough

The walkthrough is what the reader will actually read. Treat it like a tour, not a reference.

- **Step in execution order**, not file order or alphabetical.
- Each step opens with the file path or the actor, then a paragraph that explains *what happens here and why it has to happen here*.
- Reference back to the diagram. "After verifyToken returns the Session, control returns to the route handler we drew above." Spatial language pays off when the diagram is right there.

### Inline code vs lifted code

Inline `<code>` is for *short identifiers* — `useSession`, `panelId`, `/users/`, `version: 2`. Anything that grows beyond an identifier belongs in its own block:

- **Lift to `<pre class="code">` when**: the code is longer than ~40 characters, contains a parameter list, contains multiple `&` / `=` / `?` characters (URL queries, signatures), or shows a transformation. These wrap badly inside prose paragraphs and make the line jagged.
- **Keep inline when**: it's a single identifier, a path, a small literal value, or a function call with at most one short argument.

Concretely, this stays inline:

> 调用 `useProductsURLState()` 把 URL 解析出来。

This must be lifted:

> ❌ 把 URL 上的 `?category=&listType=&page=&library=&panelType=&panelId=...` 解析出来 — 这串塞在一段 prose 里会把行撑爆。
>
> ✅ 写成
>
> ```
> ?category= &listType= &page= &library= &panelType= &panelId=…
> ```
>
> 跟在段落下面，再 `<details class="snippet">` 包起来如果想默认收起来。

### Paragraph density

A walkthrough step paragraph should be **3–5 lines on screen, not 8**. If you find yourself stringing together 6+ inline `<code>` chips inside one paragraph, that paragraph is doing two things — break it into two short paragraphs at the natural seam (e.g. "解析出来 → 然后" is a seam). Dense walls of mixed prose + identifiers are the second-most-common reason a module map gets skimmed past.

### Code snippets

Inline a `<details class="snippet">` *only when the code is the explanation*. Don't paste the whole function; paste the 6–10 lines that show the seam. If the snippet is more than 20 lines, it's a reference, not an explanation — link to the file in `code` text and trust the reader's editor.

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

Default filename: `<subject-name>-breakdown.html` (e.g. `auth-flow-breakdown.html`, `checkout-breakdown.html`).

<!-- shared:save-conventions-start -->
Save in `~/artifacts/`, creating the directory if it doesn't exist. If the user specified a directory or filename, honor that instead. Surface a `computer://` link so the user can open it themselves — don't auto-open. Don't dump the HTML source into chat — the artifact is the deliverable.
<!-- shared:save-conventions-end -->

After saving, ask whether they want to (a) deepen any section, (b) add a sequence diagram or state machine, or (c) move on.

## Output language

Match the user's prose language. Code, file paths, table names, and node labels can stay in English even if the prose is Chinese — they're identifiers in the codebase.

## When *not* to use this skill

- The user wants a real architecture decision record (ADR) — that's a markdown / docs format with a specific template, not an explainer.
- The user wants to review or pitch a *change* — use `html-pr-review` or `html-pr-writeup`.
- The subject is a single function. A diagram would be silly; explain in chat.

## Reference

- `references/design-tokens.md` — full CSS/component vocabulary including the `flow` SVG diagram pattern, callstack walkthrough, key files panel, and gotchas callout. Read it before assembling the HTML — it has the full CSS and component markup you need to drop into the document's `<style>` and body.
