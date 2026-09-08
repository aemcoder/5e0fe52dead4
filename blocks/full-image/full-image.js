/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const isCaption = block.classList.contains('caption');

  const wrap = document.createElement('div');
  wrap.className = 'full-image-wrap';

  // Find media
  const media = block.querySelector('picture, img');
  if (media) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'full-image-media';
    const pic = media.closest('picture') || media;
    imgWrap.append(pic);
    wrap.append(imgWrap);
  }

  // Gradient overlay
  const overlay = document.createElement('div');
  overlay.className = 'full-image-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  wrap.append(overlay);

  // Caption text
  if (isCaption) {
    const allPs = [...block.querySelectorAll('p')];
    const captionP = allPs.find(p => !p.querySelector('picture, img') && p.textContent.trim());
    if (captionP) {
      const captionWrap = document.createElement('div');
      captionWrap.className = 'full-image-caption';
      captionWrap.append(captionP);
      wrap.append(captionWrap);
    }
  }

  block.replaceChildren(wrap);
}
