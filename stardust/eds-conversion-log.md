# EDS conversion log — "The Quiet Power of Enough" (Simply Enough)

Source: `prototype/index.html` (claude-design, inline-styled x-dc snapshot). Single page.

## Block inventory / section triage
| # | Prototype section | EDS form | Tier |
|---|---|---|---|
| chrome | fixed dark header (leaf mark, name, tagline) | `fragments/header.html` + `blocks/header` | template-slotted; leaf mark = CSS bg `/icons/simply-enough.svg` |
| 1 | full-viewport dark opening | `essay-hero` block | template-slotted (eyebrow / h1 / rule / lede; rings + rule are CSS ornaments) |
| 2 | intro paragraphs | default content, section style `intro` | — |
| 3 | forest photo band | `image-band` block | template-slotted |
| 4 | Epictetus quote | `quote` block (collection shape: quote row + attribution row) | reconstructive |
| 5 | "Frugality heals in three ways" | head = default content; `cards numbered` (stock cards JS) | reconstructive; 01/02/03 = CSS counter |
| 6 | "Frugality is not deprivation" | `columns split` (stock columns JS) | — |
| 7 | "Five anchors" | head = default content; `anchors` block, one row per item | reconstructive; i./ii. = CSS counter |
| 8 | lake band + caption | `image-band` (caption row → `.has-caption`, dark bottom scrim) | template-slotted |
| 9 | dark closing coda | default content, section style `closing` (ring/dot + rule via ::before/::after) | — |
| chrome | "Less, but better." | `fragments/footer.html` + `blocks/footer` | — |

## Decisions
- Prototype `<h4>` anchor titles canonicalised to `<h3>` (no heading-level jump).
- Overlay chrome: `--nav-height: 0`, header fixed (#108) — the hero starts at y=0 as in the source.
- Fonts: latin subsets of Cormorant Garamond (normal + italic) and DM Sans lifted from the snapshot's embedded base64 into `fonts/`, variable weight ranges, metric-adjusted fallbacks in styles.css.
- Images: unsplash snapshot copies (AVIF) → `images/<hash>.avif`, authored as `/images/...` per the caller's instruction.
- Eyebrows are plain `<p>` before an `<h2>` (styled with `p:has(+ h2)`); the intro lead paragraph uses `p:first-of-type`. Both drift in Experience Workspace edit mode (EW10) — an accepted trade-off to avoid class-based authoring.
- Section style vocabulary: `intro`, `closing`.
- Metadata nav/footer: `/e8ac983727fd/nav`, `/e8ac983727fd/footer`.
