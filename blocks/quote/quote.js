/**
 * quote — a centred pull quote on the forest ground.
 *
 * Authoring (Block Collection `quote` shape):
 *   row 1, cell 1: the quotation
 *   row 2, cell 1: the attribution (optional)
 *
 * The oversized quote mark is generated decoration. The authored quotation
 * paragraph is MOVED into a real <blockquote>, so the markup is semantic while
 * the authored element (and its editor instrumentation) survives intact.
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
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const nodes = collectNodes(block).filter((n) => n.textContent.trim());
  if (!nodes.length) return;

  // the last text run is the attribution; everything before it is the quotation
  const attribution = nodes.length > 1 ? nodes[nodes.length - 1] : null;
  const quotation = nodes.filter((n) => n !== attribution);

  const inner = document.createElement('div');
  inner.className = 'quote-inner';

  const mark = document.createElement('div');
  mark.className = 'quote-mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.textContent = '"';
  inner.append(mark);

  const body = document.createElement('blockquote');
  body.className = 'quote-body';
  body.append(...quotation);
  inner.append(body);

  if (attribution) {
    const cite = document.createElement('div');
    cite.className = 'quote-attribution';
    cite.append(attribution);
    inner.append(cite);
  }

  block.replaceChildren(inner);
}
