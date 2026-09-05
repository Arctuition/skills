<!-- Synced from skills/html-artifacts/_shared/components/content.md; edit the source and run scripts/sync-shared.sh. -->

# content components

Read this reference only when the selected artifact needs these components. Components are examples to adapt within the shared tokens, not required sections.

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

Use this for a prominent takeaway when the content warrants it. Avoid duplicating the same takeaway in a TL;DR block.

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
