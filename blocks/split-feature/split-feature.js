/**
 * split-feature — a tinted two-column band: prose on one side, image on the other.
 *
 * Authoring:
 *   row 1, cell 1: <p>eyebrow</p><h2>heading</h2><p>body</p>… (prose column)
 *   row 2, cell 1: the image
 *
 * The eyebrow is the link-free paragraph BEFORE the heading, everything after
 * it is body copy (#76 — pre-heading text is buffered, not treated as body).
 */

/**
 * Collect the authored elements from every cell of the block (#62/#71/#104).
 * @param {Element} block the block element
 * @returns {Element[]} the authored elements in document order
 */
function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    let kids = [...cell.children];
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
      && kids[0].querySelector('picture, img')) {
      kids = [...kids[0].childNodes].map((n) => {
        if (n.nodeType === 1) return n;
        if (n.textContent.trim()) {
          const p = document.createElement('p');
          p.append(n);
          return p;
        }
        return null;
      }).filter(Boolean);
    }
    if (kids.length) out.push(...kids);
    else if (cell.textContent.trim()) {
      // harness-only fallback (EW5)
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out.length ? out : [...block.children];
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const nodes = collectNodes(block);
  if (!nodes.length) return;

  const media = nodes.find((n) => n.matches('picture, img') || n.querySelector('picture, img'));
  const textNodes = nodes.filter((n) => n !== media);
  const heading = textNodes.find((n) => n.matches('h1, h2, h3, h4'));
  const headingIndex = heading ? textNodes.indexOf(heading) : -1;

  let pendingEyebrow = null;
  const body = [];
  textNodes.forEach((node, i) => {
    if (node === heading) return;
    if (headingIndex >= 0 && i < headingIndex && !pendingEyebrow) pendingEyebrow = node;
    else body.push(node);
  });

  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  const col = document.createElement('div');
  col.className = 'split-text';
  if (pendingEyebrow) {
    const eyebrow = document.createElement('div');
    eyebrow.className = 'eyebrow';
    eyebrow.append(pendingEyebrow);
    col.append(eyebrow);
  }
  if (heading) {
    const headline = document.createElement('div');
    headline.className = 'headline';
    headline.append(heading);
    col.append(headline);
  }
  if (body.length) {
    const copy = document.createElement('div');
    copy.className = 'split-copy';
    body.forEach((n) => copy.append(n));
    col.append(copy);
  }
  wrap.append(col);

  const figure = document.createElement('div');
  figure.className = 'split-media';
  if (media) figure.append(media.matches('picture, img') ? media : media.querySelector('picture, img'));
  const deco = document.createElement('span');
  deco.className = 'split-deco';
  deco.setAttribute('aria-hidden', 'true');
  figure.append(deco);
  wrap.append(figure);

  block.replaceChildren(wrap);
}
