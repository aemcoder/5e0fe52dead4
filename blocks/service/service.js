/**
 * Service — two-column feature: copy + CTAs on the left, an overlapping photo pair with a
 * yellow figure badge on the right. Template-slotted.
 *
 * Authoring, one row with two cells:
 *   cell 1  <p>eyebrow</p> <h2>heading</h2> <p>body</p>
 *           CTAs: **link** = primary (yellow), _link_ = secondary (outline)
 *   cell 2  up to two pictures (optional — placeholders keep the composition),
 *           then the badge: <p><strong>3,300</strong></p><p>Combined years of tech experience</p>
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  if (node) w.append(node);
  return w;
}

// read-only classification helper — decisions only, never displayed text
const text = (el) => (el ? el.textContent.trim() : '');

export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const copyCell = cells.find((c) => c.querySelector('h1, h2, h3')) || cells[0];
  const mediaCell = cells.find((c) => c !== copyCell);

  // --- copy (capture before moving)
  const kids = copyCell ? [...copyCell.children] : [];
  const heading = kids.find((el) => /^H[1-6]$/.test(el.tagName));
  const ctas = kids.filter((el) => el.tagName === 'P' && el.querySelector('a.button'));
  const eyebrow = heading ? kids.find((el) => el.tagName === 'P' && kids.indexOf(el) < kids.indexOf(heading)) : null;
  const body = kids.filter((el) => ![heading, eyebrow, ...ctas].includes(el));

  const copy = wrapNode(null, 'service-copy');
  if (eyebrow) copy.append(wrapNode(eyebrow, 'service-eyebrow'));
  if (heading) copy.append(wrapNode(heading, 'service-title'));
  if (body.length) {
    const b = wrapNode(null, 'service-body');
    b.append(...body);
    copy.append(b);
  }
  if (ctas.length) {
    const actions = wrapNode(null, 'service-actions');
    actions.append(...ctas);
    copy.append(actions);
  }

  // --- gallery
  const gallery = wrapNode(null, 'service-gallery');
  const pictures = mediaCell ? [...mediaCell.querySelectorAll('picture')] : [];
  const badgeParas = mediaCell
    ? [...mediaCell.children].filter((el) => el.tagName === 'P' && text(el) && !el.querySelector('picture'))
    : [];
  ['service-photo-1', 'service-photo-2'].forEach((cls, i) => {
    const slot = wrapNode(null, `service-photo ${cls}`);
    const picture = pictures[i];
    if (picture) {
      const owner = picture.closest('p');
      slot.append(picture);
      if (owner && !text(owner) && !owner.children.length) owner.remove();
    }
    gallery.append(slot);
  });
  if (badgeParas.length) {
    const badge = wrapNode(null, 'service-badge');
    badge.append(...badgeParas);
    gallery.append(badge);
  }

  block.replaceChildren(copy, gallery);
}
