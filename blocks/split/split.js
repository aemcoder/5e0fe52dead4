/**
 * split — two-column prose + image band on a tinted ground
 *
 * Authoring (one row, two cells):
 *   cell 1 (text): eyebrow <p>, <h2>, body <p>s
 *   cell 2 (media): <img> / <picture>
 *
 * The offset decorative square behind the image is drawn in CSS.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default async function decorate(block) {
  const row = block.querySelector(':scope > div') || block;
  const cells = [...row.children];
  const mediaCell = cells.find((c) => c.querySelector('picture, img'));
  const textCell = cells.find((c) => c !== mediaCell) || cells[0];

  const inner = document.createElement('div');
  inner.className = 'split-inner';

  const textCol = document.createElement('div');
  textCol.className = 'split-text';
  if (textCell) {
    const heading = textCell.querySelector('h1, h2, h3, h4, h5, h6');
    [...textCell.children].forEach((el) => {
      if (el.matches('h1, h2, h3, h4, h5, h6')) {
        textCol.append(wrapNode(el, 'split-title'));
      } else if (heading
        // eslint-disable-next-line no-bitwise
        && (heading.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING)) {
        textCol.append(wrapNode(el, 'split-eyebrow'));
      } else {
        textCol.append(wrapNode(el, 'split-body'));
      }
    });
  }
  inner.append(textCol);

  const media = mediaCell && mediaCell.querySelector('picture, img');
  if (media) {
    const mediaCol = document.createElement('div');
    mediaCol.className = 'split-media';
    mediaCol.append(media);
    const deco = document.createElement('div');
    deco.className = 'split-deco';
    deco.setAttribute('aria-hidden', 'true');
    mediaCol.append(deco);
    inner.append(mediaCol);
  }

  block.replaceChildren(inner);
}
