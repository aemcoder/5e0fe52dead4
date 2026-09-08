# EDS Conversion Log — "Simply Enough" (frugality essay)

Single-page conversion of `prototype/index.html` (an `<x-dc>` inline-styled document)
into authorable Edge Delivery blocks + content.

## Brand tokens (lifted from the prototype)

| token | value | role |
|---|---|---|
| `--color-ink` | `#1a1a1a` | dark ground / body text |
| `--color-canvas` | `#f5f0eb` | warm cream |
| `--color-terracotta` | `#c4703f` | accent |
| `--color-green` | `#2d4a3e` | quote band |
| `--color-tinted` | `#e8dfd4` | sand band |
| `--color-body` | `#555` | body copy gray |

Fonts (both OFL 1.1, self-hosted under `fonts/`):
- **Cormorant Garamond** (display/headings/quotes) — statics 300/400/400-italic/500/600.
- **DM Sans** (body/eyebrows) — variable wght.
Metric-matched `-fallback` faces computed with fontTools; `cormorant-fallback`
sources `Times New Roman` (serif), `dm-sans-fallback` sources `Arial` (sans).

## Section → block map

| # | prototype section | output |
|---|---|---|
| 1 | fixed brand bar (logo + "Simply Enough" + tagline) | chrome → `fragments/header.html` + `blocks/header` |
| 2 | dark cinematic hero (eyebrow, h1, italic lede) | block **essay-hero** |
| 3 | intro prose (lead serif + body) | **default content**, section style `intro` (D1) |
| 4 | full-bleed image (misty forest) | block **feature-image** |
| 5 | green quote band (Epictetus) | block **pull-quote** |
| 6 | "Frugality heals in three ways" (3 numbered cards) | default-content head + block **pillars** |
| 7 | "Frugality is not deprivation" (2-col text+image) | block **split** |
| 8 | "Five anchors" (5 roman-numeral items) | default-content head + block **anchors** |
| 9 | full-bleed image + overlay caption (mountain lake) | block **feature-image** (`has-caption` variant) |
| 10 | dark closing (circle emblem, h2, p) | block **closing** |
| 11 | footer ("Less, but better.") | chrome → `fragments/footer.html` + `blocks/footer` |

## Decisions locked

- **essay-hero / feature-image / pull-quote / pillars / split / anchors / closing** are all
  bespoke visual compositions (decorative rings, scrims, oversized quote mark, numbered
  cards, offset image frame, circle emblem) — justified as blocks, not default content
  (the David's-Model lint 🟡 D1 advisories are these; each is a genuine bespoke widget).
- **Intro prose** is the one true default-content section (D1) — no repeating units, no
  bespoke structure. Styled via `main .section.intro` (section style `intro`).
- **Section heads** for `pillars` and `anchors` (eyebrow + h2) are authored as DEFAULT
  CONTENT above the block in the same section (styled in place via `.<name>-container`),
  per D1 — the blocks hold only the repeating units.
- **Decorative numbers** (01/02/03, i.–v.) and the quote mark / rings / emblem are
  GENERATED in block JS, never authored.
- Decode tier: template-slotted / node-moving for all blocks (authored elements are MOVED
  into layout wrappers — EW1; wrappers carry classes, styled with descendant selectors — EW2).

## wrapTextNodes (#104) handling

`pull-quote` (blockquote + attribution) and captioned `feature-image` (img + caption) each
authored their two parts in **separate cells** so the runtime's cell-folding cannot merge
them. `pull-quote` decode also un-nests the blockquote defensively. Verified with a jsdom
simulation that emulates `wrapTextNodes` + picture-wrapping: 1×`<h1>`, 3 pillars, 5 anchors,
correct quote/cite, correct captions, split heading/eyebrow/3 body/image all land in slots.

## Chrome

- Overlay chrome (#108): the header floats over the dark hero → `--nav-height: 0`,
  `header .nav-wrapper { position: fixed }` with the prototype's translucent dark ground +
  blur. Nothing reserved in flow, so no CLS from the late chrome load.
- Brand link is a plain `<a>` (never `<strong>`/`<em>`); the logo mark is inline SVG in
  `header.js`.
- Content metadata points chrome at `/b24468d98e5f/nav` and `/b24468d98e5f/footer`
  (deploy pipeline maps the `fragments/` files).

## Images

3 editorial JPGs copied from `prototype/_resources/_blobs/` to `images/` (hash filenames
kept) and referenced as `/images/<hash>.jpg` per the task's explicit path contract. (The
David's-Model lint flags these 🔴 D4 "not fully qualified" — expected: the calling pipeline
handles image hosting; the instruction overrides the default DA-media rule.)

## Notes for the next person

- Boilerplate demo blocks (`welcome-*`, `cards`, `columns`, `hero`) are untouched and unused
  by this page; their legacy `:root` tokens were retained so they still resolve.
- No fonts in `head.html`; brand `@font-face` in `styles/fonts.css`, `-fallback` faces in
  `styles/styles.css`. Body gate + header-height reservation kept from stock.
