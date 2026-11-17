# EDS conversion log — "The Quiet Power of Enough" (Simply Enough)

Source: `prototype/index.html` (claude-design, inline-styled, single page).

## Block inventory (tier)
| Section | Treatment | Tier |
|---|---|---|
| Hero (eyebrow, h1, lede, decorative rings) | `essay-hero` block | template-slotted |
| Intro prose | default content, section style `intro` | — |
| Forest photo band | `photo-band` block | template-slotted |
| Epictetus quote | `quote` block (row 1 quote, row 2 attribution) | template-slotted |
| "Frugality heals in three ways" | head = default content; `pillars` block, one row per pillar (h3 + p) | reconstructive |
| "Frugality is not deprivation" | `split` block, one row: text cell + image cell | reconstructive (cells classified by content) |
| "Five anchors" | head = default content; `anchors` block, one row per anchor (h3 + p) | reconstructive |
| Lake photo + caption | `photo-band captioned` variant | template-slotted |
| Closing coda | default content, section style `closing` | — |
| Header / footer | `/68b5cb4b0127/nav` and `/68b5cb4b0127/footer` fragments | — |

## Decisions
- Prototype `h4` anchor titles canonicalised to `h3` (no heading level jump).
- Ordinals (01/02/03, i./ii./…), the large quote mark, accent rules and ornaments are CSS-only (`decorate()` adds no words).
- Header is a fixed overlay over the 100vh hero → `--nav-height: 0`; the logo mark is a decorative inline SVG in header.js, the brand name is an authored plain link. Tagline hidden < 600px.
- Fonts: Cormorant Garamond + DM Sans (SIL OFL) latin variable woff2 extracted from the prototype's embedded @font-face into `fonts/`.
- Images copied from `prototype/_resources/_blobs/` to `images/` and authored as `/images/<hash>.jpg`.
- Section styles rely on server-side section-metadata rendering (this `aem.js` does not process section-metadata client-side).
- Legacy tokens used by the `welcome-*` blocks are kept in `:root`.
