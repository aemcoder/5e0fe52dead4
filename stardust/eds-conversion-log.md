# EDS conversion log — "The Quiet Power of Enough" (Simply Enough)

Source: `prototype/index.html` (claude-design snapshot, inline-styled `<x-dc>`-style DOM, no section classes).
Output: `content/index.html`, `fragments/header.html` (nav), `fragments/footer.html`.

## Section triage (D1 / D11)

| # | Prototype section | Decision | Tier |
|---|---|---|---|
| 0 | fixed header (mark, brand, tagline) | `header` block + nav fragment (brand / [links] / tools) | template-slotted |
| 1 | dark full-viewport hero, rings, rule | block `essay-hero` (bespoke composition; rings/rule are CSS-only) | template-slotted |
| 2 | essay intro (serif lead + sans body) | default content, style `intro` | — |
| 3 | full-bleed forest photo | default content, style `band` | — |
| 4 | Epictetus quote on forest | default content (`<blockquote>` + attribution), style `quote` | — |
| 5 | "Frugality heals in three ways" 3-up | head = default content; block `pillars` (one row per pillar; 01/02/03 via CSS counter) | reconstructive |
| 6 | "Frugality is not deprivation" split | stock `columns` block + variant `split` (CSS only) | stock |
| 7 | "Five anchors" ruled list | head = default content; block `anchors` (one row per item; i./ii. via CSS counter) | reconstructive |
| 8 | lake photo + italic caption | default content, style `band-caption` | — |
| 9 | closing statement on ink | default content, style `closing` (ornament + rule are pseudo-elements) | — |
| 10 | "Less, but better." | footer fragment | — |

Section `style` vocabulary (closed set): `intro`, `band`, `band-caption`, `quote`, `closing`.

## Decisions
- Card/list headings canonicalised: prototype `<h4>` items → `<h3>` (single `<h1>`, h2 section titles, h3 items).
- Ordinals (01–03, i.–v.) are CSS counters — authors add/remove rows without retyping numbers.
- Prototype containers are content-box: every wrapper is `max-width: <proto width> + 2 * gutter`.
- Hero `min-height: calc(100vh + 160px)` reproduces the source (100vh content-box + 80px padding).
- Header is overlay chrome (`--nav-height: 0`, fixed bar) — the hero sits under it as in the source.
- The split image's offset frame is omitted: in the source it sits at `z-index:-1` behind the sand band and never paints.
- Images: per the calling service, blobs copied to `/images/<hash>.jpg` and authored root-relative.
  `davids-model-lint` flags these as D4 🔴 (not fully qualified) — expected; the deploy service rewrites/hosts them.
- `davids-model-lint` 🟡 D1 on `essay-hero` and `pillars`: justified — hero carries bespoke rings/rule/motion,
  pillars carry the counter + rule grid composition.
- Fonts: Cormorant Garamond (roman + italic) and DM Sans, SIL OFL 1.1, latin variable woff2 extracted from the
  prototype's embedded `@font-face` data; metric-matched fallbacks computed from hhea + measured widths
  (`cormorant-garamond-fallback` → Times New Roman, `dm-sans-fallback` → Arial).
- Section metadata: this `aem.js` has no client `section-metadata` support; `buildAutoBlocks()` gained a small
  fallback that applies `style` as section classes if the pipeline did not already.
- Known edit-mode drift: `intro` lead paragraph uses `p:first-of-type`, split eyebrow uses `p:has(+ h2)`.

## Gates run
- `ew-editability-probe --content content/index.html`: 35/35 editable, 0 dead, 0 duplicated.
- Harness render 1440 / 390: 1 `<h1>`, 3 pillars, 5 anchors; page height 6545 vs prototype 6492 at 1440.
- Text parity: every prototype word present except CSS-counter ordinals (rendered as pseudo-content).
- Token completeness: every `var(--x)` used by blocks is defined in `:root`.
