<!-- Synced from skills/html-artifacts/_shared/components/diagrams.md; edit the source and run scripts/sync-shared.sh. -->

# diagrams components

Read this reference only when the selected artifact needs these components. Components are examples to adapt within the shared tokens, not required sections.

### Architecture / flow diagram (inline SVG)

Use inline SVG for a diagram that remains self-contained when shared. Choose another rendering approach when it materially improves the explanation and preserves the deliverable's portability.

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

  <line class="arrow" x1="180" y1="72" x2="460" y2="72" marker-end="url(#arrowHead)"/>
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

**Layout criteria.** Highlight the important path, label edges with the data or event that flows, and attach arrows to node boundaries. Split a diagram when labels or crossings make the flow difficult to follow. Preserve real cycles and branching; do not change the system's meaning to satisfy a fixed node count. Render and inspect the result for overlaps and disconnected arrows.

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
