/**
 * anchor-list — a numbered rule-separated list of practices.
 *
 * The section eyebrow + heading above the list are authored as DEFAULT CONTENT
 * in the same section (D1) and styled in place via `.anchor-list-container
 * .default-content-wrapper`.
 *
 * Authoring (one row per anchor):
 *   cell 1: <h4>anchor title</h4><p>anchor copy</p>
 *
 * The DA-flattened single-cell shape is supported: items are segmented on the
 * item heading boundary (#52).
 *
 * @ew-exempt <span class="anchor-numeral"> roman numeral (i., ii., …) — derived
 *   from the item index, never authored.
 */

const NUMERALS = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];

/**
 * Collect the authored elements of one cell (#62/#71/#104).
 * @param {Element} cell the block cell
 * @returns {Element[]} the authored elements
 */
function collectCellNodes(cell) {
  const kids = [...cell.children];
  if (kids.length) return kids;
  if (cell.textContent.trim()) {
    // harness-only fallback (EW5)
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    return [p];
  }
  return [];
}

/**
 * Segment the authored nodes into one group per anchor.
 * @param {Element} block the block element
 * @returns {Element[][]} one array of nodes per anchor
 */
function segment(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const headed = rows.filter((r) => r.querySelector('h2, h3, h4, h5, h6'));
  if (headed.length >= 2) {
    return headed.map((row) => [...row.children].flatMap((cell) => collectCellNodes(cell)));
  }
  const nodes = rows.flatMap((row) => [...row.children].flatMap((cell) => collectCellNodes(cell)));
  const groups = [];
  let current = null;
  nodes.forEach((node) => {
    if (node.matches('h2, h3, h4, h5, h6') || !current) {
      current = [node];
      groups.push(current);
    } else {
      current.push(node);
    }
  });
  return groups;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const groups = segment(block).filter((g) => g.length);
  if (!groups.length) return;

  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  groups.forEach((nodes, i) => {
    const item = document.createElement('div');
    item.className = 'anchor';

    const numeral = document.createElement('span');
    numeral.className = 'anchor-numeral';
    numeral.setAttribute('aria-hidden', 'true');
    numeral.textContent = `${NUMERALS[i] || i + 1}.`;
    item.append(numeral);

    const body = document.createElement('div');
    body.className = 'anchor-body';
    nodes.forEach((n) => body.append(n));
    item.append(body);

    wrap.append(item);
  });

  block.replaceChildren(wrap);
}
