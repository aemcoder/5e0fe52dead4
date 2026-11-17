/**
 * anchors — ruled list of practices with roman-numeral markers ("Five anchors of a
 * frugal life"). Markers (i., ii., …) are drawn by a CSS counter. The section head
 * (eyebrow + <h2>) is default content above the block, styled in place via
 * .anchors-container.
 *
 * Authoring: one row per item, one cell holding an <h3> title and a <p> body.
 * Flattened shape (all items in one cell) is segmented on the heading boundary.
 */

function segment(block) {
  const nodes = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length) nodes.push(...kids);
    // HARNESS-ONLY fallback (EW5): wrap bare text nodes, never synthesize from textContent
    else if (cell.textContent.trim()) {
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      nodes.push(p);
    }
  });
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
  const list = document.createElement('div');
  list.className = 'list';

  segment(block).forEach((nodes) => {
    const item = document.createElement('div');
    item.className = 'anchor';
    const marker = document.createElement('div');
    marker.className = 'marker';
    marker.setAttribute('aria-hidden', 'true');
    const text = document.createElement('div');
    text.className = 'text';
    nodes.forEach((n) => {
      const w = document.createElement('div');
      w.className = /^H[1-6]$/.test(n.tagName) ? 'title' : 'body';
      w.append(n);
      text.append(w);
    });
    item.append(marker, text);
    list.append(item);
  });

  block.replaceChildren(list);
}
