/**
 * Locations — yellow CTA band: copy + branch finder button on the left, a
 * cloud of city chips on the right.
 *
 * Authoring: one row, two cells.
 *   | <p>Eyebrow</p> <h2>Heading</h2> <p>Body</p>
 *     <p><em><strong><a>Find Your Nearest Branch</a></strong></em></p>
 *   | <ul><li>Salt Lake City</li>…</ul> |
 */

function div(className, ...children) {
  const d = document.createElement('div');
  d.className = className;
  d.append(...children);
  return d;
}

function cellNodes(cell) {
  if (cell.children.length) return [...cell.children];
  if (cell.textContent.trim()) {
    // HARNESS-ONLY fallback: wrap existing text nodes, never synthesize.
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    return [p];
  }
  return [];
}

export default function decorate(block) {
  const nodes = [...block.querySelectorAll(':scope > div > div')].flatMap(cellNodes);
  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const hIndex = heading ? nodes.indexOf(heading) : -1;

  const copy = div('copy');
  const cities = div('city-grid');
  const ctas = [];

  nodes.forEach((n, i) => {
    if (n === heading) copy.append(div('headline', n));
    else if (n.tagName === 'UL' || n.tagName === 'OL') cities.append(n);
    else if (n.classList.contains('button-wrapper')) ctas.push(n);
    else if (hIndex > -1 && i < hIndex) copy.append(div('eyebrow', n));
    else copy.append(div('text', n));
  });
  if (ctas.length) copy.append(div('actions', ...ctas));

  const wrap = div('wrap', copy);
  if (cities.children.length) wrap.append(cities);
  block.replaceChildren(wrap);
}
