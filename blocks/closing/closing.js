/**
 * closing — the final dark band that lands the argument.
 *
 * Schema roles (single cell):
 *   heading  <h2>  the closing statement (an <em> carries the accent word)
 *   body     <p>   the closing paragraph
 *
 * The ringed dot above the heading and the hairline rule below it are
 * presentation and are generated here.
 */

/**
 * Wraps an authored element in a generated element carrying the layout class.
 * @param {Element} node the authored element
 * @param {string} className the layout class for the wrapper
 * @returns {Element} the wrapper
 */
function wrapNode(node, className) {
  const wrapper = document.createElement('div');
  wrapper.className = className;
  wrapper.append(node);
  return wrapper;
}

/**
 * Collects the authored elements of a block regardless of how the delivery
 * pipeline distributed them across rows and cells.
 * @param {Element} block the block element
 * @returns {Element[]} the authored elements, in document order
 */
function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length) {
      out.push(...kids);
    } else if (cell.textContent.trim()) {
      // harness-only fallback: an unwrapped text cell
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
  const nodes = collectNodes(block);
  if (!nodes.length) return;

  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));

  const inner = document.createElement('div');
  inner.className = 'closing-inner';

  const mark = document.createElement('span');
  mark.className = 'closing-mark';
  mark.setAttribute('aria-hidden', 'true');
  const dot = document.createElement('span');
  dot.className = 'closing-dot';
  mark.append(dot);
  inner.append(mark);

  if (heading) inner.append(wrapNode(heading, 'closing-heading'));

  const body = document.createElement('div');
  body.className = 'closing-body';
  nodes.filter((node) => node !== heading).forEach((node) => body.append(node));
  if (body.childElementCount) inner.append(body);

  const rule = document.createElement('span');
  rule.className = 'closing-rule';
  rule.setAttribute('aria-hidden', 'true');
  inner.append(rule);

  block.replaceChildren(inner);
}
