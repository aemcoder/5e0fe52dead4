# EDS conversion log — Wheeler (prototype/index.html)

## Runtime contract (probed from scripts/scripts.js + scripts/aem.js)
```json
{
  "runtime": "vanilla-eds",
  "blockWrapperClass": "block",
  "buttonClasses": ".button / .button.primary / .button.secondary / .button.accent, in p.button-wrapper",
  "buttonization": "formatted-only (<strong>/<em> around or inside the <a>, link alone in its <p>)",
  "fragmentScriptPolicy": "inert-innerHTML",
  "emptySectionCollapse": true
}
```

## Outputs
- `content/index.html` — page (metadata: nav `/010c63be93b1/nav`, footer `/010c63be93b1/footer`)
- `fragments/header.html` — nav doc: brand / links / tools / utility-bar sections
- `fragments/footer.html` — footer doc: brand / 3 link columns / legal bar

## Block inventory (names avoid the repo's existing welcome-page `hero`/`cards` blocks)
| Prototype section | Block | Tier | Notes |
|---|---|---|---|
| header.site + .utility | `header` | template-slotted | 4-section nav doc; mobile slide-in panel, sticky (top = -utility height) |
| section.hero | `promo-hero` | template-slotted | ribbon `<strong>` tag + link (`<em>Details</em>`), `<h1>` (`<em>` = yellow), lede, strong/em CTAs, optional bg image (eager/high priority). Lint D1 advisory accepted: bespoke composition (scrim, bg layer, ribbon). |
| section.quick | `quick-links` | reconstructive | row = `:icon:` token + title link + description; card-as-link |
| section.used | `equipment-cards` | reconstructive | head = default content (reabsorbed); chips `<ul>`; card row = [img] badge p, h3, specs ul, price p, note p, Details link; foot CTA row (dark primary) |
| section.stats | `stats` | reconstructive | intro = default content reabsorbed as first grid cell; row = number p + label p |
| section.service | `service` | template-slotted | 2 cells: copy / gallery (2 optional images + badge) |
| section.offers | `offers` | reconstructive | head = default content (reabsorbed); row = [img] tag p, h3, View-offer link. Lint D1 advisory accepted: image-backed tile grid. |
| section.brands | `brands` | reconstructive | head = default content styled in place; row = brand name |
| section.locations | `locations` | template-slotted | 2 cells: copy + CTA / city `<ul>` |
| footer | `footer` | template-slotted | brand + N columns + legal bar |

## Decisions
- Buttons: `<strong><a>` = yellow primary, `<em><a>` = ghost (light on the hero); equipment/locations
  primaries repaint dark in block CSS (prototype `.btn-dark`).
- Images: the prototype only has `<image-slot>` placeholders (no blobs) → image cells omitted; blocks
  render the prototype's dark placeholder ground.
- Icons: authored `:name:` tokens (`/icons/*.svg`, stroke `currentColor`); blocks inline the SVG so hover recolouring works.
- Fonts: Barlow 400–700, Barlow Condensed 700, Barlow Semi Condensed 600/700 (SIL OFL) self-hosted in
  `/fonts`, declared in `styles/fonts.css`; metric-matched `*-fallback` faces (measured width ratio) in `styles.css`.
- `--nav-height`: 173px desktop (>960), 111px mobile; header sticky with `top: -38px` so the utility bar scrolls away.
- Filter chips are visual state only (as in the prototype); `#used` / `#service` section ids set by their blocks.

## QA (local harness)
- davids-model-lint: PASS (0 🔴).
- block-roundtrip: all blocks closed except equipment-cards, whose only diffs are whitespace
  differences inside the whole-card link text (spec list items / price note) — content identical.
- EW gate: 110/110 authored texts editable, 0 dead, 0 duplicated.
- 1440 + 390 renders: 0 page errors, 1 `<h1>`, header height = reservation.
