/**
 * feature-image — full-bleed editorial image band.
 *
 * Authoring (one cell):
 *   1. image   — an <img>/<picture> (editorial, authorable)
 *   2. caption — OPTIONAL paragraph overlaid on the image (bottom, centered)
 *
 * With a caption the band uses a darker bottom-up scrim (variant: has-caption).
 */
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default async function decorate(block) {
  const media = block.querySelector('picture, img');
  const caption = [...block.querySelectorAll('p')]
    .find((p) => !p.querySelector('picture, img') && p.textContent.trim());

  const figure = document.createElement('figure');
  figure.className = 'fi-figure';

  if (media) {
    const mediaEl = media.closest('p') || media;
    figure.append(wrapNode(mediaEl, 'fi-media'));
  }

  const scrim = document.createElement('div');
  scrim.className = 'fi-scrim';
  scrim.setAttribute('aria-hidden', 'true');
  figure.append(scrim);

  if (caption) {
    block.classList.add('has-caption');
    figure.append(wrapNode(caption, 'fi-caption'));
  }

  block.replaceChildren(figure);
}
