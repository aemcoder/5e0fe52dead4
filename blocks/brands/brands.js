/**
 * brands — row of partner-brand tiles (text wordmark or logo image).
 * Heading + intro text are authored as default content before the block.
 *
 * Authoring — one row per brand: | Cat® |  or  | <picture> (logo, alt = brand) |
 */
export default function decorate(block) {
  const row = document.createElement('div');
  row.className = 'brand-row';
  [...block.children].forEach((r) => {
    const tile = document.createElement('div');
    tile.className = 'brand-tile';
    r.querySelectorAll(':scope > div').forEach((cell) => {
      if (cell.children.length) tile.append(...cell.children);
      else if (cell.textContent.trim()) {
        // harness-only fallback: bare text cell (the runtime wraps these in <p>)
        const p = document.createElement('p');
        p.append(...cell.childNodes);
        tile.append(p);
      }
    });
    if (tile.childNodes.length) row.append(tile);
  });
  block.replaceChildren(row);
}
