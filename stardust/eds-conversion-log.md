# EDS Conversion Log — Simply Enough

Source prototype: `prototype/index.html` — a single-page long-form essay,
"The Quiet Power of Enough" (an `<x-dc>` document-content export, everything
inline-styled). One page → `content/index.html`.

## Runtime contract
- Vanilla aem-boilerplate. `buttonization: formatted-only` (`<strong>`/`<em>`),
  `blockWrapperClass: block`. Sections are full-bleed bands: `main > .section`
  and its wrapper are set to zero padding / no max-width in `styles.css`; every
  block owns its own padding + inner max-width container (#13).
- Chrome is OVERLAY (#108): the prototype header is `position: fixed` over a
  full-viewport dark hero. `--nav-height: 0`; the header block positions its bar
  `fixed`, so the late chrome load shifts nothing.

## Blocks (one per distinct prototype section)
| Block | Prototype section | Notes |
|---|---|---|
| `hero` | dark cinematic opener | eyebrow + h1 (`<em>` accent) + lede; CSS rings + divider. Overwrote the boilerplate demo hero. |
| `intro` | narrow essay opening | serif lead paragraph + sans body paragraphs |
| `feature-image` | full-bleed image band | used twice: plain + `caption` variant (dark scrim + overlaid line) |
| `quote` | green pull-quote band | `<blockquote>` + attribution; CSS quote mark |
| `benefits` | "heals in three ways" | section head (eyebrow + h2) + 3 numbered cards; ordinal generated |
| `split` | "not deprivation" | 2-col prose + image, offset deco square |
| `anchors` | "Five anchors" | section head + 5 numbered (roman) rule-separated items |
| `closing` | dark coda | dot-in-ring emblem + h2 (`<em>` accent) + body + divider |

Chrome: `blocks/header` (fixed dark brand bar, inline SVG emblem) fetches
`/3e8f0204832a/nav`; `blocks/footer` fetches `/3e8f0204832a/footer`. Fragment
documents authored at `fragments/header.html` (brand = plain `<a>`) and
`fragments/footer.html`.

## Fonts (self-hosted, `fonts/`)
- Cormorant Garamond (display serif) — static weights 300/400/500/600 + italic
  400/600 → `styles/fonts.css`. Metric fallback `cormorant-fallback`
  (`local("Times New Roman")`) in `styles.css`.
- DM Sans (body sans) — variable normal + italic. Metric fallback
  `dm-sans-fallback` (`local("Arial")`). Both OFL — self-hostable, no licensing
  alert needed.

## Images
- Per task instruction (overrides the skill's DA-media rule): the 3 prototype
  blobs were copied to `images/` keeping their hash filenames and are referenced
  root-relative as `/images/<hash>.jpg` in content. The davids-model-lint's D4
  🔴 on these is EXPECTED and deliberate — the calling service handles upstream
  image delivery.

## David's Model notes
- `davids-model-lint` 🟡 D1 on `hero`/`intro`/`feature-image`/`closing`: these
  are genuine BESPOKE compositions (cinematic dark hero, dual-typeface prose,
  full-bleed scrimmed image band, centered coda emblem) requiring per-block CSS,
  not plain default content — justified.
- `benefits`/`anchors` author their section head (eyebrow + heading) as leading
  block rows the block reabsorbs; ordinals are generated, not authored.
- Decode hardened for `wrapTextNodes` folding: `quote` (blockquote is not a
  valid wrapper) and `feature-image` caption select the non-media paragraph.

## Deferred / not done (per task scope)
- No DA deploy, no commit, no push — conversion + content generation only.
