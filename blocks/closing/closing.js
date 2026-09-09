/**
 * closing — the dark closing statement of the essay: a dot ornament, a large
 * serif statement, a closing paragraph and a short rule.
 *
 * Authoring rows:
 *   1. the statement — an <h2> (may carry <em> for the accent word)
 *   2. closing paragraph
 *   3. optional CTA paragraph — wrap the link in <strong> (primary) or <em>
 *      (secondary); decorateButtons() classes it before this block runs
 *
 * Authored elements are MOVED into the generated layout, never rebuilt.
 */

/**
 * Wraps an authored element in a generated container that carries the layout class.
 * @param {Element} node authored element (moved, never copied)
 * @param {string} className class for the generated wrapper
 * @returns {Element} the wrapper
 */
function wrapNode(node, className) {
  const wrapper = document.createElement('div');
  wrapper.className = className;
  wrapper.append(node);
  return wrapper;
}

/**
 * Collects the authored elements of a block, tolerating the DA-flattened
 * single-cell shape and the runtime's media-led <p> folding.
 * @param {Element} block the block element
 * @returns {Element[]} authored elements in document order
 */
function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    let kids = [...cell.children];
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
      && kids[0].querySelector('picture, img')) {
      kids = [...kids[0].childNodes].map((n) => {
        if (n.nodeType === 1) return n;
        if (n.textContent.trim()) {
          const p = document.createElement('p');
          p.append(n);
          return p;
        }
        return null;
      }).filter(Boolean);
    }
    if (kids.length) out.push(...kids);
    else if (cell.textContent.trim()) {
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
  if (!nodes.length) return;

  const wrap = document.createElement('div');
  wrap.className = 'closing-wrap';

  const dot = document.createElement('div');
  dot.className = 'closing-dot';
  dot.setAttribute('aria-hidden', 'true');
  dot.innerHTML = '<span></span>';
  wrap.append(dot);

  const actions = document.createElement('div');
  actions.className = 'closing-actions';

  nodes.forEach((node) => {
    if (/^H[1-6]$/.test(node.tagName)) {
      wrap.append(wrapNode(node, 'closing-title'));
      return;
    }
    if (node.querySelector('a[href]')) {
      // move the CTA paragraph — the editor index lives on the <p>
      actions.append(node);
      return;
    }
    wrap.append(wrapNode(node, 'closing-body'));
  });

  if (actions.childElementCount) wrap.append(actions);

  const rule = document.createElement('div');
  rule.className = 'closing-rule';
  rule.setAttribute('aria-hidden', 'true');
  wrap.append(rule);

  block.replaceChildren(wrap);
}
