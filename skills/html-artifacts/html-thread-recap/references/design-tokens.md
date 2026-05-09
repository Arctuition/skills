# Design tokens & shared components

These tokens are deliberately consistent across the pr-writeup, pr-review, module-map, and thread-recap skills so that artifacts produced by the same person feel like a coherent set. Use them verbatim unless the user has asked for a different look.

## Why these tokens exist

The whole point of producing an HTML artifact instead of markdown is that the reader actually reads it. That happens when the document looks like something a human designed, not something an LLM auto-generated. These tokens are tuned to read as a "real" document — calm color palette, generous whitespace, serif headings paired with mono callouts. Resist the urge to add gradients, drop shadows, neon accents, or emoji.

## Color palette

```css
:root {
  --ivory:    #FAF9F5;  /* page background */
  --slate:    #141413;  /* primary heading text */
  --clay:     #D97757;  /* danger / needs-attention / removed-line / rejected option */
  --oat:      #E3DACC;  /* medium / worth-a-look / muted callout bg / dead-end bg */
  --olive:    #788C5D;  /* safe / added-line / chosen option */
  --gray-150: #F0EEE6;  /* prompt box bg, code bg */
  --gray-300: #D1CFC5;  /* borders */
  --gray-500: #87867F;  /* eyebrow, secondary text, mono labels */
  --gray-700: #3D3D3A;  /* body text */
  --white:    #FFFFFF;
}
```

The tokens map onto a meaning, not a color. `--clay` is "this needs attention / rejected", not "this is red". `--olive` is "you can move past this safely / chosen", not "this is green". When you tag risk levels, file diffs, decision options, etc., reach for the meaning first and the color follows.

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

Optional sidebar layout for documents that have an in-this-page TOC:

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
  <p class="eyebrow">THREAD RECAP · BIRCHLINE</p>
  <h1>Slow checkout investigation</h1>
  <div class="meta">
    <span class="stat">Claude Code session</span>
    <span class="stat"><strong>2026-05-09</strong></span>
    <span class="stat"><strong>47 turns</strong></span>
    <span class="stat">recapped by <strong>@haowei</strong></span>
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
.meta {
  display: flex; flex-wrap: wrap; gap: 18px;
  font-family: var(--mono); font-size: 12.5px; color: var(--gray-500);
  margin-top: 12px;
}
```

### Prompt box (optional)

Shows the user's original ask so the document is reproducible. Keep it short.

```html
<div class="prompt-box">
  <span class="label">PROMPT</span>
  Summarize this thread for the team — what we decided about the queue migration.
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

### Topic chips (overview)

For threads that explored multiple distinct topics. Each chip jumps to that decision section. Reuses the `chip` pattern from the risk-map.

```html
<div class="topic-chips">
  <a class="chip" href="#d-queue"><span class="dot"></span>Queue vs inline</a>
  <a class="chip" href="#d-retry"><span class="dot"></span>Retry policy</a>
  <a class="chip" href="#d-monitor"><span class="dot"></span>Monitoring</a>
</div>
```

```css
.topic-chips { display: flex; flex-wrap: wrap; gap: 10px; }
.chip {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 12px; border-radius: 999px;
  font-family: var(--mono); font-size: 12.5px; text-decoration: none;
  border: 1px solid var(--gray-300); color: var(--gray-700);
  background: var(--white);
}
.chip .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--gray-500); }
.chip:hover { border-color: var(--gray-500); }
```

### TOC sidebar

```html
<aside class="toc">
  <p class="toc-label">IN THIS RECAP</p>
  <a href="#tldr">TL;DR</a>
  <a href="#decisions">Decisions</a>
  <a href="#dead-ends">Dead ends</a>
  <a href="#open">Open questions</a>
  <a href="#refs">References</a>
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

## Components introduced for thread-recap

### Decision card

The heart of the artifact. Question, options with chosen/rejected markers, the deciding "because", and the explicit tradeoff. Use one card per consequential decision.

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

For attempts that didn't work. The visual signal is the muted oat background — it should look like content the reader can quickly classify as "abandoned" without struggle.

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

### Files-touched panel

For the artifacts list.

```html
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
.panel-label {
  font-family: var(--mono); font-size: 11px;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--gray-500); margin-bottom: 10px;
}
.kf { margin-bottom: 12px; }
.kf code { font-family: var(--mono); font-size: 13px; color: var(--slate); }
.kf p { font-size: 13px; margin-top: 2px; color: var(--gray-700); }
```

### TL;DR block

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

### Inline excerpt block

For the rare moments where the exact wording from the conversation matters. Don't reach for this often — paraphrase by default.

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

- Do not paste the entire transcript verbatim. The artifact is a recap, not an export. Quote sparingly.
- Do not invent a tradeoff that wasn't actually weighed. If the conversation didn't consider alternatives, it isn't a "decision" — it's a discovery. Drop it from the cards section.
- Do not hide dead ends. They're often the most useful content for the colleague reading this. The whole point is so they don't repeat them.
- Do not use emoji as iconography. The mono labels and color dots already do that job and look more professional.
- Do not add a logo, favicon, or "Generated by Claude" footer. The artifact stands on its own.
- Do not add gradients, glows, or drop shadows. The look is flat-paper.
- Do not use a dark theme by default. The ivory background is the look.
- Do not add JavaScript libraries. A small inline `<script>` for click-to-highlight is fine; anything bigger is a smell.
