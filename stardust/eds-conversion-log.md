# EDS conversion log — Wheeler (prototype/index.html)

Runtime: vanilla aem-boilerplate (`a.button.primary|secondary|accent` in `p.button-wrapper`, formatted-only buttonization). `scripts/aem.js` untouched.

## Outputs
- `content/index.html` — home page body fragment (metadata: nav `/5b113bcd9b48/nav`, footer `/5b113bcd9b48/footer`)
- `fragments/header.html`, `fragments/footer.html` — chrome fragments (brand link is a plain `<a>`)
- Prototype has no image blobs (`<image-slot>` only): image cells left empty, CSS paints fallbacks.

## Blocks
| Block | Tier | Notes |
|---|---|---|
| header / footer | chrome | classify fragment sections by content; mobile drawer is an inert dialog |
| hero | bespoke | full-bleed composition with promo strip, scrim, media slot — kept as a block (D1 lint 🟡 justified: promo strip + media layering are not expressible as default content) |
| quick-links | repeating | card-as-link tiles; `:icon:` token paragraph is `@ew-exempt` metadata |
| cards (`equipment`, `offers`) | repeating + variants | reabsorbs section head; equipment chips filter cards (real behaviour) |
| stats | bespoke | reabsorbs intro heading as first grid item |
| service | bespoke | copy + two photo slots + figure badge |
| brands | repeating | wordmark/logo tiles; section head is default content |
| locations | bespoke | copy + city chip cloud on yellow band |

## Deviations from the prototype
- Dark-button arrow: prototype paints it black-on-ink (invisible); rendered in `currentcolor`.
- Locations CTA leads with a pin icon instead of the trailing arrow.
- Used-inventory chips filter the cards (prototype chips were visual only).
- Favourite button is a sibling of the card link (no nested interactive elements).
- Footer grid collapses responsively (1 → 2 → 4 columns).

## QA (local headless render, 1440 & 390)
0 page errors, one `h1`, all blocks `loaded`, every grid computes `display: grid`, no broken images; drawer open/close + Escape and chip filtering verified. David's Model lint: 0 🔴.
