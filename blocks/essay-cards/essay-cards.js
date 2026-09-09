/**
 * essay-cards — the numbered "why it matters" grid.
 *
 * Authoring: one row per card, each row a single cell holding the card's
 * heading (<h3>) followed by its copy. The section eyebrow and heading are
 * authored as default content ABOVE the block (D1) and styled in place through
 * `.essay-cards-container .default-content-wrapper`.
 *
 * Decode supports both the one-row-per-card shape and the flattened
 * single-cell shape DA often delivers, by segmenting on the card heading
 * boundary (#52/#63). The oversized ordinal and the short rule are decorative,
 * generated from the card's position, and hidden from assistive tech.
 *
 * @ew-exempt <span> ordinal (01, 02, …) — derived from card order, decorative
 */

/**
 * Recovers the authored elements of one block cell. The runtime's
 * wrapTextNodes folds a media-led or unlisted-first-child cell into a single
 * <p>; this expands it again so no sibling is silently dropped (#104).
 * @param {Element} cell a block cell
 * @returns {Element[]} the authored elements of that cell
 */
function cellNodes(cell) {
  let kids = [...cell.children];
  if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
    && kids[0].querySelector('picture, img')) {
    kids = [...kids[0].childNodes].map((n) => {
      if (n.nodeType === 1) return n;
      // harness-only: a bare text node inside the wrapper <p>
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
    // harness-only: off-pipeline content with no element wrapper
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    return [p];
  }
  return [];
}

/**
 * Groups a flat run of authored nodes into one group per heading.
 * Text seen before the first heading is buffered onto the group that heading
 * opens, so an eyebrow authored above its title is never dropped (#76).
 * @param {Element[]} nodes the authored nodes
 * @returns {Element[][]} one array of nodes per card
 */
function segmentByHeading(nodes) {
  const groups = [];
  let pending = [];
  nodes.forEach((node) => {
    if (/^H[1-6]$/.test(node.tagName)) {
      groups.push([...pending, node]);
      pending = [];
    } else if (groups.length) {
      groups[groups.length - 1].push(node);
    } else {
      pending.push(node);
    }
  });
  if (pending.length) groups.push(pending);
  return groups;
}

/**
 * Splits the block into one group of authored nodes per card, tolerating both
 * the one-row-per-card shape and the flattened single-cell shape.
 * @param {Element} block the block element
 * @returns {Element[][]} one array of nodes per card
 */
function cardGroups(block) {
  const rowGroups = [...block.children]
    .map((row) => [...row.children].flatMap(cellNodes))
    .filter((nodes) => nodes.length);
  const heads = rowGroups.filter((nodes) => nodes.some((n) => /^H[1-6]$/.test(n.tagName)));
  if (heads.length >= 2) return rowGroups;
  return segmentByHeading(rowGroups.flat());
}

export default function decorate(block) {
  const groups = cardGroups(block);
  if (!groups.length) return;

  const list = document.createElement('ul');
  list.className = 'essay-cards-list';

  groups.forEach((nodes, i) => {
    const item = document.createElement('li');
    item.className = 'essay-cards-card';

    const ordinal = document.createElement('span');
    ordinal.className = 'essay-cards-ordinal';
    ordinal.setAttribute('aria-hidden', 'true');
    ordinal.textContent = String(i + 1).padStart(2, '0');
    item.append(ordinal);

    const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
    if (heading) {
      const title = document.createElement('div');
      title.className = 'essay-cards-title';
      title.append(heading);
      item.append(title);
    }

    const rule = document.createElement('span');
    rule.className = 'essay-cards-rule';
    rule.setAttribute('aria-hidden', 'true');
    item.append(rule);

    const rest = nodes.filter((n) => n !== heading && n.textContent.trim());
    if (rest.length) {
      const copy = document.createElement('div');
      copy.className = 'essay-cards-copy';
      copy.append(...rest);
      item.append(copy);
    }

    list.append(item);
  });

  block.replaceChildren(list);
}
