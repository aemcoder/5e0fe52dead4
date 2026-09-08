/**
 * insight-cards — a numbered three-up grid of editorial cards.
 *
 * The section eyebrow + heading above the grid are authored as DEFAULT CONTENT
 * in the same section (D1) and styled in place via `.insight-cards-container
 * .default-content-wrapper` — the block only owns the repeating units.
 *
 * Authoring (one row per card):
 *   cell 1: <h3>card title</h3><p>card copy</p>
 *
 * The DA-flattened single-cell shape (every card's elements as flat siblings)
 * is supported too: cards are segmented on the card heading boundary (#52).
 *
 * @ew-exempt <div class="insight-num"> ordinal (01, 02, …) — derived from the
 *   card index, never authored.
 */

/**
 * Collect the authored elements from every cell of the block (#62/#71/#104).
 * @param {Element} block the block element
 * @returns {Element[]} the authored elements in document order
 */
function collectCellNodes(cell) {
  let kids = [...cell.children];
  if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
    && kids[0].querySelector('picture, img')) {
    kids = [...kids[0].childNodes].map((n) => {
      if (n.nodeType === 1) return n;
      if (n.textContent.trim()) {
        const p = document.createElement('p');
        p.append(n);
        return p;
      }
      return null;
    }).filter(Boolean);
  }
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
 * Segment the authored nodes into one group per card.
 * @param {Element} block the block element
 * @returns {Element[][]} one array of nodes per card
 */
function segment(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const headed = rows.filter((r) => r.querySelector('h2, h3, h4, h5, h6'));
  // one row per card
  if (headed.length >= 2) {
    return headed.map((row) => [...row.children].flatMap((cell) => collectCellNodes(cell)));
  }
  // flattened: all cards in one cell — segment on the card heading boundary
  const nodes = rows.flatMap((row) => [...row.children].flatMap((cell) => collectCellNodes(cell)));
  const groups = [];
  let current = null;
  nodes.forEach((node) => {
    if (node.matches('h2, h3, h4, h5, h6')) {
      current = [node];
      groups.push(current);
    } else if (current) {
      current.push(node);
    } else {
      current = [node];
      groups.push(current);
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
  const grid = document.createElement('div');
  grid.className = 'insight-grid';

  groups.forEach((nodes, i) => {
    const card = document.createElement('div');
    card.className = 'insight';

    const num = document.createElement('div');
    num.className = 'insight-num';
    num.setAttribute('aria-hidden', 'true');
    num.textContent = String(i + 1).padStart(2, '0');
    card.append(num);

    const heading = nodes.find((n) => n.matches('h2, h3, h4, h5, h6'));
    if (heading) {
      const title = document.createElement('div');
      title.className = 'insight-title';
      title.append(heading);
      card.append(title);
    }

    const rule = document.createElement('div');
    rule.className = 'insight-rule';
    rule.setAttribute('aria-hidden', 'true');
    card.append(rule);

    const rest = nodes.filter((n) => n !== heading);
    if (rest.length) {
      const copy = document.createElement('div');
      copy.className = 'insight-copy';
      rest.forEach((n) => copy.append(n));
      card.append(copy);
    }

    grid.append(card);
  });

  wrap.append(grid);
  block.replaceChildren(wrap);
}
