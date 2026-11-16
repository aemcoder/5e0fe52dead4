/**
 * Quote — a pull quote on a forest ground with an attribution line.
 * Authored shape: row 1 = the quotation, row 2 (optional) = attribution.
 * Authored paragraphs are moved, never rebuilt.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const [quoteRow, attributionRow] = [...block.children];
  const inner = document.createElement('div');
  inner.className = 'quote-inner';

  const quotation = document.createElement('blockquote');
  quotation.className = 'quote-quotation';
  const quoteCell = quoteRow?.firstElementChild;
  if (quoteCell) quotation.append(...quoteCell.childNodes);
  inner.append(quotation);

  const attributionCell = attributionRow?.firstElementChild;
  if (attributionCell && attributionCell.textContent.trim()) {
    const attribution = document.createElement('div');
    attribution.className = 'quote-attribution';
    attribution.append(...attributionCell.childNodes);
    inner.append(attribution);
  }

  block.replaceChildren(inner);
}
