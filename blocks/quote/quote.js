/**
 * Pull quote band.
 * Authored shape: row 1 = the quotation, row 2 (optional) = the attribution.
 * Authored paragraphs are moved into <blockquote> / <figcaption>; the large
 * quotation mark is drawn by CSS.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const [quoteRow, ...rest] = [...block.children];
  const figure = document.createElement('figure');
  const quote = document.createElement('blockquote');
  const quoteCell = quoteRow?.firstElementChild;
  if (quoteCell) quote.append(...quoteCell.childNodes);
  figure.append(quote);

  const captionNodes = rest.flatMap((row) => [...row.querySelectorAll(':scope > div')])
    .flatMap((cell) => [...cell.childNodes]);
  if (captionNodes.some((n) => n.textContent.trim())) {
    const caption = document.createElement('figcaption');
    caption.append(...captionNodes);
    figure.append(caption);
  }

  block.replaceChildren(figure);
}
