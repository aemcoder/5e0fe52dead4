/**
 * split — two-column prose + image band ("Frugality is not deprivation").
 *
 * Authoring: one row, two cells:
 *   cell 1 (text)  — eyebrow <p>, <h2>, then body paragraphs
 *   cell 2 (media) — an editorial <img>/<picture>
 *
 * The offset decorative frame behind the image is generated, not authored.
 */
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default async function decorate(block) {
  const heading = block.querySelector('h2, h3, h4');
  const media = block.querySelector('picture, img');
  const ps = [...block.querySelectorAll('p')].filter((p) => !p.querySelector('picture, img'));

  let eyebrow = null;
  const body = [];
  ps.forEach((p) => {
    // eslint-disable-next-line no-bitwise
    const precedesHeading = heading
      && (heading.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_PRECEDING);
    if (precedesHeading && !eyebrow) eyebrow = p;
    else body.push(p);
  });

  const grid = document.createElement('div');
  grid.className = 'split-grid';

  const textCol = document.createElement('div');
  textCol.className = 'split-text';
  if (eyebrow) textCol.append(wrapNode(eyebrow, 'split-eyebrow'));
  if (heading) textCol.append(wrapNode(heading, 'split-heading'));
  if (body.length) {
    const bodyWrap = document.createElement('div');
    bodyWrap.className = 'split-body';
    bodyWrap.append(...body);
    textCol.append(bodyWrap);
  }
  grid.append(textCol);

  if (media) {
    const mediaCol = document.createElement('div');
    mediaCol.className = 'split-media';
    mediaCol.append(media.closest('p') || media);
    const frame = document.createElement('div');
    frame.className = 'split-frame';
    frame.setAttribute('aria-hidden', 'true');
    mediaCol.append(frame);
    grid.append(mediaCol);
  }

  block.replaceChildren(grid);
}
