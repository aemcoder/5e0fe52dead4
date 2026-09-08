/**
 * reasons — a grid of numbered prose cards ("Frugality heals in three ways").
 *
 * Authoring: one row per reason, each cell holding
 *   <h3>Card title</h3>
 *   <p>Card body copy…</p>
 *
 * The section eyebrow and heading are authored as default content ABOVE the
 * block, not as block rows.
 *
 * @ew-exempt .reason-index — the 01/02/03 numerals are derived from position,
 *   never authored.
 */

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

const isHeading = (node) => node.matches && node.matches('h1, h2, h3, h4, h5, h6');

/**
 * Group the authored nodes into one bundle per card. Prefers the authored row
 * structure; falls back to segmenting a DA-flattened single cell on the
 * per-card heading boundary.
 * @param {Element} block the block element
 * @returns {Element[][]} one array of nodes per card
 */
function groupCards(block) {
  const rows = [...block.children];
  const rowsWithHeading = rows.filter((row) => row.querySelector('h1, h2, h3, h4, h5, h6'));
  if (rowsWithHeading.length >= 2) {
    return rowsWithHeading.map((row) => {
      const nodes = [];
      [...row.children].forEach((cell) => {
        const kids = [...cell.children];
        if (kids.length) nodes.push(...kids);
      });
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
  const cards = groupCards(block).map((nodes, index) => {
    const card = document.createElement('div');
    card.className = 'reason';

    const number = document.createElement('div');
    number.className = 'reason-index';
    number.setAttribute('aria-hidden', 'true');
    number.textContent = String(index + 1).padStart(2, '0');
    card.append(number);

    const heading = nodes.find(isHeading);
    if (heading) {
      const wrapper = document.createElement('div');
      wrapper.className = 'reason-title';
      wrapper.append(heading);
      card.append(wrapper);
    }

    const rule = document.createElement('div');
    rule.className = 'reason-rule';
    rule.setAttribute('aria-hidden', 'true');
    card.append(rule);

    const body = document.createElement('div');
    body.className = 'reason-body';
    nodes.filter((n) => n !== heading && n.textContent.trim()).forEach((n) => body.append(n));
    if (body.childElementCount) card.append(body);

    return card;
  });

  block.replaceChildren(...cards);
}
