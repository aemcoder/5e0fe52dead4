/**
 * Locations — yellow CTA band: copy + branch-city chips.
 *
 * Authoring:
 *   Section default content BEFORE the block (reabsorbed as the copy column, EW8):
 *     <p>eyebrow</p> <h2>title</h2> <p>body</p>
 *     <p><em><strong><a>Find Your Nearest Branch</a></strong></em></p>  (dark button)
 *   Block: one cell holding a <ul> of cities (one row per city also works).
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

export default function decorate(block) {
  const copy = el('div', 'loc-copy');
  const prev = block.parentElement && block.parentElement.previousElementSibling;
  if (prev && prev.classList.contains('default-content-wrapper')) {
    const nodes = [...prev.children];
    const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
    const hIndex = heading ? nodes.indexOf(heading) : -1;
    const actions = el('div', 'actions');
    nodes.forEach((node, i) => {
      if (node === heading) copy.append(wrapNode(node, 'loc-title'));
      else if (node.querySelector('a[href]')) actions.append(node);
      else if (i < hIndex) copy.append(wrapNode(node, 'eyebrow loc-eyebrow'));
      else copy.append(wrapNode(node, 'loc-body'));
    });
    if (actions.children.length) copy.append(actions);
    prev.remove();
  }

  const cities = el('div', 'city-grid');
  const lists = [...block.querySelectorAll('ul, ol')];
  if (lists.length) {
    cities.append(...lists);
  } else {
    // one city per row → gather the rows' paragraphs into the chip grid
    [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
      if (cell.children.length) cities.append(...cell.children);
      else if (cell.textContent.trim()) {
        // HARNESS-ONLY fallback (EW5): bare text cell; move the text nodes.
        const p = document.createElement('p');
        p.append(...cell.childNodes);
        cities.append(p);
      }
    });
  }

  block.replaceChildren(...(copy.children.length ? [copy, cities] : [cities]));
}
