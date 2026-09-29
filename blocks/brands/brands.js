/**
 * Brands — centred band of partner-brand tiles.
 *
 * Authoring:
 *   Section default content BEFORE the block: <h2>title</h2> <p>intro</p>
 *   (stays default content, centred by this block's section styles)
 *   Block rows: one brand per row — a name (<p>) or a logo (<picture>), optionally linked.
 */

function el(tag, className) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

export default function decorate(block) {
  const row = el('div', 'brand-row');
  [...block.children].forEach((r) => {
    const cells = [...r.children];
    const tile = el('div', 'brand-tile');
    cells.forEach((cell) => {
      if (cell.children.length) tile.append(...cell.children);
      else if (cell.textContent.trim()) {
        // HARNESS-ONLY fallback (EW5): bare text cell; move the text nodes.
        const p = document.createElement('p');
        p.append(...cell.childNodes);
        tile.append(p);
      }
    });
    if (tile.children.length) {
      if (tile.querySelector('picture, img')) tile.classList.add('has-logo');
      row.append(tile);
    }
  });
  block.replaceChildren(row);
}
