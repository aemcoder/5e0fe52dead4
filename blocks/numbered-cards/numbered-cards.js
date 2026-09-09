/**
 * numbered-cards — a responsive grid of numbered essay points.
 *
 * Schema roles, one row per card:
 *   title  <h3>  the card title
 *   body   <p>   one or more paragraphs of supporting copy
 *
 * The ordinal ("01", "02", …) and the short copper rule are presentation and
 * are generated from the card's position — they are never authored, so an
 * author reordering the rows always gets a correct sequence.
 *
 * The section eyebrow and heading are authored as default content above the
 * block and are styled in place from styles/styles.css (D1).
 */

/**
 * Wraps an authored element in a generated element carrying the layout class.
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
 * Collects the authored elements of a cell, expanding the wrapper paragraph
 * the runtime folds media-led cells into.
 * @param {Element} cell the block cell
 * @returns {Element[]} the authored elements
 */
function cellNodes(cell) {
  const kids = [...cell.children];
  if (kids.length) return kids;
  if (cell.textContent.trim()) {
    // harness-only fallback: an unwrapped text cell
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    return [p];
  }
  return [];
}

/**
 * Splits a flat list of authored elements into one group per heading.
 * @param {Element[]} nodes the authored elements
 * @param {string} tag the heading tag that opens a group
 * @returns {Element[][]} the groups
 */
function segmentByHeading(nodes, tag) {
  const groups = [];
  nodes.forEach((node) => {
    if (node.tagName === tag || !groups.length) groups.push([]);
    groups[groups.length - 1].push(node);
  });
  return groups;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  const isHeading = (el) => /^H[1-6]$/.test(el.tagName);

  // shape 1: one row per card
  let groups = rows
    .map((row) => [...row.children].flatMap((cell) => cellNodes(cell)))
    .filter((nodes) => nodes.length);

  // shape 2: the pipeline flattened every card into a single cell — segment on
  // the most frequent heading tag (the lone section title sits one level up)
  if (groups.length === 1) {
    const flat = groups[0];
    const counts = {};
    flat.filter(isHeading).forEach((h) => { counts[h.tagName] = (counts[h.tagName] || 0) + 1; });
    const [tag] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || [];
    if (tag && counts[tag] > 1) groups = segmentByHeading(flat, tag);
  }

  const grid = document.createElement('div');
  grid.className = 'numbered-cards-grid';

  groups.forEach((nodes, i) => {
    const card = document.createElement('div');
    card.className = 'numbered-card';

    const index = document.createElement('span');
    index.className = 'numbered-card-index';
    index.setAttribute('aria-hidden', 'true');
    index.textContent = String(i + 1).padStart(2, '0');
    card.append(index);

    const heading = nodes.find(isHeading);
    if (heading) card.append(wrapNode(heading, 'numbered-card-title'));

    const rule = document.createElement('span');
    rule.className = 'numbered-card-rule';
    rule.setAttribute('aria-hidden', 'true');
    card.append(rule);

    const body = document.createElement('div');
    body.className = 'numbered-card-body';
    nodes.filter((node) => node !== heading).forEach((node) => body.append(node));
    if (body.childElementCount) card.append(body);

    grid.append(card);
  });

  block.replaceChildren(grid);
}
