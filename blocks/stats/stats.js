/**
 * Stats — a dark band of big figures with an intro.
 * The intro (h2 + p) is default content in the same section; the block pulls
 * it into its grid as the first item so it lines up with the figures.
 *
 * Authoring: one row per stat, two cells: [75] | [Years in Business]
 * (a single cell holding two paragraphs works too).
 */
export default function decorate(block) {
  const section = block.closest('.section');
  const wrapper = block.parentElement;
  const intro = section && [...section.querySelectorAll(':scope > .default-content-wrapper')]
    // eslint-disable-next-line no-bitwise
    .find((dcw) => dcw.compareDocumentPosition(wrapper) & Node.DOCUMENT_POSITION_FOLLOWING);

  [...block.children].forEach((row) => {
    row.classList.add('stats-item');
    const cells = [...row.children];
    let num;
    let label;
    if (cells.length > 1) {
      [num, label] = cells;
    } else if (cells[0]) {
      const kids = [...cells[0].children];
      if (kids.length > 1) {
        cells[0].replaceWith(...kids);
        [num, label] = kids;
      } else {
        num = cells[0];
      }
    }
    num?.classList.add('stats-num');
    label?.classList.add('stats-label');
  });

  if (intro) {
    const item = document.createElement('div');
    item.className = 'stats-item stats-intro';
    item.append(...intro.children);
    block.prepend(item);
    intro.remove();
  }
}
