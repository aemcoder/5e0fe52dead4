/**
 * Service — copy column (eyebrow, h2, text, CTAs) beside a layered gallery
 * of up to two pictures with a yellow figure badge.
 *
 * Authoring: one row, two cells:
 *   [<p>Eyebrow</p> <h2>…</h2> <p>…</p> <p><strong><a>Primary</a></strong></p> <p><em><a>Secondary</a></em></p>]
 *   [picture] [picture] <p><strong>3,300</strong></p> <p>Combined years of tech experience</p>]
 */
function div(className) {
  const el = document.createElement('div');
  el.className = className;
  return el;
}

function decorateCopy(cell) {
  cell.className = 'service-copy';
  const elements = [...cell.children];
  const heading = elements.find((el) => /^H[1-6]$/.test(el.tagName));
  const headingIndex = elements.indexOf(heading);
  let ctas;
  elements.forEach((el, i) => {
    if (heading && i < headingIndex && el.tagName === 'P') {
      el.classList.add('service-eyebrow');
    } else if (el.classList.contains('button-wrapper')) {
      if (!ctas) {
        ctas = div('service-ctas');
        el.before(ctas);
      }
      ctas.append(el);
    }
  });
}

function decorateGallery(cell) {
  cell.className = 'service-gallery';
  // a picture-led mixed cell arrives folded into one wrapper <p>: expand it
  [...cell.children].forEach((el) => {
    if (el.tagName === 'P' && el.querySelector(':scope > p')) el.replaceWith(...el.childNodes);
  });
  const pictures = [...cell.querySelectorAll('picture')];
  const slots = [div('service-shot service-shot-1'), div('service-shot service-shot-2')];
  pictures.slice(0, 2).forEach((picture, i) => {
    const holder = picture.parentElement;
    slots[i].append(picture);
    if (holder !== cell && holder.tagName === 'P' && !holder.textContent.trim() && !holder.querySelector('picture')) {
      holder.remove();
    }
  });
  const badge = div('service-badge');
  [...cell.children].forEach((el) => {
    if (el.textContent.trim()) badge.append(el);
  });
  cell.replaceChildren(...slots);
  if (badge.children.length) {
    badge.firstElementChild.classList.add('service-badge-figure');
    cell.append(badge);
  }
}

export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  row.className = 'service-grid';
  const cells = [...row.children];
  const copy = cells.find((c) => c.querySelector('h1, h2, h3')) || cells[0];
  const gallery = cells.find((c) => c !== copy);
  decorateCopy(copy);
  if (gallery) decorateGallery(gallery);
  block.replaceChildren(row);
}
