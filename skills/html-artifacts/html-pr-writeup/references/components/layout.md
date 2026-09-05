<!-- Synced from skills/html-artifacts/_shared/components/layout.md; edit the source and run scripts/sync-shared.sh. -->

# layout components

Read this reference only when the selected artifact needs these components. Components are examples to adapt within the shared tokens, not required sections.

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
.kf code {
  font-family: var(--mono); font-size: 13px; color: var(--slate);
  display: block;
  overflow-wrap: anywhere;            /* long URLs / query strings must wrap inside the 240px panel */
  word-break: break-word;
  line-height: 1.45;
}
.kf p { font-size: 13px; margin-top: 4px; color: var(--gray-700); line-height: 1.55; }
```

### File index (main column "key files" list)

For listings that live in the **wide main column** rather than the 240px sidebar — typically a "where to make changes" / "怎么找回自己写的东西" / "key files in this module" section. Filename, optional line count chip, and a description, separated by hairlines.

`.kf` (above) was sized for a 240px sidebar; reusing it in the main column makes the filename `display: block` swallow the whole row, leaves any "· 864 lines" suffix dangling onto its own line, and pushes the description further down the cascade. **Use `.file-index` whenever the list is part of the body content; reserve `.kf` for the sidebar `aside.panel`.**

```html
<ul class="file-index">
  <li>
    <code class="path">components/product/category-product-view.tsx</code>
    <span class="lines">864 行</span>
    <p>页面外壳、URL state、列表态、tab 切换、library 切换。要改"切 tab 时丢不丢搜索词"这种事去这里。</p>
  </li>
  <li>
    <code class="path">components/product/product-management.tsx</code>
    <span class="lines">2159 行</span>
    <p>主面板。所有产品的展示、搜索、筛选、排序、批量操作、产品 form 入口、侧栏面板，全在这里。<strong>是模块里最大的单文件。</strong></p>
  </li>
  <li>
    <code class="path">components/product-bundle/*</code>
    <p>整套 bundle UI：列表 (<code>Bundles.tsx</code>)、编辑面板 (<code>bundle-editor-panel.tsx</code>)、规则编辑、option set。</p>
  </li>
</ul>
```

```css
.file-index { list-style: none; padding: 0; margin: 8px 0; }
.file-index > li {
  padding: 16px 0;
  border-bottom: 1px solid var(--rule);
}
.file-index > li:last-child { border-bottom: none; }

.file-index .path {
  font-family: var(--mono); font-size: 13.5px; color: var(--slate);
  overflow-wrap: anywhere; word-break: break-word;     /* long paths wrap mid-segment instead of overflowing */
  margin-right: 10px;
}
.file-index .lines {                              /* small pill: "864 行", "lazy", "362 lines" */
  font-family: var(--mono); font-size: 11px;
  color: var(--gray-500);
  background: var(--gray-150);
  padding: 2px 9px; border-radius: 999px;
  white-space: nowrap;                            /* keep the chip on one line even when path wraps */
  vertical-align: 1px;
}
.file-index p {
  font-size: 14px; color: var(--gray-700);
  margin: 6px 0 0; line-height: 1.55;
}
.file-index p code {                              /* inline filenames inside descriptions stay quiet */
  font-size: 12.5px; color: var(--gray-700);
}
```

The `.lines` pill is *optional*. Leave it out for files where line count isn't the headline (`api.ts` · 362 行 — fine; `components/product-bundle/*` — drop it). The pill should answer "is this file a small thing or a beast?" — if the answer doesn't matter, omit it.

For descriptions, prefer a complete sentence that tells the reader what kind of change belongs here ("改'分类列表 UI'改这里"), not just a label ("分类列表"). The reader is scanning for "where do I go" — direct them.
