/**
 * anchors — section head + numbered rule-separated list ("Five anchors...")
 *
 * Authoring rows:
 *   1. eyebrow paragraph      (head)
 *   2. <h2> section heading   (head)
 *   3..N. one row per anchor, each cell holding <h4> + descriptive <p>
 *
 * The lowercase roman numeral (i., ii., ...) is generated per item.
 */

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const headEls = [];
  const itemCells = [];

  rows.forEach((row) => {
    const cell = row.querySelector(':scope > div') || row;
    if (cell.querySelector('h4, h3')) itemCells.push(cell);
    else headEls.push(...cell.children);
  });

  const inner = document.createElement('div');
  inner.className = 'anchors-inner';

  if (headEls.length) {
    const head = document.createElement('div');
    head.className = 'anchors-head';
    headEls.forEach((el) => {
      if (el.matches('h1, h2, h3, h4, h5, h6')) head.append(wrapNode(el, 'anchors-title'));
      else head.append(wrapNode(el, 'anchors-eyebrow'));
    });
    inner.append(head);
  }

  const list = document.createElement('div');
  list.className = 'anchors-list';

  itemCells.forEach((cell, i) => {
    const item = document.createElement('div');
    item.className = 'anchors-item';

    const num = document.createElement('div');
    num.className = 'anchors-num';
    num.setAttribute('aria-hidden', 'true');
    num.textContent = `${ROMAN[i] || i + 1}.`;
    item.append(num);

    const body = document.createElement('div');
    body.className = 'anchors-body';
    [...cell.children].forEach((el) => body.append(el));
    item.append(body);

    list.append(item);
  });

  inner.append(list);
  block.replaceChildren(inner);
}
