/**
 * Quote — centered blockquote on a colored ground (forest green)
 *
 * Authoring (flat siblings in one cell):
 *   <p> or <blockquote> — the quote text
 *   <p> — attribution (last paragraph, prefixed with em-dash by JS)
 */
export default async function decorate(block) {
  const nodes = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length) nodes.push(...kids);
    else if (cell.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = cell.textContent.trim();
      nodes.push(p);
    }
  });
  if (!nodes.length) return;

  const wrap = document.createElement('div');
  wrap.className = 'quote-wrap';

  const inner = document.createElement('div');
  inner.className = 'quote-inner';

  // Large decorative quotation mark
  const mark = document.createElement('div');
  mark.className = 'quote-mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.textContent = '“';
  inner.append(mark);

  // Find quote and attribution
  const textNodes = nodes.filter((n) => n.matches?.('p, blockquote'));
  if (textNodes.length >= 2) {
    const quoteEl = textNodes[0];
    const attrEl = textNodes[textNodes.length - 1];

    const bq = document.createElement('blockquote');
    bq.className = 'quote-text';
    bq.textContent = quoteEl.textContent;
    inner.append(bq);

    const attribution = document.createElement('p');
    attribution.className = 'quote-attribution';
    const attrText = attrEl.textContent.trim();
    attribution.textContent = attrText.startsWith('—') ? attrText : `— ${attrText}`;
    inner.append(attribution);
  } else if (textNodes.length === 1) {
    const bq = document.createElement('blockquote');
    bq.className = 'quote-text';
    bq.textContent = textNodes[0].textContent;
    inner.append(bq);
  }

  wrap.append(inner);
  block.replaceChildren(wrap);
}
