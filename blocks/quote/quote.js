/**
 * quote — centred pull quote on a forest band with an oversized quote glyph.
 *
 * Authoring rows:
 *   1. the quotation (paragraph)
 *   2. attribution (optional) — e.g. "— Epictetus"
 * The glyph is CSS (::before); decorate() adds no words.
 */

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  const [quoteRow, ...rest] = rows;

  const figure = document.createElement('figure');
  const blockquote = document.createElement('blockquote');
  const quoteCell = quoteRow.firstElementChild || quoteRow;
  blockquote.append(...quoteCell.childNodes);
  figure.append(blockquote);

  const attribution = rest.map((r) => r.firstElementChild || r).filter((c) => c.textContent.trim());
  if (attribution.length) {
    const cite = document.createElement('figcaption');
    attribution.forEach((cell) => cite.append(...cell.childNodes));
    figure.append(cite);
  }
  block.replaceChildren(figure);
}
