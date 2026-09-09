/**
 * essay-hero — the full-height opening band of the essay.
 *
 * Authoring rows (one cell each; a single flattened cell is also supported):
 *   1. eyebrow  — short uppercase kicker
 *   2. headline — the page's single <h1>; wrap the accent word in <em>
 *   3. lede     — one italic serif sentence
 *
 * Decode is content-driven (never `block.children[N]`): the heading is found by
 * query, the short line before it is the eyebrow and the sentence after it is
 * the lede (#42/#51). Authored elements are MOVED into generated wrappers that
 * carry the layout classes, so every text stays inline-editable (EW1/EW2).
 * The three rings and the hairline rule are decorative and generated here.
 */

/**
 * Collects the authored elements of a block, cell by cell, recovering the
 * media-led / bare-text cells the runtime's wrapTextNodes folds into one <p>.
 * @param {Element} block the block element
 * @returns {Element[]} the authored elements, in document order
 */
function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
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
    if (kids.length) out.push(...kids);
    else if (cell.textContent.trim()) {
      // harness-only: off-pipeline content with no element wrapper
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out.length ? out : [...block.children];
}

/**
 * Wraps an authored element in a generated element that carries the layout class.
 * The authored node MOVES — it keeps its tag, attributes and editor index.
 * @param {Element} node the authored element
 * @param {string} className the class for the generated wrapper
 * @param {string} [tag] the wrapper tag name
 * @returns {Element} the wrapper
 */
function wrapNode(node, className, tag = 'div') {
  const w = document.createElement(tag);
  w.className = className;
  w.append(node);
  return w;
}

export default function decorate(block) {
  const nodes = collectNodes(block);
  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const headingIndex = heading ? nodes.indexOf(heading) : -1;
  const texts = nodes.filter((n) => n !== heading && n.textContent.trim());
  const eyebrow = texts.find((n) => headingIndex < 0 || nodes.indexOf(n) < headingIndex);
  const lede = texts.find((n) => n !== eyebrow);

  const inner = document.createElement('div');
  inner.className = 'essay-hero-inner';

  if (eyebrow) inner.append(wrapNode(eyebrow, 'essay-hero-eyebrow'));
  if (heading) inner.append(wrapNode(heading, 'essay-hero-headline'));

  const rule = document.createElement('span');
  rule.className = 'essay-hero-rule';
  rule.setAttribute('aria-hidden', 'true');
  inner.append(rule);

  if (lede) inner.append(wrapNode(lede, 'essay-hero-lede'));

  const rings = document.createElement('div');
  rings.className = 'essay-hero-rings';
  rings.setAttribute('aria-hidden', 'true');
  rings.innerHTML = '<span></span><span></span><span></span>';

  block.replaceChildren(rings, inner);
}
