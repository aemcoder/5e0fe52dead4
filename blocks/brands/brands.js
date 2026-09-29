/**
 * Brands — a strip of partner-brand tiles under a centred section head.
 * Reconstructive: one row per brand; the cell holds a wordmark (text) or a logo picture.
 *
 * Authoring:
 *   section default content before the block: <h2>…</h2><p>…</p> (styled by the section)
 *   block rows: one cell per row — <p>Cat®</p> or a logo picture
 */

export default function decorate(block) {
  const list = document.createElement('ul');
  list.className = 'brands-list';

  [...block.children].forEach((row) => {
    const cell = row.querySelector(':scope > div') || row;
    if (!cell.textContent.trim() && !cell.querySelector('picture, img')) return;
    const tile = document.createElement('li');
    tile.className = 'brands-tile';
    tile.append(...cell.childNodes);
    list.append(tile);
  });

  block.replaceChildren(list);
}
