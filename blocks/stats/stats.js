/**
 * Stats — ink band with a hazard stripe: an intro column plus big yellow
 * figures.
 *
 * Intro: DEFAULT CONTENT placed before the block in the same section
 *   (<h2>Built On <em>Iron</em> &amp; Trust</h2><p>…</p>) — reabsorbed as the
 *   first grid item (EW8: moved, not rebuilt).
 * Rows: one row per figure, two cells: | 75 | Years in Business |
 */

function div(className, ...children) {
  const d = document.createElement('div');
  d.className = className;
  d.append(...children);
  return d;
}

function cellNodes(cell) {
  if (!cell) return [];
  if (cell.children.length) return [...cell.children];
  if (cell.textContent.trim()) {
    // HARNESS-ONLY fallback: wrap existing text nodes, never synthesize.
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    return [p];
  }
  return [];
}

export default function decorate(block) {
  const grid = div('grid');

  const blockWrapper = block.parentElement;
  const prev = blockWrapper && blockWrapper.previousElementSibling;
  if (prev && prev.classList.contains('default-content-wrapper')) {
    const intro = div('item intro');
    [...prev.children].forEach((n) => {
      intro.append(div(/^H[1-6]$/.test(n.tagName) ? 'headline' : 'copy', n));
    });
    prev.remove();
    grid.append(intro);
  }

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    let num = cellNodes(cells[0]);
    let lab = cellNodes(cells[1]);
    // single-cell rows: first paragraph = figure, rest = label
    if (cells.length === 1 && num.length > 1) {
      lab = num.slice(1);
      num = num.slice(0, 1);
    }
    if (!num.length && !lab.length) return;
    const item = div('item');
    if (num.length) item.append(div('num', ...num));
    if (lab.length) item.append(div('lab', ...lab));
    grid.append(item);
  });

  const stripe = div('stripe');
  stripe.setAttribute('aria-hidden', 'true');
  block.replaceChildren(stripe, div('wrap', grid));
}
