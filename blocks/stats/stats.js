/**
 * stats — dark "by the numbers" band: an intro (heading + text) as the first
 * grid cell, followed by one cell per figure.
 *
 * Authoring:
 *   - intro: <h2> (accent word in <em>) + <p>, authored as DEFAULT CONTENT in the
 *     same section before the block; the block reabsorbs it into its grid.
 *     (Fallback: a block row holding a heading is used as the intro.)
 *   - one row per figure: | 75 | Years in Business |
 *     (or one cell: <p>75</p><p>Years in Business</p>)
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default function decorate(block) {
  const grid = document.createElement('div');
  grid.className = 'grid';

  const intro = document.createElement('div');
  intro.className = 'item intro';

  // section head authored as default content → reabsorb into the grid (EW8: move nodes)
  const head = block.parentElement?.previousElementSibling;
  if (head && head.classList.contains('default-content-wrapper')) {
    intro.append(...head.childNodes);
    head.remove();
  }

  [...block.children].forEach((row) => {
    if (row.querySelector('h1, h2, h3, h4, h5, h6')) {
      row.querySelectorAll(':scope > div').forEach((cell) => intro.append(...cell.childNodes));
      return;
    }
    const parts = [];
    row.querySelectorAll(':scope > div').forEach((cell) => {
      const kids = [...cell.children];
      if (kids.length) parts.push(...kids);
      else if (cell.textContent.trim()) {
        // harness-only fallback: bare text cell (the runtime wraps these in <p>)
        const p = document.createElement('p');
        p.append(...cell.childNodes);
        parts.push(p);
      }
    });
    if (!parts.length) return;
    const item = document.createElement('div');
    item.className = 'item';
    item.append(wrapNode(parts[0], 'num'));
    parts.slice(1).forEach((p) => item.append(wrapNode(p, 'lab')));
    grid.append(item);
  });

  if (intro.childNodes.length) grid.prepend(intro);
  block.replaceChildren(grid);
}
