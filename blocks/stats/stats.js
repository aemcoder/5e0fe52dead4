/**
 * Stats — ink band with a hazard stripe: intro + big yellow figures.
 *
 * Authoring:
 *   Section default content BEFORE the block (reabsorbed as the intro, EW8):
 *     <h2>Built On <em>Iron</em> &amp; Trust</h2> <p>intro</p>
 *   Block rows: | figure (e.g. 75) | label (e.g. Years in Business) |
 *   A single-cell row is also accepted: <p>figure</p><p>label</p>.
 */

function el(tag, className) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

function wrapNode(node, className) {
  const w = el('div', className);
  w.append(node);
  return w;
}

function cellNodes(cell) {
  const kids = [...cell.children];
  if (kids.length) return kids;
  if (!cell.textContent.trim()) return [];
  // HARNESS-ONLY fallback (EW5): bare text cell; move the text nodes.
  const p = document.createElement('p');
  p.append(...cell.childNodes);
  return [p];
}

export default function decorate(block) {
  const grid = el('div', 'stats-grid');

  const prev = block.parentElement && block.parentElement.previousElementSibling;
  if (prev && prev.classList.contains('default-content-wrapper')) {
    const intro = el('div', 'stats-item stats-intro');
    [...prev.children].forEach((node) => {
      if (/^H[1-6]$/.test(node.tagName)) intro.append(wrapNode(node, 'stats-title'));
      else intro.append(wrapNode(node, 'stats-text'));
    });
    prev.remove();
    grid.append(intro);
  }

  [...block.children].forEach((row) => {
    const nodes = [...row.children].flatMap(cellNodes);
    if (!nodes.length) return;
    const item = el('div', 'stats-item');
    const [num, ...labels] = nodes;
    item.append(wrapNode(num, 'num'));
    if (labels.length) {
      const lab = el('div', 'lab');
      lab.append(...labels);
      item.append(lab);
    }
    grid.append(item);
  });

  const stripe = el('div', 'stats-stripe');
  stripe.setAttribute('aria-hidden', 'true');
  block.replaceChildren(stripe, grid);
}
