/**
 * essay-hero — the full-viewport opening band of the essay.
 *
 * Authoring rows (classified by content, order tolerant):
 *   1. eyebrow — a short line of text (e.g. "An essay on intentional living")
 *   2. headline — a real <h1> (may carry <em> for the accent word)
 *   3. lede — a sentence-length paragraph
 *
 * All authored elements are MOVED into the generated layout, so every line
 * stays inline-editable in Experience Workspace.
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
        // harness-only: a bare text node inside the folded wrapper <p>
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
      // harness-only fallback: a cell that still holds a bare text node
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

  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const texts = nodes.filter((n) => n !== heading && n.textContent.trim());
  const headingIndex = heading ? nodes.indexOf(heading) : -1;
  const eyebrow = texts.find((n) => headingIndex < 0 || nodes.indexOf(n) < headingIndex);
  const lede = texts.find((n) => n !== eyebrow);

  const rings = document.createElement('div');
  rings.className = 'essay-hero-rings';
  rings.setAttribute('aria-hidden', 'true');
  rings.innerHTML = '<span class="ring ring-a"></span><span class="ring ring-b"></span><span class="ring ring-c"></span>';

  const inner = document.createElement('div');
  inner.className = 'essay-hero-inner';

  if (eyebrow) inner.append(wrapNode(eyebrow, 'essay-hero-eyebrow'));
  if (heading) inner.append(wrapNode(heading, 'essay-hero-headline'));

  const rule = document.createElement('div');
  rule.className = 'essay-hero-rule';
  rule.setAttribute('aria-hidden', 'true');
  inner.append(rule);

  if (lede) inner.append(wrapNode(lede, 'essay-hero-lede'));

  block.replaceChildren(rings, inner);
}
