/**
 * Full-bleed photograph band with a soft scrim.
 * Authored shape: row 1 = the image; row 2 (optional) = a caption line.
 * Variant `captioned` swaps to the darker bottom scrim + shorter band.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const picture = block.querySelector('picture') || block.querySelector('img');
  const media = document.createElement('div');
  media.className = 'photo-band-media';
  if (picture) media.append(picture.closest('p') || picture);

  const scrim = document.createElement('div');
  scrim.className = 'photo-band-scrim';
  scrim.setAttribute('aria-hidden', 'true');

  const captionNodes = [...block.querySelectorAll(':scope > div > div')]
    .flatMap((cell) => [...cell.childNodes])
    .filter((n) => n.textContent.trim() && !n.querySelector?.('picture, img'));

  const children = [media, scrim];
  if (captionNodes.length) {
    const caption = document.createElement('div');
    caption.className = 'photo-band-caption';
    caption.append(...captionNodes);
    children.push(caption);
  }

  block.replaceChildren(...children);
}
