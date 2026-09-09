/**
 * split-feature — a two-column band pairing an argument with a photograph.
 *
 * Schema roles (one row, two cells):
 *   cell 1 — eyebrow <p>, heading <h2>, body <p> × n
 *   cell 2 — media   <picture>/<img>
 *
 * The offset frame behind the photograph is presentation and is generated here.
 * Cell order is not assumed: whichever cell carries the media becomes the media
 * column, so an author swapping the cells still gets a correct render.
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
 * Collects the authored elements of a cell, expanding the wrapper paragraph
 * the runtime folds media-led mixed cells into.
 * @param {Element} cell the block cell
 * @returns {Element[]} the authored elements
 */
function cellNodes(cell) {
  let kids = [...cell.children];
  if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
    && kids[0].querySelector('picture, img')) {
    kids = [...kids[0].childNodes].map((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) return node;
      if (node.textContent.trim()) {
        const p = document.createElement('p');
        p.append(node);
        return p;
      }
      return null;
    }).filter(Boolean);
  }
  if (kids.length) return kids;
  if (cell.textContent.trim()) {
    // harness-only fallback: an unwrapped text cell
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    return [p];
  }
  return [];
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  if (!cells.length) return;

  const groups = cells.map((cell) => cellNodes(cell)).filter((nodes) => nodes.length);
  const hasMedia = (nodes) => nodes.some((n) => n.matches('picture, img') || n.querySelector('picture, img'));

  const mediaNodes = groups.find(hasMedia) || [];
  const textNodes = groups.filter((nodes) => nodes !== mediaNodes).flat();

  const inner = document.createElement('div');
  inner.className = 'split-feature-inner';

  // --- text column ---
  const text = document.createElement('div');
  text.className = 'split-feature-text';

  const headingIndex = textNodes.findIndex((n) => /^H[1-6]$/.test(n.tagName));
  const heading = headingIndex >= 0 ? textNodes[headingIndex] : null;

  const body = document.createElement('div');
  body.className = 'split-feature-body';

  textNodes.forEach((node, i) => {
    if (node === heading) return;
    if (heading && i < headingIndex && !text.querySelector('.split-feature-eyebrow')) {
      text.append(wrapNode(node, 'split-feature-eyebrow'));
      return;
    }
    body.append(node);
  });

  if (heading) {
    const headingWrap = wrapNode(heading, 'split-feature-heading');
    const eyebrow = text.querySelector('.split-feature-eyebrow');
    if (eyebrow) eyebrow.after(headingWrap);
    else text.prepend(headingWrap);
  }
  if (body.childElementCount) text.append(body);
  if (text.childElementCount) inner.append(text);

  // --- media column ---
  const mediaHost = mediaNodes.find((n) => n.matches('picture, img') || n.querySelector('picture, img'));
  const media = mediaHost && (mediaHost.matches('picture, img') ? mediaHost : mediaHost.querySelector('picture, img'));
  if (media) {
    const mediaWrap = wrapNode(media, 'split-feature-media');
    const frame = document.createElement('span');
    frame.className = 'split-feature-frame';
    frame.setAttribute('aria-hidden', 'true');
    mediaWrap.append(frame);
    inner.append(mediaWrap);
  }

  block.replaceChildren(inner);
}
