/**
 * Brands — a row of brand tiles. The section head (<h2> + <p>) is DEFAULT
 * CONTENT before the block and is styled in place (no reabsorption).
 *
 * Rows: one row per brand, one cell: | Brand name | (an optional logo
 * <picture> in the cell replaces the wordmark text).
 */

export default function decorate(block) {
  const row = document.createElement('div');
  row.className = 'brand-row';
  [...block.children].forEach((r) => {
    const cells = [...r.children];
    const nodes = cells.flatMap((c) => {
      if (c.children.length) return [...c.children];
      if (c.textContent.trim()) {
        // HARNESS-ONLY fallback: wrap existing text nodes, never synthesize.
        const p = document.createElement('p');
        p.append(...c.childNodes);
        return [p];
      }
      return [];
    });
    if (!nodes.length) return;
    const tile = document.createElement('div');
    tile.className = 'brand-tile';
    tile.append(...nodes);
    row.append(tile);
  });
  block.replaceChildren(row);
}
