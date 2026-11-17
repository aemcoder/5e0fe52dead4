/**
 * quote — full-bleed forest band with a large decorative quotation mark,
 * an italic pull quote and a small-caps attribution.
 * Mirrors the Block Collection "quote" content model.
 *
 * Authoring rows:
 *   1. quotation (one or more paragraphs)
 *   2. attribution (optional), e.g. "— Epictetus"
 */
export default async function decorate(block) {
  const rows = [...block.children];
  const [quoteRow, attrRow] = rows;

  const inner = document.createElement('div');
  inner.className = 'quote-inner';

  const mark = document.createElement('div');
  mark.className = 'quote-mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.textContent = '"';
  inner.append(mark);

  const blockquote = document.createElement('blockquote');
  blockquote.className = 'quote-quotation';
  const quoteCell = quoteRow?.firstElementChild;
  if (quoteCell) blockquote.append(...quoteCell.childNodes);
  inner.append(blockquote);

  const attrCell = attrRow?.firstElementChild;
  if (attrCell && attrCell.textContent.trim()) {
    const attribution = document.createElement('div');
    attribution.className = 'quote-attribution';
    attribution.append(...attrCell.childNodes);
    inner.append(attribution);
  }

  block.replaceChildren(inner);
}
