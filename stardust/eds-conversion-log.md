# EDS conversion log — "The Quiet Power of Enough" (Simply Enough)

Source: `prototype/index.html` (claude-design `<x-dc>` page, inline styles). Single page.

## Section triage (D1 / D11)

| # | Prototype section | EDS shape | Notes |
|---|---|---|---|
| — | fixed header (logo, brand, tagline) | `fragments/header.html` + `blocks/header` | overlay chrome: fixed bar over the hero, `--nav-height: 0` |
| 1 | dark hero (rings, eyebrow, h1, rule, lede) | block `hero` (template-slotted) | bespoke cinematic composition; rings/rule are decorative DOM |
| 2 | intro essay paragraphs | default content, style `intro` | first paragraph styled as the serif lead |
| 3 | misty forest image band | default content, style `photo` | editorial image, authored `<img>` |
| 4 | Epictetus quote | block `quote` (Block Collection model) | rows: quotation, attribution |
| 5 | "Why it matters" 3 numbered points | section head default content + `cards steps` | 01/02/03 are CSS counters |
| 6 | "The misconception" text + image | block `columns` | sand band, decorative offset square in CSS |
| 7 | "In practice" five anchors | section head default content + `cards anchors` | same pattern as #5 → one block + variant; i./ii. via CSS counters; prototype `<h4>` canonicalised to `<h3>` |
| 8 | mountain lake band + caption | default content, style `photo-caption` | |
| 9 | closing manifesto | default content, style `closing` | ring+dot ornament and rule drawn with pseudo-elements |
| — | footer "Less, but better." | `fragments/footer.html` + `blocks/footer` | |

## Decisions

- Fonts: Cormorant Garamond + DM Sans (both SIL OFL) self-hosted as latin variable woff2 lifted from the
  prototype; metric-matched `cormorant-garamond-fallback` / `dm-sans-fallback` faces computed from the
  measured rendered width ratio.
- Images: prototype AVIFs converted to JPEG under `/images/` (required output convention). `davids-model-lint`
  flags these as D4 (not fully qualified) — the calling service handles hosting.
- `scripts/scripts.js` gained `applySectionMetadata()` (fallback only — no-op when delivery already renders
  section-metadata `style` server-side).
- Lint 🟡 D1 advisories for `hero`/`quote`/`cards` are deliberate: bespoke composition, Collection quote model,
  and repeating units respectively.
- Hero load animations kept (CSS keyframes, `prefers-reduced-motion: no-preference` only).
- Known edit-mode drift: eyebrows (`p:has(+ h2)`) and the intro lead (`p:first-of-type`) are positional
  selectors on default content.
