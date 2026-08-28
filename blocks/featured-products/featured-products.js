/**
 * Featured Products block — two card layout.
 * Authored rows become side-by-side cards, each with image above and text below.
 *
 * Authored content model (2 rows, 2 cells each):
 *   row → card
 *     cell[0] → card image
 *     cell[1] → card body: heading + text + CTA
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
   const cards = [...block.children];

   cards.forEach((card) => {
      card.classList.add("featured-products-card");

      const [imgCell, textCell] = [...card.children];
      if (imgCell) imgCell.classList.add("featured-products-card-image");
      if (textCell) textCell.classList.add("featured-products-card-body");

      // EDS decorateButtons() adds .button class to <strong><a> links;
      // promote those to primary variant for the teal CTA style.
      const cta = textCell?.querySelector("a.button");
      if (cta) cta.classList.add("primary");
   });
}
