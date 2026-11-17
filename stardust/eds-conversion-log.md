# EDS conversion log — Field Guide (prototype/index.html)

Single-page conversion of the claude-design "Modernist" Field Guide prototype
(x-dc snapshot, inline-styled) into vanilla aem-boilerplate blocks + content.

## Outputs
- `content/index.html` — the page (body fragment, metadata first; nav/footer
  metadata → `/b148b3ce98f7/nav`, `/b148b3ce98f7/footer`).
- `fragments/header.html` — nav document (brand / three mega-menus / tools).
- `fragments/footer.html` — footer document (colophon + year).
- `images/*.jpg` — the five prototype blobs, referenced as `/images/<hash>.jpg`.
- `fonts/archivo-variable*.woff2` — Archivo (SIL OFL 1.1) extracted from the
  prototype's embedded base64 faces (latin + latin-ext, wght 100–900, wdth 62–125).

## Block inventory (decode tier)
| Block | Tier | Authoring shape |
|---|---|---|
| hero (Block Collection name, bespoke CSS) | template-slotted | h1 (lines split by `<br>`) + lede + CTAs / media / caption |
| marquee | template-slotted | one `<ul>` |
| stats | reconstructive | one row per stat: number `<p>` + label `<p>` |
| chapter-intro (×7) | template-slotted | number `<p>`, eyebrow `<p>`, `<h2>`, lede `<p>`; sets section id `ch<N>` |
| plates (+ `wide` variant) | reconstructive | media cell \| caption cell (label, meta — parallax speed parsed from meta) |
| highlight | template-slotted | one `<p>` |
| squares | template-slotted | eyebrow, `<h3>`, body |
| gallery | reconstructive | media \| number/`<h3>`/meta rows; media-less row = footer bar |
| scrolly | reconstructive | one row per state: eyebrow + body |
| video-player | template-slotted | poster (+ optional .mp4 link) / caption |
| clips | reconstructive | media \| number + `<h3>` |
| pointer-field | template-slotted | label `<p>` |
| type-specimen | template-slotted | eyebrow/`<h3>`/lede / specimen word |
| archive | reconstructive | media \| caption ("Roll N · Frame NN" → roll filter) |
| table (Block Collection) | reconstructive | header row + data rows |
| accordion (Block Collection) | reconstructive | question \| answer; reabsorbs the preceding default content (Notes + h3) as its head |
| closing | template-slotted | h2 + em-CTA / `<ul>` marquee items |
| header / footer | template-slotted chrome | see fragments |

## Decisions
- D1 advisories (single-cell "prose-only" blocks) are deliberate: every flagged
  block carries bespoke motion/behaviour (scramble, count-up, word highlight,
  canvas, sticky track, variable-font driver) that default content cannot express.
- D4 lint 🔴 on `/images/<hash>.jpg` srcs is intentional: the pipeline brief
  requires repo-relative `/images/` references for the prototype blobs.
- Videos: the prototype's mp4/poster files were not captured (posters are error
  pages; the Google sample bucket returns 403). Every video slot is authored as an
  image; blocks build a `<video>` only when an author adds an `.mp4` link to the
  media cell. The "Hover to play" badge and the player controls' active state
  appear only when a video exists (player renders disabled controls otherwise).
- Archive frames reuse the five captured photographs (prototype used Lorem Picsum
  seeds that were not captured).
- Card titles in gallery/clips are promoted from styled spans to `<h3>`
  (heading outline); block-roundtrip reports this as ROLE SWAP — intended.
- Mega menus: chapter cards, technique groups, feature tiles and the "Now
  showing" tile are authored as nested lists; the roll quick-filter buttons and
  menu thumbnails of the prototype's Media panel were not carried over.
- Trailing cursor + reading-progress rule live in the header block (chrome-owned,
  fine pointers only, off under reduced motion).
- No scroll-reveal `opacity:0` in CSS; reveals are WAAPI `fill: backwards` only.

## Gates run
- Experience Workspace probe: 211/211 authored texts editable, 0 dead, 0 dup;
  edit-mode simulation: block Δh 0 everywhere.
- block-roundtrip (with `--map` selectors to the prototype's data-dc-tpl/ids):
  closed for all blocks except the intended gallery/clips h3 promotion + badge.
- Local render (dev server) at 1440 and 390: 24 block instances loaded, 0 page
  errors, one `<h1>`, anchors #ch1–#ch7 present; archive filter/lightbox and
  accordion driven and asserted.
- CLS was not measured (deployed-URL only).
