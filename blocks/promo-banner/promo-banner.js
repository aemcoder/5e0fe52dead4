/**
 * Promo Banner Block
 * Full-width promotional strip with SVG wave background.
 * Single-column content (heading + body + CTA) aligned to right portion.
 *
 * @param {Element} block The block element
 */
export default async function decorate(block) {
 // Block receives one row with one cell (heading + body + CTA).
 // No structural transform needed — CSS handles the layout.
 // Mark the CTA link for button decoration if not already done.
 const cta = block.querySelector("a");
 if (cta && !cta.classList.contains("button")) {
  cta.classList.add("button");
 }
}
