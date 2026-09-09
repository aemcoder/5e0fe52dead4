/**
 * anchors — a numbered list of practices ("Five anchors of a frugal life"),
 * each a rule-separated row with a roman numeral, a title and a paragraph.
 *
 * Authoring rows:
 *   1. eyebrow — a short label line (optional)
 *   2. section heading — an <h2>
 *   3..N. one row per anchor, each cell holding an <h4> title and a paragraph
 *
 * The roman numerals are presentational and generated with a CSS counter.
 * Authored elements are MOVED into the generated layout, never rebuilt.
 */

/**
 * Wraps an authored element in a generated container that carries the layout class.
 * @param {Element} node authored element (moved, never copied)
 * @param {string} className class for the generated wrapper
 * @returns {Element} the wrapper
 */
function wrapNode(node, className) {
  const wrapper = document.createElement('div');
  wrapper.className = className;
  wrapper.append(node);
  return wrapper;
}

/**
 * Collects the authored elements of a block, tolerating the DA-flattened
 * single-cell shape and the runtime's media-led <p> folding.
 * @param {Element} block the block element
 * @returns {Element[]} authored elements in document order
 */
function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
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
    if (kids.length) out.push(...kids);
    else if (cell.textContent.trim()) {
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out.length ? out : [...block.children];
}

/**
 * Determines which heading tag opens a repeating unit — the most frequent
 * heading in the block (the lone section title sits one level up).
 * @param {Element[]} nodes collected authored elements
 * @returns {string} the unit heading tag name, or '' when there is none
 */
function unitHeadingTag(nodes) {
  const counts = {};
  nodes.filter((n) => /^H[1-6]$/.test(n.tagName))
    .forEach((n) => { counts[n.tagName] = (counts[n.tagName] || 0) + 1; });
  const tags = Object.keys(counts);
  if (!tags.length) return '';
  return tags.reduce((best, tag) => (counts[tag] > counts[best] ? tag : best), tags[0]);
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const nodes = collectNodes(block).filter((n) => n.textContent.trim());
  if (!nodes.length) return;

  const unitTag = unitHeadingTag(nodes);
  const head = document.createElement('div');
  head.className = 'anchors-head';
  const list = document.createElement('div');
  list.className = 'anchors-list';

  let content = null;
  nodes.forEach((node) => {
    if (unitTag && node.tagName === unitTag) {
      const item = document.createElement('div');
      item.className = 'anchor';
      const num = document.createElement('div');
      num.className = 'anchor-num';
      num.setAttribute('aria-hidden', 'true');
      content = document.createElement('div');
      content.className = 'anchor-content';
      content.append(wrapNode(node, 'anchor-title'));
      item.append(num, content);
      list.append(item);
      return;
    }
    if (!content) {
      const isHeading = /^H[1-6]$/.test(node.tagName);
      head.append(wrapNode(node, isHeading ? 'anchors-title' : 'anchors-eyebrow'));
      return;
    }
    content.append(wrapNode(node, 'anchor-body'));
  });

  const wrap = document.createElement('div');
  wrap.className = 'anchors-wrap';
  if (head.childElementCount) wrap.append(head);
  if (list.childElementCount) wrap.append(list);

  block.replaceChildren(wrap);
}
