# EDS conversion log — "Simply Enough" essay

Source prototype: `prototype/index.html` (document-content export, all styling
inline per element). Converted to authorable Edge Delivery blocks + content.

## Output

| Path | What |
|---|---|
| `content/index.html` | the essay page (body fragment, metadata block first) |
| `fragments/header.html` | nav document — brand link + tagline (deployed at `/9709f79c5814/nav`) |
| `fragments/footer.html` | footer document — closing line (deployed at `/9709f79c5814/footer`) |
| `images/*.jpg` | the three editorial photographs, lifted from the prototype blobs |

## Section triage (D1)

| Prototype band | Decision |
|---|---|
| fixed top bar | chrome → nav document + `header` block minimal mode |
| 100vh dark opening | block `essay-hero` (bespoke, template-slotted) |
| 720px prose opener | block `essay-intro` (one row per paragraph) — see note below |
| full-bleed forest photo | block `image-band` |
| green quotation band | block `pull-quote` |
| "heals in three ways" | section head as default content + block `reasons` (3 repeating units) |
| "not deprivation" split | block `split-note` |
| "five anchors" | section head as default content + block `anchor-list` (5 repeating units) |
| lake photo + caption | block `image-band` **variant** `caption` (same pattern, different skin) |
| dark closing statement | block `closing` |
| "Less, but better." | chrome → footer document + `footer` block minimal mode |

Two photo bands collapse into one block plus a variant class rather than two
bespoke blocks; everything else is a genuinely distinct pattern.

## Decisions locked

- **Block names** = the band's intent, none colliding with reserved EDS classes
  or the site's existing `welcome-*` / boilerplate blocks.
- **No `section-metadata` anywhere.** This repo's `scripts/aem.js` has no
  client-side section-metadata handling (`decorateSections` never reads it), so
  a `style` row would either render as a visible table or silently do nothing
  depending on the pipeline version. The prose opener is therefore a small
  `essay-intro` block rather than a styled default-content section — a
  deliberate, documented deviation from D1 in favour of a deterministic render.
  The two section heads (`reasons`, `anchor-list`) ARE default content; they
  need no metadata because the runtime already gives their section the
  `<name>-container` class to style through.
- **Decode tier**: `essay-hero`, `pull-quote`, `split-note`, `closing`,
  `image-band` are template-slotted (fixed composition); `reasons` and
  `anchor-list` are reconstructive (authors add/remove units).
- **Node-slotting everywhere**: every block MOVES the authored `h*`/`p`/
  `blockquote`/`picture` into generated wrappers that carry the layout classes
  (`.headline :is(h1, h2)` style selectors). No text is ever rebuilt from
  `textContent`/`innerHTML`, so every line stays inline-editable in Experience
  Workspace.
- **Derived ornament**: the `01/02/03` numerals (`reasons`), the roman numerals
  (`anchor-list`), the rules, rings, dot and quote mark are generated and
  `aria-hidden` — authors never maintain them.
- **Headings**: one `<h1>` (the hero), section titles `<h2>`, card/anchor titles
  `<h3>` — the prototype's `<h4>` anchors were canonicalised to `<h3>` so the
  outline has no level jump.
- **Chrome is additive, not destructive**: the site already ships a full nav.
  The header block now detects a nav document with no link list and renders the
  essay's minimal bar (`nav.nav-minimal`); the footer block flags a link-less
  footer document as `.minimal`. The existing nav/footer styling is untouched.
- **Foundation is additive**: brand tokens are new `--se-*` custom properties
  and the brand faces are new `@font-face` rules; no existing token, button
  rule or structural rule was changed, so the pre-existing site is unaffected.

## Fonts

Cormorant Garamond (serif) + DM Sans (sans), both SIL OFL 1.1 — self-hosted as
latin-subset variable woff2 under `fonts/`, declared in `styles/fonts.css`
(loaded by `loadFonts()`). Metric-matched `cormorant-garamond-fallback`
(`local('Times New Roman')`) and `dm-sans-fallback` (`local('Arial')`) live in
`styles/styles.css` so first paint has the right metrics and the swap costs no
layout shift. `head.html` was NOT touched. Overrides were computed from the
woff2 with fontTools using a frequency-weighted average advance width (the
variable fonts report a placeholder `xAvgCharWidth`, which would have produced
a badly wrong `size-adjust`).

## Chrome overlay / CLS

The prototype's bar is fixed and floats over the hero, so reserving
`--nav-height` would push the hero down. `essay-hero` adds `overlay-chrome` to
`<body>` during `loadEager` (before first paint) and `styles.css` zeroes the
header reservation for that class — no reserve-then-collapse shift.

## Verified locally

Rendered through the real runtime (`scripts.js` → `loadPage`) in headless
Chromium at 390 / 1440 / 1920:

- `body.appear` set, all 11 blocks `data-block-status="loaded"`, 0 pageerrors,
  0 console errors, 0 broken images.
- Exactly one `<h1>`; heading outline `h1 → h2 → h3` with no level jump.
- `reasons` computes `display: grid` (3 columns), `split-note-inner` computes
  `grid` (`518px 518px`) — the grid-collapse failure mode is excluded.
- Every block honours its max-width container at 1920 (720 / 800 / 860 / 1100 /
  700 px as per the prototype); only image bands and coloured grounds bleed.
- No horizontal overflow at 390px; two- and three-column bands stack.
- Header renders as the fixed translucent bar with a reserved height of 0 (no
  reserve-then-collapse shift); footer renders the minimal paper band.

## Notes for the next person

- Image sources are root-relative `/images/<hash>.jpg` as required by this
  pipeline. If these ever move to Document Authoring, upload the binaries and
  author `https://content.da.live/...` URLs instead.
- `image-band` accepts an optional second row: add a line and it renders as the
  overlaid caption with the dark foot scrim (`image-band caption`).
- The section heads above `reasons` and `anchor-list` are default content; they
  are styled in place through `.reasons-container` / `.anchor-list-container`,
  so no reabsorption JS is needed and the head stays plain prose for authors.
