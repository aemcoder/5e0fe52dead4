/**
 * benefits — section head + numbered card grid ("...heals in three ways")
 *
 * Authoring rows:
 *   1. eyebrow paragraph        (head)
 *   2. <h2> section heading     (head)
 *   3..N. one row per card, each cell holding <h3> + descriptive <p>
 *
 * The ordinal number (01, 02, ...) and the accent rule are generated per card.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const headEls = [];
  const cardCells = [];

  rows.forEach((row) => {
    const cell = row.querySelector(':scope > div') || row;
    if (cell.querySelector('h3')) cardCells.push(cell);
    else headEls.push(...cell.children);
  });

  const inner = document.createElement('div');
  inner.className = 'benefits-inner';

  if (headEls.length) {
    const head = document.createElement('div');
    head.className = 'benefits-head';
    headEls.forEach((el) => {
      if (el.matches('h1, h2, h3, h4, h5, h6')) head.append(wrapNode(el, 'benefits-title'));
      else head.append(wrapNode(el, 'benefits-eyebrow'));
    });
    inner.append(head);
  }

  const grid = document.createElement('div');
  grid.className = 'benefits-grid';

  cardCells.forEach((cell, i) => {
    const card = document.createElement('div');
    card.className = 'benefits-card';

    const num = document.createElement('div');
    num.className = 'benefits-num';
    num.setAttribute('aria-hidden', 'true');
    num.textContent = String(i + 1).padStart(2, '0');
    card.append(num);

    const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) card.append(wrapNode(heading, 'benefits-card-title'));

    const rule = document.createElement('div');
    rule.className = 'benefits-rule';
    rule.setAttribute('aria-hidden', 'true');
    card.append(rule);

    [...cell.querySelectorAll('p')].forEach((p) => card.append(wrapNode(p, 'benefits-card-body')));

    grid.append(card);
  });

  inner.append(grid);
  block.replaceChildren(inner);
}
