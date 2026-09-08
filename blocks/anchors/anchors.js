/**
 * anchors — numbered practice list ("Five anchors of a frugal life").
 *
 * The section eyebrow + heading are authored as DEFAULT CONTENT above the block
 * (styled via .anchors-container). This block holds only the list items.
 *
 * Authoring: one row per item, each cell:
 *   1. <h4> title
 *   2. <p>  description
 * The lowercase roman numeral is generated (decorative), not authored.
 */
const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];

function segment(block) {
  const rows = [...block.children];
  const withHeading = rows.filter((r) => r.querySelector('h2, h3, h4, h5'));
  if (withHeading.length >= 2) {
    return rows.map((r) => [...(r.firstElementChild ? r.firstElementChild.children : r.children)]);
  }
  const cell = rows[0] && rows[0].firstElementChild ? rows[0].firstElementChild : rows[0];
  const nodes = cell ? [...cell.children] : [];
  const groups = [];
  let cur = null;
  nodes.forEach((n) => {
    if (n.matches('h2, h3, h4, h5')) {
      cur = [n];
      groups.push(cur);
    } else if (cur) {
      cur.push(n);
    }
  });
  return groups;
}

export default async function decorate(block) {
  const items = segment(block);

  const list = document.createElement('div');
  list.className = 'anchors-list';

  items.forEach((nodes, i) => {
    if (!nodes.length) return;
    const item = document.createElement('div');
    item.className = 'anchor-item';

    const num = document.createElement('span');
    num.className = 'anchor-num';
    num.setAttribute('aria-hidden', 'true');
    num.textContent = `${ROMAN[i] || i + 1}.`;
    item.append(num);

    const content = document.createElement('div');
    content.className = 'anchor-content';
    content.append(...nodes);
    item.append(content);

    list.append(item);
  });

  block.replaceChildren(list);
}
