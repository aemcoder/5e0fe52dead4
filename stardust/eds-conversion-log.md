# EDS conversion log — Field Guide ("The page moves.")

Source: `prototype/index.html` (claude-design `<x-dc>` snapshot, Modernist design system).
Output: `content/index.html`, `fragments/header.html` (nav), `fragments/footer.html`.

## Foundation
- Tokens lifted verbatim from the prototype `:root` into `styles/styles.css`; the body gate,
  header reservation (`--nav-height: 60px`, sticky header) and the section scaffold are kept.
- Font: Archivo variable (wght 100–900, wdth 62–125, SIL OFL), extracted from the prototype's
  inlined latin woff2 into `fonts/archivo-variable.woff2`; `@font-face` in `styles/fonts.css`.
  Metric-matched `archivo-fallback` (Arial, size-adjust 101.69%) in `styles.css`.
- Buttons: prototype `.btn-primary` / `.btn-secondary` mapped onto `a.button.primary/.secondary`.

## Block inventory (one per prototype pattern)
| Block | Tier | Authoring shape |
|---|---|---|
| opening | template-slotted | [h1 + lede + CTAs] / [video URL · caption · meta] |
| marquee | template-slotted | one `<ul>` of phrases |
| stats | reconstructive | number · label per row |
| chapter-head (×7) | template-slotted | numeral, eyebrow, h2, lede — numeral sets `#chN` |
| plates (`parallax`, `clip`) | reconstructive | media · caption · meta per row |
| word-reveal | template-slotted | one paragraph |
| squares | template-slotted | eyebrow, h3, body |
| gallery-track | reconstructive | media · number · title · kind; final row = bar labels |
| scrolly | reconstructive | "State NN — Label" · paragraph |
| video-player | template-slotted | video URL · caption · meta |
| clips | reconstructive | video URL · number · title |
| pointer-field | template-slotted | label |
| type-specimen | template-slotted | [eyebrow, h3, body] / [specimen word] |
| archive | reconstructive | image · caption ("Roll N · Frame NN") |
| inventory | reconstructive | data table (header row + entries, 4 cols) |
| accordion | reconstructive | question · answer; section head = default content, reabsorbed |
| closing | template-slotted | [h2] / [em CTA] / [ul ticker] |

D1 advisories (lint 🟡): chapter-head, marquee, word-reveal, squares, pointer-field,
type-specimen and closing are single-cell blocks on purpose — each carries bespoke
motion (scramble + anchor, ticker, scroll-linked word highlight, scroll-driven squares,
canvas field, variable-font specimen, reverse ticker) that default content cannot express.

## Decisions
- Videos: the prototype's `media/*.mp4` were never captured and Google's sample bucket
  now returns 403, so clips are authored as links to reachable public sources
  (archive.org Blender films, test-videos.co.uk, MDN CC0 clips). Authors can swap them.
- Archive photos: the prototype's `media/photo-NN.jpg` were missing; the 12 frames reuse
  the five captured photographs (`/images/<hash>.jpg`).
- Images are referenced as `/images/<hash>.jpg` per the pipeline contract (the lint's D4
  flags these; the deploy service resolves them).
- Nav: header block reads brand / trigger list / tools, then one panel section per trigger
  (cards, groups with optional `<em>` counts, callout, video preview, thumbnails).
  `#roll-N` / `#frame-NN` links are handled by the archive block (filter / lightbox).
- Prototype scroll-reveals are re-wired in block JS with WAAPI (`fill: backwards`), so
  content stays visible without JS. All motion honours `prefers-reduced-motion`.

## Gates
- ew-editability-probe: 220 authored, 211 editable, 0 dead, 0 duplicated, 9 exempt
  (video source links); `--simulate-editor` drift 0.
