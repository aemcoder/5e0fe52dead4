# EDS Conversion Log — "Simply Enough" (single-page essay)

Source: `prototype/index.html` (claude-design `<x-dc>` inline-styled document).
Single page → `content/index.html`. Chrome → `fragments/header.html`, `fragments/footer.html`.

## Runtime contract
Vanilla aem-boilerplate. Buttons: `a.button.primary` (`<strong><a>`) / `.secondary` (`<em><a>`)
in `p.button-wrapper`. **No CTAs/links exist in this essay**, so the button system is unused
(kept, rebranded, for convention). Overlay chrome (#108): the prototype header is `position:fixed`
over the hero → `--nav-height: 0`, `header { position: fixed }`, no flow reservation, no CLS.

## Foundation
- `styles/styles.css`: brand tokens (`--ink #1a1a1a`, `--canvas #f5f0eb`, `--terracotta #c4703f`,
  `--forest #2d4a3e`, `--tint #e8dfd4`, `--body-text #555`). Base page ground = cream `--canvas`.
  Global `box-sizing` reset, `img { display:block; max-width:100%; height:auto }`, full-bleed section
  scaffold (blocks own their padding + inner max-width wrap). Kept the body `appear` gate + chrome
  visibility rules. `main .section:empty { display:none }` for the metadata section.
- Fonts (`styles/fonts.css`): DM Sans (variable, body) + Cormorant Garamond (static 300/400/500/600/700
  + 400i/600i, display). Both OFL 1.1, self-hosted under `fonts/`. Metric-matched `-fallback` faces in
  `styles.css`: `dm-sans-fallback` (local Arial, size-adjust 122.34%), `cormorant-fallback`
  (local Times New Roman, size-adjust 119.98%) — values computed from the woff2 with fontTools.
- `head.html` untouched (no font lines). Favicon already present (`favicon.ico`).

## Section → block map (David's Model triage)
| Prototype section | Decision | Name |
|---|---|---|
| Fixed header (logo + brand + tagline) | chrome fragment | `fragments/header.html` + `blocks/header` |
| Hero (dark, rings, eyebrow/h1/lede) | bespoke widget block (template-slotted) | `hero` |
| Intro prose (2 paragraphs) | **default content** (D1) + section style `intro` | — |
| Full-bleed forest image | bespoke image band (reused) | `image-band` |
| Epictetus quote (green) | block-collection quote | `quote` |
| "Heals in three ways" (eyebrow+h2 + 3 numbered cards) | head=default content, `cards` block (3 units) | `cards` |
| "Not deprivation" (2-col text+image) | bespoke feature | `feature` |
| "Five anchors" (eyebrow+h2 + 5 roman rows) | head=default content, `anchors` block (5 units) | `anchors` |
| Full-bleed lake image + caption | same `image-band` + `caption` variant | `image-band` |
| Closing (dark, ornament, h2/p) | bespoke coda | `closing` |
| Footer ("Less, but better.") | chrome fragment | `fragments/footer.html` + `blocks/footer` |

Reused demo blocks removed: `welcome-*` (referenced removed indigo tokens). `columns`/`cards`
repurposed. `cards` rewritten for the numbered essay grid.

## David's Model lint
- 🔴 D4 (repo-relative `/images/*.jpg`): **intentional override** — the task requires copying local
  prototype blobs to `images/` and referencing `/images/<hash>.ext` (deploy service maps these; NOT a
  DA `/media` upload flow).
- 🟡 D1 default-content candidates (hero, image-band×2, cards, closing): all justified —
  hero/closing/image-band are genuine bespoke visual widgets (rings, gradient washes, caption overlay,
  ornament); cards is a repeating 3-unit grid (D9). Not plain prose.

## Decode/EW notes
- All blocks MOVE authored `h1–h6/p/blockquote/picture` into generated wrappers (EW1); layout classes
  ride wrappers; CSS targets `.slot :is(h2,h3)` descendant form (EW2).
- Decorative numbers (cards 01–03), roman numerals (anchors i–v), rings, rules, quote-mark, closing
  dot are CSS counters/pseudo-elements — never authored text.
- `cards`/`anchors` decode: one-row-per-unit with a heading-boundary segmentation fallback (#52).
- `image-band`: adds `caption` variant class when a caption `<p>` is present; eager-loads its `<img>`.

## Validation (headless chromium, offline harness)
- Decode: all 7 blocks decorate with **0 errors**; exactly **1 `<h1>`** on the page; cards=3, anchors=5,
  both image bands present, feature has text+img. 10 sections.
- Full-page + per-section screenshots match the prototype (dark hero, green quote, numbered cards,
  roman-numeral anchors, image bands with washes, dark closing).

## Not done here (handled by calling service)
Deploy (DA Source API), sanitise, commit/push. Content is UTF-8 (em dashes etc.) — sanitise before write.
