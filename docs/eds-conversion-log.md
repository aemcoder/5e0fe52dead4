# EDS conversion log — "The Quiet Power of Enough"

Source: `prototype/index.html` (inline-styled `<x-dc>` document-content snapshot,
1.3 MB; the authored DOM lives in `#dc-root > .sc-host`).

## Block inventory

| Prototype band | Output | Notes |
|---|---|---|
| fixed top bar | `fragments/header.html` + `blocks/header` | overlay chrome (#108) |
| 100vh dark opener | `blocks/essay-hero` | template-slotted, decorative rings + rule generated |
| opening prose (720px) | **default content** (D1) | no block — styled via the "section hosting no block" selector |
| full-bleed photo | `blocks/figure-band` | no caption → light top scrim |
| forest quote band | `blocks/pull-quote` | generated `<blockquote>` wrapper + quote mark |
| "Frugality heals in three ways" | `blocks/insight-cards` | head is default content in the same section; ordinals derived |
| "Frugality is not deprivation" | `blocks/split-feature` | 2-col prose + image, sand ground |
| "Five anchors of a frugal life" | `blocks/anchor-list` | head is default content; roman numerals derived |
| photo + caption | `blocks/figure-band` (`.has-caption`) | dark bottom scrim, caption overlay |
| dark closing statement | `blocks/closing` | dot medallion + hairline generated |
| "Less, but better." | `fragments/footer.html` + `blocks/footer` | |

Two prototype photo bands share ONE block (`figure-band`) with a caption
variant; everything else is a genuinely distinct pattern.

## Decisions locked

- **Decode tier (#95).** `essay-hero`, `pull-quote`, `split-feature`, `closing`
  and `figure-band` are template-slotted (fixed composition, authored nodes
  MOVED into role slots). `insight-cards` and `anchor-list` are reconstructive —
  authors add/remove units, so they segment on the item-heading boundary and
  also accept the DA-flattened single-cell shape (#52/#62).
- **Section scaffold.** The design is a stack of full-bleed bands, so
  `main > .section` is neutral (no padding, no max-width) and each block owns
  its own gutters and inner container (#13). Verified at 1920: cards 1100,
  split 1100, anchors 860, intro 720.
- **Content-box parity.** The prototype has no `border-box` reset, so its
  `max-width` containers measure content only and its `min-height: 100vh` hero
  measures a viewport PLUS its 160px gutters. The foundation ships the global
  `border-box` reset (#106), so the ported containers carry
  `max-width = prototype max-width + gutters` and the hero is explicitly
  `box-sizing: content-box`. Band heights match the source within ~2px.
- **Intro section styling without section metadata.** `scripts/aem.js` in this
  repo does not process `.section-metadata` client-side, so an authored
  `style: essay-intro` row would render as junk unless the delivery pipeline
  consumes it. The prose band is therefore styled by a content-anchored
  selector — `main > .section:not([class*="-container"])`, i.e. "the section
  that hosts no block" — with the `.section.essay-intro` rule kept alongside it
  so a metadata-rendering pipeline produces the identical result.
- **`<blockquote>` is not authorable inside a block cell (#104).** The runtime's
  `wrapTextNodes` folds any cell whose first element is not
  `P/PRE/UL/OL/PICTURE/TABLE/H1–6` into a single `<p>` — an authored
  `<blockquote>` swallowed the attribution. The quotation is authored as a
  paragraph and `pull-quote` supplies the `<blockquote>` as a generated wrapper.
- **Headings.** One `<h1>` (the hero). Section titles `<h2>`; card and anchor
  titles `<h3>` (the prototype's `<h4>` anchors were canonicalised up one level
  to keep the outline gap-free).
- **Derived text (`@ew-exempt`).** Card ordinals (`01…03`) and anchor numerals
  (`i…v`) are generated from the item index — declared in the block JSDoc.
- **No CTAs on this page.** The button system is still rebranded in
  `styles/styles.css` (plus the edit-mode repaint) so future CTAs decorate
  correctly; blocks route any authored CTA paragraph into an `.actions` wrapper
  by MOVING the paragraph (EW3).

## Fonts

Cormorant Garamond (display/serif) and DM Sans (body) — both SIL OFL 1.1, so
self-hosting is permitted; **no licensing alert required**. The latin-subset
variable woff2 files were extracted from the prototype's own base64
`@font-face` rules into `fonts/` (4 files, ~129 KB total) and declared in
`styles/fonts.css` (deferred, `font-display: swap`). Metric-matched
`cormorant-fallback` (→ Times New Roman) and `dm-sans-fallback` (→ Arial) faces
live in `styles/styles.css` for first paint; overrides were computed from each
face's x-height ratio against the reference face. `head.html` is untouched.

## Images

Three JPEG blobs copied from `prototype/_resources/_blobs/` to `images/` under
their hash filenames and authored as `/images/<hash>.jpg` per the conversion
brief. `davids-model-lint` flags these as D4 🔴 ("not fully qualified") — that is
expected and accepted here: this run stops before Document Authoring, so no DA
`/media` upload exists yet. When the page is pushed to DA, re-point the three
`<img src>` values at `https://content.da.live/<org>/<repo>/media/...`.

## Gates run (local harness, no DA)

- `qa-gate.mjs` — **PASS**, 26 ok / 2 warn / 0 fail. Both warnings are the
  `figure-band` full-bleed check, which is correct: the source photo bands have
  no inner max-width wrapper.
- `block-roundtrip.mjs` (6 mapped blocks, `--ew` on) — **all round-trips
  closed**, 0 structural 🔴, EW editable 32/32, dead 0, duplicated 0.
- `ew-editability-probe.mjs` (whole page) — authored 34, editable 34, dead 0,
  duplicated 0.
- `davids-model-lint.mjs` — 3 🔴 (the image-URL item above) and 6 🟡 D1
  "default-content candidate" advisories. The 🟡s are justified: every flagged
  section is a bespoke composition the block generates chrome for (hero rings,
  photo scrim + caption overlay, numbered grid, split media column, closing
  medallion), not bare prose. The one genuinely prose-only band *is* default
  content.
- Token completeness (#91) — clean. Legacy `--indigo-*` / `--gray-200` /
  `--accent-text` aliases were kept in `:root` so the pre-existing `welcome/*`
  blocks stay resolvable.
- Fixed-asset URL grep (#44) — no absolute origins in `blocks/`.
- Prototype ↔ EDS band heights @1440: 73/1060/615/520/431/806/694/1196/440/635/96
  vs 73/1060/615/520/433/808/696/1212/440/633/99 — total 6492 vs 6517 (+0.4%).
- Mobile 390px: no horizontal overflow.

## For the next person

- The header is `position: fixed` on the `header` element itself (not on an
  inner wrapper) so the block box has a real height for the QA gate while still
  floating over the hero. `--nav-height` is intentionally `0`.
- `blocks/welcome-*`, `blocks/cards`, `blocks/columns`, `blocks/hero` are
  pre-existing and untouched; they are not used by this page.
- The unused `fonts/roboto-*.woff2` files were left in place but are no longer
  referenced by `styles/fonts.css`.
