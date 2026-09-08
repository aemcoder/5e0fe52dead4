/**
 * split-note — two-column prose-and-photograph band on the sand ground.
 *
 * Authoring: one row, two cells
 *   cell 1 — eyebrow paragraph, an <h2>, then the body paragraphs
 *   cell 2 — the supporting image
 *
 * A DA-flattened single cell (everything as flat siblings) decodes the same
 * way: the media is found wherever it sits, text before the heading becomes
 * the eyebrow, text after it becomes body copy.
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
  const mediaHost = nodes.find((n) => n.matches
    && (n.matches('picture, img') || n.querySelector('picture, img')));
  const media = mediaHost
    && (mediaHost.matches('picture, img') ? mediaHost : mediaHost.querySelector('picture, img'));

  const textNodes = nodes.filter((n) => n !== mediaHost && n.textContent.trim());
  const heading = textNodes.find((n) => n.matches('h1, h2, h3, h4, h5, h6'));
  const headingIndex = heading ? textNodes.indexOf(heading) : -1;
  const eyebrow = headingIndex > 0 ? textNodes[headingIndex - 1] : null;

  const inner = document.createElement('div');
  inner.className = 'split-note-inner';

  const text = document.createElement('div');
  text.className = 'split-note-text';
  if (eyebrow) {
    const wrapper = document.createElement('div');
    wrapper.className = 'split-note-eyebrow';
    wrapper.append(eyebrow);
    text.append(wrapper);
  }
  if (heading) {
    const wrapper = document.createElement('div');
    wrapper.className = 'split-note-headline';
    wrapper.append(heading);
    text.append(wrapper);
  }
  const body = document.createElement('div');
  body.className = 'split-note-body';
  textNodes.filter((n) => n !== eyebrow && n !== heading).forEach((n) => body.append(n));
  if (body.childElementCount) text.append(body);
  inner.append(text);

  if (media) {
    const frame = document.createElement('div');
    frame.className = 'split-note-media';
    frame.append(media);
    inner.append(frame);
  }

  block.replaceChildren(inner);
}
