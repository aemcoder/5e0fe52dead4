/**
 * pull-quote — centred quotation on the deep-green band.
 *
 * Authoring:
 *   row 1 — the quotation, authored as a <blockquote> (a plain paragraph works too)
 *   row 2 — the attribution line ("— Epictetus")
 *
 * The oversized opening quote mark is decorative and generated here.
 */

/**
 * Collect authored elements from the block, cell by cell, recovering the
 * shapes the runtime's wrapTextNodes() and DA's flattening produce.
 * @param {Element} block the block element
 * @returns {Element[]} authored elements in document order
 */
function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    let kids = [...cell.children];
    // the runtime folds a <blockquote> cell into a wrapper <p> (blockquote is
    // not a valid wrapper tag) — expand it so the quotation keeps its element
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].querySelector('blockquote')) {
      kids = [...kids[0].children];
    }
    if (kids.length) {
      out.push(...kids);
    } else if (cell.textContent.trim()) {
      // harness-only: DA always delivers a <p> in every cell
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out.length ? out : [...block.children];
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const nodes = collectNodes(block).filter((n) => n.textContent.trim());
  const quote = nodes.find((n) => n.matches && n.matches('blockquote')) || nodes[0];
  const attribution = nodes.find((n) => n !== quote);

  const inner = document.createElement('div');
  inner.className = 'pull-quote-inner';

  const mark = document.createElement('div');
  mark.className = 'pull-quote-mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.textContent = '"';
  inner.append(mark);

  if (quote) {
    const wrapper = document.createElement('div');
    wrapper.className = 'pull-quote-text';
    wrapper.append(quote);
    inner.append(wrapper);
  }

  if (attribution) {
    const wrapper = document.createElement('div');
    wrapper.className = 'pull-quote-attribution';
    wrapper.append(attribution);
    inner.append(wrapper);
  }

  block.replaceChildren(inner);
}
