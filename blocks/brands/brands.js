/**
 * brands — row of brand name tiles under a centered section head.
 * Decode tier: reconstructive (authors add/remove brands).
 *
 * Section head: authored as DEFAULT CONTENT before the block (<h2> + <p>), styled in place
 * via .brands-container .default-content-wrapper (no reabsorption).
 * Block rows: one per brand — the brand name (text, or an optional logo image).
 */
export default async function decorate(block) {
  const row = document.createElement('div');
  row.className = 'brand-row';
  [...block.children].forEach((r) => {
    const nodes = [...r.querySelectorAll(':scope > div > *')];
    if (!nodes.length) return;
    const tile = document.createElement('div');
    tile.className = 'brand-tile';
    tile.append(...nodes);
    row.append(tile);
  });
  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  wrap.append(row);
  block.replaceChildren(wrap);
}
