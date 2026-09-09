/**
 * anchors — a numbered list of practice items ("Five anchors of a frugal life").
 * The section eyebrow + heading above the list are authored as DEFAULT CONTENT
 * in the same section (styled in place, see anchors.css).
 *
 * Authoring — one row per anchor, each cell holding:
 *   <h4>anchor title</h4>
 *   <p>anchor description</p>
 *
 * Falls back to segmenting a single flattened cell on its heading boundaries.
 * The lowercase-roman ordinal (i, ii, …) is generated per item (decorative).
 * Authored headings/paragraphs are MOVED (never rebuilt).
 */

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];

function buildItem(elements, index) {
  const item = document.createElement('div');
  item.className = 'anchors-item';

  const num = document.createElement('span');
  num.className = 'anchors-num';
  num.setAttribute('aria-hidden', 'true');
  num.textContent = `${ROMAN[index] || index + 1}.`;
  item.append(num);

  const body = document.createElement('div');
  body.className = 'anchors-body';
  elements.forEach((el) => body.append(el));
  item.append(body);
  return item;
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

  const list = document.createElement('div');
  list.className = 'anchors-list';
  groups.forEach((els, i) => list.append(buildItem(els, i)));
  block.replaceChildren(list);
}
