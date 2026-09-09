/**
 * essay-lede — the two-tier opening of the essay body: an oversized serif
 * statement followed by running sans-serif copy.
 *
 * Authoring rows (one cell each; a flattened single cell also works):
 *   1. lead paragraph — set large, in the serif display face
 *   2..N body paragraphs — running copy
 *
 * Authored paragraphs are MOVED into generated wrappers that carry the
 * typographic role, so they stay inline-editable (EW1/EW2).
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
  wrap.className = 'essay-lede-wrap';

  const lead = document.createElement('div');
  lead.className = 'essay-lede-lead';
  lead.append(nodes[0]);
  wrap.append(lead);

  const rest = nodes.slice(1);
  if (rest.length) {
    const body = document.createElement('div');
    body.className = 'essay-lede-body';
    body.append(...rest);
    wrap.append(body);
  }

  block.replaceChildren(wrap);
}
