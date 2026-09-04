/**
 * hero — dark cinematic essay opener (Simply Enough)
 *
 * Authoring (default content in one cell):
 *   1. eyebrow paragraph — short kicker above the title
 *   2. <h1> — the page's single headline (use <em> for the accent word)
 *   3. lede paragraph — the italic sub-line below the title
 *
 * The decorative rings are drawn in CSS; a thin divider is inserted between the
 * headline and the lede.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default async function decorate(block) {
  const heading = block.querySelector('h1, h2');
  const paragraphs = [...block.querySelectorAll('p')];
  const eyebrow = paragraphs.find((p) => heading
    // eslint-disable-next-line no-bitwise
    && (heading.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_PRECEDING));
  const lede = paragraphs.find((p) => heading
    // eslint-disable-next-line no-bitwise
    && (heading.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING));

  const inner = document.createElement('div');
  inner.className = 'hero-inner';

  if (eyebrow) inner.append(wrapNode(eyebrow, 'hero-eyebrow'));
  if (heading) inner.append(wrapNode(heading, 'hero-headline'));

  const divider = document.createElement('div');
  divider.className = 'hero-divider';
  divider.setAttribute('aria-hidden', 'true');
  inner.append(divider);

  if (lede) inner.append(wrapNode(lede, 'hero-lede'));

  const rings = document.createElement('div');
  rings.className = 'hero-rings';
  rings.setAttribute('aria-hidden', 'true');
  rings.innerHTML = '<span></span><span></span><span></span>';

  block.replaceChildren(rings, inner);
}
