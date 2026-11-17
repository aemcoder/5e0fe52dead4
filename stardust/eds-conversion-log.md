# EDS conversion log — Field Guide (prototype/index.html → content/index.html)

## Block inventory (single page; decode tier)
| Block | Pattern | Tier | Content model |
|---|---|---|---|
| hero | opening headline, lede, CTAs, scroll-unmasked media plate | template-slotted | rows: h1 (Shift+Enter per line) / lede / CTAs / media (img or .mp4 link) / caption (2 cells) |
| marquee | velocity-reactive ticker between rules | template-slotted | one cell with a list; variant `reverse` |
| stats | count-up numerals | reconstructive | row per figure: number / label |
| chapter | chapter opener (numeral, eyebrow, h2, lede); sets section id `ch<n>` | template-slotted | 1 row: [p num, p eyebrow, h2] / [p lede] |
| plates | numbered figure plates; variants: (pair, parallax) / `wide` (clip opens) / `track` (pinned horizontal gallery) / `clips` (hover-to-play) | reconstructive | row per plate: media / [num] / title / [note]; track: last row without media = progress bar labels |
| highlight | word-by-word reading highlight | template-slotted | one paragraph |
| squares | CSS `animation-timeline: view()` squares beside a note | template-slotted | eyebrow, h3, p (squares generated, decorative) |
| story | scrollytelling pinned 4×4 figure + steps | reconstructive | row per step: eyebrow ("State 01 — Grid") / paragraph |
| player | custom video controls | template-slotted | 1 row: .mp4 link / caption / note |
| field | Canvas 2D pointer field | template-slotted | one label paragraph |
| specimen | variable-font specimen (wght × wdth) | template-slotted | row 1: [eyebrow, h3] / [note]; row 2: the word |
| archive | FLIP roll filter + keyboard lightbox; portrait images span 2 rows | reconstructive | row per frame: image / caption ("Roll N · Frame NN") |
| table | inventory table (Block Collection name) | reconstructive | first row = header |
| accordion | numbered FAQ (Block Collection name); section head is default content beside it | reconstructive | row per item: question / answer |
| closing | red closing band + big reverse marquee | template-slotted | h2 / CTA / list |
| header / footer | sticky nav with 3 mega-menu panels, reading-progress rule, trailing cursor dot / colophon | template-slotted | see JSDoc in blocks/header/header.js for the nav document contract |

## Decisions
- No section-metadata styles are used: this project's `decorateSections` doesn't process section metadata on the client, so every painted band is a block.
- Chapter dividers are drawn by `chapter` CSS (`.chapter-wrapper::before`); never authored as `<hr>`.
- Anchors `#ch1…#ch7` come from the chapter numeral; `#top` is the native top-of-document anchor; `#roll-<n>|all` (nav chips) drive the archive filter.
- Header: the hover/click mega menu follows the prototype logic: 120 ms hover-open delay, 240 ms leave-close delay, closing on Escape, a backdrop click, a link click, or more than 80 px of scroll. On mobile the trigger row scrolls sideways, as in the prototype; there's no hamburger.
- Images use repo-relative `/images/<file>` as the task requires. davids-model-lint D4 flags these (🔴). The calling service handles media.
- 🟡 D1 (marquee, highlight, squares, field, closing) and D3 (hero caption row, plates track bar row, specimen) are deliberate. These are bespoke motion components, not prose.
- Generated UI strings (allowlisted): "Play/Pause/Mute/Unmute", "← Previous / Next → / Close", archive filter labels (derived from the captions), "NN frames", "of NN", accordion numbers, wght/wdth readouts, and the CSS badges "Hover to play / Hover to preview".

## Media caveats
- The prototype snapshot carried 0-byte videos and no archive photos. The 12 archive frames come from their stated source (Lorem Picsum, seeds `fieldguide-01…12`, grayscale) and are saved as `images/fieldguide-NN.jpg`.
- Video links point to Google's public sample bucket (`commondatastorage.googleapis.com/gtv-videos-bucket/sample/*.mp4`), the prototype's stated source. They currently return 403, so the plates render the dark placeholder the prototype shows. Swap in hosted mp4s when they're available.

## Fonts
- Archivo variable (wght 100–900, wdth 62–125, latin), extracted from the prototype's embedded woff2 → `fonts/archivo-variable.woff2` (SIL OFL). The metric-matched `archivo-fallback` and `archivo-heading-fallback` faces were measured against Arial with canvas metrics.

## Gates run locally
- Experience Workspace editability probe: 211/220 editable, 0 dead, 9 exempt (the .mp4 source links).
- Token completeness: every `var(--x)` resolves.
