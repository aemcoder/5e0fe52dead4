/**
 * pillars — numbered grid of short essays ("Frugality heals in three ways").
 * The ordinal (01, 02, …) and the short accent rule are drawn by CSS, so authors
 * only maintain the title and text. The section head (eyebrow + <h2>) is default
 * content above the block, styled in place via .pillars-container.
 *
 * Authoring: one row per pillar, one cell holding an <h3> title and a <p> body.
 * Flattened shape (all pillars in one cell) is segmented on the <h3> boundary.
 */

function collectNodes(cell) {
  const out = [];
  [...cell.children].forEach((n) => out.push(n));
  // HARNESS-ONLY fallback (EW5): wrap bare text nodes, never synthesize from textContent
  if (!out.length && cell.textContent.trim()) {
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    out.push(p);
  }
  return out;
}

function segment(block) {
  const nodes = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => nodes.push(...collectNodes(cell)));
  const groups = [];
  let current = null;
  nodes.forEach((n) => {
    if (/^H[1-6]$/.test(n.tagName) || !current) {
      current = [];
      groups.push(current);
    }
    current.push(n);
  });
  return groups;
}

export default function decorate(block) {
  const groups = segment(block);
  const grid = document.createElement('div');
  grid.className = 'grid';

  groups.forEach((nodes) => {
    const item = document.createElement('div');
    item.className = 'pillar';
    const ordinal = document.createElement('div');
    ordinal.className = 'ordinal';
    ordinal.setAttribute('aria-hidden', 'true');
    item.append(ordinal);
    nodes.forEach((n) => {
      const w = document.createElement('div');
      w.className = /^H[1-6]$/.test(n.tagName) ? 'title' : 'body';
      w.append(n);
      item.append(w);
    });
    grid.append(item);
  });

  block.replaceChildren(grid);
}
