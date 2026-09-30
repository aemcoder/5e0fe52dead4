/**
 * offers — section head + 3-up grid of photo offer tiles (whole tile is a link).
 * Decode tier: reconstructive (authors add/remove offers).
 *
 * Section head: authored as DEFAULT CONTENT before the block (eyebrow <p>, <h2>,
 * <p><a>All offers</a></p>); reabsorbed into the block's .sec-head layout.
 * Block rows: one per offer — [optional image cell] + content cell:
 *   <p>tag</p> <h3>offer title</h3> <p><a href>View offer</a></p>
 * Without an image the tile shows the dark placeholder ground under the gradient.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

// eslint-disable-next-line no-bitwise
const isBefore = (a, b) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

// append with a separating space so a tile link's text / accessible name reads naturally
function appendSpaced(parent, ...nodes) {
  nodes.filter(Boolean).forEach((n) => {
    if (parent.childNodes.length) parent.append(' ');
    parent.append(n);
  });
}

function buildHead(block) {
  const source = block.parentElement?.previousElementSibling;
  if (!source || !source.classList.contains('default-content-wrapper')) return null;
  const heading = source.querySelector('h1, h2, h3');
  const ps = [...source.querySelectorAll(':scope > p')];
  const linkP = ps.find((p) => p.querySelector('a') && p.textContent.trim() === p.querySelector('a').textContent.trim());
  const eyebrow = heading ? ps.find((p) => p !== linkP && isBefore(p, heading)) : null;
  const lede = ps.find((p) => p !== linkP && p !== eyebrow);

  const head = document.createElement('div');
  head.className = 'sec-head';
  const copy = document.createElement('div');
  copy.className = 'head-copy';
  if (eyebrow) copy.append(wrapNode(eyebrow, 'kicker'));
  if (heading) copy.append(wrapNode(heading, 'headline'));
  if (lede) copy.append(wrapNode(lede, 'lede'));
  head.append(copy);
  if (linkP) head.append(wrapNode(linkP, 'head-link'));
  if (!source.children.length) source.remove();
  return head;
}

function buildOffer(row) {
  const heading = row.querySelector('h2, h3, h4');
  const media = row.querySelector('picture') || row.querySelector('img');
  const ps = [...row.querySelectorAll('p')].filter((p) => !p.querySelector('picture, img'));
  const linkP = ps.find((p) => p.querySelector('a'));
  const link = linkP?.querySelector('a');
  const tag = ps.find((p) => p !== linkP && (!heading || isBefore(p, heading)));

  const offer = document.createElement('a');
  offer.className = 'offer';
  offer.href = link ? link.href : '#';
  const bg = document.createElement('div');
  bg.className = 'media';
  if (media) bg.append(media);
  const ov = document.createElement('div');
  ov.className = 'ov';
  const c = document.createElement('div');
  c.className = 'c';
  if (tag) appendSpaced(c, wrapNode(tag, 'tag'));
  if (heading) appendSpaced(c, wrapNode(heading, 'title'));
  if (linkP) {
    appendSpaced(c, wrapNode(linkP, 'more'));
    if (link) link.replaceWith(...link.childNodes);
  }
  offer.append(bg, ov, c);
  return offer;
}

export default async function decorate(block) {
  const head = buildHead(block);
  const grid = document.createElement('div');
  grid.className = 'offer-grid';
  [...block.children].forEach((row) => {
    if (row.textContent.trim() || row.querySelector('picture, img')) grid.append(buildOffer(row));
  });
  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  if (head) wrap.append(head);
  wrap.append(grid);
  block.replaceChildren(wrap);
}
