/**
 * loads and decorates the full-image block
 * @param {Element} block The full-image block element
 */
export default async function decorate(block) {
  // Collect all row divs from the block
  const rows = [...block.querySelectorAll(':scope > div')];

  // Clear block content
  block.innerHTML = '';

  // Create image container
  const imageContainer = document.createElement('div');
  imageContainer.className = 'full-image-container';

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

  // Add image to container
  if (imageElement) {
    const imgClone = imageElement.cloneNode(true);
    imageContainer.append(imgClone);
  }

  // Create overlay div
  const overlay = document.createElement('div');
  overlay.className = 'full-image-overlay';
  imageContainer.append(overlay);

  // Add optional text overlay
  if (textContent) {
    const captionWrapper = document.createElement('div');
    captionWrapper.className = 'full-image-text';
    captionWrapper.append(textContent);
    imageContainer.append(captionWrapper);
  }

  block.append(imageContainer);
}
