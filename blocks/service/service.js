/**
 * service — two-column split: copy + CTAs on the left, overlapping photo gallery with a
 * yellow "years of experience" badge on the right.
 * Decode tier: template-slotted (fixed composition; authored nodes are MOVED into slots).
 *
 * Authoring: one row, two cells.
 *   cell 1: eyebrow <p> (before the heading), <h2>, lede <p>,
 *           <p><strong><a></a></strong></p> primary CTA, <p><em><a></a></em></p> secondary CTA
 *   cell 2: up to two optional images (large back photo, small front photo), then the badge:
 *           <p>3,300</p><p>Combined years of tech experience</p>
 * Empty image slots render as dark placeholders, like the prototype.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

// eslint-disable-next-line no-bitwise
const isBefore = (a, b) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

export default async function decorate(block) {
  const section = block.closest('.section');
  if (section && !section.id) section.id = 'service';

  const cells = [...block.querySelectorAll(':scope > div > div')];
  const heading = block.querySelector('h1, h2, h3');
  const copyCell = (heading && cells.find((c) => c.contains(heading))) || cells[0];
  const galleryCell = cells.find((c) => c !== copyCell);

  // ── copy ──
  const copy = document.createElement('div');
  copy.className = 'copy';
  const ps = copyCell ? [...copyCell.querySelectorAll('p')] : [];
  const ctas = ps.filter((p) => p.classList.contains('button-wrapper') || p.querySelector('a'));
  const eyebrow = heading ? ps.find((p) => !ctas.includes(p) && isBefore(p, heading)) : null;
  const lede = ps.find((p) => !ctas.includes(p) && p !== eyebrow);
  if (eyebrow) copy.append(wrapNode(eyebrow, 'kicker'));
  if (heading) copy.append(wrapNode(heading, 'headline'));
  if (lede) copy.append(wrapNode(lede, 'lede'));
  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.append(...ctas);
    copy.append(actions);
  }

  // ── gallery ──
  const gallery = document.createElement('div');
  gallery.className = 'gallery';
  const media = galleryCell
    ? [...galleryCell.querySelectorAll('picture, img')].filter((m) => m.tagName === 'PICTURE' || !m.closest('picture'))
    : [];
  ['g1', 'g2'].forEach((cls, i) => {
    const slot = document.createElement('div');
    slot.className = `photo ${cls}`;
    if (media[i]) slot.append(media[i]);
    gallery.append(slot);
  });
  const badgePs = galleryCell
    ? [...galleryCell.querySelectorAll('p')].filter((p) => p.textContent.trim())
    : [];
  if (badgePs.length) {
    const badge = document.createElement('div');
    badge.className = 'badge-yrs';
    const [num, ...rest] = badgePs;
    badge.append(wrapNode(num, 'b-num'));
    if (rest.length) {
      const lab = document.createElement('div');
      lab.className = 'b-lab';
      lab.append(...rest);
      badge.append(lab);
    }
    gallery.append(badge);
  }

  const grid = document.createElement('div');
  grid.className = 'grid';
  grid.append(copy, gallery);
  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  wrap.append(grid);
  block.replaceChildren(wrap);
}
