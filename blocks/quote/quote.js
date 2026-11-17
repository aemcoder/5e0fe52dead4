/**
 * quote — full-width forest band with a centered pull quote (Block Collection
 * "quote" shape).
 * Decode tier: template-slotted; authored paragraphs are MOVED, never rebuilt.
 *
 * Authoring rows:
 *   1. quotation — one or more paragraphs
 *   2. attribution — e.g. "— Epictetus" (optional)
 * Single-cell fallback: the LAST paragraph is the attribution when it starts
 * with a dash.
 * The large opening quote mark is generated decoration (aria-hidden).
 */
export default function decorate(block) {
  const rows = [...block.children];
  const quoteRow = rows[0];
  const attributionRow = rows[1];

  const quoteNodes = quoteRow ? [...quoteRow.querySelectorAll(':scope > div > *')] : [];
  let attributionNodes = attributionRow ? [...attributionRow.querySelectorAll(':scope > div > *')] : [];

  if (!attributionNodes.length && quoteNodes.length > 1) {
    const last = quoteNodes[quoteNodes.length - 1];
    if (/^\s*[—–-]/.test(last.textContent)) attributionNodes = [quoteNodes.pop()];
  }

  const inner = document.createElement('div');
  inner.className = 'quote-inner';

  const mark = document.createElement('div');
  mark.className = 'quote-mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.textContent = '"';
  inner.append(mark);

  const figure = document.createElement('figure');
  const quotation = document.createElement('blockquote');
  quotation.className = 'quote-quotation';
  quotation.append(...quoteNodes);
  figure.append(quotation);

  if (attributionNodes.length) {
    const caption = document.createElement('figcaption');
    caption.className = 'quote-attribution';
    caption.append(...attributionNodes);
    figure.append(caption);
  }
  inner.append(figure);

  block.replaceChildren(inner);
}
