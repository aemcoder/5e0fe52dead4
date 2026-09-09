/**
 * essay-hero — the full-height opening band of the essay.
 *
 * Schema roles (in authored order, all in a single cell):
 *   eyebrow  <p>   short uppercase kicker
 *   heading  <h1>  the page headline (an <em> inside carries the accent word)
 *   lede     <p>   the italic standfirst underneath
 *
 * The decorative rings, the hairline rule and the ground are presentation and
 * are generated here / drawn in CSS — they are never authored.
 *
 * Authored nodes are MOVED into generated wrappers so they keep their tag,
 * attributes and Experience Workspace edit indices.
 */

/**
 * Wraps an authored element in a generated element carrying the layout class.
 * The node MOVES — it is never rebuilt from text.
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
 * Collects the authored elements of a block regardless of how the delivery
 * pipeline distributed them across rows and cells.
 * @param {Element} block the block element
 * @returns {Element[]} the authored elements, in document order
 */
function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    let kids = [...cell.children];
    // the runtime folds media-led cells into a single <p>; expand it back
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
      && kids[0].querySelector('picture, img')) {
      kids = [...kids[0].childNodes].map((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) return node;
        // harness-only: a bare text node inside the wrapper <p>
        if (node.textContent.trim()) {
          const p = document.createElement('p');
          p.append(node);
          return p;
        }
        return null;
      }).filter(Boolean);
    }
    if (kids.length) {
      out.push(...kids);
    } else if (cell.textContent.trim()) {
      // harness-only fallback: an unwrapped text cell
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out.length ? out : [...block.children];
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const nodes = collectNodes(block);
  if (!nodes.length) return;

  const headingIndex = nodes.findIndex((n) => /^H[1-6]$/.test(n.tagName));
  const heading = headingIndex >= 0 ? nodes[headingIndex] : null;
  const paragraphs = nodes.filter((n) => n.tagName === 'P');

  // eyebrow precedes the heading, lede follows it (#51)
  const before = paragraphs.filter((p) => headingIndex < 0
    || nodes.indexOf(p) < headingIndex);
  const after = paragraphs.filter((p) => headingIndex >= 0
    && nodes.indexOf(p) > headingIndex);
  const eyebrow = before[0] || null;
  const lede = after[0] || (!eyebrow ? paragraphs[0] : null);

  const decor = document.createElement('div');
  decor.className = 'essay-hero-decor';
  decor.setAttribute('aria-hidden', 'true');
  ['one', 'two', 'three'].forEach((name) => {
    const ring = document.createElement('span');
    ring.className = `essay-hero-ring essay-hero-ring-${name}`;
    decor.append(ring);
  });

  const inner = document.createElement('div');
  inner.className = 'essay-hero-inner';

  if (eyebrow) inner.append(wrapNode(eyebrow, 'essay-hero-eyebrow'));
  if (heading) inner.append(wrapNode(heading, 'essay-hero-headline'));

  const rule = document.createElement('span');
  rule.className = 'essay-hero-rule';
  rule.setAttribute('aria-hidden', 'true');
  inner.append(rule);

  if (lede) inner.append(wrapNode(lede, 'essay-hero-lede'));

  block.replaceChildren(decor, inner);
}
