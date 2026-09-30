/**
 * promo-hero — full-bleed dark hero with a promo ribbon, <h1>, lede and CTAs.
 * Decode tier: template-slotted (authored nodes are MOVED into fixed slots).
 *
 * Authoring (one cell, any order the runtime delivers; classified by content):
 *   - optional <picture>/<img>        → background layer behind the scrim
 *   - ribbon <p> BEFORE the heading   → <strong>tag</strong> + <a>promo text</a>
 *   - <h1>                            → headline; <em> renders the yellow highlight
 *   - first link-free <p> after <h1>  → lede
 *   - <p><strong><a></a></strong></p> → primary CTA (yellow);
 *     <p><em><a></a></em></p>         → secondary CTA (light ghost)
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default async function decorate(block) {
  const heading = block.querySelector('h1, h2, h3');
  const media = block.querySelector('picture') || block.querySelector('img');
  const ps = [...block.querySelectorAll('p')].filter((p) => !p.querySelector('picture, img'));
  const ctas = ps.filter((p) => p.classList.contains('button-wrapper') || p.querySelector('a.button'));
  const before = (el) => heading
    // eslint-disable-next-line no-bitwise
    && (el.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING);
  const ribbon = ps.find((p) => !ctas.includes(p) && before(p));
  const lede = ps.find((p) => p !== ribbon && !ctas.includes(p) && !p.querySelector('a'));

  const bg = document.createElement('div');
  bg.className = 'hero-bg';
  if (media) {
    const img = media.tagName === 'IMG' ? media : media.querySelector('img');
    if (img) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
    }
    bg.append(media);
  }

  const scrim = document.createElement('div');
  scrim.className = 'scrim';

  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  if (ribbon) wrap.append(wrapNode(ribbon, 'promo-ribbon'));
  if (heading) wrap.append(wrapNode(heading, 'headline'));
  if (lede) wrap.append(wrapNode(lede, 'lede'));
  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.append(...ctas);
    wrap.append(actions);
  }

  block.replaceChildren(bg, scrim, wrap);
}
