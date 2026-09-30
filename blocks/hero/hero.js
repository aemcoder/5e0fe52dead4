/**
 * hero — full-bleed dark lead band: optional background image, promo ribbon,
 * the page <h1>, a lede and CTAs. Template-slotted: authored nodes are MOVED
 * into fixed slots (Experience Workspace safe).
 *
 * Authoring (one cell, or one element per row — order-tolerant):
 *   - optional <picture>/<img>            → background layer (LCP, eager)
 *   - <p><strong>Tag</strong> <a><strong>Date</strong> text <em>Details</em></a></p>
 *     before the heading → promo ribbon
 *   - <h1> (accent word in <em>)          → headline
 *   - <p> after the heading, no link      → lede
 *   - <p><strong><a>…</a></strong></p> / <p><em><a>…</a></em></p> → CTAs
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default function decorate(block) {
  const heading = block.querySelector('h1, h2');
  const media = block.querySelector('picture') || block.querySelector('img');
  const paras = [...block.querySelectorAll('p')].filter((p) => !p.querySelector('picture, img'));

  const before = [];
  const lede = [];
  const ctas = [];
  paras.forEach((p) => {
    // eslint-disable-next-line no-bitwise
    const isBefore = heading && (p.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING);
    if (isBefore) before.push(p);
    else if (p.classList.contains('button-wrapper') || p.querySelector(':scope > :is(strong, em) > a, :scope > em > strong > a, :scope > a.button')) ctas.push(p);
    else lede.push(p);
  });

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
  if (before.length) {
    const ribbon = document.createElement('div');
    ribbon.className = 'promo-ribbon';
    ribbon.append(...before);
    wrap.append(ribbon);
  }
  if (heading) wrap.append(wrapNode(heading, 'headline'));
  if (lede.length) {
    const l = document.createElement('div');
    l.className = 'lede';
    l.append(...lede);
    wrap.append(l);
  }
  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.append(...ctas);
    wrap.append(actions);
  }

  block.replaceChildren(bg, scrim, wrap);
}
