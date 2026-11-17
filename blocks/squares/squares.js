/**
 * squares — text column beside twelve decorative squares animated purely
 * by CSS scroll-driven animation (animation-timeline: view()).
 *
 * Authoring rows:
 *   1. one cell: <p> eyebrow, <h3> title, <p> description (may hold <code>)
 */

const PATTERN = 'atattataatat'; // a = accent, t = ink

function wrap(className, ...nodes) {
  const el = document.createElement('div');
  el.className = className;
  el.append(...nodes);
  return el;
}

export default async function decorate(block) {
  const heading = block.querySelector('h1, h2, h3, h4');
  const ps = [...block.querySelectorAll('p')];
  // eslint-disable-next-line no-bitwise
  const isBefore = (p) => heading && (p.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING);
  const text = wrap('squares-text');
  const eyebrows = ps.filter(isBefore);
  const body = ps.filter((p) => !isBefore(p));
  if (eyebrows.length) text.append(wrap('squares-eyebrow', ...eyebrows));
  if (heading) text.append(wrap('squares-title', heading));
  if (body.length) text.append(wrap('squares-body', ...body));

  const grid = wrap('squares-grid');
  grid.setAttribute('aria-hidden', 'true');
  [...PATTERN].forEach((k, i) => {
    const sq = document.createElement('span');
    sq.className = `squares-cell ${k === 'a' ? 'is-accent' : 'is-ink'}`;
    sq.style.setProperty('--range-end', `${30 + i * 3}%`);
    grid.append(sq);
  });

  block.replaceChildren(wrap('squares-layout', text, grid));
}
