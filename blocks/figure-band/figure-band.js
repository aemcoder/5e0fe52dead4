/**
 * figure-band — a full-bleed editorial image band with an optional overlaid caption.
 *
 * Authoring:
 *   row 1, cell 1: the image
 *   row 2, cell 1: (optional) the caption line rendered over the bottom of the image
 *
 * When a caption is authored the block adds `.has-caption`, which switches the
 * scrim from a light top wash to a dark bottom wash so the caption stays legible.
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
  const media = nodes.find((n) => n.nodeType === 1
    && (n.matches('picture, img') || n.querySelector('picture, img')));
  const caption = nodes.find((n) => n !== media && n.nodeType === 1
    && n.textContent.trim() && !n.querySelector('picture, img'));

  const frame = document.createElement('div');
  frame.className = 'figure-frame';

  if (media) {
    const holder = document.createElement('div');
    holder.className = 'figure-media';
    holder.append(media.matches('picture, img') ? media : media.querySelector('picture, img'));
    frame.append(holder);
  }

  const scrim = document.createElement('div');
  scrim.className = 'figure-scrim';
  scrim.setAttribute('aria-hidden', 'true');
  frame.append(scrim);

  if (caption) {
    block.classList.add('has-caption');
    const cap = document.createElement('div');
    cap.className = 'figure-caption';
    cap.append(caption);
    frame.append(cap);
  }

  block.replaceChildren(frame);
}
