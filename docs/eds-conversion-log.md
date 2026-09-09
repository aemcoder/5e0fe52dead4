# EDS conversion log — "Simply Enough" essay page

Source prototype: `prototype/index.html` (an `<x-dc>` document-content export —
every element carries inline styles; no external per-section stylesheet).

## Output

| Path | What |
| --- | --- |
| `content/index.html` | the page (body fragment: no `<!DOCTYPE>`/`<html>`/`<head>`) |
| `fragments/header.html` | nav document → deployed at `/ede2407c7757/nav` |
| `fragments/footer.html` | footer document → deployed at `/ede2407c7757/footer` |
| `blocks/essay-hero`, `image-band`, `quote`, `numbered-cards`, `split-feature`, `anchor-list`, `closing` | seven new blocks |
| `styles/styles.css` | `body.simply-enough` theme foundation (appended; nothing existing changed) |
| `styles/fonts.css` | Cormorant Garamond + DM Sans `@font-face` (appended) |
| `fonts/*.woff2`, `images/*.jpg` | self-hosted brand faces, prototype photography |

## Decisions locked

**Theme scoping.** The site already carries an unrelated Adobe-blue design
system plus a `welcome` demo page. Rather than rebrand the global foundation,
the page sets `theme: simply-enough` in its metadata block; `decorateTemplateAndTheme()`
turns that into a body class and every foundation rule for this template is
scoped under `body.simply-enough`. The existing pages are untouched. Same reason
`blocks/header` and `blocks/footer` JS were **not** modified — the chrome is
restyled entirely from the scoped foundation, and the leaf mark is a CSS
`::before` data-URI on the brand link.

**Section triage (D1).** The opening prose band has no repeating units and no
bespoke structure, so it is **default content** in a section carrying
`style: essay-intro` — not a block. The eyebrow + heading above the card grid
and above the anchor list are likewise default content
(`style: section-head`), styled in place through the runtime's
`.numbered-cards-container` / `.anchor-list-container` classes, so no
reabsorption JS is needed and the block tables hold only repeating units.

**Blocks are per pattern.** Every section that *is* a block is a distinct
pattern, so each gets its own block. The one shared pattern is `image-band`,
used twice: the caption cell switches it to the shorter, dark-footed variant
(`has-caption`) via a class the block adds in `decorate()`.

**Decode tiers.** `essay-hero`, `quote`, `split-feature` and `closing` are
fixed-composition and decode by role (heading / eyebrow / lede / media), not by
row index. `numbered-cards` and `anchor-list` are reconstructive: they accept
both one-row-per-unit and the flattened single-cell shape, segmenting on the
most frequent heading tag.

**Generated vs authored.** Ordinals (`01`, `i.`), the hairline rules, the ring
decorations, the ringed dot, the oversized quote mark and the gradient scrims
are presentation and are generated in `decorate()` / CSS — never authored — so
reordering rows always renumbers correctly.

**Heading outline.** The prototype's anchor titles are `<h4>` under an `<h2>`;
they are canonicalised to `<h3>` so the outline has no level jump. One `<h1>`
per page (the hero headline).

**No buttons.** The page has no CTAs, so no button conventions apply.

## Type

Cormorant Garamond (display/serif) and DM Sans (body) are both SIL OFL 1.1 and
are self-hosted from `fonts/` — no licensing alert needed, and `head.html` is
untouched. Brand faces load via `styles/fonts.css` (`loadFonts()`); the
metric-matched fallbacks live in `styles/styles.css` so first paint never
shifts. Their `size-adjust` values were **measured** from rendered width ratios
(DM Sans/Arial 102.21 %, Cormorant/Times 93.00 %) rather than derived from
`xAvgCharWidth`, whose OS/2 definition differs between these fonts and the
reference faces and produced a 20 % error.

## Layout notes

The prototype has **no `box-sizing` reset**, so its `max-width` values are
*content* measures and `min-height: 100vh` on the hero resolves to
`100vh + 160px` of padding. The foundation ships the standard `border-box`
reset (written at zero specificity with `:where()`), and the five boxes that
need the prototype's sizing model opt back into `content-box` explicitly:
the hero, the intro and section-head wrappers, `.numbered-cards` and
`.anchor-list`. With that, every band matches the prototype to the pixel at
1440 (hero 1260, intro 615, image 520, quote 431, cards 806, split 694,
anchors 1196, image 440, closing 633 vs 635).

The chrome is overlay chrome (fixed, translucent, over the hero), so
`--nav-height` is `0` for this theme and nothing is reserved in flow — the late
header load shifts nothing (#108).

## Deliberate divergences from the prototype

- **Responsive behaviour.** The prototype has zero media queries. The
  `split-feature` two-column grid stacks below 900px (it would render two
  ~155px columns otherwise) and the header tagline hides below 600px (it
  wraps to two lines in the prototype). Gutters, vertical rhythm and the card
  grid otherwise use the prototype's values verbatim at every width.
- **Scroll/entry animations.** The hero's `fadeIn` / `fadeUp` / `drawLine`
  keyframes are reproduced in the block CSS and are disabled under
  `prefers-reduced-motion: reduce`.
- **Alt text** is carried over verbatim from the prototype, including
  `"Still mountain lake at golden hour"` on an image that does not depict one —
  it is authored copy and belongs to the editor, not the conversion.

## Verified locally (harness at `qa/`, gitignored)

- runtime boots (`body.appear`), all 8 blocks `loaded` and non-empty, 0 page
  errors, 3 images loaded and rendering non-zero
- exactly one `<h1>`, no heading level jumps, 3 cards / 5 anchors rendered
- the emptied metadata section collapses; content stays within its measures at
  1920 while the bands stay full-bleed
- band-for-band geometry parity with the prototype at 1440, and a full-page
  eyeball at 1440 and 390
- Experience Workspace: all 35 authored prose elements and all 3 images survive
  `decorate()` with their indices, 0 dead, 0 duplicated; the edit-mode swap
  simulation reports **no** font/colour/line-height drift and no block height
  change (inter-paragraph rhythm rides flex `gap`, not paragraph margins, and
  the intro's lead-paragraph rule uses `> p:first-child` plus a
  `.prosemirror-editor:first-child` companion instead of `p:first-of-type`)
