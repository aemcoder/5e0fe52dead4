/**
 * Quick links — full-bleed strip of task shortcuts under the hero.
 *
 * Authoring: one row per shortcut, two cells:
 *   | icon keyword | <p><a href>Title</a></p><p>Subtitle</p> |
 * Icon keywords: quote, search, rent, parts, service (unknown → arrow).
 *
 * @ew-exempt <p> icon keyword (cell 1) — text-as-metadata, never displayed
 */

const ICONS = {
  quote: '<path d="M3 21h18M5 21v-7l5-2 2-5 3 1-1 4 4 2v7"/><circle cx="8" cy="21" r="0.3"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  rent: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>',
  parts: '<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 6.6 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4 13.4H3.9a2 2 0 1 1 0-4H4a1.6 1.6 0 0 0 1.5-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 11 4V3.9a2 2 0 1 1 4 0V4a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8z"/>',
  service: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.3L3 18v3h3l6.4-6.3a4 4 0 0 0 5.3-5.4l-2.5 2.5-2.1-2.1z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
};

function svg(name) {
  const key = Object.keys(ICONS).find((k) => name.includes(k)) || 'arrow';
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[key]}</svg>`;
}

export default function decorate(block) {
  const items = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const content = cells.find((c) => c.querySelector('a[href]')) || cells[cells.length - 1];
    if (!content) return;
    const iconCell = cells.find((c) => c !== content);
    // read-only: the keyword is metadata (EW5), never displayed
    const keyword = iconCell ? iconCell.textContent.trim().toLowerCase() : '';

    const link = content.querySelector('a[href]');
    const item = document.createElement(link ? 'a' : 'div');
    item.className = 'quick-item';
    if (link) item.href = link.href;

    const ico = document.createElement('span');
    ico.className = 'quick-ico';
    ico.innerHTML = svg(keyword || (link ? link.textContent.toLowerCase() : ''));

    const txt = document.createElement('div');
    txt.className = 'quick-txt';
    const title = document.createElement('div');
    title.className = 'quick-title';
    const sub = document.createElement('div');
    sub.className = 'quick-sub';

    [...content.children].forEach((node) => {
      if (link && node.contains(link)) title.append(node);
      else sub.append(node);
    });
    // card-as-link (EW6): the indexed <p> survives, the nested anchor goes
    if (link) link.replaceWith(...link.childNodes);

    txt.append(title);
    if (sub.children.length) txt.append(sub);
    item.append(ico, txt);
    items.push(item);
  });
  block.replaceChildren(...items);
}
