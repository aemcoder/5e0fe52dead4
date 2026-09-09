/**
 * essay-figure — a full-bleed editorial image band that breaks up the essay.
 *
 * Authoring rows:
 *   1. image — the editorial photograph (required, with real alt text)
 *   2. caption — optional pull line rendered over the foot of the image
 *
 * Variants: add `light` for the pale top wash used above the essay body; the
 * default is the dark bottom wash that a caption sits on.
 *
 * The authored <picture>/<img> and the caption paragraph are MOVED into the
 * generated figure, so both stay authorable and inline-editable (EW1/EW2).
 */

/**
 * Collects the authored elements of a block, cell by cell, recovering the
 * media-led / bare-text cells the runtime's wrapTextNodes folds into one <p>.
 * @param {Element} block the block element
 * @returns {Element[]} the authored elements, in document order
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
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out.length ? out : [...block.children];
}

export default function decorate(block) {
  const nodes = collectNodes(block);
  const media = nodes.find((n) => n.matches('picture, img') || n.querySelector('picture, img'));
  const caption = nodes.find((n) => n !== media && n.textContent.trim());

  const figure = document.createElement('figure');
  figure.className = 'essay-figure-frame';

  if (media) {
    const img = media.matches('img') ? media : media.querySelector('img');
    if (img) img.loading = img.loading || 'lazy';
    figure.append(media);
  }

  const wash = document.createElement('span');
  wash.className = 'essay-figure-wash';
  wash.setAttribute('aria-hidden', 'true');
  figure.append(wash);

  if (caption) {
    const cap = document.createElement('figcaption');
    cap.className = 'essay-figure-caption';
    cap.append(caption);
    figure.append(cap);
    block.classList.add('has-caption');
  }

  block.replaceChildren(figure);
}
