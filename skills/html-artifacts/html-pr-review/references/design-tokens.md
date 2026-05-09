<!--
  Shared by all html-artifacts skills via sync.
  Edit only in skills/html-artifacts/_shared/design-tokens.md, then run
  scripts/sync-shared.sh to propagate to each skill's references/ folder.
  Direct edits to references/design-tokens.md will be overwritten on the
  next sync.
-->

# Design tokens & shared components

These tokens are the shared vocabulary used by every skill under `skills/html-artifacts/`. Keeping artifacts visually consistent means a team's deliverables feel like a coherent set rather than a collection of one-offs. Use them verbatim unless the user has asked for a different look.

## Why these tokens exist

The whole point of producing an HTML artifact instead of markdown is that the reader actually reads it. That happens when the document looks like something a human designed, not something an LLM auto-generated. These tokens are tuned to read as a "real" document — calm color palette, generous whitespace, serif headings paired with mono callouts. Resist the urge to add gradients, drop shadows, neon accents, or emoji.

## Color palette

```css
:root {
  --ivory:    #FAF9F5;  /* page background */
  --slate:    #141413;  /* primary heading text */
  --clay:     #D97757;  /* danger / needs-attention / removed-line / rejected option */
  --oat:      #E3DACC;  /* medium / worth-a-look / muted callout bg / dead-end bg */
  --olive:    #788C5D;  /* safe / added-line / chosen option / success */
  --gray-150: #F0EEE6;  /* prompt box bg, code bg */
  --gray-300: #D1CFC5;  /* borders */
  --gray-500: #87867F;  /* eyebrow, secondary text, mono labels */
  --gray-700: #3D3D3A;  /* body text */
  --white:    #FFFFFF;
}
```

The tokens map onto a meaning, not a color. `--clay` is "this needs attention / rejected", not "this is red". `--olive` is "you can move past this safely / chosen", not "this is green". When you tag risk levels, file diffs, decision options, status indicators, etc., reach for the meaning first and the color follows.

## Typography

```css
:root {
  --serif: ui-serif, Georgia, 'Times New Roman', serif;
  --sans:  system-ui, -apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --mono:  ui-monospace, 'SF Mono', Menlo, Monaco, monospace;
}
```

- Serif for `h1`/`h2` — gives the document weight and signals "this was written for me to read"
- Sans for body — keeps line length comfortable, with PingFang SC / Microsoft YaHei as Chinese fallback
- Mono for filenames, code, eyebrows, small status labels — anywhere you want "this is a fact, not prose"

## Page shell

```css
body {
  font-family: var(--sans);
  background: var(--ivory);
  color: var(--gray-700);
  line-height: 1.55;
  padding: 56px 32px 120px;
  -webkit-font-smoothing: antialiased;
}
.page { max-width: 1040px; margin: 0 auto; }
```

Optional sidebar layout for documents that have an in-this-page TOC or a "key files" panel:

```css
.layout {
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 48px;
  align-items: start;
}
@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
  .toc { display: none; }
}
```

## Reusable components (shared vocabulary)

### Eyebrow + title

```html
<header class="page-head">
  <p class="eyebrow">PULL REQUEST · BIRCHLINE</p>
  <h1>#312 — Move notification delivery onto a queue</h1>
  <div class="meta">
    <span class="stat"><strong>9</strong> files</span>
    <span class="stat"><span class="add">+418</span> / <span class="del">−190</span></span>
    <span class="stat">branch <strong>notify-queue</strong> → <strong>main</strong></span>
    <span class="stat">author <strong>@priya</strong></span>
  </div>
</header>
```

For a thread recap, status report, or any non-PR artifact, swap the eyebrow text and meta stats; the structure is the same:

```html
<p class="eyebrow">THREAD RECAP · BIRCHLINE</p>
<h1>Slow checkout investigation</h1>
<div class="meta">
  <span class="stat">Claude Code session</span>
  <span class="stat"><strong>2026-05-09</strong></span>
  <span class="stat"><strong>47 turns</strong></span>
</div>
```

```css
.eyebrow {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gray-500);
  margin-bottom: 12px;
}
h1 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: 36px;
  line-height: 1.15;
  color: var(--slate);
  letter-spacing: -0.01em;
}
.meta {
  display: flex; flex-wrap: wrap; gap: 18px;
  font-family: var(--mono); font-size: 12.5px; color: var(--gray-500);
  margin-top: 12px;
}
.meta .add { color: var(--olive); }
.meta .del { color: var(--clay); }
```

### Prompt box (optional)

Shows the user's original ask so the document is reproducible. Keep it short.

```html
<div class="prompt-box">
  <span class="label">PROMPT</span>
  Review PR #247 — focus on the optimistic-update hook.
</div>
```

```css
.prompt-box {
  background: var(--gray-150);
  border: 1.5px solid var(--gray-300);
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 14.5px;
}
.prompt-box .label {
  font-family: var(--mono); font-size: 11px; text-transform: uppercase;
  letter-spacing: 0.06em; color: var(--gray-500);
  display: block; margin-bottom: 6px;
}
```

### Chips overview

A horizontal row of clickable chips that jump to sections below. Three common uses:

- **Risk map** — file-by-file PR review, each chip coloured by risk level. Use the `.safe` / `.medium` / `.attention` modifiers.
- **Topic chips** — when a document covers multiple distinct topics or decisions. No risk colouring; chips are neutral.
- **Status tags** — generic chip-list for any "lay of the land" overview.

```html
<!-- Risk map (PR review) -->
<div class="risk-map">
  <a class="chip attention" href="#file-hook"><span class="dot"></span>useOptimisticTasks.ts</a>
  <a class="chip medium"    href="#file-list"><span class="dot"></span>TaskList.tsx</a>
  <a class="chip safe"      href="#file-toast"><span class="dot"></span>Toast.tsx</a>
</div>
<div class="legend">
  <span><span class="dot" style="background:var(--olive)"></span> safe</span>
  <span><span class="dot" style="background:#A89968"></span> worth a look</span>
  <span><span class="dot" style="background:var(--clay)"></span> needs attention</span>
</div>

<!-- Topic chips (thread recap, multi-section explainer) -->
<div class="topic-chips">
  <a class="chip" href="#d-queue"><span class="dot"></span>Queue vs inline</a>
  <a class="chip" href="#d-retry"><span class="dot"></span>Retry policy</a>
  <a class="chip" href="#d-monitor"><span class="dot"></span>Monitoring</a>
</div>
```

```css
.risk-map, .topic-chips { display: flex; flex-wrap: wrap; gap: 10px; }
.chip {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 12px; border-radius: 999px;
  font-family: var(--mono); font-size: 12.5px; text-decoration: none;
  border: 1px solid var(--gray-300); color: var(--gray-700);
  background: var(--white);
}
.chip:hover { border-color: var(--gray-500); }
.chip .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--gray-500); }

/* Risk variants */
.chip.safe       { background: rgba(120,140,93,0.10); border-color: rgba(120,140,93,0.45); }
.chip.safe .dot  { background: var(--olive); }
.chip.medium     { background: var(--oat); }
.chip.medium .dot{ background: #A89968; }
.chip.attention  { background: rgba(217,119,87,0.12); border-color: rgba(217,119,87,0.55); }
.chip.attention .dot { background: var(--clay); }

.legend {
  display: flex; gap: 18px; margin-top: 10px;
  font-family: var(--mono); font-size: 11.5px; color: var(--gray-500);
}
.legend .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; }
```

### TOC sidebar

```html
<aside class="toc">
  <p class="toc-label">IN THIS PR</p>
  <a href="#why">Why</a>
  <a href="#files">File-by-file</a>
  <a href="#focus">Where to focus</a>
  <a href="#test">Test plan</a>
  <a href="#rollout">Rollout</a>
</aside>
```

Customize the label (`IN THIS PR` / `IN THIS RECAP` / `IN THIS REPORT` / etc.) and the section list to match the document.

```css
.toc {
  position: sticky; top: 32px;
  border-left: 1px solid var(--gray-300);
  padding-left: 18px;
  font-size: 13px;
}
.toc-label {
  font-family: var(--mono); font-size: 11px;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--gray-500); margin-bottom: 12px;
}
.toc a {
  display: block; padding: 4px 0; color: var(--gray-700); text-decoration: none;
}
.toc a:hover { color: var(--clay); }
```

### Code blocks

```html
<pre class="code">git diff main..notify-queue
# 9 files changed, 418 insertions(+), 190 deletions(-)</pre>
```

For diffs, use line classes:

```html
<pre class="code">
<span class="del">- await sendNotification(user, payload);</span>
<span class="add">+ await queue.enqueue('notify', { userId: user.id, payload });</span>
</pre>
```

Optional caption above a code block:

```html
<p class="code-caption">notify/worker.ts — retry loop</p>
<pre class="code">...</pre>
```

```css
.code {
  background: var(--gray-150);
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  padding: 14px 16px;
  font-family: var(--mono); font-size: 12.5px; line-height: 1.55;
  overflow-x: auto;
  white-space: pre;
}
.code .add { color: var(--olive); display: block; }
.code .del { color: var(--clay); display: block; }
.code-caption {
  font-family: var(--mono); font-size: 11px; color: var(--gray-500);
  text-transform: uppercase; letter-spacing: 0.06em;
  margin-bottom: 6px;
}
```

### Annotated diff with inline review notes

For PR review and similar artifacts that need to render hunks with margin notes. Each row is a diff line; bubbles attach severity-tagged commentary.

```html
<div class="diff">
  <div class="diff-row context"><span class="ln">42</span><span class="mark"> </span><pre>function pickWorker() {</pre></div>
  <div class="diff-row del">    <span class="ln">43</span><span class="mark">-</span><pre>  return workers[Math.floor(Math.random() * workers.length)];</pre></div>
  <div class="diff-row add">    <span class="ln">44</span><span class="mark">+</span><pre>  return workers[counter++ % workers.length];</pre></div>
  <div class="bubble blocking">
    <span class="label">BLOCKING</span>
    <p><code>counter</code> is module-local but workers run in multiple processes — round-robin per-process is not round-robin overall.</p>
  </div>
</div>
```

Bubble severities:

- `blocking` (clay) — must change before merge
- `question` (slate) — needs an answer, may not need a change
- `nit` (gray) — preference, not a blocker

```css
.diff {
  border: 1px solid var(--gray-300); border-radius: 8px;
  background: var(--white);
  overflow: hidden;
  margin: 12px 0;
}
.diff-row {
  display: grid;
  grid-template-columns: 48px 20px 1fr;
  font-family: var(--mono); font-size: 12.5px; line-height: 1.6;
}
.diff-row .ln  { color: var(--gray-500); text-align: right; padding-right: 8px; }
.diff-row .mark{ color: var(--gray-500); text-align: center; }
.diff-row pre  { padding: 0 12px; white-space: pre-wrap; }
.diff-row.add  { background: rgba(120,140,93,0.10); }
.diff-row.add .mark, .diff-row.add pre { color: var(--olive); }
.diff-row.del  { background: rgba(217,119,87,0.10); }
.diff-row.del .mark, .diff-row.del pre { color: var(--clay); }

.bubble {
  margin: 8px 14px 12px 60px;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--gray-150);
  border-left: 3px solid var(--gray-500);
}
.bubble .label {
  font-family: var(--mono); font-size: 10.5px;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--gray-500); margin-right: 8px;
}
.bubble.blocking { background: rgba(217,119,87,0.10); border-color: var(--clay); }
.bubble.blocking .label { color: var(--clay); }
.bubble.question { background: var(--gray-150); border-color: var(--slate); }
.bubble.question .label { color: var(--slate); }
.bubble.nit      { background: var(--white); border-color: var(--gray-300); }
.bubble p { font-size: 14px; color: var(--gray-700); }
```

### Before / after grid

For any "previously this happened, now this happens" comparison.

```html
<div class="ba-grid">
  <div class="ba-card">
    <span class="ba-label">BEFORE</span>
    <ul>
      <li>Sends run inline in the mutation handler</li>
      <li>SMTP timeout = 500 error for the comment</li>
    </ul>
  </div>
  <div class="ba-card after">
    <span class="ba-label">AFTER</span>
    <ul>
      <li>Handler enqueues one job per recipient, returns 202</li>
      <li>Worker retries 3× with exponential backoff</li>
    </ul>
  </div>
</div>
```

```css
.ba-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.ba-card {
  border: 1px solid var(--gray-300);
  border-radius: 10px; padding: 18px 20px;
  background: var(--white);
}
.ba-card.after { border-color: rgba(120,140,93,0.55); }
.ba-label {
  font-family: var(--mono); font-size: 11px;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--gray-500); display: block; margin-bottom: 8px;
}
.ba-card ul { list-style: none; }
.ba-card li {
  padding: 4px 0; padding-left: 14px; position: relative;
  font-size: 14px;
}
.ba-card li::before {
  content: "·"; position: absolute; left: 0; color: var(--gray-500);
}
```

### Architecture / flow diagram (inline SVG)

The whole point of HTML over markdown is being able to draw. Inline SVG with simple rounded rectangles + arrows is enough for 90% of architecture diagrams. Don't reach for D3 or mermaid unless the diagram is genuinely complex.

```html
<svg class="flow" viewBox="0 0 720 280" role="img" aria-label="Auth flow">
  <defs>
    <marker id="arrowHead" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#87867F"></path>
    </marker>
  </defs>

  <g><rect class="box"     x="30"  y="40"  width="150" height="64" rx="10"/>
     <text x="105" y="68"  text-anchor="middle">Browser</text>
     <text class="sub" x="105" y="84" text-anchor="middle">birchline.app</text></g>

  <g><rect class="box hot" x="460" y="40"  width="180" height="64" rx="10"/>
     <text x="550" y="68"  text-anchor="middle">verifyToken()</text>
     <text class="sub" x="550" y="84" text-anchor="middle">middleware/auth.ts</text></g>

  <line class="arrow" x1="180" y1="72" x2="245" y2="72" marker-end="url(#arrowHead)"/>
</svg>
```

```css
.flow .box  { fill: #fff; stroke: var(--gray-300); stroke-width: 1.5; }
.flow .box.hot { fill: rgba(217,119,87,0.10); stroke: var(--clay); }
.flow text { font-family: var(--sans); font-size: 13px; fill: var(--slate); }
.flow .sub { font-family: var(--mono); font-size: 11px; fill: var(--gray-500); }
.flow .arrow { stroke: var(--gray-500); stroke-width: 1.5; fill: none; }
```

Use `.box.hot` to highlight the "this is the interesting node" — the entry point, the bug site, the new component.

### Callstack walkthrough

For walking a reader through code in execution order. Numbered badge + filename + prose + collapsible source snippet.

```html
<div class="step">
  <div class="badge">1</div>
  <div class="step-body">
    <div class="step-loc">src/app/providers/AuthProvider.tsx<span class="range"> :22-48</span></div>
    <p>On mount, the React provider issues a <code>GET /api/session</code> ...</p>
    <details class="snippet">
      <summary>show source</summary>
      <pre class="code">// ...</pre>
    </details>
  </div>
</div>
```

```css
.step { display: grid; grid-template-columns: 32px 1fr; gap: 16px; margin-bottom: 28px; }
.badge {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--gray-150); border: 1px solid var(--gray-300);
  display: grid; place-items: center;
  font-family: var(--mono); font-size: 13px; color: var(--gray-700);
}
.step-loc { font-family: var(--mono); font-size: 13px; color: var(--gray-700); margin-bottom: 6px; }
.step-loc .range { color: var(--gray-500); }
.snippet summary {
  cursor: pointer; font-family: var(--mono); font-size: 12px;
  color: var(--gray-500); padding: 4px 0;
}
```

### TL;DR block

A single paragraph that orients the reader in 3–5 sentences. Lead with what was being figured out / what changed, then the headline, then the current state.

```html
<section id="tldr" class="tldr">
  <p>We were investigating why p99 checkout latency spiked to 1.4s after the comment-notifications launch. The hot path was running SMTP sends inline; under load that added 200–800ms. We <strong>moved notification delivery onto a Redis-backed queue with a worker</strong> and reduced p99 to 180ms in staging. Open question: whether to add a dead-letter queue.</p>
</section>
```

```css
.tldr {
  background: var(--gray-150);
  border-left: 3px solid var(--clay);
  border-radius: 0 8px 8px 0;
  padding: 16px 22px;
  margin: 20px 0 36px;
}
.tldr p {
  font-size: 15.5px; line-height: 1.6; color: var(--slate);
}
```

### Section headings

```css
h2 {
  font-family: var(--serif); font-weight: 500;
  font-size: 24px; color: var(--slate);
  margin: 40px 0 16px;
  letter-spacing: -0.005em;
}
h2 .h-num {
  font-family: var(--mono); font-size: 14px;
  color: var(--gray-500); margin-right: 8px;
  font-weight: normal;
}
```

### Decision card

For artifacts that capture decisions (thread recaps, design docs, post-mortems, RFCs). Question, options with chosen/rejected markers, the deciding "because", and the explicit tradeoff. Use one card per consequential decision.

```html
<article class="decision" id="d-queue">
  <header class="decision-head">
    <span class="decision-num">DECISION 1</span>
    <h3>Inline notification sends vs queue-based delivery</h3>
  </header>

  <ul class="options">
    <li class="opt chosen">
      <span class="marker">CHOSEN</span>
      <strong>Queue-based with worker</strong>
      <span class="opt-note">Enqueue per-recipient jobs; worker handles SMTP with retries.</span>
    </li>
    <li class="opt rejected">
      <span class="marker">REJECTED</span>
      <strong>Inline with longer SMTP timeout</strong>
      <span class="opt-note">Simpler, but still couples request latency to SMTP availability.</span>
    </li>
    <li class="opt rejected">
      <span class="marker">REJECTED</span>
      <strong>Fire-and-forget background task</strong>
      <span class="opt-note">No retry semantics; lost notifications on worker crash.</span>
    </li>
  </ul>

  <p class="because"><span class="kw">Because:</span> the request-path p99 has been the user-visible pain — anything that keeps SMTP off the hot path was worth more than implementation simplicity.</p>
  <p class="tradeoff"><span class="kw">Tradeoff:</span> we lose synchronous delivery confirmation; the sender no longer knows in-request whether the email actually went out.</p>
</article>
```

```css
.decision {
  border: 1px solid var(--gray-300);
  border-radius: 12px;
  background: var(--white);
  padding: 22px 24px;
  margin-bottom: 24px;
}
.decision-head { margin-bottom: 14px; }
.decision-num {
  font-family: var(--mono); font-size: 11px;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--gray-500);
  display: block; margin-bottom: 4px;
}
.decision h3 {
  font-family: var(--serif); font-weight: 500;
  font-size: 21px; color: var(--slate);
  letter-spacing: -0.005em;
}

.options { list-style: none; margin: 12px 0 16px; padding: 0; }
.opt {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 14px;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 6px;
  align-items: baseline;
}
.opt strong { color: var(--slate); font-weight: 500; }
.opt-note { display: block; color: var(--gray-700); font-size: 14px; margin-top: 2px; grid-column: 2; }
.opt .marker {
  font-family: var(--mono); font-size: 10.5px;
  letter-spacing: 0.08em; padding: 3px 8px;
  border-radius: 999px; text-align: center;
  align-self: center;
}
.opt.chosen { background: rgba(120,140,93,0.10); }
.opt.chosen .marker {
  background: var(--olive); color: var(--white);
}
.opt.rejected .marker {
  background: var(--white); color: var(--gray-500);
  border: 1px solid var(--gray-300);
}
.opt.rejected strong { color: var(--gray-700); }

.because, .tradeoff {
  font-size: 14.5px; line-height: 1.55; margin-top: 8px;
}
.because .kw, .tradeoff .kw {
  font-family: var(--mono); font-size: 11px;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--gray-500); margin-right: 6px;
}
```

### Dead-end callout

For attempts that didn't work — abandoned approaches, failed hypotheses, refactors that got reverted. The visual signal is the muted oat background — it should look like content the reader can quickly classify as "abandoned" without struggle.

```html
<section id="dead-ends">
  <h2>Dead ends</h2>

  <div class="dead-end">
    <span class="de-label">TRIED</span>
    <p class="de-what">Bumping the SMTP client timeout from 5s to 30s, hoping retries would smooth out flakes.</p>
    <p class="de-why"><span class="kw">Why we stopped:</span> still blocked the request; latency got worse, not better. Made it clear inline was the wrong shape entirely.</p>
  </div>

  <div class="dead-end">
    <span class="de-label">TRIED</span>
    <p class="de-what">Caching session lookups in Redis with a 30s TTL.</p>
    <p class="de-why"><span class="kw">Why we stopped:</span> revoke-on-logout broke. Per-process LRU was the simpler and correct fix.</p>
  </div>
</section>
```

```css
.dead-end {
  background: var(--oat);
  border-left: 3px solid #B8AC92;
  border-radius: 0 8px 8px 0;
  padding: 14px 18px;
  margin-bottom: 12px;
}
.de-label {
  font-family: var(--mono); font-size: 10.5px;
  letter-spacing: 0.08em; color: var(--gray-700);
  background: var(--white); padding: 2px 8px; border-radius: 999px;
  display: inline-block; margin-bottom: 8px;
}
.de-what {
  font-size: 14.5px; color: var(--slate); margin-bottom: 6px;
}
.de-why { font-size: 14px; color: var(--gray-700); }
.de-why .kw {
  font-family: var(--mono); font-size: 11px;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--gray-500); margin-right: 6px;
}
```

### Open questions

For unresolved items: things that came up but weren't decided, follow-ups, ambiguities.

```html
<section id="open">
  <h2>Open questions</h2>
  <ul class="open-list">
    <li>
      <span class="q-tag">OPEN</span>
      Do we need a dead-letter queue, or is the 3× retry policy enough? <span class="q-owner">→ @priya to call</span>
    </li>
    <li>
      <span class="q-tag">OPEN</span>
      Whether the backfill of historical notifications should run before or after the cutover.
    </li>
  </ul>
</section>
```

```css
.open-list { list-style: none; }
.open-list li {
  padding: 10px 12px;
  border-bottom: 1px solid var(--gray-300);
  font-size: 14.5px;
}
.open-list li:last-child { border-bottom: none; }
.q-tag {
  font-family: var(--mono); font-size: 10.5px;
  letter-spacing: 0.08em; color: var(--clay);
  background: rgba(217,119,87,0.10);
  padding: 2px 8px; border-radius: 999px;
  margin-right: 10px;
}
.q-owner {
  font-family: var(--mono); font-size: 12px;
  color: var(--gray-500); margin-left: 8px;
}
```

### Reference badge

For external links — Jira tickets, Sentry issues, GitHub PRs, design docs. The source label is what makes the badge readable at a glance.

```html
<ul class="ref-list">
  <li>
    <a class="ref-badge" href="https://your-jira.atlassian.net/browse/BLDR-1247">
      <span class="src">JIRA</span>
      <span class="key">BLDR-1247</span>
      <span class="title">Move notification sends off the request path</span>
    </a>
  </li>
  <li>
    <a class="ref-badge" href="https://sentry.io/...">
      <span class="src">SENTRY</span>
      <span class="key">python-prod #91382</span>
      <span class="title">SMTPTimeout in handle_comment</span>
    </a>
  </li>
  <li>
    <a class="ref-badge" href="https://github.com/...">
      <span class="src">GITHUB</span>
      <span class="key">PR #312</span>
      <span class="title">notify-queue → main</span>
    </a>
  </li>
</ul>
```

```css
.ref-list { list-style: none; }
.ref-list li { margin-bottom: 8px; }
.ref-badge {
  display: inline-flex; align-items: baseline; gap: 12px;
  padding: 8px 14px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  background: var(--white);
  text-decoration: none;
  font-size: 14px;
  color: var(--gray-700);
}
.ref-badge:hover { border-color: var(--gray-500); }
.ref-badge .src {
  font-family: var(--mono); font-size: 10.5px;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--gray-500);
}
.ref-badge .key {
  font-family: var(--mono); font-size: 12.5px;
  color: var(--slate);
}
.ref-badge .title { color: var(--gray-700); }
```

### Sidebar panels (key files / gotchas / files-touched)

A right-sidebar `aside` for short reference material — file lists, gotchas, summary stats. Use the `.callout` modifier when the panel is an attention-grabbing warning (gotchas, retries that aren't idempotent, etc.).

```html
<aside class="panel">
  <p class="panel-label">KEY FILES</p>
  <div class="kf"><code>src/middleware/auth.ts</code><p>Single entry point for request authentication.</p></div>
  <div class="kf"><code>src/lib/sessionStore.ts</code><p>LRU + Postgres session lookup; only DB caller.</p></div>
</aside>

<aside class="panel callout">
  <p class="panel-label">GOTCHAS</p>
  <ul>
    <li>The LRU in <code>SessionStore</code> is per-process. Revoking a session only invalidates the process that handled the revoke.</li>
  </ul>
</aside>

<aside class="panel">
  <p class="panel-label">FILES TOUCHED</p>
  <div class="kf"><code>src/notify/queue.ts</code><p>New: enqueues per-recipient jobs.</p></div>
  <div class="kf"><code>src/notify/worker.ts</code><p>New: SMTP send + 3× retry with backoff.</p></div>
  <div class="kf"><code>src/handlers/comment.ts</code><p>Replaced inline send with <code>queue.enqueue</code>.</p></div>
</aside>
```

```css
.panel {
  background: var(--white); border: 1px solid var(--gray-300);
  border-radius: 10px; padding: 18px 20px;
}
.panel.callout {
  background: rgba(217,119,87,0.06);
  border-color: rgba(217,119,87,0.45);
}
.panel-label {
  font-family: var(--mono); font-size: 11px;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--gray-500); margin-bottom: 10px;
}
.kf { margin-bottom: 12px; }
.kf code { font-family: var(--mono); font-size: 13px; color: var(--slate); }
.kf p { font-size: 13px; margin-top: 2px; color: var(--gray-700); }
```

### Inline excerpt block

For the rare moments where the exact wording from a source matters (a user constraint that drove the design, a particularly clear explanation in a thread). Don't reach for this often — paraphrase by default.

```html
<blockquote class="excerpt">
  <span class="ex-label">USER · TURN 23</span>
  <p>The 30-minute SLA is hard, not aspirational. If we can't hit it, we have to redesign — not just hope retries fix it.</p>
</blockquote>
```

```css
.excerpt {
  border-left: 3px solid var(--gray-300);
  padding: 8px 16px;
  margin: 14px 0;
  background: var(--white);
}
.ex-label {
  font-family: var(--mono); font-size: 11px;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--gray-500);
  display: block; margin-bottom: 6px;
}
.excerpt p {
  font-size: 14.5px; color: var(--slate); line-height: 1.55;
}
```

## Anti-patterns

- Do not add a logo, favicon, or "Generated by Claude" footer. The artifact stands on its own.
- Do not use emoji as iconography. The mono labels and color dots already do that job and look more professional.
- Do not add gradients, glows, or drop shadows. The look is flat-paper, not glassmorphism.
- Do not use a dark theme by default. The ivory background is the look.
- Do not add JavaScript libraries. A small inline `<script>` for click-to-highlight is fine; anything bigger is a smell.
- Do not bury the lede behind hero illustrations or animations. The reader is here for the content.
- Do not paste an entire transcript, log, or PR diff verbatim. The artifact synthesizes; the reader can chase the source if they need it.
- Do not invent a tradeoff that wasn't actually weighed. If no alternative was considered, it's not a "decision" — it's a discovery. Drop it from the cards section.
- Do not hide dead ends. They're often the most useful content for the next reader. The whole point of capturing them is so people don't repeat them.
- Do not link file paths as `<a href="file:///...">` or `<a href="src/foo.tsx">`. The artifact will be shared — the recipient does not have the author's filesystem, and relative paths don't resolve once the HTML moves off the author's machine. Render file paths as plain mono text (`<code>src/foo.tsx</code>`) or as in-document anchor links (`href="#file-foo"`) that jump to a section *inside* the same HTML. The only `href`s that should leave the document are public URLs (GitHub, Jira, Sentry, design docs).
