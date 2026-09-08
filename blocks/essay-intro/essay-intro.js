/**
 * essay-intro — the narrow prose opener that follows the hero.
 *
 * Authoring: one row per paragraph. The first paragraph is the serif lead
 * ("We live in an age of relentless accumulation…"); every paragraph after it
 * is body copy. Authors add or remove paragraphs freely.
 *
 * Kept as a block rather than a styled default-content section because this
 * runtime's aem.js does not consume section-metadata client side.
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
    const kids = [...cell.children];
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

  const inner = document.createElement('div');
  inner.className = 'essay-intro-inner';

  nodes.forEach((node, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = index === 0 ? 'essay-intro-lead' : 'essay-intro-body';
    wrapper.append(node);
    inner.append(wrapper);
  });

  block.replaceChildren(inner);
}
