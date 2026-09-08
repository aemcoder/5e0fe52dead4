/**
 * numbered-cards — an auto-fit grid of numbered prose cards.
 *
 * Authoring: one ROW per card, one cell holding the card's parts as flat
 * siblings:
 *   <h3>card title</h3>
 *   <p>card copy</p>
 *
 * The oversized ordinal and the short rule under each title are generated
 * (a CSS counter and a hairline) — they are sequence decoration, not content.
 * The section eyebrow and heading above the grid are authored as DEFAULT
 * CONTENT in the same section and styled in place (see styles/styles.css).
 */

/**
 * Collects the authored elements of a block, cell by cell, recovering the
 * shapes the delivery pipeline produces (a media-led cell folded into one <p>,
 * a bare-text cell).
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
 * Used when the pipeline flattens every card into a single cell.
 * @param {Element[]} nodes the authored elements
 * @returns {Element[][]} one array of elements per card
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

  // the pipeline can flatten every card into one cell — segment it back
  if (groups.length === 1) groups = segmentByHeading(groups[0]);

  const grid = document.createElement('div');
  grid.className = 'numbered-cards-grid';

  groups.forEach((nodes) => {
    const card = document.createElement('div');
    card.className = 'numbered-card';

    const num = document.createElement('div');
    num.className = 'numbered-card-num';
    num.setAttribute('aria-hidden', 'true');
    card.append(num);

    const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
    if (heading) card.append(wrapNode(heading, 'numbered-card-title'));

    const rule = document.createElement('div');
    rule.className = 'numbered-card-rule';
    rule.setAttribute('aria-hidden', 'true');
    card.append(rule);

    const body = document.createElement('div');
    body.className = 'numbered-card-body';
    nodes.filter((n) => n !== heading).forEach((n) => body.append(n));
    if (body.childElementCount) card.append(body);

    grid.append(card);
  });

  block.replaceChildren(grid);
}
