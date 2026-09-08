/**
 * feature — two-column band: prose (eyebrow, heading, paragraphs) beside an
 * image with a decorative offset frame ("Frugality is not deprivation").
 *
 * Authoring: two cells — a text cell (eyebrow <p>, <h2>, body <p>s) and a media
 * cell (<img>). Decoded by role so a flattened single cell also works. The
 * eyebrow (link-free <p> before the heading) rides its own wrapper; every
 * authored node is MOVED (EW1), layout classes ride wrappers (EW2).
 */
export default async function decorate(block) {
  const media = block.querySelector('picture, img');
  const heading = block.querySelector('h2, h3');
  const paragraphs = [...block.querySelectorAll('p')];

  const grid = document.createElement('div');
  grid.className = 'feature-grid';

  const textCol = document.createElement('div');
  textCol.className = 'feature-text';

  const eyebrow = heading
    && paragraphs.find((p) => heading.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_PRECEDING);
  if (eyebrow) {
    const w = document.createElement('div');
    w.className = 'feature-eyebrow';
    w.append(eyebrow);
    textCol.append(w);
  }
  if (heading) textCol.append(heading);
  paragraphs
    .filter((p) => p !== eyebrow)
    .filter((p) => heading
      ? heading.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING
      : true)
    .forEach((p) => textCol.append(p));

  grid.append(textCol);

  if (media) {
    const mediaCol = document.createElement('div');
    mediaCol.className = 'feature-media';
    mediaCol.append(media.closest('picture') || media);
    grid.append(mediaCol);
  }

  block.replaceChildren(grid);
}
