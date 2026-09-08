/**
 * image-band — a full-bleed editorial image band with a gradient scrim.
 *
 * Authoring:
 *   row 1, cell 1: the image (a <picture>/<img>)
 *   row 2, cell 1: an optional caption line, set over the bottom of the image
 *
 * Variants:
 *   image-band            tall band, light scrim falling from the top
 *   image-band caption    shorter band, dark scrim rising to the caption
 *
 * The scrim is generated (pure decoration); the image and the caption are the
 * AUTHORED elements, moved into their layout wrappers.
 */

/**
 * Collects the authored elements of a block, cell by cell, recovering the
 * shapes the delivery pipeline produces (a media-led cell folded into one <p>,
 * a bare-text cell).
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
        if (n.nodeType === Node.ELEMENT_NODE) return n;
        if (n.textContent.trim()) {
          const p = document.createElement('p');
          p.append(n);
          return p;
        }
        return null;
      }).filter(Boolean);
    }
    if (kids.length) {
      out.push(...kids);
    } else if (cell.textContent.trim()) {
      // harness-only: off-pipeline content can deliver a bare text cell
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out.length ? out : [...block.children];
}

/**
 * Wraps an AUTHORED element in a generated wrapper carrying the layout class.
 * @param {Element} node the authored element
 * @param {string} className the layout class for the wrapper
 * @returns {Element} the wrapper
 */
function wrapNode(node, className) {
  const wrapper = document.createElement('div');
  wrapper.className = className;
  wrapper.append(node);
  return wrapper;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const nodes = collectNodes(block);
  const media = nodes.find((n) => n.matches('picture, img') || n.querySelector('picture, img'));
  const caption = nodes.find((n) => n !== media && n.textContent.trim());

  const children = [];
  if (media) {
    const mediaNode = media.matches('picture, img') ? media : media.querySelector('picture, img');
    children.push(wrapNode(mediaNode, 'image-band-media'));
  }

  const scrim = document.createElement('div');
  scrim.className = 'image-band-scrim';
  scrim.setAttribute('aria-hidden', 'true');
  children.push(scrim);

  if (caption) children.push(wrapNode(caption, 'image-band-caption'));

  block.replaceChildren(...children);
}
