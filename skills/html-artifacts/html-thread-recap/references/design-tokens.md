<!-- Synced from skills/html-artifacts/_shared/design-tokens.md; edit the source and run scripts/sync-shared.sh. -->

# Shared design tokens

Use these defaults unless the user requests a different visual style. Keep the artifact self-contained: inline the CSS and any SVG or small script used in the deliverable.

## Palette

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

Use clay for attention/rejection, olive for safe/chosen, and oat for intermediate or muted states. Card surfaces are white on ivory, with 1.5px gray-300 borders; reserve rule for inner dividers. Keep idle cards flat and use hover elevation only on interactive elements.

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

Use serif headings, sans body text, and mono identifiers. Keep the CJK font fallbacks paired with their Latin family.

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

/* Long URLs, query strings, deep paths inside <code> have no natural break
   opportunities and overflow narrow containers (panels, table cells). Allow
   the browser to break anywhere as a last resort — readability beats word
   integrity for identifiers and paths. */
code { overflow-wrap: anywhere; word-break: break-word; }
```

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

## Component references

Read only the references relevant to the chosen layout and content; do not load the whole library by default.

| Need | Reference |
|---|---|
| Headers, section headings, TOC, sidebar panels, main-column file index | [Layout](components/layout.md) |
| Summary, before/after, code, chips, callouts, lists, links, quotations | [Content](components/content.md) |
| Architecture/flow SVG and execution walkthrough | [Diagrams](components/diagrams.md) |
| Annotated diff and review bubbles | [Reviews](components/reviews.md) |
| Decisions, abandoned approaches, open questions | [Decisions](components/decisions.md) |

## Delivery criteria

Choose components and section counts to fit the material. Keep text, source excerpts, and diagrams legible at narrow and wide widths. Use a visible focus treatment for interactive controls.

Avoid decorative gradients, paper textures, logo footers, and AI attribution. Use the existing typography and spacing to establish hierarchy.

Render repository paths as code, in-document anchors, or usable source URLs. Filesystem URLs and relative source paths will not work for a recipient who only has the HTML file.
