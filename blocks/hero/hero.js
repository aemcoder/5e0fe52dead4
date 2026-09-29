/**
 * Hero — full-bleed dark band: optional background photo under a scrim, a promo ribbon,
 * the page headline, a lede and the CTA row. Template-slotted: authored nodes are MOVED
 * into fixed slots, never rebuilt (Experience Workspace stays editable).
 *
 * Authoring (a single cell; row/cell order is forgiving):
 *   picture                         optional background photo (LCP — loaded eagerly)
 *   <p><strong>Demo Days</strong>   promo tag — a bold-only paragraph before the headline
 *   <p>… <a>Details</a></p>         promo body — prose with a plain link (whole ribbon clicks)
 *   <h1>We Keep <em>Utah</em>…      headline — italic words render in brand yellow
 *   <p>lede</p>
 *   CTAs: **link** = primary (yellow), _link_ = secondary (outline)
 */

const wrapNode = (className) => {
  const div = document.createElement('div');
  div.className = className;
  return div;
};

// read-only classification helper — decisions only, never displayed text
const text = (el) => (el ? el.textContent.trim() : '');

export default function decorate(block) {
  // 1. query + classify before moving anything
  const heading = block.querySelector('h1, h2');
  const pictures = [...block.querySelectorAll('picture')];
  const paras = [...block.querySelectorAll('p')].filter((p) => !p.querySelector('picture') || text(p));
  const ctas = paras.filter((p) => p.querySelector('a.button'));
  const before = (el) => heading
    // eslint-disable-next-line no-bitwise
    && (heading.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING);
  const promoParas = paras.filter((p) => !ctas.includes(p) && before(p));
  const ledeParas = paras.filter((p) => !ctas.includes(p) && !promoParas.includes(p));
  const tag = promoParas.find((p) => {
    const strong = p.querySelector('strong');
    return strong && !p.querySelector('a') && text(strong) === text(p);
  });

  // 2. template with empty slots
  const media = wrapNode('hero-media');
  const scrim = wrapNode('hero-scrim');
  const inner = wrapNode('hero-inner');
  const promo = wrapNode('hero-promo');
  const promoTag = wrapNode('hero-promo-tag');
  const promoBody = wrapNode('hero-promo-body');
  const headline = wrapNode('hero-headline');
  const lede = wrapNode('hero-lede');
  const actions = wrapNode('hero-actions');

  // 3. move authored nodes into the slots
  pictures.forEach((picture, i) => {
    const owner = picture.closest('p');
    media.append(picture);
    if (owner && !owner.children.length && !text(owner)) owner.remove();
    const img = picture.querySelector('img');
    if (img && i === 0) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
    }
  });
  if (tag) promoTag.append(tag);
  promoParas.filter((p) => p !== tag).forEach((p) => promoBody.append(p));
  if (heading) headline.append(heading);
  ledeParas.forEach((p) => lede.append(p));
  ctas.forEach((p) => actions.append(p));

  if (promoTag.children.length) promo.append(promoTag);
  if (promoBody.children.length) promo.append(promoBody);
  [promo, headline, lede, actions].forEach((slot) => {
    if (slot.children.length) inner.append(slot);
  });

  block.replaceChildren(...(pictures.length ? [media] : []), scrim, inner);
  block.classList.toggle('has-media', pictures.length > 0);
}
