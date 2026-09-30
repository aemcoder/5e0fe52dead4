# EDS conversion log — Field Guide (prototype/index.html)

## Outputs
- Page: `content/index.html` (body fragment; metadata block first — Title, Description, nav `/c68d78c273e5/nav`, footer `/c68d78c273e5/footer`)
- Chrome: `fragments/header.html`, `fragments/footer.html`
- Images: 5 prototype blobs copied to `images/<hash>.jpg`; the 12 archive frames (Lorem Picsum in the prototype) downloaded as `images/fieldguide-NN.jpg` (1000px wide, recompressed). All referenced root-relative as `/images/...` per the pipeline instruction (davids-model-lint reports these as D4 🔴 "not fully qualified" — intentional; the calling service handles upload).
- Font: Archivo variable (wght 100–900, wdth 62–125, SIL OFL) extracted from the prototype's embedded latin woff2 → `fonts/archivo-variable.woff2`, declared in `styles/fonts.css`; metric-matched `archivo-fallback` (Arial, size-adjust 99% measured) in `styles/styles.css`.

## Block inventory (all decode by content; authored nodes are MOVED, never rebuilt)
| Block | Tier | Notes |
|---|---|---|
| opening | template-slotted | `<h1>` with a line break → masked line entrance; lede; strong/em CTAs |
| hero-media | template-slotted | video link → looping video, scroll unmask (clip-path) |
| marquee (+ `reverse`) | reconstructive | `<ul>` ticker, velocity-reactive WAAPI; `reverse` for the closing band |
| stats | reconstructive | one row per stat; count-up |
| chapter | template-slotted | numeral, kicker, `<h2>`, lede; sets `id="chN"` from the numeral; rule above; heading scramble |
| plates (+ `wide`) | reconstructive | parallax plates (speed read from caption "Layer speed N×"); `wide` = clip-path frame |
| reading | template-slotted | word-by-word scroll highlight (words split in place) |
| squares | template-slotted | CSS `animation-timeline: view()` squares |
| hscroll | reconstructive | pinned horizontal gallery; last media-less row = progress labels |
| scrolly | reconstructive | pinned 16-cell figure, one row per state |
| video-player | template-slotted | custom controls (play, scrub, time, mute) |
| clips | reconstructive | hover-to-play clips |
| pointer-field | template-slotted | Canvas 2D field |
| specimen | template-slotted | variable-font specimen (wght/wdth) |
| archive | reconstructive | roll filter (FLIP) + keyboard lightbox; deep links `#roll-N`, `#frame-N` (used by the Media mega menu) |
| table | Block Collection | header row + records (inventory) |
| accordion | Block Collection | Q/A rows; section head authored as default content, reabsorbed |
| closing | template-slotted | accent band (paints `.closing-container`), outline CTA; paired with `marquee reverse` |
| header / footer | template-slotted chrome | nav doc contract: §1 brand (plain `<a>`), §2 tools CTA, §3+ one mega panel each (`<h2>` label, intro, `<h3>`-segmented groups) |

Pre-existing blocks (hero, cards, columns, welcome-*) are untouched; their legacy tokens are kept in `:root`.

## Decisions
- D1 advisories (opening, hero-media, marquee, reading, squares, video-player, pointer-field, specimen, closing flagged as default-content candidates): each is a bespoke motion widget with JS behaviour — kept as blocks.
- Video: the Google sample bucket 403s from the build environment; video URLs are authored as links (as in the prototype) and rendered as `<video>`; posters omitted, neutral-900 fallback. Video link paragraphs are declared `@ew-exempt`.
- Closing statement authored as `<h2>` (prototype used `<h3>`) for a clean outline; plate/clip titles are caption paragraphs (prototype spans).
- Reveal-on-enter implemented per block, only hiding elements that start below the fold (content is visible without JS). All motion honours `prefers-reduced-motion`.
- Trailing cursor lives in `scripts/delayed.js` (fine pointers only).
- Mobile: scrolly figure is shrunk and given the page ground below 600px so state text scrolls under it.

## QA (local harness)
- block-roundtrip: 0 structural 🔴, EW editable 208/217, dead 0, duplicated 0, exempt 9 (video links)
- ew-editability-probe --simulate-editor: 0 drift
- qa-gate: PASS (62 ok, 5 wide-viewport warnings — all full-bleed in the prototype)
- Interaction drive: mega menus, archive filter/lightbox/deep links, accordion — all pass
