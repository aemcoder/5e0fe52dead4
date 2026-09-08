/**
 * essay-hero — the full-height opening band of the essay.
 *
 * Authoring (one row, one cell — flat siblings; extra rows are tolerated):
 *   <p>eyebrow</p>          the short kicker above the headline (optional)
 *   <h1>headline</h1>       the page's single <h1>; <em> carries the accent word
 *   <p>lede</p>             the sentence under the rule (optional)
 *
 * The decorative rings and the hairline rule are generated (they carry no
 * content); everything else is the AUTHORED element, moved — never rebuilt.
 */

/**
 * Collects the authored elements of a block, cell by cell, recovering the
 * shapes the delivery pipeline produces (a media-led cell folded into one <p>,
 * a bare-text cell).
 * @param {Element} block the block element
 * @returns {Element[]} the authored elements in document order
 */
function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
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
    if (kids.length) {
      out.push(...kids);
    } else if (cell.textContent.trim()) {
      // harness-only: off-pipeline content can deliver a bare text cell
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out.length ? out : [...block.children];
}

/**
 * Wraps an AUTHORED element in a generated wrapper carrying the layout class.
 * The element moves, keeping its tag, attributes and editor instrumentation.
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
  const nodes = collectNodes(block);
  if (!nodes.length) return;

  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const headingIndex = heading ? nodes.indexOf(heading) : -1;
  const texts = nodes.filter((n) => n !== heading && n.textContent.trim());
  // canonical lead order: eyebrow (before the heading) → heading → lede (after)
  const eyebrow = texts.find((n) => headingIndex === -1 || nodes.indexOf(n) < headingIndex);
  const lede = texts.find((n) => n !== eyebrow);

  const inner = document.createElement('div');
  inner.className = 'essay-hero-inner';

  if (eyebrow) inner.append(wrapNode(eyebrow, 'essay-hero-eyebrow'));
  if (heading) inner.append(wrapNode(heading, 'essay-hero-headline'));

  const rule = document.createElement('div');
  rule.className = 'essay-hero-rule';
  rule.setAttribute('aria-hidden', 'true');
  inner.append(rule);

  if (lede) inner.append(wrapNode(lede, 'essay-hero-lede'));

  const rings = ['essay-hero-ring ring-a', 'essay-hero-ring ring-b', 'essay-hero-ring ring-c']
    .map((cls) => {
      const ring = document.createElement('div');
      ring.className = cls;
      ring.setAttribute('aria-hidden', 'true');
      return ring;
    });

  block.replaceChildren(...rings, inner);
}
