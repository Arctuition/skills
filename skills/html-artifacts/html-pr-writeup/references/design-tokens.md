# Design tokens & shared components

These tokens are deliberately consistent across the pr-writeup, pr-review, and module-breakdown skills so that artifacts produced by the same person feel like a coherent set. Use them verbatim unless the user has asked for a different look.

## Why these tokens exist

The whole point of producing an HTML artifact instead of markdown is that the reader actually reads it. That happens when the document looks like something a human designed, not something an LLM auto-generated. These tokens are tuned to read as a "real" document — calm color palette, generous whitespace, serif headings paired with mono callouts. Resist the urge to add gradients, drop shadows, neon accents, or emoji.

## Color palette

```css
:root {
  --ivory:    #FAF9F5;  /* page background */
  --slate:    #141413;  /* primary heading text */
  --clay:     #D97757;  /* danger / needs-attention / removed-line */
  --oat:      #E3DACC;  /* medium / worth-a-look / muted callout bg */
  --olive:    #788C5D;  /* safe / added-line / success */
  --gray-150: #F0EEE6;  /* prompt box bg, code bg */
  --gray-300: #D1CFC5;  /* borders */
  --gray-500: #87867F;  /* eyebrow, secondary text, mono labels */
  --gray-700: #3D3D3A;  /* body text */
  --white:    #FFFFFF;
}
```

The tokens map onto a meaning, not a color. `--clay` is "this needs attention", not "this is red". `--olive` is "you can move past this safely", not "this is green". When you tag risk levels, file diffs, status indicators, etc., reach for the meaning first and the color follows.

## Typography

```css
:root {
  --serif: ui-serif, Georgia, 'Times New Roman', serif;
  --sans:  system-ui, -apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --mono:  ui-monospace, 'SF Mono', Menlo, Monaco, monospace;
}
```

- Serif for `h1`/`h2` — gives the document weight and signals "this was written for me to read"
- Sans for body — keeps line length comfortable
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

## Reusable components

### Eyebrow + title

```html
<header class="page-head">
  <p class="eyebrow">PULL REQUEST · BIRCHLINE</p>
  <h1>#312 — Move notification delivery onto a queue</h1>
  <div class="pr-meta">
    <span class="stat"><strong>9</strong> files</span>
    <span class="stat"><span class="add">+418</span> / <span class="del">−190</span></span>
    <span class="stat">branch <strong>notify-queue</strong> → <strong>main</strong></span>
    <span class="stat">author <strong>@priya</strong></span>
  </div>
</header>
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
.pr-meta {
  display: flex; flex-wrap: wrap; gap: 18px;
  font-family: var(--mono); font-size: 12.5px; color: var(--gray-500);
}
.pr-meta .add { color: var(--olive); }
.pr-meta .del { color: var(--clay); }
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

### Risk-map chips

For PR review, file-by-file tours, or any "here's the lay of the land" overview. Each chip jumps to the corresponding section.

```html
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
```

```css
.risk-map { display: flex; flex-wrap: wrap; gap: 10px; }
.chip {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 12px; border-radius: 999px;
  font-family: var(--mono); font-size: 12.5px; text-decoration: none;
  border: 1px solid var(--gray-300); color: var(--gray-700);
  background: var(--white);
}
.chip .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--gray-500); }
.chip.safe       { background: rgba(120,140,93,0.10); border-color: rgba(120,140,93,0.45); }
.chip.safe .dot  { background: var(--olive); }
.chip.medium     { background: var(--oat); }
.chip.medium .dot{ background: #A89968; }
.chip.attention  { background: rgba(217,119,87,0.12); border-color: rgba(217,119,87,0.55); }
.chip.attention .dot { background: var(--clay); }
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
.code {
  background: var(--gray-150);
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  padding: 14px 16px;
  font-family: var(--mono); font-size: 12.5px; line-height: 1.55;
  overflow-x: auto;
}
```

### Key files / gotchas sidebar panel

```html
<aside class="panel">
  <p class="panel-label">KEY FILES</p>
  <div class="kf"><code>src/middleware/auth.ts</code><p>Single entry point for request authentication.</p></div>
  <div class="kf"><code>src/lib/sessionStore.ts</code><p>LRU + Postgres session lookup; only DB caller.</p></div>
</aside>

<aside class="panel callout">
  <p class="panel-label">GOTCHAS</p>
  <ul>
    <li>The LRU in <code>SessionStore</code> is per-process. Revoking a session only ...</li>
  </ul>
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

## Anti-patterns

- Do not add a logo, favicon, or "Generated by Claude" footer. The artifact stands on its own.
- Do not use emoji as iconography. The mono labels and color dots already do that job and look more professional.
- Do not add gradients, glows, or drop shadows. The look is flat-paper, not glassmorphism.
- Do not use a dark theme by default. The ivory background is the look.
- Do not add JavaScript libraries. A small inline `<script>` for click-to-highlight is fine; anything bigger is a smell.
- Do not bury the lede behind hero illustrations or animations. The reader is here for the content.
