/**
 * essay-anchors — the ruled list of practices ("five anchors of a frugal life").
 *
 * Authoring: one row per anchor, each row a single cell holding the anchor's
 * heading (<h3>) followed by its explanation. The section eyebrow and heading
 * are authored as default content ABOVE the block (D1) and styled in place
 * through `.essay-anchors-container .default-content-wrapper`.
 *
 * Decode segments on the heading boundary so both the one-row-per-anchor shape
 * and the flattened single-cell shape work (#52/#63). The roman numeral is
 * decorative, derived from position, and hidden from assistive tech.
 *
 * @ew-exempt <span> roman numeral (i., ii., …) — derived from list order
 */

/**
 * Recovers the authored elements of one block cell, expanding the single <p>
 * the runtime's wrapTextNodes folds a media-led cell into (#104).
 * @param {Element} cell a block cell
 * @returns {Element[]} the authored elements of that cell
 */
function cellNodes(cell) {
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
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    return [p];
  }
  return [];
}

/**
 * Groups a flat run of authored nodes into one group per heading.
 * @param {Element[]} nodes the authored nodes
 * @returns {Element[][]} one array of nodes per anchor
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

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];

export default function decorate(block) {
  const rowGroups = [...block.children]
    .map((row) => [...row.children].flatMap(cellNodes))
    .filter((nodes) => nodes.length);
  const heads = rowGroups.filter((nodes) => nodes.some((n) => /^H[1-6]$/.test(n.tagName)));
  const groups = heads.length >= 2 ? rowGroups : segmentByHeading(rowGroups.flat());
  if (!groups.length) return;

  const list = document.createElement('ol');
  list.className = 'essay-anchors-list';

  groups.forEach((nodes, i) => {
    const item = document.createElement('li');
    item.className = 'essay-anchors-item';

    const marker = document.createElement('span');
    marker.className = 'essay-anchors-marker';
    marker.setAttribute('aria-hidden', 'true');
    marker.textContent = `${ROMAN[i] || i + 1}.`;
    item.append(marker);

    const body = document.createElement('div');
    body.className = 'essay-anchors-body';

    const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
    if (heading) {
      const title = document.createElement('div');
      title.className = 'essay-anchors-title';
      title.append(heading);
      body.append(title);
    }

    const rest = nodes.filter((n) => n !== heading && n.textContent.trim());
    if (rest.length) {
      const copy = document.createElement('div');
      copy.className = 'essay-anchors-copy';
      copy.append(...rest);
      body.append(copy);
    }

    item.append(body);
    list.append(item);
  });

  block.replaceChildren(list);
}
