# EDS conversion log — "The Quiet Power of Enough"

Source: `prototype/index.html` — a claude-design `<x-dc>` document-content prototype
(all styling as per-element inline `style="…"`, no section classes, brand webfonts
embedded as base64 data URIs).

## Output

| Path | What |
|---|---|
| `content/index.html` | the essay page (DA body fragment) |
| `fragments/header.html` | nav document (`nav: /012473c5d6ca/nav`) |
| `fragments/footer.html` | footer document (`footer: /012473c5d6ca/footer`) |
| `blocks/essay-*` | eight new blocks (below) |
| `styles/styles.css` | essay tokens, metric-matched fallback faces, essay section scaffold |
| `styles/fonts.css` | self-hosted Cormorant Garamond + DM Sans |
| `fonts/*.woff2` | latin-subset variable faces lifted from the prototype |
| `images/*.jpg` | the three editorial photographs |
| `icons/leaf.svg` | the brand mark from the prototype header |

## Section → block map

| # | Prototype section | Decision |
|---|---|---|
| 0 | fixed header bar | `fragments/header.html` + essay chrome CSS in `blocks/header` |
| 1 | full-height dark opening | `essay-hero` (bespoke, template-slotted) |
| 2 | two-tier essay opening | `essay-lede` (bespoke) |
| 3 | full-bleed photo band | `essay-figure` variants `light tall` |
| 4 | pull quote on forest ground | `essay-quote` |
| 5 | "why it matters" numbered grid | default-content head (D1) + `essay-cards` |
| 6 | argument beside a photograph | `essay-split` |
| 7 | "five anchors" ruled list | default-content head (D1) + `essay-anchors` |
| 8 | full-bleed photo band + caption | `essay-figure` (default dark wash) |
| 9 | dark coda | `essay-closing` |
| 10 | sign-off line | `fragments/footer.html` + essay chrome CSS in `blocks/footer` |

## Decisions locked

- **Block naming.** The prototype has no section classes (`<div data-dc-tpl="N">`), so
  names are derived from intent and carry the `essay-` prefix — matching the project's
  existing `welcome-*` convention and guaranteeing no collision with the boilerplate
  `cards` / `columns` / `hero` blocks that other pages still use.
- **Decode tier (#95).** `essay-hero`, `essay-lede`, `essay-quote`, `essay-figure` and
  `essay-closing` are fixed-composition bespoke bands; `essay-cards`, `essay-split` and
  `essay-anchors` are reconstructive (authors add/remove units). Every block classifies
  by content — never by `block.children[N]` — and every one handles both the
  one-row-per-unit shape and the flattened single-cell shape DA often delivers
  (#48/#52/#62/#63), including the `wrapTextNodes` media-led fold (#104).
- **Section heads are default content (D1).** The eyebrow + `<h2>` above `essay-cards`
  and `essay-anchors` are authored as prose in the section and styled in place through
  `.<name>-container .default-content-wrapper` — no reabsorption, zero pixel change.
- **Ordinals are generated, not authored.** `01/02/03` and `i.–v.` are derived from
  position, emitted `aria-hidden`, and declared `@ew-exempt` in the block JSDoc.
- **Heading outline canonicalised.** The single `<h1>` is the hero headline; section
  titles are `<h2>`; card and anchor titles are `<h3>` (the prototype used `<h4>` for
  the anchors, which would have skipped a level).
- **No buttons.** The essay has no CTAs, so the emphasis convention is unused and no
  block manufactures anchors.
- **Global scaffold is additive.** New `--essay-*` tokens sit beside the existing Adobe
  ramp; the boilerplate's `body.appear` gate, header reservation and section scaffold
  are intact. Essay sections opt out of the generic section shell through
  `main .section[class*="essay-"]`, and each block paints its own full-bleed band.
- **Chrome is content-anchored, not global.** Both the essay header and footer styles
  are scoped `body:has(.essay-hero-container) …`, so the boilerplate chrome that other
  pages rely on is untouched. (An earlier section-metadata `style` hook was dropped:
  this fork's `decorateSections` does not process section metadata client-side.)
- **Overlay chrome, no reservation (#108).** The prototype nav is a fixed translucent
  bar over the full-height hero, so `header { height: 0 }` on this page — reserving
  `--nav-height` would push the hero down below where the source renders it.
- **Fonts.** Cormorant Garamond and DM Sans are both SIL OFL 1.1 — no licensing alert
  needed. Their latin-subset variable woff2 files were extracted from the prototype's
  own embedded `@font-face` data URIs and are declared in `styles/fonts.css` (loaded
  post-paint); `cormorant-garamond-fallback` (local Times New Roman) and
  `dm-sans-fallback` (local Arial) carry computed `size-adjust` /
  `ascent-override` / `descent-override` in `styles.css` so the swap costs no CLS.
  `head.html` is untouched.
- **Content-box where the source relies on it.** The prototype ships no `box-sizing`
  reset, so `.essay-hero` (100vh inside an 80px band), the `essay-lede` wrap and the
  `essay-closing` dot ring are explicitly `content-box`; everything else is border-box
  inside each block. Adding a global reset would have shifted the other pages.
- **Responsive.** The prototype has no media queries; `essay-split` collapses to one
  column under 900px and every band tightens its gutter under 600px.
- **Favicon.** The prototype ships none, so the repo's existing `favicon.ico` stands.

## Deviations from the skill, and why

- **`D4` 🔴 — authored `<img src="/images/<hash>.jpg">` is repo-relative, not a
  `content.da.live` URL.** Required verbatim by the conversion request (blobs copied to
  `images/`, referenced as `/images/<hash>.ext`). Deployment is handled by the calling
  service, which owns the media upload/rewrite step.
- **`D1` 🟡 on `essay-hero` / `essay-lede` / `essay-quote` / `essay-figure` /
  `essay-closing`** — each is flagged as "single-column prose, default-content
  candidate". All five are genuinely bespoke compositions whose layout default content
  cannot express (a 100vh centred stage with three decorative rings and a drawn rule; a
  two-tier serif/sans opening; a quote with a generated 140px quote mark; a full-bleed
  image with a gradient wash and overlaid caption; a coda with a dot mark and closing
  rule). Modelling them as default content would need positional prose selectors, which
  the Experience Workspace contract forbids (EW10).

## Verification (local harness, 1440×900)

- Full-page pixel diff vs the prototype: **125 px of 9.35 M (0.0013 %)** — the residual
  is the brand leaf rendered as `<img>` vs the prototype's inline SVG. Document height
  identical (6492 px on both).
- `block-roundtrip` (all blocks, mapped to the prototype's `nth-child` sections):
  **0 structural 🔴**; EW gate **34/34 editable, 0 dead, 0 duplicated**.
- `ew-editability-probe --simulate-editor`: **35/35 editable, 0 drift, 0 px block
  height delta** in edit mode.
- `qa-gate`: 27 ok / 3 warn / 1 fail. The three warnings are the wide-1600 full-bleed
  check on `essay-hero` and the two `essay-figure` bands — correct, those prototype
  sections have no inner max-width wrapper. The one failure is
  `block header renders non-empty h=0`, which is the intended overlay chrome (#108):
  the `<header>` spacer is 0 and the fixed nav bar renders 72 px.
- Token-completeness (`comm -23`) clean; no absolute asset origins in `blocks/`.
- Mobile (390 px) and wide (1920 px) renders eyeballed.
