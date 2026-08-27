/**
 * Image Band — full-width image with gradient overlay
 *
 * Authoring (single cell):
 *   <picture>/<img> — the full-bleed image
 */
export default async function decorate(block) {
  const img = block.querySelector('picture, img');
  if (!img) return;

  const wrap = document.createElement('div');
  wrap.className = 'image-band-wrap';

  const media = document.createElement('div');
  media.className = 'image-band-media';
  media.append(img);

  const overlay = document.createElement('div');
  overlay.className = 'image-band-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  wrap.append(media, overlay);
  block.replaceChildren(wrap);
}
