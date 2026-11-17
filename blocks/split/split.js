/**
 * Text + image split band.
 * Authored shape: one row, two cells — a text cell (eyebrow <p>, <h2>, body <p>s)
 * and an image cell (<picture>/<img>). Cells are classified by content, so
 * either order works.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const inner = document.createElement('div');
  inner.className = 'split-inner';

  cells.forEach((cell) => {
    const hasMedia = cell.querySelector('picture, img');
    const hasText = cell.querySelector('h1, h2, h3, h4, h5, h6') || cell.textContent.trim();
    if (hasMedia && !cell.querySelector('h1, h2, h3, h4, h5, h6')) {
      cell.className = 'split-media';
    } else if (hasText) {
      cell.className = 'split-text';
      const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
      const first = cell.firstElementChild;
      if (heading && first && first.tagName === 'P' && first !== heading) {
        first.classList.add('eyebrow');
      }
    } else {
      return;
    }
    inner.append(cell);
  });

  block.replaceChildren(inner);
}
