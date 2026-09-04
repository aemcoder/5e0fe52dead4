/**
 * loads and decorates the image-quote block
 * @param {Element} block The image-quote block element
 */
export default async function decorate(block) {
  // Collect all row divs from the block
  const rows = [...block.querySelectorAll(':scope > div')];

  // Clear block content
  block.innerHTML = '';

  // Create image background wrapper
  const imageBg = document.createElement('div');
  imageBg.className = 'image-quote-bg';

  // Find the image (picture or img element)
  let imageElement = null;
  let textContent = null;

  rows.forEach((row) => {
    const cell = row.querySelector('div');
    if (!cell) return;

    // Check for image
    const picture = cell.querySelector('picture');
    const img = cell.querySelector('img');
    if (picture || img) {
      imageElement = picture || img;
    }

    // Check for text content (em or p tags)
    const emTag = cell.querySelector('em');
    const pTag = cell.querySelector('p');
    if (emTag) {
      textContent = emTag.cloneNode(true);
    } else if (pTag && !picture && !img) {
      textContent = pTag.cloneNode(true);
    }
  });

  // Add image to background wrapper
  if (imageElement) {
    const imgClone = imageElement.cloneNode(true);
    imageBg.append(imgClone);
  }

  // Create overlay gradient
  const overlay = document.createElement('div');
  overlay.className = 'image-quote-overlay';
  imageBg.append(overlay);

  // Add text overlay at bottom
  if (textContent) {
    const captionWrapper = document.createElement('div');
    captionWrapper.className = 'image-quote-text';
    captionWrapper.append(textContent);
    imageBg.append(captionWrapper);
  }

  block.append(imageBg);
}
