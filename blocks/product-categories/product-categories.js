/**
 * Product Categories block — five icon+label cards in a horizontal row.
 * Content model: each row = one card (icon cell, label/link cell).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // Each child div is a card row.
  // EDS delivers: block > div(row) > div(icon-cell) + div(label-cell)
  block.setAttribute('role', 'list');

  [...block.children].forEach((card) => {
    card.setAttribute('role', 'listitem');

    const link = card.querySelector('a');
    if (link) {
      card.setAttribute('aria-label', link.textContent.trim());
      card.style.cursor = 'pointer';

      // Navigate only to same-origin or root-relative paths
      card.addEventListener('click', (e) => {
        if (!e.target.closest('a')) {
          link.click();
        }
      });

      card.setAttribute('tabindex', '0');
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          link.click();
        }
      });
    }
  });
}
