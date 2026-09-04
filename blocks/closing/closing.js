/**
 * loads and decorates the closing block
 * @param {Element} block The closing block element
 */
export default async function decorate(block) {
  // Collect all row divs from the block
  const rows = [...block.querySelectorAll(':scope > div')];

  // Clear block content
  block.innerHTML = '';

  // Create wrap container for centered content
  const wrap = document.createElement('div');
  wrap.className = 'closing-wrap';

  // Create decorative circle at top
  const decorativeCircle = document.createElement('div');
  decorativeCircle.className = 'closing-circle';
  wrap.append(decorativeCircle);

  // Extract h2 and paragraphs from authored content
  let h2Element = null;
  const paragraphs = [];

  rows.forEach((row) => {
    const cell = row.querySelector('div');
    if (!cell) return;

    // Extract h2
    const h2 = cell.querySelector('h2');
    if (h2) {
      h2Element = h2.cloneNode(true);
      return;
    }

    // Extract paragraphs
    const p = cell.querySelector('p');
    if (p) {
      paragraphs.push(p.cloneNode(true));
    }
  });

  // Add h2 heading
  if (h2Element) {
    wrap.append(h2Element);
  }

  // Add paragraphs
  paragraphs.forEach((p) => {
    wrap.append(p);
  });

  // Create decorative divider line at bottom
  const divider = document.createElement('div');
  divider.className = 'closing-divider';
  wrap.append(divider);

  block.append(wrap);
}
