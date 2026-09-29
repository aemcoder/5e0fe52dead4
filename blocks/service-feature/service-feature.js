/**
 * Service feature — template-slotted (Step 2b): copy column + stacked photo
 * gallery with a yellow experience badge.
 *
 * Authoring:
 *   Section default content BEFORE the block (reabsorbed as the copy column, EW8):
 *     <p>eyebrow</p> <h2>title</h2> <p>body</p>
 *     <p><strong><a>primary CTA</a></strong></p> <p><em><a>secondary CTA</a></em></p>
 *   Block rows:
 *     gallery: | photo 1 | photo 2 |   (cells may be left empty — framed placeholders show)
 *     badge:   | figure (e.g. 3,300) | caption |
 *   (A block row holding the heading is also accepted as the copy.)
 * The section gets id="service" (in-page anchor) unless it already has one.
 */

function el(tag, className) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

function wrapNode(node, className) {
  const w = el('div', className);
  w.append(node);
  return w;
}

function cellNodes(cell) {
  let kids = [...cell.children];
  if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
    && kids[0].querySelector('picture, img')) {
    kids = [...kids[0].childNodes].map((n) => {
      if (n.nodeType === 1) return n;
      // HARNESS-ONLY fallback (EW5): bare text beside a picture.
      if (n.textContent.trim()) {
        const p = document.createElement('p');
        p.append(n);
        return p;
      }
      return null;
    }).filter(Boolean);
  }
  if (!kids.length && cell.textContent.trim()) {
    // HARNESS-ONLY fallback (EW5): bare text cell.
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    kids = [p];
  }
  return kids;
}

const isMedia = (n) => n.matches('picture, img') || (!!n.querySelector('picture, img') && !n.textContent.trim());

export default function decorate(block) {
  const section = block.closest('.section');
  if (section && !section.id) section.id = 'service';

  const copy = el('div', 'svc-copy');
  const eyebrow = el('div', 'eyebrow svc-eyebrow');
  const title = el('div', 'svc-title');
  const body = el('div', 'svc-body');
  const actions = el('div', 'actions');
  const gallery = el('div', 'svc-gallery');
  const frames = [el('div', 'g g1'), el('div', 'g g2')];
  const badge = el('div', 'badge-yrs');

  const rows = [...block.children];
  const prev = block.parentElement && block.parentElement.previousElementSibling;
  const headWrapper = prev && prev.classList.contains('default-content-wrapper') ? prev : null;
  const copyRow = headWrapper || rows.find((r) => r.querySelector('h1, h2, h3, h4, h5, h6'));
  const others = rows.filter((r) => r !== copyRow);
  const badgeRow = [...others].reverse().find((r) => r.textContent.trim()
    && !r.querySelector('picture, img'));

  if (copyRow) {
    const nodes = copyRow === headWrapper
      ? [...headWrapper.children]
      : [...copyRow.children].flatMap(cellNodes);
    const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
    const hIndex = nodes.indexOf(heading);
    nodes.forEach((node, i) => {
      if (node === heading) title.append(node);
      else if (isMedia(node)) frames.find((f) => !f.children.length)?.append(node);
      else if (node.querySelector('a[href]')) actions.append(node);
      else if (i < hIndex) eyebrow.append(node);
      else body.append(node);
    });
  }

  let frameIndex = 0;
  others.filter((r) => r !== badgeRow).forEach((row) => {
    [...row.children].flatMap(cellNodes).forEach((node) => {
      if (!isMedia(node)) return;
      while (frameIndex < frames.length && frames[frameIndex].children.length) frameIndex += 1;
      if (frameIndex < frames.length) frames[frameIndex].append(node);
    });
  });

  if (badgeRow) {
    const nodes = [...badgeRow.children].flatMap(cellNodes);
    const [fig, ...caption] = nodes;
    if (fig) badge.append(wrapNode(fig, 'badge-fig'));
    if (caption.length) {
      const cap = el('div', 'badge-cap');
      cap.append(...caption);
      badge.append(cap);
    }
  }

  if (eyebrow.children.length) copy.append(eyebrow);
  copy.append(title);
  if (body.children.length) copy.append(body);
  if (actions.children.length) copy.append(actions);

  frames.forEach((f) => {
    if (!f.children.length) f.classList.add('empty');
    gallery.append(f);
  });
  if (badge.children.length) gallery.append(badge);

  if (headWrapper) headWrapper.remove();
  block.replaceChildren(copy, gallery);
}
