/**
 * image-band — a full-bleed editorial photograph that breaks up the essay.
 *
 * Authoring:
 *   row 1 — the image (authored <img>, rendered by the pipeline as <picture>)
 *   row 2 — optional caption line, laid over the foot of the image
 *
 * Variants: `image-band caption` uses the taller dark bottom scrim so the
 * caption stays legible; the default variant carries a light top scrim.
 */

/**
 * Collect authored elements from the block, cell by cell, recovering the
 * shapes the runtime's wrapTextNodes() and DA's flattening produce.
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
          // harness-only: off-pipeline content can hold a bare text node here
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
      // harness-only: DA always delivers a <p> in every cell
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
  const isMedia = (n) => n.matches && (n.matches('picture, img') || n.querySelector('picture, img'));
  const mediaHost = nodes.find(isMedia);
  const media = mediaHost
    && (mediaHost.matches('picture, img') ? mediaHost : mediaHost.querySelector('picture, img'));
  const caption = nodes.find((n) => n !== mediaHost && n.textContent.trim());

  const children = [];
  if (media) {
    const frame = document.createElement('div');
    frame.className = 'image-band-media';
    frame.append(media);
    children.push(frame);
  }

  const scrim = document.createElement('div');
  scrim.className = 'image-band-scrim';
  scrim.setAttribute('aria-hidden', 'true');
  children.push(scrim);

  if (caption) {
    const wrapper = document.createElement('div');
    wrapper.className = 'image-band-caption';
    wrapper.append(caption);
    children.push(wrapper);
  }

  block.replaceChildren(...children);
}
