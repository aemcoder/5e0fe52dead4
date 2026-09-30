/**
 * quick-links — dark band of icon shortcuts (New Quote, Shop Used, Rent, Parts, Service).
 * Reconstructive: one row per shortcut; authors add/remove rows freely.
 *
 * Authoring — one row per item, one cell:
 *   <p>:icon-name:</p>                 → icon (EDS icon syntax, /icons/<name>.svg)
 *   <p><a href="/path">Title</a></p>   → title; its href makes the whole tile a link
 *   <p>Short description</p>           → sub-line
 */

/** Convert un-rendered `:name:` icon tokens (off-pipeline content) into EDS icon spans. */
function renderIconTokens(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const hits = [];
  while (walker.nextNode()) {
    if (/:[a-z0-9-]+:/.test(walker.currentNode.nodeValue)) hits.push(walker.currentNode);
  }
  hits.forEach((node) => {
    const frag = document.createDocumentFragment();
    node.nodeValue.split(/(:[a-z0-9-]+:)/).forEach((part) => {
      const m = part.match(/^:([a-z0-9-]+):$/);
      if (m) {
        const span = document.createElement('span');
        span.className = `icon icon-${m[1]}`;
        const img = document.createElement('img');
        img.src = `${window.hlx?.codeBasePath || ''}/icons/${m[1]}.svg`;
        img.alt = '';
        span.append(img);
        frag.append(span);
      } else if (part) frag.append(document.createTextNode(part));
    });
    node.replaceWith(frag);
  });
}

export default function decorate(block) {
  renderIconTokens(block);
  const grid = document.createElement('div');
  grid.className = 'grid';

  [...block.children].forEach((row) => {
    const link = row.querySelector('a[href]');
    const icon = row.querySelector('span.icon');
    const item = document.createElement(link ? 'a' : 'div');
    item.className = 'item';
    if (link) item.href = link.getAttribute('href');

    const ico = document.createElement('div');
    ico.className = 'ico';
    if (icon) {
      const img = icon.querySelector('img');
      if (img) {
        // tint via CSS mask (currentColor) so hover colours apply; the <img> is not needed
        icon.style.setProperty('--icon', `url("${img.getAttribute('src')}")`);
        img.remove();
      }
      const iconP = icon.closest('p');
      ico.append(iconP && !iconP.textContent.trim() ? iconP : icon);
    }

    const txt = document.createElement('div');
    txt.className = 'txt';
    const ps = [...row.querySelectorAll('p')].filter((p) => !p.contains(icon) || p.textContent.trim());
    ps.forEach((p) => {
      const isTitle = link && p.contains(link);
      const w = document.createElement('div');
      w.className = isTitle ? 'title' : 'desc';
      w.append(p);
      // card-as-link: keep the authored paragraph, drop the nested anchor (EW6)
      if (isTitle) link.replaceWith(...link.childNodes);
      txt.append(w);
    });

    item.append(ico, txt);
    grid.append(item);
  });

  block.replaceChildren(grid);
}
