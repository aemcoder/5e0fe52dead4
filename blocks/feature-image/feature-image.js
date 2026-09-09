/**
 * feature-image — a full-bleed editorial image band with a tonal scrim.
 *
 * Authoring rows:
 *   1. the image (an authored <picture>/<img> with alt text)
 *   2. optional caption line, rendered over the bottom of the image
 *
 * Variants (block classes): `caption` — dark bottom scrim sized for a caption.
 */

/**
 * Collects the authored elements of a block, tolerating the DA-flattened
 * single-cell shape and the runtime's media-led <p> folding.
 * @param {Element} block the block element
 * @returns {Element[]} authored elements in document order
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

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const nodes = collectNodes(block);
  const media = nodes.find((n) => n.matches('picture, img') || n.querySelector('picture, img'));
  const caption = nodes.find((n) => n !== media && n.textContent.trim());

  const figure = document.createElement('figure');
  figure.className = 'feature-image-figure';

  if (media) {
    const holder = document.createElement('div');
    holder.className = 'feature-image-media';
    holder.append(media.matches('picture, img') ? media : media.querySelector('picture, img'));
    figure.append(holder);
  }

  const scrim = document.createElement('div');
  scrim.className = 'feature-image-scrim';
  scrim.setAttribute('aria-hidden', 'true');
  figure.append(scrim);

  if (caption) {
    const holder = document.createElement('figcaption');
    holder.className = 'feature-image-caption';
    holder.append(caption);
    figure.append(holder);
    block.classList.add('caption');
  }

  block.replaceChildren(figure);
}
