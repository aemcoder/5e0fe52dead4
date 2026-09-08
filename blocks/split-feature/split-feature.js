/**
 * split-feature — a two-column prose/image band on the sand ground.
 *
 * Authoring (one row, two cells — the media cell may come first or last):
 *   cell A: <p>eyebrow</p><h2>heading</h2><p>body</p>… (the prose column)
 *   cell B: the image
 *
 * Roles are classified by content, never by cell index, and the authored
 * elements are moved into the layout wrappers.
 */

/**
 * Collects the authored elements of a cell, recovering the shapes the delivery
 * pipeline produces (a media-led cell folded into one <p>, a bare-text cell).
 * @param {Element} cell the block cell
 * @returns {Element[]} the authored elements in document order
 */
function cellNodes(cell) {
  let kids = [...cell.children];
  if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
    && kids[0].querySelector('picture, img')) {
    kids = [...kids[0].childNodes].map((n) => {
      if (n.nodeType === Node.ELEMENT_NODE) return n;
      if (n.textContent.trim()) {
        const p = document.createElement('p');
        p.append(n);
        return p;
      }
      return null;
    }).filter(Boolean);
  }
  if (kids.length) return kids;
  if (cell.textContent.trim()) {
    // harness-only: off-pipeline content can deliver a bare text cell
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    return [p];
  }
  return [];
}

/**
 * Wraps an AUTHORED element in a generated wrapper carrying the layout class.
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
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const nodes = [...block.querySelectorAll(':scope > div > div')]
    .flatMap((cell) => cellNodes(cell));
  if (!nodes.length) return;

  const mediaNode = nodes.find((n) => n.matches('picture, img') || n.querySelector('picture, img'));
  const media = mediaNode && (mediaNode.matches('picture, img')
    ? mediaNode
    : mediaNode.querySelector('picture, img'));

  const text = nodes.filter((n) => n !== mediaNode);
  const heading = text.find((n) => /^H[1-6]$/.test(n.tagName));
  const headingIndex = heading ? text.indexOf(heading) : -1;
  // an eyebrow is the short label that PRECEDES the heading
  const eyebrow = text.find((n, i) => n !== heading
    && n.textContent.trim()
    && (headingIndex === -1 ? false : i < headingIndex));
  const body = text.filter((n) => n !== heading && n !== eyebrow && n.textContent.trim());

  const inner = document.createElement('div');
  inner.className = 'split-feature-inner';

  const column = document.createElement('div');
  column.className = 'split-feature-text';
  if (eyebrow) column.append(wrapNode(eyebrow, 'split-feature-eyebrow'));
  if (heading) column.append(wrapNode(heading, 'split-feature-headline'));
  if (body.length) {
    const copy = document.createElement('div');
    copy.className = 'split-feature-body';
    body.forEach((n) => copy.append(n));
    column.append(copy);
  }
  inner.append(column);

  if (media) {
    const figure = document.createElement('div');
    figure.className = 'split-feature-media';
    figure.append(media);
    const frame = document.createElement('span');
    frame.className = 'split-feature-frame';
    frame.setAttribute('aria-hidden', 'true');
    figure.append(frame);
    inner.append(figure);
  }

  block.replaceChildren(inner);
}
