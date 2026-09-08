/**
 * closing — the dark closing statement that ends the essay.
 *
 * Authoring (one row, one cell — flat siblings):
 *   <h2>closing statement</h2>   <em> carries the accent word
 *   <p>closing paragraph</p>     optional
 *   optional CTA paragraphs      <strong><a> primary, <em><a> secondary
 *
 * The dot emblem and the closing hairline are generated decoration; every text
 * element is the AUTHORED element, moved.
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
  const nodes = collectNodes(block).filter((n) => n.textContent.trim() || n.querySelector('a'));
  if (!nodes.length) return;

  const inner = document.createElement('div');
  inner.className = 'closing-inner';

  const emblem = document.createElement('div');
  emblem.className = 'closing-emblem';
  emblem.setAttribute('aria-hidden', 'true');
  emblem.append(document.createElement('span'));
  inner.append(emblem);

  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  if (heading) inner.append(wrapNode(heading, 'closing-headline'));

  const ctas = nodes.filter((n) => n !== heading && n.querySelector('a[href]'));
  const body = nodes.filter((n) => n !== heading && !ctas.includes(n));
  if (body.length) {
    const copy = document.createElement('div');
    copy.className = 'closing-body';
    body.forEach((n) => copy.append(n));
    inner.append(copy);
  }

  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'closing-actions';
    ctas.forEach((n) => actions.append(n));
    inner.append(actions);
  }

  const rule = document.createElement('div');
  rule.className = 'closing-rule';
  rule.setAttribute('aria-hidden', 'true');
  inner.append(rule);

  block.replaceChildren(inner);
}
