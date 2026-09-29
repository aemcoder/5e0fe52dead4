/**
 * Locations — yellow band: branch-finder copy + dark CTA on one side, a chip cloud of
 * branch cities on the other. Template-slotted.
 *
 * Authoring, one row with two cells:
 *   cell 1  <p>eyebrow</p> <h2>heading</h2> <p>body</p> CTA (_**link**_ = dark button)
 *   cell 2  <ul> of branch cities (each item may be a link)
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  if (node) w.append(node);
  return w;
}

export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const copyCell = cells.find((c) => c.querySelector('h1, h2, h3')) || cells[0];
  const listCell = cells.find((c) => c !== copyCell && c.querySelector('ul, ol'));

  const kids = copyCell ? [...copyCell.children] : [];
  const heading = kids.find((el) => /^H[1-6]$/.test(el.tagName));
  const ctas = kids.filter((el) => el.tagName === 'P' && el.querySelector('a.button'));
  const eyebrow = heading ? kids.find((el) => el.tagName === 'P' && kids.indexOf(el) < kids.indexOf(heading)) : null;
  const body = kids.filter((el) => ![heading, eyebrow, ...ctas].includes(el));

  const copy = wrapNode(null, 'locations-copy');
  if (eyebrow) copy.append(wrapNode(eyebrow, 'locations-eyebrow'));
  if (heading) copy.append(wrapNode(heading, 'locations-title'));
  if (body.length) {
    const b = wrapNode(null, 'locations-body');
    b.append(...body);
    copy.append(b);
  }
  if (ctas.length) {
    const actions = wrapNode(null, 'locations-actions');
    actions.append(...ctas);
    copy.append(actions);
  }

  const inner = wrapNode(copy, 'locations-inner');
  if (listCell) {
    const cities = wrapNode(null, 'locations-cities');
    cities.append(...listCell.childNodes);
    inner.append(cities);
  }

  block.replaceChildren(inner);
}
