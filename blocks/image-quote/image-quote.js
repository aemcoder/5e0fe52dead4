/**
 * Image Quote — full-width image with an overlaid text quote
 *
 * Authoring (flat siblings in one cell):
 *   <picture>/<img> — the background image
 *   <p> — the overlaid quote text
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
  wrap.className = 'image-quote-wrap';

  // Image
  const picNode = nodes.find((n) => n.matches?.('picture, img') || n.querySelector?.('picture, img'));
  if (picNode) {
    const media = document.createElement('div');
    media.className = 'image-quote-media';
    const img = picNode.matches?.('picture, img') ? picNode : picNode.querySelector('picture, img');
    if (img) media.append(img);
    wrap.append(media);
  }

  // Gradient overlay
  const overlay = document.createElement('div');
  overlay.className = 'image-quote-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  wrap.append(overlay);

  // Quote text
  const quoteP = nodes.find((n) => n.matches?.('p') && n.textContent.trim().length > 0);
  if (quoteP) {
    const quote = document.createElement('p');
    quote.className = 'image-quote-text';
    quote.textContent = quoteP.textContent;
    wrap.append(quote);
  }

  block.replaceChildren(wrap);
}
