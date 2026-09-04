/**
 * quote — centered pull-quote band on a green ground
 *
 * Authoring (one cell):
 *   1. <blockquote> — the quotation
 *   2. attribution paragraph — e.g. "— Epictetus"
 *
 * The large decorative quotation mark is drawn in CSS.
 */

export default async function decorate(block) {
  const quote = block.querySelector('blockquote');
  const attribution = [...block.querySelectorAll('p')]
    .find((p) => !p.querySelector('blockquote') && p.textContent.trim());

  const inner = document.createElement('div');
  inner.className = 'quote-inner';

  const mark = document.createElement('div');
  mark.className = 'quote-mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.textContent = '“';
  inner.append(mark);

  if (quote) inner.append(quote);
  if (attribution) {
    const cite = document.createElement('div');
    cite.className = 'quote-attribution';
    cite.append(attribution);
    inner.append(cite);
  }

  block.replaceChildren(inner);
}
