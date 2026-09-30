/**
 * locations — yellow CTA band: copy + CTA on the left, branch city pills on the right.
 * Decode tier: template-slotted (fixed composition; authored nodes are MOVED into slots).
 *
 * Authoring: one row, two cells.
 *   cell 1: eyebrow <p> (before the heading), <h2>, <p> text, <p><strong><a></a></strong></p> CTA
 *   cell 2: <ul> of branch cities (rendered as pills)
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

// eslint-disable-next-line no-bitwise
const isBefore = (a, b) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

export default async function decorate(block) {
  const heading = block.querySelector('h1, h2, h3');
  const cities = block.querySelector('ul');
  const ps = [...block.querySelectorAll('p')].filter((p) => !cities || !cities.contains(p));
  const ctas = ps.filter((p) => p.classList.contains('button-wrapper') || p.querySelector('a'));
  const eyebrow = heading ? ps.find((p) => !ctas.includes(p) && isBefore(p, heading)) : null;
  const text = ps.find((p) => !ctas.includes(p) && p !== eyebrow);

  const copy = document.createElement('div');
  copy.className = 'copy';
  if (eyebrow) copy.append(wrapNode(eyebrow, 'eyebrow'));
  if (heading) copy.append(wrapNode(heading, 'headline'));
  if (text) copy.append(wrapNode(text, 'text'));
  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.append(...ctas);
    copy.append(actions);
  }

  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  wrap.append(copy);
  if (cities) wrap.append(wrapNode(cities, 'city-grid'));
  block.replaceChildren(wrap);
}
