/**
 * split — two-column band (text + image) on a tinted "sand" ground. Used for the
 * "Frugality is not deprivation" misconception section.
 *
 * Authoring — one row, two cells:
 *   cell 1 (text):  <p>eyebrow</p> <h2>heading</h2> <p>body…</p> …
 *   cell 2 (media): <picture>/<img>
 *
 * Authored elements are MOVED (never rebuilt). The eyebrow (first paragraph
 * before the heading) is wrapped so it can be styled without a class on the
 * authored element. A decorative offset frame is generated behind the image.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default async function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const mediaCell = cells.find((c) => c.querySelector('picture, img'));
  const textCell = cells.find((c) => c !== mediaCell) || cells[0];

  const grid = document.createElement('div');
  grid.className = 'split-grid';

  // text column
  const textCol = document.createElement('div');
  textCol.className = 'split-text';
  if (textCell) {
    const heading = textCell.querySelector('h1,h2,h3,h4,h5,h6');
    [...textCell.children].forEach((el) => {
      // eslint-disable-next-line no-bitwise
      const beforeHeading = heading
        && (heading.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING);
      if (el.tagName === 'P' && beforeHeading) {
        textCol.append(wrapNode(el, 'split-eyebrow'));
      } else {
        textCol.append(el);
      }
    });
  }
  grid.append(textCol);

  // media column
  if (mediaCell) {
    const media = mediaCell.querySelector('picture, img');
    const mediaCol = document.createElement('div');
    mediaCol.className = 'split-media';
    if (media) mediaCol.append(media.tagName === 'PICTURE' ? media : wrapNode(media, 'split-img'));
    const frame = document.createElement('span');
    frame.className = 'split-frame';
    frame.setAttribute('aria-hidden', 'true');
    mediaCol.append(frame);
    grid.append(mediaCol);
  }

  block.replaceChildren(grid);
}
