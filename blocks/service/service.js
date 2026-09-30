/**
 * service — two-column feature: copy (eyebrow, <h2>, text, CTAs) beside a
 * stacked two-photo gallery with a yellow figure badge. Template-slotted:
 * authored nodes are MOVED into fixed slots.
 *
 * Authoring — one row, two cells:
 *   | copy: <p><strong>Eyebrow</strong></p> <h2> <p>text</p> CTAs | gallery: up to two <picture>s + <p><strong>3,300</strong> caption</p> |
 * CTAs: <strong><a> primary, <em><a> secondary. Photos are optional — empty
 * slots render as dark placeholders.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

const isCta = (p) => p.classList.contains('button-wrapper')
  || !!p.querySelector(':scope > :is(strong, em) > a, :scope > em > strong > a, :scope > a.button');

export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const heading = block.querySelector('h1, h2, h3');
  const copyCell = cells.find((c) => heading && c.contains(heading)) || cells[0];
  const galleryCells = cells.filter((c) => c !== copyCell);

  // ----- copy -----
  const copy = document.createElement('div');
  copy.className = 'copy';
  const actions = document.createElement('div');
  actions.className = 'actions';
  if (copyCell) {
    [...copyCell.children].forEach((el) => {
      if (el === heading) copy.append(wrapNode(el, 'headline'));
      else if (el.tagName === 'P' && isCta(el)) actions.append(el);
      else if (el.tagName === 'P' && heading
        // eslint-disable-next-line no-bitwise
        && (el.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING)) {
        copy.append(wrapNode(el, 'eyebrow'));
      } else copy.append(wrapNode(el, 'text'));
    });
  }
  if (actions.children.length) copy.append(actions);

  // ----- gallery -----
  const gallery = document.createElement('div');
  gallery.className = 'gallery';
  const pics = [];
  let badge = null;
  galleryCells.forEach((cell) => {
    [...cell.children].forEach((el) => {
      const pic = el.matches('picture, img') ? el : el.querySelector('picture, img');
      if (pic) pics.push(el.tagName === 'P' && el.children.length === 1 ? el : pic);
      else if (el.textContent.trim() && !badge) badge = el;
    });
  });
  ['g1', 'g2'].forEach((cls, i) => {
    const slot = document.createElement('div');
    slot.className = `photo ${cls}`;
    if (pics[i]) slot.append(pics[i]);
    gallery.append(slot);
  });
  if (badge) gallery.append(wrapNode(badge, 'badge-yrs'));

  const grid = document.createElement('div');
  grid.className = 'grid';
  grid.append(copy, gallery);
  block.replaceChildren(grid);
}
