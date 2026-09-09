/**
 * image-band — a full-bleed photographic band that separates essay movements.
 *
 * Schema roles:
 *   media    <picture>/<img>  the photograph (row 1)
 *   caption  <p>              optional pull line laid over the foot of the
 *                             image (row 2). Its presence switches the band to
 *                             the shorter, darker-footed variant.
 *
 * The gradient scrim is presentation and is generated here.
 */

/**
 * Wraps an authored element in a generated element carrying the layout class.
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
 * Collects the authored elements of a block regardless of how the delivery
 * pipeline distributed them across rows and cells.
 * @param {Element} block the block element
 * @returns {Element[]} the authored elements, in document order
 */
function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    let kids = [...cell.children];
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
      && kids[0].querySelector('picture, img')) {
      kids = [...kids[0].childNodes].map((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) return node;
        if (node.textContent.trim()) {
          const p = document.createElement('p');
          p.append(node);
          return p;
        }
        return null;
      }).filter(Boolean);
    }
    if (kids.length) {
      out.push(...kids);
    } else if (cell.textContent.trim()) {
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

  const isMedia = (el) => el.matches('picture, img') || el.querySelector('picture, img');
  const mediaHost = nodes.find(isMedia);
  const media = mediaHost
    ? (mediaHost.matches('picture, img') ? mediaHost : mediaHost.querySelector('picture, img'))
    : null;
  const caption = nodes.find((el) => el !== mediaHost && el.textContent.trim() && !isMedia(el));

  const children = [];
  if (media) children.push(wrapNode(media, 'image-band-media'));

  const scrim = document.createElement('span');
  scrim.className = 'image-band-scrim';
  scrim.setAttribute('aria-hidden', 'true');
  children.push(scrim);

  if (caption) {
    block.classList.add('has-caption');
    children.push(wrapNode(caption, 'image-band-caption'));
  }

  block.replaceChildren(...children);
}
