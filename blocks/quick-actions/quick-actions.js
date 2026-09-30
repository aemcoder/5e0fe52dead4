/**
 * Quick actions — a strip of icon + title + hint tiles, each tile one link.
 *
 * Authoring: one row per action, one cell:
 *   <p>:quote:</p>                 (icon — quote | find | rent | parts | service)
 *   <p><a href="…">New Quote</a></p>
 *   <p>Spec &amp; price a machine</p>
 * The whole tile becomes the link; authored paragraphs are moved, not rebuilt.
 */

const ICONS = {
  quote: '<path d="M3 21h18M5 21v-7l5-2 2-5 3 1-1 4 4 2v7"/><circle cx="8" cy="21" r="0.3"/>',
  find: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  rent: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>',
  parts: '<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 6.6 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4 13.4H3.9a2 2 0 1 1 0-4H4a1.6 1.6 0 0 0 1.5-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 11 4V3.9a2 2 0 1 1 4 0V4a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8z"/>',
  service: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.3L3 18v3h3l6.4-6.3a4 4 0 0 0 5.3-5.4l-2.5 2.5-2.1-2.1z"/>',
};
ICONS.search = ICONS.find;

function iconName(el) {
  const img = el.querySelector('img[data-icon-name]');
  if (img) return img.dataset.iconName;
  const span = el.querySelector('span.icon');
  const cls = span && [...span.classList].find((c) => c.startsWith('icon-'));
  return cls ? cls.substring(5) : null;
}

function inlineIcon(name) {
  const paths = ICONS[name];
  if (!paths) return null;
  const tpl = document.createElement('template');
  tpl.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths}</svg>`;
  return tpl.content.firstElementChild;
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const parts = [...row.querySelectorAll(':scope > div > *')];
    const link = row.querySelector('a[href]');
    if (!link) return;

    const tile = document.createElement('a');
    tile.className = 'quick-actions-item';
    tile.href = link.href;
    if (link.target) tile.target = link.target;

    const icon = parts.find((el) => el.querySelector('span.icon, img'));
    if (icon) {
      icon.classList.add('quick-actions-icon');
      const svg = inlineIcon(iconName(icon));
      const span = icon.querySelector('span.icon');
      if (svg && span) span.replaceChildren(svg);
      tile.append(icon);
    }

    const text = document.createElement('div');
    text.className = 'quick-actions-text';
    parts.filter((el) => el !== icon).forEach((el) => {
      if (el.contains(link)) {
        el.classList.add('quick-actions-title');
        el.classList.remove('button-wrapper');
        link.replaceWith(...link.childNodes);
      } else {
        el.classList.add('quick-actions-hint');
      }
      text.append(el);
    });
    tile.append(text);
    row.replaceWith(tile);
  });
}
