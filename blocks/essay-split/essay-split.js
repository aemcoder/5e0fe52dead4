/**
 * essay-split — the two-up band that sets an argument beside a photograph.
 *
 * Authoring: one row, two cells.
 *   cell 1 — eyebrow, heading (<h2>) and the body paragraphs
 *   cell 2 — the photograph
 *
 * Decode is content-driven: whichever cell carries the image is the media
 * column, the rest is prose. Inside the prose column the heading is found by
 * query, text buffered BEFORE it is the eyebrow and everything after it is body
 * copy (#76). Authored elements are MOVED into the generated columns (EW1/EW2).
 */

/**
 * Recovers the authored elements of one block cell, expanding the single <p>
 * the runtime's wrapTextNodes folds a media-led cell into (#104).
 * @param {Element} cell a block cell
 * @returns {Element[]} the authored elements of that cell
 */
function cellNodes(cell) {
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
  if (kids.length) return kids;
  if (cell.textContent.trim()) {
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    return [p];
  }
  return [];
}

const isMedia = (el) => el.matches('picture, img') || !!el.querySelector('picture, img');

export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const nodesByCell = cells.map(cellNodes);
  const flat = nodesByCell.flat();

  const media = flat.find(isMedia);
  const prose = flat.filter((n) => n !== media && n.textContent.trim());

  const grid = document.createElement('div');
  grid.className = 'essay-split-grid';

  const text = document.createElement('div');
  text.className = 'essay-split-text';

  const heading = prose.find((n) => /^H[1-6]$/.test(n.tagName));
  const headingIndex = heading ? prose.indexOf(heading) : prose.length;
  const eyebrow = prose.find((n, i) => n !== heading && i < headingIndex);

  if (eyebrow) {
    const kicker = document.createElement('div');
    kicker.className = 'essay-split-eyebrow';
    kicker.append(eyebrow);
    text.append(kicker);
  }
  if (heading) {
    const title = document.createElement('div');
    title.className = 'essay-split-title';
    title.append(heading);
    text.append(title);
  }

  const body = prose.filter((n) => n !== heading && n !== eyebrow);
  if (body.length) {
    const copy = document.createElement('div');
    copy.className = 'essay-split-copy';
    copy.append(...body);
    text.append(copy);
  }
  grid.append(text);

  if (media) {
    const figure = document.createElement('div');
    figure.className = 'essay-split-media';
    const img = media.matches('img') ? media : media.querySelector('img');
    if (img) img.loading = img.loading || 'lazy';
    figure.append(media);
    const frame = document.createElement('span');
    frame.className = 'essay-split-frame';
    frame.setAttribute('aria-hidden', 'true');
    figure.append(frame);
    grid.append(figure);
  }

  block.replaceChildren(grid);
}
