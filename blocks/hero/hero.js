/**
 * Loads and decorates the Fréscopa hero block.
 *
 * Content model (one row, one cell):
 *   Row 0, Cell 0:
 *     p           — eyebrow label (marked .hero-eyebrow)
 *     h1          — headline
 *     p > strong > a — primary CTA button (decorated by EDS as a.button.primary)
 *
 * @param {Element} block The hero block element
 */
export default async function decorate(block) {
  const cell = block.querySelector(':scope > div > div');
  if (!cell) return;

  // Mark the paragraph immediately before h1 as the eyebrow label
  const h1 = cell.querySelector('h1');
  if (h1) {
    const prev = h1.previousElementSibling;
    if (prev && prev.tagName === 'P') {
      prev.classList.add('hero-eyebrow');
    }
  }
}
