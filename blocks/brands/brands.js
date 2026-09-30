/**
 * Brands — a row of brand tiles (name or logo picture).
 * The heading + intro are default content in the same section.
 *
 * Authoring: one row per brand, one cell: <p>SITECH</p> or a logo picture
 * (optionally linked).
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.className = 'brands-tile';
    const cell = row.firstElementChild;
    if (cell && row.children.length === 1) {
      // keep authored nodes, drop the extra cell level
      row.replaceChildren(...cell.childNodes);
    }
  });
}
