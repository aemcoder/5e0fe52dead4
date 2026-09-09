/**
 * split — a two-column band on the sand ground: prose on the left, an
 * editorial image with an offset frame on the right.
 *
 * Authoring rows (one row, two cells):
 *   cell 1 — eyebrow line, an <h2>, then the body paragraphs
 *   cell 2 — the image (an authored <picture>/<img> with alt text)
 *
 * Authored elements are MOVED into the generated columns, never rebuilt.
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
  const nodes = collectNodes(block);
  if (!nodes.length) return;

  const mediaNode = nodes.find((n) => n.matches('picture, img') || n.querySelector('picture, img'));
  const media = mediaNode
    && (mediaNode.matches('picture, img') ? mediaNode : mediaNode.querySelector('picture, img'));

  const text = document.createElement('div');
  text.className = 'split-text';

  let seenHeading = false;
  nodes.filter((n) => n !== mediaNode && n.textContent.trim()).forEach((node) => {
    if (/^H[1-6]$/.test(node.tagName)) {
      seenHeading = true;
      text.append(wrapNode(node, 'split-title'));
      return;
    }
    text.append(wrapNode(node, seenHeading ? 'split-body' : 'split-eyebrow'));
  });

  const wrap = document.createElement('div');
  wrap.className = 'split-wrap';
  wrap.append(text);

  if (media) {
    const figure = document.createElement('div');
    figure.className = 'split-media';
    figure.append(media);
    const frame = document.createElement('div');
    frame.className = 'split-frame';
    frame.setAttribute('aria-hidden', 'true');
    figure.append(frame);
    wrap.append(figure);
  }

  block.replaceChildren(wrap);
}
