# EDS conversion log — "The Quiet Power of Enough"

Source: `prototype/index.html` (single-page essay, document-content markup with
per-element inline styles). Converted to authorable EDS blocks + one content page.

## Output

| Path | What |
| --- | --- |
| `content/index.html` | the page (body fragment; `nav: /f38f39754c65/nav`, `footer: /f38f39754c65/footer`) |
| `fragments/header.html` | nav document — section 1 brand link (plain `<a>`), section 2 tagline |
| `fragments/footer.html` | footer document — "Less, but better." |
| `images/*.jpg` | the three editorial images, lifted from the prototype blobs, referenced as `/images/<hash>.jpg` |

## Section → block mapping

| Prototype band | Block | Notes |
| --- | --- | --- |
| fixed top bar | `header` (+ `fragments/header.html`) | inline leaf mark in block JS; overlay chrome, `--nav-height: 0` (#108) |
| 100vh dark opening | `essay-hero` | eyebrow / `<h1>` / rule / lede, decorative rings, entrance animations behind `prefers-reduced-motion` |
| lead + body prose | `essay-intro` | row 1 = large serif lead, row 2+ = body copy |
| full-bleed forest image | `feature-image` | light top scrim |
| Epictetus pull quote | `quote` | forest ground, generated quote mark, authored `<p>` moved into a generated `<blockquote>` |
| "Frugality heals in three ways" | `reasons` | eyebrow + `<h2>` + one row per card (`<h3>` + `<p>`); the 01/02/03 ordinals are a CSS counter |
| "Frugality is not deprivation" | `split` | 2-cell row: prose column + image column, offset frame |
| "Five anchors of a frugal life" | `anchors` | eyebrow + `<h2>` + one row per anchor (`<h4>` + `<p>`); roman numerals are a CSS counter |
| lake image + caption | `feature-image caption` | variant: dark bottom scrim + caption |
| dark closing statement | `closing` | dot ornament, statement, closing copy, rule; supports an optional CTA paragraph |
| "Less, but better." | `footer` (+ `fragments/footer.html`) | |

## Decisions locked

- **One block per distinct prototype band**; `feature-image` is the single
  same-pattern collapse (two image bands, one `caption` variant).
- **Decode tier**: every block is reconstructive but *node-slotting* — authored
  `h*/p/picture` elements are MOVED into generated wrappers that carry the
  layout classes (EW1/EW2). Nothing is rebuilt from `textContent`/`innerHTML`,
  nothing is retagged, no class is put on an authored element. Every block uses
  the same defensive `collectNodes()` collector (flattened single-cell shape +
  the runtime's media-led `<p>` folding, #62/#104) and classifies by content, not
  by row index (#48/#52).
- **Presentational numerals** (01–03, i–v) are CSS counters, never authored text.
- **`essay-intro` is a block, not a default-content section** (a deliberate D1
  deviation): the band needs the lead paragraph typographically distinguished
  from the body copy, and doing that from default content requires positional
  prose selectors that drift in the Experience Workspace editor (EW10). The
  section-metadata `style` vocabulary (`tinted`, `dark`) is still defined in
  `styles.css` for future prose sections.
- **Chrome floats over the hero** exactly as the prototype does, so nothing is
  reserved in flow (`--nav-height: 0`, `header { position: fixed }`) and the late
  chrome load shifts nothing.

## Foundation

- Brand tokens lifted from the prototype (`--ink #1a1a1a`, `--paper #f5f0eb`,
  `--sand #e8dfd4`, `--forest #2d4a3e`, `--copper #c4703f`, `--muted #555`).
- Fonts self-hosted (both OFL): Cormorant Garamond Variable (roman + italic) and
  DM Sans Variable in `fonts/`, declared in `styles/fonts.css` (loaded after first
  paint). Metric-matched `cormorant-fallback` (`local('Times New Roman')`) and
  `dm-sans-fallback` (`local('Arial')`) faces live in `styles/styles.css`, computed
  from the woff2 lowercase advance widths; both are named second in their stacks.
  No font lines were added to `head.html`. **No licensing alert needed** — both
  families are SIL OFL 1.1.
- Global `box-sizing: border-box` reset (#106) and `img { display:block; max-width:100%; height:auto }` (#36).
- The boilerplate's structural layer is intact: `body { display: none }` /
  `body.appear`, the `header .header` / `footer .footer` visibility gate.
- Button system restyled to the brand and the Experience Workspace edit-mode CTA
  repaint added; the page itself authors no CTAs.

## Prototype-fidelity notes

The prototype has **no `box-sizing` reset**, so its containers are content-box:
`max-width: 720/860/1100px` + `padding: 0 40px` renders 720/860/1100px of *content*.
The blocks therefore use `max-width: 800/940/1180px` under border-box, and
`.essay-hero` keeps `box-sizing: content-box` so `min-height: 100vh` + 80px padding
reproduces the prototype's 100vh + 160px band. Eyebrow / attribution / caption lines
keep `line-height: normal` (the prototype sets none).

Verified headless at 1440×900 against the prototype served locally:

| Band | prototype | EDS |
| --- | --- | --- |
| hero | 1060 | 1060 |
| intro | 615 | 615 |
| image 1 | 520 | 520 |
| quote | 431 | 431 |
| reasons | 806 | 805 |
| split | 694 | 694 |
| anchors | 1196 | 1195 |
| image 2 | 440 | 440 |
| closing | 635 | 633 |
| **document** | **6492** | **6494** |

Also asserted: exactly one `<h1>`, all blocks `data-block-status="loaded"` and
non-empty, `.reasons-grid` computes `grid`, 3 authored `<img>` with alt text and
non-zero rendered width, zero page errors. Mobile (390px) verified stacked.

## For the next person

- Non-ASCII in `content/` and `fragments/` is already HTML-entity encoded (DA
  corrupts raw UTF-8) — keep it that way when editing.
- The prototype ships **no favicon**; the repo's existing `favicon.ico` is unchanged
  and `head.html` was not touched. If a brand icon appears later, add it as the one
  permitted `head.html` line.
- Images are referenced root-relative (`/images/<hash>.jpg`) per the deploy brief.
  If they are later moved to DA Media, author `https://content.da.live/...` URLs
  instead and re-check the delivered `.plain.html` `<img>` count.
- Legacy boilerplate blocks (`cards`, `columns`, `hero`, `welcome-*`) are untouched
  and unused by this page; they still read the compatibility aliases kept in `:root`.
