/**
 * anchor-list — the numbered practice list ("Five anchors of a frugal life").
 *
 * Authoring: one row per anchor, each cell holding
 *   <h3>Anchor title</h3>
 *   <p>Anchor description…</p>
 *
 * The section eyebrow and heading are authored as default content ABOVE the
 * block, not as block rows.
 *
 * @ew-exempt .anchor-index — the roman numerals are derived from position,
 *   never authored.
 */

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];

const isHeading = (node) => node.matches && node.matches('h1, h2, h3, h4, h5, h6');

/**
 * Collect authored elements from the block, cell by cell, recovering the
 * shapes the runtime's wrapTextNodes() and DA's flattening produce.
 * @param {Element} block the block element
 * @returns {Element[]} authored elements in document order
 */
function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length) {
      out.push(...kids);
    } else if (cell.textContent.trim()) {
      // harness-only: DA always delivers a <p> in every cell
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out;
}

/**
 * Group the authored nodes into one bundle per anchor — by row when the rows
 * carry the headings, otherwise by segmenting a flattened cell on the heading.
 * @param {Element} block the block element
 * @returns {Element[][]} one array of nodes per anchor
 */
function groupItems(block) {
  const rowsWithHeading = [...block.children]
    .filter((row) => row.querySelector('h1, h2, h3, h4, h5, h6'));
  if (rowsWithHeading.length >= 2) {
    return rowsWithHeading.map((row) => {
      const nodes = [];
      [...row.children].forEach((cell) => nodes.push(...cell.children));
      return nodes;
    });
  }

  const groups = [];
  collectNodes(block).forEach((node) => {
    if (isHeading(node) || !groups.length) groups.push([]);
    groups[groups.length - 1].push(node);
  });
  return groups.filter((group) => group.length);
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const items = groupItems(block).map((nodes, index) => {
    const item = document.createElement('div');
    item.className = 'anchor';

    const number = document.createElement('span');
    number.className = 'anchor-index';
    number.setAttribute('aria-hidden', 'true');
    number.textContent = `${ROMAN[index] || index + 1}.`;
    item.append(number);

    const content = document.createElement('div');
    content.className = 'anchor-content';

    const heading = nodes.find(isHeading);
    if (heading) {
      const wrapper = document.createElement('div');
      wrapper.className = 'anchor-title';
      wrapper.append(heading);
      content.append(wrapper);
    }

    const body = document.createElement('div');
    body.className = 'anchor-body';
    nodes.filter((n) => n !== heading && n.textContent.trim()).forEach((n) => body.append(n));
    if (body.childElementCount) content.append(body);

    item.append(content);
    return item;
  });

  block.replaceChildren(...items);
}
