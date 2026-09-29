/**
 * Stats — dark band under a hazard stripe: an intro (heading + text) followed by big
 * yellow figures. Reconstructive: one row per figure.
 *
 * Authoring:
 *   section default content before the block: <h2>Built On <em>Iron</em> & Trust</h2><p>…</p>
 *     (reabsorbed as the first grid item; italic words render in yellow)
 *   block rows: cell 1 figure (<p>75</p>) | cell 2 label (<p>Years in Business</p>)
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  if (node) w.append(node);
  return w;
}

export default function decorate(block) {
  const grid = wrapNode(null, 'stats-grid');

  // reabsorb the section head (EW8: move, then drop the empty wrapper)
  const prev = block.parentElement?.previousElementSibling;
  if (prev && prev.classList.contains('default-content-wrapper')) {
    const intro = wrapNode(null, 'stats-intro');
    intro.append(...prev.childNodes);
    grid.append(intro);
    prev.remove();
  }

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;
    const item = wrapNode(null, 'stats-item');
    const num = wrapNode(null, 'stats-num');
    num.append(...cells[0].childNodes);
    item.append(num);
    if (cells[1]) {
      const label = wrapNode(null, 'stats-label');
      label.append(...cells[1].childNodes);
      item.append(label);
    }
    grid.append(item);
  });

  const inner = wrapNode(grid, 'stats-inner');
  const stripe = wrapNode(null, 'stats-stripe');
  stripe.setAttribute('aria-hidden', 'true');
  block.replaceChildren(stripe, inner);
}
