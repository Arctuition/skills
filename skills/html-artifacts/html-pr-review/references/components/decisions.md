<!-- Synced from skills/html-artifacts/_shared/components/decisions.md; edit the source and run scripts/sync-shared.sh. -->

# decisions components

Read this reference only when the selected artifact needs these components. Components are examples to adapt within the shared tokens, not required sections.

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
