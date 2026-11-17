/**
 * image-band — full-bleed photograph with a soft scrim and an optional overlaid caption.
 *
 * Authoring rows:
 *   1. the image (<picture>/<img> with alt text)
 *   2. caption paragraph (optional) — rendered italic over a dark scrim at the bottom
 * Without a caption the band uses a light top-wash scrim.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default function decorate(block) {
  const picture = block.querySelector('picture') || block.querySelector('img');
  const captions = [...block.querySelectorAll('p')].filter(
    (p) => !p.querySelector('picture, img') && p.textContent.trim(),
  );
  // the media paragraph (pipeline wraps <picture> in a <p>) moves whole
  const mediaNode = picture ? (picture.closest('p') || picture) : null;

  const parts = [];
  if (mediaNode) parts.push(wrapNode(mediaNode, 'media'));
  const scrim = document.createElement('div');
  scrim.className = 'scrim';
  scrim.setAttribute('aria-hidden', 'true');
  parts.push(scrim);
  if (captions.length) {
    const caption = document.createElement('div');
    caption.className = 'caption';
    caption.append(...captions);
    parts.push(caption);
    block.classList.add('has-caption');
  }
  block.replaceChildren(...parts);
}
