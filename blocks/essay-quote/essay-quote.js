/**
 * essay-quote — the pull quote band that punctuates the essay.
 *
 * Authoring rows (one cell each):
 *   1. the quotation
 *   2. the attribution
 *
 * The authored paragraph is MOVED into a generated <blockquote>, so the mark-up
 * gains its semantics without retagging the author's element (EW1). The
 * oversized opening quote mark is decorative and generated in CSS.
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

export default function decorate(block) {
  const nodes = collectNodes(block).filter((n) => n.textContent.trim());
  if (!nodes.length) return;

  const wrap = document.createElement('div');
  wrap.className = 'essay-quote-wrap';

  const quote = document.createElement('blockquote');
  quote.className = 'essay-quote-text';
  quote.append(nodes[0]);
  wrap.append(quote);

  const rest = nodes.slice(1);
  if (rest.length) {
    const cite = document.createElement('div');
    cite.className = 'essay-quote-attribution';
    cite.append(...rest);
    wrap.append(cite);
  }

  block.replaceChildren(wrap);
}
