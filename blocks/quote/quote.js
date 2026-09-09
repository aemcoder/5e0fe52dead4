/**
 * quote — full-bleed pull-quote band (deep forest ground) with attribution.
 *
 * Authoring (one cell, flat siblings):
 *   <blockquote>the quotation</blockquote>
 *   <p>— Attribution</p>
 *
 * Authored elements are MOVED (never rebuilt) to stay inline-editable. The large
 * decorative quotation mark is generated and aria-hidden.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default async function decorate(block) {
  const cell = block.querySelector(':scope > div > div') || block;
  const quoteEl = cell.querySelector('blockquote');
  const attribution = [...cell.querySelectorAll('p')].pop();

  const inner = document.createElement('div');
  inner.className = 'quote-inner';

  const mark = document.createElement('span');
  mark.className = 'quote-mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.textContent = '“';
  inner.append(mark);

  if (quoteEl) inner.append(quoteEl);
  if (attribution) inner.append(wrapNode(attribution, 'quote-attribution'));

  block.replaceChildren(inner);
}
