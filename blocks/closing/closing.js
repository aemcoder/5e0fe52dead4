/**
 * closing — the dark closing statement that ends the essay.
 *
 * Authoring:
 *   row 1 — the closing headline as <h2> (use <em> for the accented word)
 *   row 2 — the closing paragraph
 *
 * The ringed dot above the headline and the hairline below it are decorative
 * and generated here.
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
  const heading = nodes.find((n) => n.matches && n.matches('h1, h2, h3, h4, h5, h6'));

  const inner = document.createElement('div');
  inner.className = 'closing-inner';

  const ornament = document.createElement('div');
  ornament.className = 'closing-ornament';
  ornament.setAttribute('aria-hidden', 'true');
  ornament.append(document.createElement('span'));
  inner.append(ornament);

  if (heading) {
    const wrapper = document.createElement('div');
    wrapper.className = 'closing-headline';
    wrapper.append(heading);
    inner.append(wrapper);
  }

  const body = document.createElement('div');
  body.className = 'closing-body';
  nodes.filter((n) => n !== heading).forEach((n) => body.append(n));
  if (body.childElementCount) inner.append(body);

  const rule = document.createElement('div');
  rule.className = 'closing-rule';
  rule.setAttribute('aria-hidden', 'true');
  inner.append(rule);

  block.replaceChildren(inner);
}
