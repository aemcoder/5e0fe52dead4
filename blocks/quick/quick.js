/**
 * Quick actions — a strip of full-width link tiles under the hero.
 *
 * Authoring: one row per tile, two cells:
 *   | <a href="…">Title</a> | Subtitle text |
 * (a single cell holding both paragraphs works too).
 * The tile icon is chosen from the title keywords (quote / used / rent /
 * parts / service); unknown titles get an arrow.
 * The whole tile becomes the link; the authored anchor is unwrapped inside it
 * (EW6) so its paragraph stays editable.
 */

const ICONS = {
  quote: '<path d="M3 21h18M5 21v-7l5-2 2-5 3 1-1 4 4 2v7"/><circle cx="8" cy="21" r="0.3"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  rent: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>',
  parts: '<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 6.6 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4 13.4H3.9a2 2 0 1 1 0-4H4a1.6 1.6 0 0 0 1.5-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 11 4V3.9a2 2 0 1 1 4 0V4a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8z"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.3L3 18v3h3l6.4-6.3a4 4 0 0 0 5.3-5.4l-2.5 2.5-2.1-2.1z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
};

function iconFor(title) {
  const t = title.toLowerCase();
  if (/quote|price/.test(t)) return 'quote';
  if (/used|shop|search|find/.test(t)) return 'search';
  if (/rent/.test(t)) return 'rent';
  if (/part/.test(t)) return 'parts';
  if (/service|repair|support/.test(t)) return 'wrench';
  return 'arrow';
}

function svg(name) {
  const ns = 'http://www.w3.org/2000/svg';
  const el = document.createElementNS(ns, 'svg');
  el.setAttribute('viewBox', '0 0 24 24');
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = ICONS[name];
  return el;
}

function rowNodes(row) {
  const out = [];
  [...row.children].forEach((cell) => {
    if (cell.children.length) out.push(...cell.children);
    else if (cell.textContent.trim()) {
      // HARNESS-ONLY fallback: wrap existing text nodes, never synthesize.
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out;
}

export default function decorate(block) {
  const grid = document.createElement('div');
  grid.className = 'grid';

  [...block.children].forEach((row) => {
    const nodes = rowNodes(row);
    if (!nodes.length) return;
    const link = nodes.map((n) => (n.tagName === 'A' ? n : n.querySelector('a'))).find(Boolean);
    const titleNode = link ? (link.closest('p') || link) : nodes[0];
    const subNodes = nodes.filter((n) => n !== titleNode);

    const tile = document.createElement(link ? 'a' : 'div');
    tile.className = 'tile';
    if (link) {
      tile.href = link.getAttribute('href');
      if (link.title) tile.title = link.title;
    }

    const ico = document.createElement('span');
    ico.className = 'ico';
    ico.append(svg(iconFor(titleNode.textContent)));

    const txt = document.createElement('div');
    txt.className = 'txt';
    const title = document.createElement('div');
    title.className = 'title';
    title.append(titleNode);
    // EW6 — card-as-link: unwrap the inner anchor, keep the indexed <p>
    if (link && link !== titleNode) link.replaceWith(...link.childNodes);
    txt.append(title);
    if (subNodes.length) {
      const sub = document.createElement('div');
      sub.className = 'sub';
      sub.append(...subNodes);
      txt.append(sub);
    }

    tile.append(ico, txt);
    grid.append(tile);
  });

  block.replaceChildren(grid);
}
