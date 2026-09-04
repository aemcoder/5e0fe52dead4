/**
 * loads and decorates the anchors block
 * @param {Element} block The anchors block element
 */
export default async function decorate(block) {
  // Try to reabsorb default content (section head) from the owning section
  let eyebrowText = '';
  let headingElement = null;

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
        headingElement = defaultHeading.cloneNode(true);
      }

      defaultWrapper.remove();
    }
  }

  // Collect item rows from the block
  const rows = [...block.querySelectorAll(':scope > div')];
  const items = [];

  rows.forEach((row) => {
    const cell = row.querySelector('div');
    if (!cell) return;

    const h3 = cell.querySelector('h3');
    const p = cell.querySelector('p');

    if (h3 || p) {
      items.push({
        title: h3?.textContent.trim() || '',
        body: p?.textContent.trim() || '',
      });
    }
  });

  // Clear block content
  block.innerHTML = '';

  // Create wrap container
  const wrap = document.createElement('div');
  wrap.className = 'anchors-wrap';

  // Add section heading if available
  if (eyebrowText || headingElement) {
    const headingSection = document.createElement('div');
    headingSection.className = 'anchors-heading';

    if (eyebrowText) {
      const eyebrow = document.createElement('p');
      eyebrow.className = 'anchors-eyebrow';
      eyebrow.textContent = eyebrowText;
      headingSection.append(eyebrow);
    }

    if (headingElement) {
      headingElement.className = 'anchors-title';
      headingSection.append(headingElement);
    }

    wrap.append(headingSection);
  }

  // Roman numerals array
  const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];

  // Create items list
  const itemsList = document.createElement('div');
  itemsList.className = 'anchors-items';

  items.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'anchors-item';

    // Item number (roman numeral)
    const numeral = document.createElement('div');
    numeral.className = 'anchors-numeral';
    numeral.textContent = `${romanNumerals[index] || 'x'}.`;
    itemDiv.append(numeral);

    // Item content
    const content = document.createElement('div');
    content.className = 'anchors-content';

    // Item title
    if (item.title) {
      const title = document.createElement('h3');
      title.className = 'anchors-item-title';
      title.textContent = item.title;
      content.append(title);
    }

    // Item body text
    if (item.body) {
      const bodyText = document.createElement('p');
      bodyText.className = 'anchors-item-body';
      bodyText.textContent = item.body;
      content.append(bodyText);
    }

    itemDiv.append(content);
    itemsList.append(itemDiv);
  });

  wrap.append(itemsList);
  block.append(wrap);
}
