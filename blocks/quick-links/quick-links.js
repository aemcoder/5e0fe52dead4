/**
 * quick-links — dark band of icon tiles, each tile one whole-card link.
 * Decode tier: reconstructive (authors add/remove tiles).
 *
 * Authoring: one row per tile.
 *   cell 1: <p>:icon-name:</p> (an /icons/<name>.svg token; inlined so it recolors on hover)
 *   cell 2: <p><a href>Title</a></p> then <p>short description</p>
 * A single-cell row works too (icon token paragraph first).
 *
 * @ew-exempt <p> :icon: token (cell 1) — metadata, rendered as an SVG glyph
 */

async function inlineIcon(holder) {
  let span = holder.querySelector('span.icon');
  if (!span) {
    const m = holder.textContent.match(/:([a-z0-9-]+):/);
    if (!m) return;
    span = document.createElement('span');
    span.className = `icon icon-${m[1]}`;
    holder.replaceChildren(span);
  }
  const name = [...span.classList].find((c) => c.startsWith('icon-'))?.slice(5);
  if (!name) return;
  try {
    const resp = await fetch(`${window.hlx?.codeBasePath || ''}/icons/${name}.svg`);
    if (!resp.ok) return;
    const svg = (await resp.text()).trim();
    if (svg.startsWith('<svg')) span.innerHTML = svg;
  } catch (e) {
    // keep the <img> fallback
  }
}

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default async function decorate(block) {
  const grid = document.createElement('div');
  grid.className = 'grid';
  const iconJobs = [];

  [...block.children].forEach((row) => {
    const ps = [...row.querySelectorAll('p')];
    const iconP = ps.find((p) => p.querySelector('span.icon')
      || /^\s*:[a-z0-9-]+:\s*$/.test(p.textContent));
    const titleP = ps.find((p) => p !== iconP && p.querySelector('a'));
    const link = titleP?.querySelector('a');
    const descP = ps.find((p) => p !== iconP && p !== titleP);
    if (!titleP && !descP) return;

    const tile = document.createElement('a');
    tile.className = 'tile';
    tile.href = link ? link.href : '#';

    const ico = document.createElement('span');
    ico.className = 'ico';
    if (iconP) {
      ico.append(iconP);
      iconJobs.push(inlineIcon(iconP));
    }
    const txt = document.createElement('div');
    txt.className = 'txt';
    if (titleP) {
      txt.append(wrapNode(titleP, 'q-title'));
      // card-as-link: keep the authored paragraph, drop the nested anchor (EW6)
      if (link) link.replaceWith(...link.childNodes);
    }
    if (descP) txt.append(wrapNode(descP, 'q-sub'));
    tile.append(ico, txt);
    grid.append(tile);
  });

  block.replaceChildren(grid);
  await Promise.all(iconJobs);
}
