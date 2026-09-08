/**
 * essay-hero — the full-viewport opening statement of the essay.
 *
 * Authoring (order matters, every part optional):
 *   row 1 — eyebrow line (short, uppercase in render)
 *   row 2 — the page headline as a real <h1> (use <em> for the accented word)
 *   row 3 — the italic lede sentence
 *
 * DA frequently flattens all three into a single cell, so the rows are read as
 * a flat node list and classified by position around the heading (eyebrow
 * before, lede after) rather than by index.
 *
 * The hairline rule and the three background rings are decorative; they are
 * generated here so authors never have to maintain them.
 */

/**
 * Collect authored elements from the block, cell by cell, recovering the
 * shapes the runtime's wrapTextNodes() and DA's flattening produce.
 * @param {Element} block the block element
 * @returns {Element[]} authored elements in document order
 */
function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    let kids = [...cell.children];
    // media-led cells arrive folded into a single wrapper <p> — expand them
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
      && kids[0].querySelector('picture, img')) {
      kids = [...kids[0].childNodes].map((n) => {
        if (n.nodeType === 1) return n;
        if (n.textContent.trim()) {
          // harness-only: off-pipeline content can hold a bare text node here
          const p = document.createElement('p');
          p.append(n);
          return p;
        }
        return null;
      }).filter(Boolean);
    }
    if (kids.length) {
      out.push(...kids);
    } else if (cell.textContent.trim()) {
      // harness-only: DA always delivers a <p> in every cell
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out.length ? out : [...block.children];
}

/**
 * Move an authored element into a generated wrapper that carries the layout
 * class. The element keeps its tag, attributes and editing identity.
 * @param {Element} node authored element
 * @param {string} className wrapper class
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
  const nodes = collectNodes(block);
  const heading = nodes.find((n) => n.matches && n.matches('h1, h2, h3, h4, h5, h6'));
  const headingIndex = heading ? nodes.indexOf(heading) : -1;
  const texts = nodes.filter((n) => n !== heading && n.textContent.trim());
  const eyebrow = headingIndex > 0
    ? texts.find((n) => nodes.indexOf(n) < headingIndex)
    : null;
  const lede = texts.find((n) => nodes.indexOf(n) > headingIndex && n !== eyebrow);

  const rings = document.createElement('div');
  rings.className = 'essay-hero-rings';
  rings.setAttribute('aria-hidden', 'true');
  rings.append(...['ring-lg', 'ring-md', 'ring-halo'].map((name) => {
    const ring = document.createElement('span');
    ring.className = name;
    return ring;
  }));

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

  // this page's chrome floats over the hero — claim it before first paint so
  // the header reservation never collapses under the content (no CLS)
  document.body.classList.add('overlay-chrome');
}
