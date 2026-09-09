/**
 * anchor-list — a ruled list of practices, each prefixed with a roman numeral.
 *
 * Schema roles, one row per anchor:
 *   title  <h4>  the practice
 *   body   <p>   one or more paragraphs explaining it
 *
 * The numeral is presentation and is derived from the row's position, so
 * reordering or inserting a row always renumbers correctly.
 *
 * The section eyebrow and heading are authored as default content above the
 * block and are styled in place from styles/styles.css (D1).
 */

const ROMAN = [
  [1000, 'm'], [900, 'cm'], [500, 'd'], [400, 'cd'],
  [100, 'c'], [90, 'xc'], [50, 'l'], [40, 'xl'],
  [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i'],
];

/**
 * Converts a positive integer to a lower-case roman numeral.
 * @param {number} value the number
 * @returns {string} the roman numeral
 */
function toRoman(value) {
  let rest = value;
  return ROMAN.reduce((acc, [size, numeral]) => {
    let out = acc;
    while (rest >= size) {
      out += numeral;
      rest -= size;
    }
    return out;
  }, '');
}

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
 * Collects the authored elements of a cell.
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

  let groups = rows
    .map((row) => [...row.children].flatMap((cell) => cellNodes(cell)))
    .filter((nodes) => nodes.length);

  if (groups.length === 1) {
    const flat = groups[0];
    const counts = {};
    flat.filter(isHeading).forEach((h) => { counts[h.tagName] = (counts[h.tagName] || 0) + 1; });
    const [tag] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || [];
    if (tag && counts[tag] > 1) groups = segmentByHeading(flat, tag);
  }

  const list = document.createElement('div');
  list.className = 'anchor-list-items';

  groups.forEach((nodes, i) => {
    const item = document.createElement('div');
    item.className = 'anchor-list-item';

    const numeral = document.createElement('span');
    numeral.className = 'anchor-list-numeral';
    numeral.setAttribute('aria-hidden', 'true');
    numeral.textContent = `${toRoman(i + 1)}.`;
    item.append(numeral);

    const content = document.createElement('div');
    content.className = 'anchor-list-content';

    const heading = nodes.find(isHeading);
    if (heading) content.append(wrapNode(heading, 'anchor-list-title'));

    const body = document.createElement('div');
    body.className = 'anchor-list-body';
    nodes.filter((node) => node !== heading).forEach((node) => body.append(node));
    if (body.childElementCount) content.append(body);

    item.append(content);
    list.append(item);
  });

  block.replaceChildren(list);
}
