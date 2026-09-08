/**
 * quote — centered pull-quote on a deep-green ground (block-collection "quote").
 *
 * Authoring: one cell holding a <blockquote> and an attribution <p>.
 * The large decorative quotation mark is CSS. Authored nodes are MOVED (EW1);
 * layout classes ride generated wrappers (EW2).
 */
export default async function decorate(block) {
  const quote = block.querySelector('blockquote');
  const attribution = [...block.querySelectorAll('p')].find((p) => p.textContent.trim());

  const inner = document.createElement('div');
  inner.className = 'quote-inner';

  const mark = document.createElement('span');
  mark.className = 'quote-mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.textContent = '“';
  inner.append(mark);

  if (quote) inner.append(quote);
  if (attribution) {
    const cite = document.createElement('div');
    cite.className = 'quote-cite';
    cite.append(attribution);
    inner.append(cite);
  }

  block.replaceChildren(inner);
}
