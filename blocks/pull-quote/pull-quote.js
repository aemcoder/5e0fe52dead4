/**
 * pull-quote — centered quotation on a deep-green band.
 *
 * Authoring: one row, two cells:
 *   cell 1 — the quotation (a <blockquote> or paragraph)
 *   cell 2 — the attribution ("— Author")
 *
 * The oversized decorative quote mark is generated, not authored.
 */
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default async function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];

  let quote;
  let cite;
  if (cells.length >= 2) {
    quote = cells[0].querySelector('blockquote') || cells[0].querySelector('p, h2, h3') || cells[0];
    cite = cells[1].querySelector('p, blockquote') || cells[1];
  } else {
    // single-cell fallback
    quote = block.querySelector('blockquote') || block.querySelector('p, h2, h3');
    cite = [...block.querySelectorAll('p')].find((p) => p !== quote && !p.contains(quote));
  }

  const inner = document.createElement('div');
  inner.className = 'pq-inner';

  const mark = document.createElement('div');
  mark.className = 'pq-mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.textContent = '“';
  inner.append(mark);

  if (quote) inner.append(wrapNode(quote, 'pq-quote'));
  if (cite) inner.append(wrapNode(cite, 'pq-cite'));

  block.replaceChildren(inner);
}
