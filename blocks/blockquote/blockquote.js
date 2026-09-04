/**
 * blockquote — centered quote section with forest green background
 *
 * Authoring rows:
 *   1. Quote text
 *   2. Attribution (author name)
 *
 * @param {Element} block The blockquote block element
 */
export default async function decorate(block) {
  // Collect all text content from cells (handle bare text and <p>)
  const textNodes = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const p = cell.querySelector('p');
    const text = p ? p.textContent.trim() : cell.textContent.trim();
    if (text) textNodes.push(text);
  });

  // Clear block content
  block.innerHTML = '';

  // Create wrap container
  const wrap = document.createElement('div');
  wrap.className = 'blockquote-wrap';

  // Create decorative quote mark
  const quoteMark = document.createElement('div');
  quoteMark.className = 'blockquote-quote-mark';
  quoteMark.textContent = '"';
  wrap.append(quoteMark);

  // Create blockquote element with the quote text
  const blockquoteEl = document.createElement('blockquote');
  blockquoteEl.className = 'blockquote-text';
  blockquoteEl.textContent = textNodes[0] || '';
  wrap.append(blockquoteEl);

  // Create attribution paragraph
  if (textNodes[1]) {
    const attribution = document.createElement('p');
    attribution.className = 'blockquote-attribution';
    let attrText = textNodes[1];
    // Prepend em-dash if not already there
    if (!attrText.startsWith('—') && !attrText.startsWith('&#8212;')) {
      attrText = `— ${attrText}`;
    }
    attribution.textContent = attrText;
    wrap.append(attribution);
  }

  block.append(wrap);
}
