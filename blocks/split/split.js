/**
 * split — two-column text + image layout
 *
 * Authoring rows:
 *   1. eyebrow text (short line)
 *   2. h2 headline
 *   3. body paragraphs (may contain <strong> accents)
 *   4. image
 *
 * @param {Element} block The split block element
 */
export default async function decorate(block) {
  // Collect all nodes from cells (handles DA flattening)
  const nodes = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length) nodes.push(...kids);
    else if (cell.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = cell.textContent.trim();
      nodes.push(p);
    }
  });

  // Classify nodes
  let eyebrowText = '';
  let h2Element = null;
  const bodyParagraphs = [];
  let imageElement = null;

  let foundHeading = false;
  nodes.forEach((el) => {
    // Check for image
    const media = el.matches('picture, img') ? el : el.querySelector('picture, img');
    if (media && !imageElement) {
      imageElement = media;
      return;
    }

    // Check for h2
    if (el.matches('h1, h2, h3, h4, h5, h6') && !h2Element) {
      h2Element = el.cloneNode(true);
      foundHeading = true;
      return;
    }

    // Short text before the heading is the eyebrow
    const text = el.textContent.trim();
    if (!foundHeading && !eyebrowText && text && text.length < 60) {
      eyebrowText = text;
      return;
    }

    // Everything else after heading is body text
    if (foundHeading && text) {
      bodyParagraphs.push(el.cloneNode(true));
    }
  });

  // Clear block and build new structure
  block.innerHTML = '';

  // Create wrap container
  const wrap = document.createElement('div');
  wrap.className = 'split-wrap';

  // Create text column
  const textColumn = document.createElement('div');
  textColumn.className = 'split-text';

  // Add eyebrow
  if (eyebrowText) {
    const eyebrow = document.createElement('div');
    eyebrow.className = 'split-eyebrow';
    eyebrow.textContent = eyebrowText;
    textColumn.append(eyebrow);
  }

  // Add h2
  if (h2Element) {
    textColumn.append(h2Element);
  }

  // Add body paragraphs
  bodyParagraphs.forEach((p) => {
    textColumn.append(p);
  });

  wrap.append(textColumn);

  // Create media column
  const mediaColumn = document.createElement('div');
  mediaColumn.className = 'split-media';

  // Add image if present
  if (imageElement) {
    const imgClone = imageElement.cloneNode(true);
    mediaColumn.append(imgClone);

    // Add decorative accent box
    const accent = document.createElement('div');
    accent.className = 'split-accent';
    mediaColumn.append(accent);
  }

  wrap.append(mediaColumn);
  block.append(wrap);
}
