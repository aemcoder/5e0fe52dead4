# EDS conversion log — "The Quiet Power of Enough" (Simply Enough)

Source: `prototype/index.html` (claude-design snapshot, inline-styled `x-dc` DOM).
Output: `content/index.html`, `fragments/header.html`, `fragments/footer.html`.

## Runtime contract (this repo)
- vanilla EDS; blocks get `.block` + `data-block-name`, wrapped in `.<name>-wrapper`, section gets `.<name>-container`.
- Buttons: `formatted-only` (`<strong>/<em>` around `<a>`), classes `.button.primary/.secondary/.accent` in `p.button-wrapper`. (No CTAs on this page.)
- `aem.js` here does NOT apply `section-metadata` client-side → `scripts.js#applySectionMetadata` (called from `buildAutoBlocks`) maps `style` → section classes as a fallback; harmless when the pipeline already consumed it.

## Section triage (D1 / D11) + decode tier
| # | Prototype section | Output | Tier |
|---|---|---|---|
| 1 | Dark full-viewport hero (eyebrow, h1 w/ accent `<em>`, rule, italic lede, decorative rings) | block `essay-hero` | template-slotted |
| 2 | Intro prose (serif lead + body) | default content, style `intro` | — |
| 3 | Full-bleed forest photo | default content, style `banner` | — |
| 4 | Forest quote band (Epictetus) | block `quote` (Block Collection shape: quotation row + attribution row) | template-slotted |
| 5 | "Why it matters" — 3 numbered pillars | head = default content; block `numbered-cards` (one row per card) | reconstructive |
| 6 | "The misconception" — text + photo on sand | block `columns feature` (Block Collection columns + variant) | reconstructive |
| 7 | "In practice" — 5 roman-numeral anchors | head = default content; block `anchors` (one row per item) | reconstructive |
| 8 | Lake photo with italic caption | default content, style `banner-caption` | — |
| 9 | Dark closing coda (ornament, h2 w/ `<em>`, body, rule) | default content, style `closing` (ornament + rule are CSS) | — |
| — | Fixed header (logo, brand, tagline) | `fragments/header.html` + `blocks/header` | template-slotted |
| — | "Less, but better." | `fragments/footer.html` + `blocks/footer` | — |

## Decisions
- Numbers (01–03) and numerals (i.–v.) are generated with CSS counters, not authored — authors only add/remove rows.
- Card/anchor titles canonicalised to `<h3>` (prototype used `<h4>` under `<h2>`).
- Prototype has no border-box reset: its `max-width` values are CONTENT widths; containers use `calc(<w> + 2 * var(--page-gutter))` to match. Hero is `content-box` `min-height: 100vh` + 80px padding (as in the prototype).
- Header is overlay chrome (fixed, translucent) → `--nav-height: 0`. Tagline hidden < 600px.
- The prototype is not responsive (2-col split squashes on phones); EDS stacks the `columns feature` block below 900px and uses 24px gutters below 600px.
- Images: per pipeline instructions, blobs copied to `/images/<hash>.jpg` and referenced root-relative. `davids-model-lint` flags these as D4 🔴 (not `content.da.live`) — accepted deviation by explicit instruction; the deploy service must make `/images/` resolvable.
- Lint 🟡 D1 on `essay-hero` / `quote` / `numbered-cards`: genuine bespoke compositions / repeat units — kept as blocks.

## Fonts
- Cormorant Garamond (variable 300–700 + italic) and DM Sans (variable + italic 400), SIL OFL 1.1 — latin woff2 extracted from the prototype's embedded data-URIs into `fonts/`, declared in `styles/fonts.css`.
- Metric-matched fallbacks (`cormorant-garamond-fallback` → Times New Roman, `dm-sans-fallback` → Arial) in `styles/styles.css`; size-adjust from measured rendered-width ratio.

## Gates run
- `block-roundtrip` (all blocks): 0 structural 🔴; only 🟡 = CSS-generated numerals.
- `ew-editability-probe --simulate-editor`: 35/35 editable, 0 dead, 0 duplicated, 0 drift, block Δh 0.
- Token-completeness: clean. Harness render: 1 `<h1>`, all blocks loaded, grids compute `grid`, 0 zero-size images; page height 6501 vs prototype 6492 @1440.
