# EDS conversion log — Wheeler (home page)

Source: `prototype/index.html` (single page, claude-design prototype, `<image-slot>` placeholders, no real images).

## Outputs
- `content/index.html` — home page (metadata: nav `/46caf247ea4f/nav`, footer `/46caf247ea4f/footer`)
- `fragments/header.html` — nav document (sections: brand / links / tools / utility)
- `fragments/footer.html` — footer document (sections: brand / 3 link columns / legal)

## Section → block decisions (locked)
| Prototype section | EDS | Tier | Notes |
|---|---|---|---|
| `header.site` + `.utility` + `#mnav` | `header` block | template-slotted | sticky host (`top: -38px` so the utility bar scrolls away), mobile slide-in panel wired in block JS |
| `section.hero` | `hero` block | template-slotted | ribbon = `<p><strong>tag</strong> <a><strong>date</strong> … <em>Details</em></a></p>`; empty image → dark bg; first img set eager/high |
| `section.quick` | `quick-links` block | reconstructive | one row per shortcut; icons via EDS `:name:` syntax (`/icons/*.svg`), tinted with CSS mask |
| `section.used` | default-content head + `cards (equipment)` + trailing accent CTA | reconstructive | head `<ul>` = filter chips (wired by the cards block, text match) |
| `section.stats` | default-content intro + `stats` block | reconstructive | intro reabsorbed into the grid (EW8 move) |
| `section.service` | `service` block | template-slotted | 2 optional photos + yellow figure badge |
| `section.offers` | default-content head + `cards (offers)` | reconstructive | same block as used equipment, variant CSS |
| `section.brands` | default-content head + `brands` block | reconstructive | text wordmarks or logo pictures |
| `section.locations` | DEFAULT CONTENT, section style `yellow` | — | D1: prose + simple list, no block |
| `footer` | `footer` block | template-slotted | social icons chosen from link host |

Replaced the demo `hero`, `cards`, `header`, `footer` blocks. `columns` and `welcome-*` untouched.

## Button convention
primary `<strong><a>` = yellow + arrow; secondary `<em><a>` = outline (light on the hero); accent `<em><strong><a>` = dark + arrow (Browse Full Inventory, Find Your Nearest Branch).

## Fonts
Barlow 400/500/600/700, Barlow Condensed 700, Barlow Semi Condensed 600/700 — SIL OFL, self-hosted in `fonts/`, declared in `styles/fonts.css`.
Metric-matched fallbacks in `styles/styles.css` computed from glyph advance widths vs Liberation Sans / Sans Narrow (condensed faces fall back to Arial Narrow first).

## Gates
- davids-model-lint: 0 🔴 (🟡 hero / offers-cards "prose-only" — justified: bespoke hero composition, and offers are a repeating card unit sharing the cards block).
- block-roundtrip (+EW): hero, quick-links, stats, service, brands closed; EW editable 100 %, 0 dead, 0 duplicated.
  `cards` reports MISSING CTA / EXTRA pairs whose texts are identical except for whitespace between the card's
  block children (prototype whole-card anchor textContent vs EDS) — classifier false positive, verified by eye.
- Interaction checks: mobile menu open/escape, chip filtering, save toggle, sticky header.

## Notes for the next person
- `aem.js` in this repo does NOT decorate section-metadata client-side — the `yellow` style relies on the server-side rendering (section class). Local harnesses must simulate it.
- Images are empty `<image-slot>`s in the prototype; every image slot is an optional authored `<picture>` with a CSS fallback.
