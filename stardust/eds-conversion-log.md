# EDS conversion log — Simply Enough ("The Quiet Power of Enough")

Source: `prototype/index.html` (claude-design `<x-dc>` bundle, inline styles). Single page.

## Section map (locked)
| # | Prototype band | EDS form | Decode tier |
|---|---|---|---|
| 1 | Dark full-viewport hero (eyebrow, h1 + `<em>`, rule, italic lede, rings) | `essay-hero` block | template-slotted (moves authored nodes) |
| 2 | Intro prose (serif lead + body) | default content, `style: intro` | — |
| 3 | Full-bleed forest photo | default content, `style: full-image` | — |
| 4 | Forest pull quote + attribution | `quote` block (Block Collection shape) | template-slotted |
| 5 | "Why it matters" 3-up numbered points | head as default content + `cards numbered` | reconstructive (stock cards.js) |
| 6 | "The misconception" prose + photo on sand | `columns split` | stock columns.js |
| 7 | "Five anchors" ruled list | head as default content + `cards roman` | reconstructive (stock cards.js) |
| 8 | Lake photo with overlaid italic caption | default content, `style: full-image` (caption = 2nd `<p>`) | — |
| 9 | Dark closing (ring ornament, h2 + `<em>`, body, rule) | default content, `style: closing` | — |
| chrome | Fixed translucent header (mark + brand + tagline); "Less, but better." footer | `fragments/header.html`, `fragments/footer.html` | template-slotted |

## Decisions
- Card/anchor numerals (01–03, i.–v.) are CSS counters, so no generated words reach the DOM. Prototype `<h4>` items were canonicalised to `<h3>`.
- Ornaments (rings, rules, quote glyph, closing ring) are CSS-only decoration.
- Header floats over the hero (`--nav-height: 0`, `header { position: fixed }`); tagline hidden < 600px.
- Brand mark lives at `icons/simply-enough.svg`, painted as `::before` on the plain brand `<a>`.
- Fonts self-hosted from the prototype's embedded latin woff2 subsets (Cormorant Garamond normal/italic, DM Sans) and declared in `styles/fonts.css`, with metric-approximated fallbacks in `styles.css`.
- Images copied from `_resources/_blobs` to `/images/<hash>.jpg`.
- The prototype's decorative square behind the split-section photo is z-index:-1 under the sand ground and never visible, so it was not ported.
- `styles/styles.css` was rebranded fully. Legacy `welcome-*` / `hero` blocks remain in the repo, unused by this page; they reference old tokens.
