/**
 * loads and decorates the hero block
 * @param {Element} block The hero block element
 */
export default async function decorate(block) {
  // Collect text content from the authored structure
  const rows = [...block.querySelectorAll(':scope > div')];
  let h1Element = null;
  let eyebrowText = '';
  let ledeText = '';

  rows.forEach((row) => {
    const cell = row.querySelector('div');
    if (!cell) return;

    // Extract h1 and preserve em tag styling
    const heading = cell.querySelector('h1');
    if (heading) {
      h1Element = heading.cloneNode(true);
      return;
    }

    // Extract eyebrow text (second row, plain text)
    const plainText = cell.textContent.trim();
    if (!eyebrowText && plainText && !cell.querySelector('em')) {
      eyebrowText = plainText;
      return;
    }

    // Extract lede text (third row with em tag)
    const emTag = cell.querySelector('em');
    if (emTag) {
      ledeText = emTag.textContent.trim();
    }
  });

  // Clear block and build new structure
  block.innerHTML = '';

  // Create wrap container
  const wrap = document.createElement('div');
  wrap.className = 'hero-wrap';

  // Add decorative circles (created via CSS pseudo-elements)
  const circles = document.createElement('div');
  circles.className = 'hero-circles';
  wrap.append(circles);

  // Create content container
  const content = document.createElement('div');
  content.className = 'hero-content';

  // Eyebrow
  if (eyebrowText) {
    const eyebrow = document.createElement('div');
    eyebrow.className = 'hero-eyebrow';
    eyebrow.textContent = eyebrowText;
    content.append(eyebrow);
  }

  // H1 heading — em styling handled by CSS (.hero h1 em)
  if (h1Element) {
    content.append(h1Element);
  }

  // Divider line
  const divider = document.createElement('div');
  divider.className = 'hero-divider';
  content.append(divider);

  // Lede/subtitle
  if (ledeText) {
    const lede = document.createElement('p');
    lede.className = 'hero-lede';
    lede.textContent = ledeText;
    content.append(lede);
  }

  wrap.append(content);
  block.append(wrap);
}
