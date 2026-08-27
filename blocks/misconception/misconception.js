/**
 * Misconception — 2-column layout: text left, image right on warm ground
 *
 * Authoring (flat siblings in one cell):
 *   <p> eyebrow
 *   <h2> heading
 *   <p> body paragraphs (multiple)
 *   <picture>/<img> — side image
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
  wrap.className = 'misconception-wrap';

  const textCol = document.createElement('div');
  textCol.className = 'misconception-text';

  const imageCol = document.createElement('div');
  imageCol.className = 'misconception-image';

  // Find elements
  const h2 = nodes.find((n) => n.matches?.('h2'));
  const pic = nodes.find((n) => n.matches?.('picture, img') || n.querySelector?.('picture, img'));
  const paragraphs = nodes.filter((n) => n.matches?.('p'));

  // Eyebrow = first short paragraph before h2
  const h2Idx = h2 ? nodes.indexOf(h2) : -1;
  const eyebrow = paragraphs.find((p) => !p.querySelector('a') && nodes.indexOf(p) < h2Idx);

  if (eyebrow) {
    eyebrow.className = 'misconception-eyebrow';
    textCol.append(eyebrow);
  }

  if (h2) {
    h2.className = 'misconception-title';
    textCol.append(h2);
  }

  // Body paragraphs = all paragraphs after h2 that aren't the eyebrow
  paragraphs.forEach((p) => {
    if (p === eyebrow) return;
    if (h2 && nodes.indexOf(p) > h2Idx) {
      const body = document.createElement('p');
      body.className = 'misconception-body';
      body.innerHTML = p.innerHTML;
      textCol.append(body);
    }
  });

  // Image
  if (pic) {
    const img = pic.matches?.('picture, img') ? pic : pic.querySelector('picture, img');
    if (img) {
      imageCol.append(img);
      // Decorative corner element
      const corner = document.createElement('div');
      corner.className = 'misconception-corner';
      corner.setAttribute('aria-hidden', 'true');
      imageCol.append(corner);
    }
  }

  wrap.append(textCol, imageCol);
  block.replaceChildren(wrap);
}
