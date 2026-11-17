/**
 * columns — Block Collection "columns" shape: one row, one cell per column.
 *
 * Variants:
 *   - feature: sand band, text column (eyebrow + <h2> + body) beside a tall
 *     photograph with an offset outline square (used by "The misconception").
 *
 * In a text column, a short paragraph authored BEFORE the column's heading is
 * treated as the eyebrow and MOVED into a `.eyebrow` wrapper (stays editable).
 */
export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture, img');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
          return;
        }
      }

      // eyebrow: paragraph(s) that precede the column heading
      const heading = col.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > h4');
      if (!heading) return;
      const before = [];
      let node = col.firstElementChild;
      while (node && node !== heading) {
        const next = node.nextElementSibling;
        if (node.tagName === 'P' && !node.querySelector('a, picture, img')) before.push(node);
        node = next;
      }
      if (before.length) {
        const eyebrow = document.createElement('div');
        eyebrow.className = 'eyebrow';
        eyebrow.append(...before);
        heading.before(eyebrow);
      }
    });
  });
}
