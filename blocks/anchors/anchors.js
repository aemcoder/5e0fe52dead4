/**
 * anchors — a hairline-separated numbered list of practices.
 *
 * Authoring: one ROW per anchor, one cell holding its parts as flat siblings:
 *   <h3>anchor title</h3>
 *   <p>anchor copy</p>
 *
 * The roman ordinal is generated from a CSS counter — it is sequence
 * decoration, not authored content. The section eyebrow and heading above the
 * list are authored as DEFAULT CONTENT in the same section.
 */

/**
 * Collects the authored elements of a cell, recovering the shapes the delivery
 * pipeline produces (a media-led cell folded into one <p>, a bare-text cell).
 * @param {Element} cell the block cell
 * @returns {Element[]} the authored elements in document order
 */
function cellNodes(cell) {
  let kids = [...cell.children];
  if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
    && kids[0].querySelector('picture, img')) {
    kids = [...kids[0].childNodes].map((n) => {
      if (n.nodeType === Node.ELEMENT_NODE) return n;
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
    // harness-only: off-pipeline content can deliver a bare text cell
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    return [p];
  }
  return [];
}

/**
 * Splits a flat run of authored elements into one group per repeating heading.
 * Used when the pipeline flattens every anchor into a single cell.
 * @param {Element[]} nodes the authored elements
 * @returns {Element[][]} one array of elements per anchor
 */
function segmentByHeading(nodes) {
  const headings = nodes.filter((n) => /^H[1-6]$/.test(n.tagName));
  if (headings.length < 2) return [nodes];
  const counts = headings.reduce((acc, h) => {
    acc[h.tagName] = (acc[h.tagName] || 0) + 1;
    return acc;
  }, {});
  const boundary = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  const groups = [];
  nodes.forEach((node) => {
    if (node.tagName === boundary || !groups.length) groups.push([]);
    groups[groups.length - 1].push(node);
  });
  return groups;
}

/**
 * Wraps an AUTHORED element in a generated wrapper carrying the layout class.
 * @param {Element} node the authored element
 * @param {string} className the layout class for the wrapper
 * @returns {Element} the wrapper
 */
function wrapNode(node, className) {
  const wrapper = document.createElement('div');
  wrapper.className = className;
  wrapper.append(node);
  return wrapper;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  let groups = rows
    .map((row) => [...row.children].flatMap((cell) => cellNodes(cell)))
    .filter((nodes) => nodes.length);

  if (groups.length === 1) groups = segmentByHeading(groups[0]);

  const list = document.createElement('div');
  list.className = 'anchors-list';

  groups.forEach((nodes) => {
    const item = document.createElement('div');
    item.className = 'anchor';

    const num = document.createElement('span');
    num.className = 'anchor-num';
    num.setAttribute('aria-hidden', 'true');
    item.append(num);

    const text = document.createElement('div');
    text.className = 'anchor-text';

    const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
    if (heading) text.append(wrapNode(heading, 'anchor-title'));

    const body = document.createElement('div');
    body.className = 'anchor-body';
    nodes.filter((n) => n !== heading).forEach((n) => body.append(n));
    if (body.childElementCount) text.append(body);

    item.append(text);
    list.append(item);
  });

  block.replaceChildren(list);
}
