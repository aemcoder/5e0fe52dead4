/**
 * squares — a text column beside twelve squares that spin and grow into place
 * with CSS scroll-driven animation (`animation-timeline: view()`); no script
 * drives them. Browsers without support show them at rest.
 *
 * Authoring: one cell — eyebrow <p>, <h3> title, body <p> (inline <code> allowed).
 */

/* accent / ink rhythm of the twelve squares (decorative) */
const PATTERN = [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0];

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  if (node) w.append(node);
  return w;
}

export default async function decorate(block) {
  const heading = block.querySelector('h1, h2, h3, h4');
  const paras = [...block.querySelectorAll('p')];
  const eyebrow = heading
    // eslint-disable-next-line no-bitwise
    ? paras.find((p) => heading.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_PRECEDING)
    : null;
  const body = paras.filter((p) => p !== eyebrow);

  const text = wrapNode(null, 'squares-text');
  if (eyebrow) text.append(wrapNode(eyebrow, 'eyebrow'));
  if (heading) text.append(wrapNode(heading, 'headline'));
  if (body.length) {
    const b = wrapNode(null, 'body');
    b.append(...body);
    text.append(b);
  }

  const figure = wrapNode(null, 'squares-figure');
  figure.setAttribute('aria-hidden', 'true');
  PATTERN.forEach((accent, i) => {
    const sq = document.createElement('span');
    sq.className = accent ? 'sq accent' : 'sq';
    sq.style.setProperty('--range-end', `${30 + i * 3}%`);
    figure.append(sq);
  });

  const grid = wrapNode(null, 'squares-grid');
  grid.append(text, figure);
  block.replaceChildren(grid);
}
