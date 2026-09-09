/**
 * quote — a full-bleed pull-quote band on the deep forest ground.
 *
 * Authoring rows:
 *   1. the quotation itself (a paragraph)
 *   2. optional attribution line (e.g. "— Epictetus")
 *
 * The authored paragraphs are MOVED into a generated <blockquote>/attribution
 * pair, so both stay inline-editable in Experience Workspace.
 */

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
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const nodes = collectNodes(block).filter((n) => n.textContent.trim());
  if (!nodes.length) return;

  const wrap = document.createElement('div');
  wrap.className = 'quote-wrap';

  const mark = document.createElement('div');
  mark.className = 'quote-mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.textContent = '"';
  wrap.append(mark);

  const [body, ...rest] = nodes;
  const quote = document.createElement('blockquote');
  quote.className = 'quote-body';
  quote.append(body);
  wrap.append(quote);

  rest.forEach((node) => {
    const holder = document.createElement('div');
    holder.className = 'quote-attribution';
    holder.append(node);
    wrap.append(holder);
  });

  block.replaceChildren(wrap);
}
