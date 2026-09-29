/**
 * Offers — financing deals: section head + photo cards with a dark overlay.
 *
 * Authoring:
 *   Section default content BEFORE the block (reabsorbed into the head, EW8):
 *     <p>eyebrow</p> <h2>title</h2> <p><a>All offers</a></p>
 *   Block rows: | image (optional) | <p>tag</p> <h3>offer</h3> <p><a>View offer</a></p> |
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

function buildHead(block) {
  const prev = block.parentElement && block.parentElement.previousElementSibling;
  if (!prev || !prev.classList.contains('default-content-wrapper')) return null;
  const head = el('div', 'sec-head');
  const text = el('div', 'sec-head-text');
  const aside = el('div', 'sec-head-link');
  const nodes = [...prev.children];
  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const hIndex = heading ? nodes.indexOf(heading) : -1;
  nodes.forEach((node, i) => {
    if (node === heading) text.append(wrapNode(node, 'sec-title'));
    else if (node.querySelector('a[href]')) aside.append(node);
    else if (i < hIndex) text.append(wrapNode(node, 'kicker'));
    else text.append(wrapNode(node, 'sec-intro'));
  });
  head.append(text);
  if (aside.children.length) head.append(aside);
  prev.remove();
  return head;
}

function buildOffer(row) {
  const nodes = [...row.children].flatMap(cellNodes);
  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const hIndex = heading ? nodes.indexOf(heading) : -1;
  const link = nodes.map((n) => (n.matches('a[href]') ? n : n.querySelector('a[href]'))).find(Boolean);

  const offer = el(link ? 'a' : 'div', 'offer');
  if (link) offer.href = link.href;
  const media = el('div', 'offer-media');
  const ov = el('div', 'offer-ov');
  const c = el('div', 'offer-content');

  nodes.forEach((node, i) => {
    if (node.matches('picture, img') || (node.querySelector('picture, img') && !node.textContent.trim())) {
      media.append(node);
    } else if (node === heading) {
      c.append(wrapNode(node, 'offer-title'));
    } else if (link && node.contains(link)) {
      c.append(wrapNode(node, 'more'));
    } else if (i < hIndex) {
      c.append(wrapNode(node, 'tag'));
    } else {
      c.append(wrapNode(node, 'offer-text'));
    }
  });
  // card-as-link (EW6)
  if (link) link.replaceWith(...link.childNodes);
  if (!media.children.length) offer.classList.add('no-media');

  offer.append(media, ov, c);
  return offer;
}

export default function decorate(block) {
  const head = buildHead(block);
  const grid = el('div', 'offer-grid');
  [...block.children].forEach((row) => {
    if (row.textContent.trim() || row.querySelector('picture, img')) grid.append(buildOffer(row));
  });
  block.replaceChildren(...(head ? [head, grid] : [grid]));
}
