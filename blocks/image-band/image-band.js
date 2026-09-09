/**
 * image-band — full-bleed editorial image, optionally with an overlaid caption.
 *
 * Variants: (default) plain image band; `caption` adds a gradient scrim + an
 * overlaid italic caption line.
 *
 * Authoring (one cell):
 *   <picture>/<img>          — the editorial image
 *   <p>caption</p>           — optional; presence implies the caption treatment
 *
 * The authored <picture> and caption <p> are MOVED (never rebuilt).
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default async function decorate(block) {
  const cell = block.querySelector(':scope > div > div') || block;
  const media = cell.querySelector('picture, img');
  const caption = cell.querySelector('p');

  const figure = document.createElement('div');
  figure.className = 'image-band-figure';

  if (media) {
    const wrap = media.tagName === 'PICTURE' ? media : wrapNode(media, 'image-band-img');
    figure.append(wrap);
    const img = figure.querySelector('img');
    if (img) img.loading = 'lazy';
  }

  const scrim = document.createElement('span');
  scrim.className = 'image-band-scrim';
  scrim.setAttribute('aria-hidden', 'true');
  figure.append(scrim);

  if (caption) {
    block.classList.add('caption');
    figure.append(wrapNode(caption, 'image-band-caption'));
  }

  block.replaceChildren(figure);
}
