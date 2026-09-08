/**
 * image-band — a full-bleed editorial image with a soft gradient wash and an
 * OPTIONAL italic caption overlaid at the bottom.
 *
 * Authoring:
 *   1. image cell — a <picture>/<img> (editorial, authorable)
 *   2. (optional) caption cell — a <p>
 *
 * Variant class "caption" is added when a caption is present, switching the
 * gradient from a light top-wash to a dark bottom-wash. Authored nodes MOVED (EW1).
 */
export default async function decorate(block) {
  const media = block.querySelector('picture, img');
  const caption = [...block.querySelectorAll('p')].find((p) => p.textContent.trim());

  const frame = document.createElement('div');
  frame.className = 'image-band-frame';

  if (media) frame.append(media.closest('picture') || media);

  const wash = document.createElement('span');
  wash.className = 'image-band-wash';
  wash.setAttribute('aria-hidden', 'true');
  frame.append(wash);

  if (caption) {
    block.classList.add('caption');
    const cap = document.createElement('div');
    cap.className = 'image-band-caption';
    cap.append(caption);
    frame.append(cap);
  }

  // eager-load: these bands are large and can be the LCP element
  const img = frame.querySelector('img');
  if (img) {
    img.setAttribute('loading', 'eager');
    img.setAttribute('fetchpriority', 'high');
  }

  block.replaceChildren(frame);
}
