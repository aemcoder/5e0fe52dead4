/**
 * essay-hero — the full-height opening band of the essay.
 *
 * Template-slotted: the block owns the prototype's DOM (decorative rings, the
 * hairline rule) and MOVES the authored elements into role slots, so every
 * authored text stays inline-editable in Experience Workspace.
 *
 * Authoring (one row, one cell — the DA-flattened shape):
 *   <p>eyebrow</p>
 *   <h1>headline (use <em> for the accented word)</h1>
 *   <p>lede</p>
 *   optionally CTA paragraphs (<strong><a> primary, <em><a> secondary)
 *
 * Order rule (#51): the eyebrow is the link-free paragraph BEFORE the heading,
 * the lede is the link-free paragraph AFTER it.
 */

/**
 * Collect the authored elements from every cell of the block (#62/#71/#104).
 * Returns EXISTING nodes — they are moved, never rebuilt (EW1).
 * @param {Element} block the block element
 * @returns {Element[]} the authored elements in document order
 */
function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    let kids = [...cell.children];
    // the runtime's wrapTextNodes folds a media-led cell into ONE <p> — expand it
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
      && kids[0].querySelector('picture, img')) {
      kids = [...kids[0].childNodes].map((n) => {
        if (n.nodeType === 1) return n;
        // harness-only fallback: a bare text node inside the wrapper <p>
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
      // harness-only fallback (EW5): wrap the existing text nodes, never copy text
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out.length ? out : [...block.children];
}

/**
 * Wrap an AUTHORED element in a generated wrapper carrying the layout class.
 * @param {Element} node the authored element (moved, not copied)
 * @param {string} className the layout class
 * @returns {Element} the wrapper
 */
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const nodes = collectNodes(block);
  if (!nodes.length) return;

  const isEl = (n, sel) => n.nodeType === 1 && (n.matches(sel) || !!n.querySelector(sel));
  const heading = nodes.find((n) => n.nodeType === 1 && n.matches('h1, h2, h3'));
  const headingIndex = heading ? nodes.indexOf(heading) : -1;
  const ctas = nodes.filter((n) => n.nodeType === 1 && n.matches('p') && isEl(n, 'a[href]'));
  const texts = nodes.filter((n) => n.nodeType === 1 && n.matches('p') && !isEl(n, 'a[href]'));

  const eyebrow = texts.find((n) => headingIndex < 0 || nodes.indexOf(n) < headingIndex);
  const lede = texts.find((n) => n !== eyebrow);

  const rings = document.createElement('div');
  rings.className = 'hero-rings';
  rings.setAttribute('aria-hidden', 'true');
  rings.innerHTML = '<span class="ring ring-a"></span><span class="ring ring-b"></span><span class="ring ring-c"></span>';

  const inner = document.createElement('div');
  inner.className = 'hero-inner';

  if (eyebrow) inner.append(wrapNode(eyebrow, 'eyebrow'));
  if (heading) inner.append(wrapNode(heading, 'headline'));

  const rule = document.createElement('div');
  rule.className = 'hero-rule';
  rule.setAttribute('aria-hidden', 'true');
  inner.append(rule);

  if (lede) inner.append(wrapNode(lede, 'lede'));

  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'actions';
    ctas.forEach((p) => actions.append(p));
    inner.append(actions);
  }

  block.replaceChildren(rings, inner);
}
