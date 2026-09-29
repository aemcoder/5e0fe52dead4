/**
 * split — two-column band on sand: editorial text (eyebrow, <h2>, paragraphs)
 * beside a rounded photo.
 * Stacks to one column on mobile.
 *
 * Decode tier: template-slotted (node-slotting). Authored elements are MOVED.
 *
 * Authoring (Block Collection "columns" shape): one row, two cells —
 *   cell 1: eyebrow paragraph, <h2> heading, body paragraphs (<strong> for accents)
 *   cell 2: the image (<img>/<picture> with alt text)
 * Cell order is not significant: the image cell is detected by content.
 */

function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    let kids = [...cell.children];
    // runtime wrapTextNodes may fold a media-led cell into one <p>; expand it
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
      && kids[0].querySelector('picture, img')) {
      kids = [...kids[0].children];
    }
    if (kids.length) out.push(...kids);
    // HARNESS-ONLY fallback (EW5): bare text cell — wrap the existing text nodes.
    else if (cell.textContent.trim()) {
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out;
}

const isMedia = (el) => el.matches('picture, img') || !!el.querySelector('picture, img');

export default async function decorate(block) {
  const nodes = collectNodes(block);
  const media = nodes.filter(isMedia);
  const textNodes = nodes.filter((n) => !isMedia(n));
  const heading = textNodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const headingIdx = textNodes.indexOf(heading);

  const inner = document.createElement('div');
  inner.className = 'inner';

  const text = document.createElement('div');
  text.className = 'text';
  const eyebrowNodes = headingIdx > 0 ? textNodes.slice(0, headingIdx) : [];
  if (eyebrowNodes.length) {
    const eyebrow = document.createElement('div');
    eyebrow.className = 'eyebrow';
    eyebrow.append(...eyebrowNodes);
    text.append(eyebrow);
  }
  if (heading) {
    const h = document.createElement('div');
    h.className = 'headline';
    h.append(heading);
    text.append(h);
  }
  const bodyNodes = textNodes.slice(headingIdx + 1);
  if (bodyNodes.length) {
    const body = document.createElement('div');
    body.className = 'body';
    body.append(...bodyNodes);
    text.append(body);
  }
  inner.append(text);

  const figure = document.createElement('div');
  figure.className = 'media';
  if (media.length) figure.append(...media);
  else figure.classList.add('empty');
  inner.append(figure);

  block.replaceChildren(inner);
}
