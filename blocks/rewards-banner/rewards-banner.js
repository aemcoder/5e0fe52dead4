/**
 * Rewards Banner block
 *
 * Content model (one row, two cells):
 *   Cell 0 — left spacer (background SVG bow shows through)
 *   Cell 1 — H2 heading, body paragraph, CTA link
 *
 * @param {HTMLElement} block
 */
export default function decorate(block) {
 const rows = [...block.children];
 if (rows.length === 0) return;

 const row = rows[0];
 const cells = [...row.children];

 if (cells.length >= 2) {
  cells[1].classList.add("rewards-banner-content");
 }
}
