/**
 * Service — split band: copy + CTAs on the left, an overlapping two-photo
 * gallery with a yellow figure badge on the right.
 *
 * Authoring: one row, two cells.
 *   | <p>Eyebrow</p> <h2>Heading</h2> <p>Body</p>
 *     <p><strong><a>Primary CTA</a></strong></p> <p><em><a>Secondary CTA</a></em></p>
 *   | <picture> <picture> (optional, up to two)
 *     <p><strong>3,300</strong></p> <p>Badge label</p> |
 * Missing photos render as dark placeholder frames.
 */

function div(className, ...children) {
  const d = document.createElement('div');
  d.className = className;
  d.append(...children);
  return d;
}

function cellNodes(cell) {
  if (!cell) return [];
  let kids = [...cell.children];
  // wrapTextNodes folds a media-led cell into ONE <p> — expand it back.
  if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
    && kids[0].querySelector('picture, img')) {
    kids = [...kids[0].childNodes].map((n) => {
      if (n.nodeType === 1) return n;
      // HARNESS-ONLY fallback: move a bare text node into a <p>.
      if (n.textContent.trim()) {
        const p = document.createElement('p');
        p.append(n);
        return p;
      }
      return null;
    }).filter(Boolean);
  }
  if (kids.length) return kids;
  if (cell.textContent.trim()) {
    // HARNESS-ONLY fallback: wrap existing text nodes, never synthesize.
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    return [p];
  }
  return [];
}

const isMedia = (n) => n.matches('picture, img')
  || (n.tagName === 'P' && !!n.querySelector('picture, img') && !n.textContent.trim());

const isStrongOnly = (p) => p.tagName === 'P'
  && !p.querySelector('a')
  && !!p.querySelector('strong')
  && p.textContent.trim() === [...p.querySelectorAll('strong')].map((s) => s.textContent).join('').trim();

export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const perCell = cells.map((c) => ({ cell: c, nodes: cellNodes(c) }));

  // the gallery side is the first non-leading cell without a heading
  const galleryEntry = perCell.find((e, i) => i > 0
    && !e.nodes.some((n) => /^H[1-6]$/.test(n.tagName)));
  const galleryNodes = galleryEntry ? galleryEntry.nodes : [];
  const copyNodes = perCell.filter((e) => e !== galleryEntry).flatMap((e) => e.nodes);

  // copy column
  const copy = div('copy');
  const heading = copyNodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const hIndex = heading ? copyNodes.indexOf(heading) : -1;
  const ctas = [];
  const media = [];
  copyNodes.forEach((n, i) => {
    if (isMedia(n)) media.push(n);
    else if (n === heading) copy.append(div('headline', n));
    else if (n.classList.contains('button-wrapper')) ctas.push(n);
    else if (hIndex > -1 && i < hIndex) copy.append(div('eyebrow', n));
    else copy.append(div('text', n));
  });
  if (ctas.length) copy.append(div('actions', ...ctas));

  // gallery column
  const badgeNum = [];
  const badgeLab = [];
  galleryNodes.forEach((n) => {
    if (isMedia(n)) media.push(n);
    else if (!badgeNum.length && isStrongOnly(n)) badgeNum.push(n);
    else badgeLab.push(n);
  });
  const g1 = div('frame g1');
  const g2 = div('frame g2');
  if (media[0]) g1.append(media[0]);
  if (media[1]) g2.append(media[1]);
  const gallery = div('gallery', g1, g2);
  if (badgeNum.length || badgeLab.length) {
    const badge = div('badge-yrs');
    if (badgeNum.length) badge.append(div('figure', ...badgeNum));
    if (badgeLab.length) badge.append(div('label', ...badgeLab));
    gallery.append(badge);
  }

  block.replaceChildren(div('wrap', div('grid', copy, gallery)));
}
