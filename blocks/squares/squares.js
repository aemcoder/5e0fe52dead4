/**
 * squares — a short note (eyebrow, heading, paragraph) beside a 4×3 grid of
 * squares that spin and grow into place, driven purely by CSS
 * `animation-timeline: view()` (no script runs for the motion; unsupported
 * browsers show the squares at rest).
 *
 * Authoring: one cell — <p>eyebrow</p>, <h3>heading</h3>, <p>body</p>.
 * The twelve squares are decorative and generated.
 */

// accent (a) / ink (b) pattern of the twelve squares, row by row
const PATTERN = 'abab' + 'baba' + 'abab';

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default function decorate(block) {
  const heading = block.querySelector('h2, h3, h4');
  const ps = [...block.querySelectorAll('p')];
  const before = (p) => p.compareDocumentPosition(heading) === Node.DOCUMENT_POSITION_FOLLOWING;
  const eyebrow = heading ? ps.find(before) : null;
  const body = ps.filter((p) => p !== eyebrow);

  const copy = document.createElement('div');
  copy.className = 'squares-copy';
  if (eyebrow) copy.append(wrapNode(eyebrow, 'squares-eyebrow'));
  if (heading) copy.append(wrapNode(heading, 'squares-heading'));
  if (body.length) {
    const b = document.createElement('div');
    b.className = 'squares-body';
    b.append(...body);
    copy.append(b);
  }

  const grid = document.createElement('div');
  grid.className = 'squares-grid';
  grid.setAttribute('aria-hidden', 'true');
  [...PATTERN].forEach((k) => {
    const sq = document.createElement('div');
    sq.className = `sq sq-${k}`;
    grid.append(sq);
  });
  block.replaceChildren(copy, grid);
}
