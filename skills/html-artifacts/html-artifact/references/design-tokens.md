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

The whole point of producing an HTML artifact instead of markdown is that the reader actually reads it. That happens when the document looks like something a human designed, not something an LLM auto-generated. These tokens are tuned to read as a real editorial page — calm ivory paper, crisp slate ink, serif headings with a clay accent, generous breathing room. Cards stay completely flat at idle (clean 1.5px border, soft radius); they only lift on hover. Resist the urge to add idle drop shadows, gradients, neon accents, or emoji — the page reads modern because the *typography* and *spacing* are doing the work, not visual effects.

## Color palette

```css
:root {
  /* surfaces */
  --ivory:    #FAF9F5;  /* page background */
  --paper:    #FFFFFF;  /* card surfaces — pure white, the contrast against ivory is the point */
  --white:    #FFFFFF;  /* alias of --paper; both names ship for legibility at the call site */

  /* ink */
  --slate:    #141413;  /* heading text and body text — high-contrast for crisp reading */
  --gray-700: #3D3D3A;  /* secondary body text, table cells */
  --gray-500: #87867F;  /* eyebrow, mono labels, tertiary text */
  --gray-300: #D1CFC5;  /* default border on ivory — visible but warm */
  --gray-200: #E6E3DA;  /* soft fills (thumbnail bg, decorative lines, divider inside cards) */
  --gray-150: #F0EEE6;  /* prompt box bg, code bg, count chip bg */

  /* accents — semantic, not decorative */
  --clay:     #D97757;  /* danger / needs-attention / removed-line / rejected option / accent */
  --clay-d:   #B85C3E;  /* darker clay for hover states and emphasis */
  --olive:    #788C5D;  /* safe / added-line / chosen option / success */
  --oat:      #E3DACC;  /* medium / worth-a-look / muted callout bg / dead-end bg */

  /* tints — pre-mixed accents for backgrounds and rails */
  --clay-tint:   rgba(217,119,87,0.10);
  --clay-rail:   rgba(217,119,87,0.55);
  --olive-tint:  rgba(120,140,93,0.10);
  --olive-rail:  rgba(120,140,93,0.55);

  /* hairline — semi-transparent ink, only for inner dividers (list rows, glossary) */
  --rule:     rgba(20,20,19,0.16);

  /* elevation — reserved for hover lift and the dark callout. Idle cards stay flat. */
  --shadow-hover: 0 10px 30px rgba(20,20,19,0.10);
  --shadow-md:    0 1px 2px rgba(20,20,19,0.04), 0 6px 18px -10px rgba(20,20,19,0.08);

  /* radii — soft, modern corners */
  --radius-xs: 6px;
  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 18px;
}
```

The tokens map onto a meaning, not a color. `--clay` is "this needs attention / rejected / accent", not "this is red". `--olive` is "you can move past this safely / chosen", not "this is green". When you tag risk levels, file diffs, decision options, status indicators, etc., reach for the meaning first and the color follows.

**Surfaces.** `--paper` (pure white `#FFFFFF`) is the default for every card, panel, chip, badge, and ref-link. The contrast against the warm ivory page is what makes a card *visibly distinct* — softening that contrast (with off-whites or near-ivory tints) makes cards dissolve into the page, which is the failure mode to avoid. `--white` ships as an alias for the same value; use whichever name reads more clearly at the call site.

**Borders.** `--gray-300` (`#D1CFC5`, **1.5px**) is the default for card chrome — the outline that delineates a zone. Always 1.5px, never 1px: the half-pixel makes the difference between "I see it" and "I almost see it" on retina displays at viewing distance. `--rule` is for *inner dividers* only — the hairlines between rows in `.open-list`, `.principle-list`, `dl.glossary`, or the sidebar TOC's left edge — places where a solid `--gray-300` would feel too loud because the rows are already part of one container. Don't reach for `--rule` to outline a card; the card will dissolve into ivory. `--gray-200` is for *internal dividers within a card* (e.g. between a thumbnail and a card body) where you want the divider darker than `--rule` but still distinct from the outer chrome.

**Elevation.** Cards are flat at idle. The reference editorial style here gets its modern feel from typography, spacing, and tight border craft — *not* from drop shadows on every card. `--shadow-hover` is reserved for `:hover` lifts on interactive cards (`a.card`, `.ref-badge`); pair with `transform: translateY(-3px)` and a `border-color: var(--slate)` darken for the full affordance. `--shadow-md` is reserved for the `.callout-dark` block where the depth genuinely tells the reader "this is the moment".

## Typography

```css
:root {
  --serif: ui-serif, Georgia, 'Times New Roman',
           'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', STSong, SimSun, serif;
  --sans:  system-ui, -apple-system, 'Segoe UI', Roboto,
           'PingFang SC', 'Source Han Sans SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
  --mono:  ui-monospace, 'SF Mono', Menlo, Monaco, monospace;
}
```

- Serif for `h1`/`h2` — gives the document weight and signals "this was written for me to read"
- Sans for body — keeps line length comfortable
- Mono for filenames, code, eyebrows, small status labels — anywhere you want "this is a fact, not prose"

### CJK pairing — keep "same family" alignment

CSS picks fonts per-glyph from the stack: Latin characters match the English fonts at the front, CJK characters fall through to the Chinese fonts further down. The order matters: **never let a serif heading fall back to a sans Chinese font, or vice versa** — that produces the "西装配运动鞋" (suit + sneakers) mismatch where English Georgia in a heading sits next to Chinese 黑体 (a sans face).

The stacks above are arranged so:

- **`--serif`** pairs English serifs (ui-serif / Georgia) with Chinese serifs (Source Han Serif SC → Songti SC → SimSun). Source Han Serif and Noto Serif SC are the highest-quality cross-platform pair; Songti SC ships preinstalled on macOS, SimSun on Windows.
- **`--sans`** pairs English sans (system-ui / Segoe UI / Roboto) with Chinese sans (PingFang SC on macOS → Source Han Sans / Noto Sans → Microsoft YaHei on Windows).
- **`--mono`** is identifier-only (filenames, code), so no CJK fallback is needed — if Chinese ever appears inside a `<code>` block, it'll fall through to the body's sans face.

Don't "clean up" the stacks by dropping the Chinese entries thinking they're redundant. The generic `serif` / `sans-serif` keywords at the end do not guarantee a Chinese face that matches the family — on Windows, generic `serif` for Chinese can resolve to a default that clashes with the Latin face above it.

### Inline italic-English emphasis

Inside a sentence of Chinese prose, an English keyword (a function name, a library, a metric) is doing real work — let it carry visual weight. Tag it with `em.kw-en` and the italic serif treatment ties it to the document's accent and pulls the reader's eye without breaking the line.

```html
<p>第一次 <em class="kw-en">useEffect</em> 跑完之后，<em class="kw-en">SessionStore</em> 的 LRU 才会预热。</p>
```

```css
em.kw-en {
  font-family: var(--serif);
  font-style: italic;
  font-weight: 500;
  color: var(--clay);
}
```

Use sparingly — three or four per page, not every English term. If everything is emphasized, nothing is.

## Page shell

```css
html { scroll-behavior: smooth; }
body {
  font-family: var(--sans);
  background: var(--ivory);
  color: var(--slate);          /* high-contrast ink for crisp reading on ivory */
  font-size: 16px;
  line-height: 1.55;
  padding: 64px 32px 140px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
.page { max-width: 1120px; margin: 0 auto; }

/* Smooth interaction targets — modern micro-feedback without animation noise */
a, .chip, .ref-badge, .toc a, a.card, .card { transition: color 150ms ease, border-color 150ms ease, background 150ms ease, transform 150ms ease, box-shadow 150ms ease; }
```

**No paper texture.** Earlier iterations of this file shipped a `body::before` dotted-paper background. We've removed it — the editorial reference our skills are derived from runs flat ivory, and on dense pages the texture competed with the typography for attention. If a future artifact genuinely needs the printed-stock cue (a zine, a poster), opt in locally; don't put it in the global shell.

The texture is the lightest possible "this is paper" cue — at full opacity it would distract; at 0.85 of two ~0.02 alpha radials it just kills the screen-glow flatness. Don't crank it up looking for a stronger effect; if you can see it on first glance, it's too loud.

Two side-effects worth knowing about:

- **Stacking context**: the texture sits at `z-index: 0` (fixed) and `.page` sits at `z-index: 1` to layer above it. Anything that introduces its own stacking context later — a sticky TOC, a modal, a hover overlay — needs to opt in by setting `position: relative; z-index: 1` (or higher) on its positioned ancestor. Otherwise it can render *underneath* the texture and look broken.
- **Print**: `position: fixed` backgrounds repeat on every printed page in some browsers. The artifact is built for screen reading, but if a recipient prints it, the dots may double up. Acceptable tradeoff; only revisit if the artifact starts being shared as PDF.

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
  letter-spacing: 0.12em;            /* wider than typical mono — matches the reference editorial feel */
  text-transform: uppercase;
  color: var(--gray-500);
  margin-bottom: 18px;
  display: flex; align-items: center; gap: 12px;
}
.eyebrow::before {                    /* clay tick-mark before the eyebrow text */
  content: "";
  width: 24px; height: 1.5px;
  background: var(--clay);
}
h1 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: clamp(36px, 4.6vw, 62px); /* dramatic display size — earns the page's attention */
  line-height: 1.06;
  color: var(--slate);
  letter-spacing: -0.018em;            /* tighter tracking for serif display */
  margin: 0 0 8px;
  max-width: 17ch;                     /* 17ch keeps the headline from sprawling on wide viewports */
}
h1 em {                                /* italic accent in clay — drop it on one or two key words */
  font-style: italic;
  color: var(--clay);
}
.meta {
  display: flex; flex-wrap: wrap; gap: 18px;
  font-family: var(--mono); font-size: 12.5px; color: var(--gray-500);
  margin-top: 22px;
}
.meta .add { color: var(--olive); }
.meta .del { color: var(--clay); }
```

The `h1 em` italic-clay treatment is the same idea as the inline `em.kw-en` (used inside body prose). Both pull the reader's eye to a load-bearing word; pick the one that fits the typographic level. Use it once per page; if every word is emphasised, none are.

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
  border-radius: var(--radius-md);
  padding: 18px 22px;
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
  padding: 7px 14px; border-radius: 999px;
  font-family: var(--mono); font-size: 12.5px; text-decoration: none;
  border: 1.5px solid var(--gray-300); color: var(--gray-700);
  background: var(--paper);
}
.chip:hover {
  border-color: var(--slate);
  color: var(--slate);
}
.chip .n {                                  /* optional count after a chip label */
  font-family: var(--mono); font-size: 10.5px; color: var(--gray-500);
}
.chip:hover .n { color: var(--clay); }
.chip .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--gray-500); }

/* Risk variants */
.chip.safe       { background: var(--olive-tint); border-color: var(--olive-rail); }
.chip.safe .dot  { background: var(--olive); }
.chip.medium     { background: var(--oat); border-color: rgba(168,153,104,0.45); }
.chip.medium .dot{ background: #A89968; }
.chip.attention  { background: var(--clay-tint); border-color: var(--clay-rail); }
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
  border-left: 1.5px solid var(--gray-300);
  padding-left: 20px;
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
  border: 1.5px solid var(--gray-300);
  border-radius: var(--radius-sm);
  padding: 16px 18px;
  font-family: var(--mono); font-size: 12.5px; line-height: 1.6;
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
  border: 1.5px solid var(--gray-300); border-radius: var(--radius-md);
  background: var(--paper);
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
.diff-row.add  { background: var(--olive-tint); }
.diff-row.add .mark, .diff-row.add pre { color: var(--olive); }
.diff-row.del  { background: var(--clay-tint); }
.diff-row.del .mark, .diff-row.del pre { color: var(--clay); }

.bubble {
  margin: 10px 14px 14px 60px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  background: var(--gray-150);
  border-left: 3px solid var(--gray-500);
}
.bubble .label {
  font-family: var(--mono); font-size: 10.5px;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--gray-500); margin-right: 8px;
}
.bubble.blocking { background: var(--clay-tint); border-color: var(--clay); }
.bubble.blocking .label { color: var(--clay); }
.bubble.question { background: var(--gray-150); border-color: var(--slate); }
.bubble.question .label { color: var(--slate); }
.bubble.nit      { background: var(--paper); border-left-color: var(--gray-300); }
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
.ba-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.ba-card {
  border: 1.5px solid var(--gray-300);
  border-radius: var(--radius-md);
  padding: 22px 24px;
  background: var(--paper);
}
.ba-card.after { border-color: var(--olive-rail); }
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
.flow .box  { fill: #fff; stroke: #D1CFC5; stroke-width: 1.5; }
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
.step { display: grid; grid-template-columns: 32px 1fr; gap: 18px; margin-bottom: 28px; }
.badge {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--paper); border: 1.5px solid var(--gray-300);
  display: grid; place-items: center;
  font-family: var(--mono); font-size: 13px; color: var(--clay); font-weight: 600;
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
  border-radius: 4px var(--radius-md) var(--radius-md) 4px;
  padding: 20px 24px;
  margin: 24px 0 36px;
}
.tldr p {
  font-size: 16px; line-height: 1.55; color: var(--slate);
}
```

### Headline takeaway (dark callout)

For the one line you'd want quoted in the team Slack — the takeaway that justifies the rest of the artifact. The inverted slate-on-ivory body plus the corner crop mark says "this is *the* point"; that's the whole job, so don't dilute it. At most one per artifact, and don't use it on the same page as `.tldr` — the two compete for the same role and turn into noise.

```html
<aside class="callout-dark">
  <span class="cd-label">CORE TAKEAWAY</span>
  <p>Moving SMTP off the request path was worth the loss of synchronous delivery confirmation.</p>
</aside>
```

```css
.callout-dark {
  margin: 40px 0;
  padding: 36px 40px;
  background: var(--slate);
  color: var(--ivory);
  border-radius: var(--radius-md);
  position: relative;
}
.callout-dark::before {  /* corner crop mark */
  content: ""; position: absolute; top: 14px; left: 14px;
  width: 24px; height: 24px;
  border-top: 2px solid var(--clay);
  border-left: 2px solid var(--clay);
  border-top-left-radius: 4px;
}
.callout-dark .cd-label {
  font-family: var(--mono); font-size: 11px;
  letter-spacing: 0.20em; text-transform: uppercase;
  color: var(--clay); display: block; margin-bottom: 12px;
}
.callout-dark p {
  font-family: var(--serif); font-size: 20px; line-height: 1.5;
  color: var(--ivory); font-weight: 400;
}
```

### Section headings

The reference editorial pattern uses a clay mono index ("01", "02"…) sitting on a fixed left rail, with the serif h2 on the same baseline. Subsequent prose inside the section indents to match the index column so every section reads as one column visually. Reach for the `.sec-head` form when the document has more than two sections — it gives the reader an at-a-glance map. For one-off h2 headings inside short documents, use the plain `h2` with an inline `.h-num` instead.

```css
section { margin-top: 72px; scroll-margin-top: 28px; }

.sec-head {
  display: flex; align-items: baseline; gap: 16px;
  margin-bottom: 12px;
}
.sec-head .idx {
  font-family: var(--mono); font-size: 13px;
  color: var(--clay); font-weight: 600;
  width: 34px; flex-shrink: 0;
}
.sec-head h2 {
  font-family: var(--serif); font-weight: 500;
  font-size: 27px; color: var(--slate);
  letter-spacing: -0.012em;
  margin: 0;
}
.sec-head .count {                   /* optional small count chip */
  font-family: var(--mono); font-size: 11px;
  color: var(--gray-500); background: var(--gray-150);
  padding: 2px 8px; border-radius: 999px;
}
.sec-intro {
  font-size: 14.5px; color: var(--gray-700);
  max-width: 70ch;
  margin: 0 0 24px 50px;             /* indent matches sec-head idx column (34px + 16px gap) */
}
@media (max-width: 640px) {
  .sec-intro { margin-left: 0; }
}

/* Plain h2 — for short documents that don't use .sec-head */
h2 {
  font-family: var(--serif); font-weight: 500;
  font-size: clamp(22px, 1.9vw, 27px); color: var(--slate);
  margin: 56px 0 16px;
  letter-spacing: -0.012em;
}
h2 .h-num {                          /* inline mono index in clay */
  font-family: var(--mono); font-size: 13px;
  color: var(--clay); font-weight: 600;
  margin-right: 12px;
}
h3 {
  font-family: var(--serif); font-weight: 500;
  font-size: 19px; color: var(--slate);
  margin: 28px 0 8px;
  letter-spacing: -0.005em;
}
```

```html
<!-- Sec-head form (preferred for multi-section documents) -->
<section id="risk">
  <div class="sec-head">
    <span class="idx">01</span>
    <h2>Risk map</h2>
    <span class="count">9 files</span>
  </div>
  <p class="sec-intro">A short orientation paragraph for this section, indented under the title to keep the column flow.</p>
  <!-- section content here, also typically margin-left: 50px to align under sec-head -->
</section>

<!-- Plain form -->
<h2><span class="h-num">02</span>Where to focus</h2>
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
  border: 1.5px solid var(--gray-300);
  border-radius: var(--radius-md);
  background: var(--paper);
  padding: 26px 28px;
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
  grid-template-columns: 96px 1fr;
  gap: 16px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  margin-bottom: 6px;
  align-items: baseline;
}
.opt strong { color: var(--slate); font-weight: 500; }
.opt-note { display: block; color: var(--gray-700); font-size: 14px; margin-top: 2px; grid-column: 2; }
.opt .marker {
  font-family: var(--mono); font-size: 10.5px;
  letter-spacing: 0.08em; padding: 3px 10px;
  border-radius: 999px; text-align: center;
  align-self: center;
}
.opt.chosen { background: var(--olive-tint); }
.opt.chosen .marker {
  background: var(--olive); color: var(--ivory);
}
.opt.rejected .marker {
  background: var(--paper); color: var(--gray-500);
  border: 1.5px solid var(--gray-300);
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
  border-radius: 4px var(--radius-md) var(--radius-md) 4px;
  padding: 16px 20px;
  margin-bottom: 14px;
}
.de-label {
  font-family: var(--mono); font-size: 10.5px;
  letter-spacing: 0.08em; color: var(--gray-700);
  background: var(--paper); padding: 2px 10px; border-radius: 999px;
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
  padding: 12px 12px;
  border-bottom: 1px solid var(--rule);
  font-size: 14.5px;
}
.open-list li:last-child { border-bottom: none; }
.q-tag {
  font-family: var(--mono); font-size: 10.5px;
  letter-spacing: 0.08em; color: var(--clay);
  background: var(--clay-tint);
  padding: 3px 10px; border-radius: 999px;
  margin-right: 10px;
}
.q-owner {
  font-family: var(--mono); font-size: 12px;
  color: var(--gray-500); margin-left: 8px;
}
```

### Principle list

For numbered heuristics, takeaways, or guardrails — items that share a "rule, then category" shape. Three-column grid: mono number, serif principle, mono category tag. Hairline-separated, no card chrome — the typography itself does the work.

```html
<ol class="principle-list">
  <li>
    <span class="pn">01</span>
    <span class="pt">Always enqueue per-recipient — don't try to "send all" from a single job.</span>
    <span class="pl">RELIABILITY</span>
  </li>
  <li>
    <span class="pn">02</span>
    <span class="pt">Cap worker concurrency below the SMTP rate limit, not above it.</span>
    <span class="pl">CAPACITY</span>
  </li>
  <li>
    <span class="pn">03</span>
    <span class="pt">Use <em class="kw-en">exponential backoff</em> with jitter — fixed delay leads to a thundering herd.</span>
    <span class="pl">RETRY</span>
  </li>
</ol>
```

```css
.principle-list { list-style: none; padding: 0; }
.principle-list li {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 28px; padding: 20px 0;
  border-bottom: 1px solid var(--rule);
  align-items: start;
}
.principle-list li:last-child { border-bottom: none; }
.principle-list .pn {
  font-family: var(--mono); font-size: 13px;
  color: var(--clay); padding-top: 2px;
}
.principle-list .pt {
  font-family: var(--serif); font-size: 16px;
  color: var(--slate); line-height: 1.55; font-weight: 500;
}
.principle-list .pl {
  font-family: var(--mono); font-size: 10px;
  letter-spacing: 0.20em; text-transform: uppercase;
  color: var(--gray-500); padding-top: 4px;
}
```

`.principle-list` and `.open-list` carry different signals: open-list says "unresolved, someone needs to do something"; principle-list says "settled — these are the rules we'd repeat next time." Don't conflate them by mixing pending items into a principle list.

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
.ref-list li { margin-bottom: 10px; }
.ref-badge {
  display: inline-flex; align-items: baseline; gap: 14px;
  padding: 10px 16px;
  border: 1.5px solid var(--gray-300);
  border-radius: var(--radius-sm);
  background: var(--paper);
  text-decoration: none;
  font-size: 14px;
  color: var(--gray-700);
}
.ref-badge:hover {
  border-color: var(--slate);
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}
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
  background: var(--paper); border: 1.5px solid var(--gray-300);
  border-radius: var(--radius-md); padding: 22px 24px;
}
.panel.callout {
  background: rgba(217,119,87,0.06);
  border-color: var(--clay-rail);
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
  padding: 12px 20px;
  margin: 16px 0;
  background: var(--paper);
  border-radius: 4px var(--radius-sm) var(--radius-sm) 4px;
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

### Pullquote

A heavier-weight cousin of `.excerpt`, for the line that turned the decision — the constraint that shaped the design, the user phrasing worth preserving verbatim. Top and bottom hairlines plus the accent bar before the quote tell the reader "this is load-bearing, not background."

```html
<blockquote class="pullquote">
  <p class="quote">If we can't hit the 30-minute SLA, we have to redesign — not just hope retries fix it.</p>
  <p class="attr">— user, turn 23</p>
</blockquote>
```

```css
.pullquote {
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
  padding: 22px 0; margin: 28px 0;
}
.pullquote .quote {
  font-family: var(--serif); font-size: 20px; line-height: 1.5;
  color: var(--slate); font-weight: 500;
}
.pullquote .quote::before {
  content: ""; display: inline-block;
  width: 20px; height: 2px; background: var(--clay);
  vertical-align: middle; margin-right: 14px; margin-bottom: 6px;
}
.pullquote .attr {
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--gray-500); margin-top: 10px;
}
```

When in doubt, prefer `.excerpt` — it's quieter and won't crowd the surrounding prose. Reach for `.pullquote` when the line genuinely deserves the spotlight; one per artifact is usually enough.

## Anti-patterns

- Do not add a logo, favicon, or "Generated by Claude" footer. The artifact stands on its own.
- Do not use emoji as iconography. The mono labels and color dots already do that job and look more professional.
- Do not put idle drop shadows on cards. Cards stay flat at rest — the editorial look gets its modernness from typography, generous spacing, and clean 1.5px borders, not from cards floating off the page. `--shadow-hover` is reserved for `:hover` lifts on interactive elements; `--shadow-md` is reserved for `.callout-dark`.
- Do not add gradients, neon glows, or glassmorphism blur. If you want more presence, lean on typography (italic clay accents, larger serif display sizes) or the section's accent rail, not depth.
- Do not use 1px borders for card chrome. Always 1.5px — the half-pixel keeps the outline legible at retina viewing distance.
- Do not soften card surfaces below pure white (`--paper` / `--white` are the same). Off-whites or near-ivory tints make cards dissolve into the page.
- Do not use a dark theme by default. The ivory background is the look. The `.callout-dark` block is the one exception, used at most once per artifact.
- Do not add JavaScript libraries. A small inline `<script>` for click-to-highlight is fine; anything bigger is a smell.
- Do not bury the lede behind hero illustrations or animations. The reader is here for the content.
- Do not paste an entire transcript, log, or PR diff verbatim. The artifact synthesizes; the reader can chase the source if they need it.
- Do not invent a tradeoff that wasn't actually weighed. If no alternative was considered, it's not a "decision" — it's a discovery. Drop it from the cards section.
- Do not hide dead ends. They're often the most useful content for the next reader. The whole point of capturing them is so people don't repeat them.
- Do not link file paths as `<a href="file:///...">` or `<a href="src/foo.tsx">`. The artifact will be shared — the recipient does not have the author's filesystem, and relative paths don't resolve once the HTML moves off the author's machine. Render file paths as plain mono text (`<code>src/foo.tsx</code>`) or as in-document anchor links (`href="#file-foo"`) that jump to a section *inside* the same HTML. The only `href`s that should leave the document are public URLs (GitHub, Jira, Sentry, design docs).
