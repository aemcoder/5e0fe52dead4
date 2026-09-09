/**
 * benefits — a responsive grid of numbered benefit cards ("Frugality heals in
 * three ways"). The section eyebrow + heading above the grid are authored as
 * DEFAULT CONTENT in the same section (styled in place, see benefits.css).
 *
 * Authoring — one row per card, each cell holding:
 *   <h3>card title</h3>
 *   <p>card description</p>
 *
 * Falls back to segmenting a single flattened cell on its <h3> boundaries.
 * The large ordinal (01, 02, …) is generated per card (decorative, aria-hidden).
 * Authored headings/paragraphs are MOVED (never rebuilt).
 */

function buildCard(elements, index) {
  const card = document.createElement('div');
  card.className = 'benefits-card';

  const num = document.createElement('span');
  num.className = 'benefits-num';
  num.setAttribute('aria-hidden', 'true');
  num.textContent = String(index + 1).padStart(2, '0');
  card.append(num);

  const heading = elements.find((el) => /^H[1-6]$/.test(el.tagName));
  if (heading) card.append(heading);

  const rule = document.createElement('span');
  rule.className = 'benefits-rule';
  rule.setAttribute('aria-hidden', 'true');
  card.append(rule);

  elements.filter((el) => el.tagName === 'P').forEach((p) => card.append(p));
  return card;
}

export default async function decorate(block) {
  const rows = [...block.children];
  let groups = [];

  const cellsWithHeading = rows
    .map((row) => row.querySelector(':scope > div'))
    .filter((cell) => cell && cell.querySelector('h1,h2,h3,h4,h5,h6'));

  if (cellsWithHeading.length > 1) {
    groups = cellsWithHeading.map((cell) => [...cell.children]);
  } else {
    // flattened single cell — segment on heading boundaries
    const cell = block.querySelector(':scope > div > div') || block;
    let current = null;
    [...cell.children].forEach((el) => {
      if (/^H[1-6]$/.test(el.tagName)) {
        current = [];
        groups.push(current);
      }
      if (current) current.push(el);
    });
  }

  const grid = document.createElement('div');
  grid.className = 'benefits-grid';
  groups.forEach((els, i) => grid.append(buildCard(els, i)));
  block.replaceChildren(grid);
}
