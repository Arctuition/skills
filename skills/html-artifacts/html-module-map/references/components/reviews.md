<!-- Synced from skills/html-artifacts/_shared/components/reviews.md; edit the source and run scripts/sync-shared.sh. -->

# reviews components

Read this reference only when the selected artifact needs these components. Components are examples to adapt within the shared tokens, not required sections.

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
