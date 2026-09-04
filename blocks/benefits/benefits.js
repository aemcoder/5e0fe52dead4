/**
 * loads and decorates the benefits block
 * @param {Element} block The benefits block element
 */
export default async function decorate(block) {
  // First, try to reabsorb default content (section head)
  let eyebrowText = '';
  let headingText = '';

  // Check for default content in the owning section
  const section = block.closest('.section');
  if (section) {
    const defaultWrapper = section.querySelector('.default-content-wrapper')
      || section.querySelector('.default-content');

    if (defaultWrapper) {
      const defaultParagraphs = [...defaultWrapper.querySelectorAll('p')];
      const defaultHeading = defaultWrapper.querySelector('h2');

      if (defaultParagraphs.length > 0) {
        eyebrowText = defaultParagraphs[0].textContent.trim();
      }

      if (defaultHeading) {
        headingText = defaultHeading.textContent.trim();
      }

      defaultWrapper.remove();
    }
  }

  // Collect card rows from the block
  const rows = [...block.querySelectorAll(':scope > div')];
  const cards = [];

  rows.forEach((row) => {
    const cell = row.querySelector('div');
    if (!cell) return;

    const h3 = cell.querySelector('h3');
    const p = cell.querySelector('p');

    if (h3 || p) {
      cards.push({
        title: h3?.textContent.trim() || '',
        body: p?.textContent.trim() || '',
      });
    }
  });

  // Clear block content
  block.innerHTML = '';

  // Create wrap container
  const wrap = document.createElement('div');
  wrap.className = 'benefits-wrap';

  // Add section heading if available
  if (eyebrowText || headingText) {
    const headingSection = document.createElement('div');
    headingSection.className = 'benefits-heading';

    if (eyebrowText) {
      const eyebrow = document.createElement('p');
      eyebrow.className = 'benefits-eyebrow';
      eyebrow.textContent = eyebrowText;
      headingSection.append(eyebrow);
    }

    if (headingText) {
      const heading = document.createElement('h2');
      heading.className = 'benefits-title';
      heading.textContent = headingText;
      headingSection.append(heading);
    }

    wrap.append(headingSection);
  }

  // Create grid container
  const grid = document.createElement('div');
  grid.className = 'benefits-grid';

  // Build numbered cards
  cards.forEach((card, index) => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'benefits-card';

    // Card number
    const number = document.createElement('div');
    number.className = 'benefits-number';
    number.textContent = String(index + 1).padStart(2, '0');
    cardDiv.append(number);

    // Card title
    if (card.title) {
      const title = document.createElement('h3');
      title.className = 'benefits-card-title';
      title.textContent = card.title;
      cardDiv.append(title);
    }

    // Decorative line
    const line = document.createElement('div');
    line.className = 'benefits-card-line';
    cardDiv.append(line);

    // Card body text
    if (card.body) {
      const bodyText = document.createElement('p');
      bodyText.className = 'benefits-card-body';
      bodyText.textContent = card.body;
      cardDiv.append(bodyText);
    }

    grid.append(cardDiv);
  });

  wrap.append(grid);
  block.append(wrap);
}
