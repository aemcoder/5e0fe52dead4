import { decorateIcons } from '../../scripts/aem.js';

/**
 * Quick links — the yellow-ruled strip of shortcut tiles under the hero.
 * Reconstructive: one row per tile, each tile becomes one link (card-as-link).
 *
 * Authoring, one row per tile:
 *   cell 1  icon — `:name:` (an SVG in /icons)
 *   cell 2  <p><a href>Title</a></p><p>Subtitle</p>
 *
 * @ew-exempt <p> icon token (cell 1) — text-as-metadata, rendered as an icon
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  if (node) w.append(node);
  return w;
}

/** Turns a raw `:name:` token (off-pipeline content) into span.icon — harness-only path. */
function iconFromToken(cell) {
  const span = cell.querySelector('span.icon');
  if (span) return span;
  const match = cell.textContent.match(/:([a-z0-9-]+):/);
  if (!match) return null;
  const created = document.createElement('span');
  created.className = `icon icon-${match[1]}`;
  return created;
}

export default function decorate(block) {
  const tiles = [...block.children].map((row) => {
    const cells = [...row.children];
    const iconCell = cells.length > 1 ? cells[0] : null;
    const body = cells[cells.length - 1];
    const link = body?.querySelector('a[href]');
    const title = link ? link.closest('p') : body?.querySelector('p, h2, h3, h4');
    const rest = body ? [...body.querySelectorAll(':scope > p, :scope > h2, :scope > h3, :scope > h4')].filter((el) => el !== title) : [];

    const tile = document.createElement(link ? 'a' : 'div');
    tile.className = 'quick-links-item';
    if (link) tile.href = link.href;

    const icon = iconCell ? iconFromToken(iconCell) : null;
    const ico = wrapNode(icon, 'quick-links-icon');
    ico.setAttribute('aria-hidden', 'true');

    const txt = wrapNode(null, 'quick-links-text');
    if (title) txt.append(wrapNode(title, 'quick-links-title'));
    if (link && title) link.replaceWith(...link.childNodes); // EW6: no nested anchors
    if (rest.length) {
      const sub = wrapNode(null, 'quick-links-sub');
      sub.append(...rest);
      txt.append(sub);
    }
    tile.append(ico, txt);
    return tile;
  });

  block.replaceChildren(...tiles);
  decorateIcons(block);
  block.querySelectorAll('span.icon').forEach((span) => {
    const img = span.querySelector('img');
    if (!img) return;
    span.style.setProperty('--icon-src', `url("${img.src}")`);
    img.remove();
  });
}
