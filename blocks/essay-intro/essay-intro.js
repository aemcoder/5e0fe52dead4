/**
 * essay-intro — the opening prose of the essay: one large serif lead paragraph
 * followed by supporting body copy.
 *
 * Authoring rows:
 *   1. lead paragraph (rendered large, in the display serif)
 *   2..N. body paragraphs
 *
 * Authored paragraphs are MOVED into the layout, never rebuilt, so they stay
 * inline-editable in Experience Workspace.
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
  wrap.className = 'essay-intro-wrap';

  nodes.forEach((node, i) => {
    const holder = document.createElement('div');
    holder.className = i === 0 ? 'essay-intro-lead' : 'essay-intro-body';
    holder.append(node);
    wrap.append(holder);
  });

  block.replaceChildren(wrap);
}
