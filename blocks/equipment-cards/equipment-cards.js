/**
 * equipment-cards — used-inventory band: section head, filter chips, machine cards, foot CTA.
 * Decode tier: reconstructive (authors add/remove machines and chips).
 *
 * Section head: authored as DEFAULT CONTENT before the block (eyebrow <p>, <h2>, lede <p>,
 * <p><a>view-all link</a></p>); reabsorbed into the block's .sec-head layout.
 *
 * Block rows (classified by content, not position):
 *   - filter row : a <ul> of category names and no heading → pill chips (first is active)
 *   - card rows  : [optional image cell] + content cell:
 *                  <p>badge</p> <h3>machine</h3> <ul><li>hours</li><li>location</li></ul>
 *                  <p>price</p> <p>price note</p> <p><a href>Details</a></p>
 *                  The link makes the whole card clickable.
 *   - foot row   : <p><strong><a>Browse Full Inventory</a></strong></p> (dark button)
 */

const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.6-9.2-9A4.6 4.6 0 0 1 12 6a4.6 4.6 0 0 1 9.2 5C19 15.4 12 20 12 20z"></path></svg>';

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

// eslint-disable-next-line no-bitwise
const isBefore = (a, b) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

// append with a separating space so a card link's text / accessible name reads naturally
function appendSpaced(parent, ...nodes) {
  nodes.filter(Boolean).forEach((n) => {
    if (parent.childNodes.length) parent.append(' ');
    parent.append(n);
  });
}

/**
 * Reabsorbs the section's default-content head into a .sec-head layout.
 * @param {Element} block block element
 * @returns {Element|null} head element
 */
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

function buildChips(list) {
  const filters = document.createElement('div');
  filters.className = 'filters';
  filters.append(list);
  const chips = [...list.querySelectorAll(':scope > li')];
  chips.forEach((li, i) => {
    li.setAttribute('role', 'button');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    const activate = () => {
      chips.forEach((c) => c.setAttribute('aria-pressed', c === li ? 'true' : 'false'));
    };
    li.addEventListener('click', activate);
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });
  list.setAttribute('aria-label', 'Filter by category');
  return filters;
}

function buildCard(row) {
  const heading = row.querySelector('h2, h3, h4');
  const media = row.querySelector('picture') || row.querySelector('img');
  const ps = [...row.querySelectorAll('p')].filter((p) => !p.querySelector('picture, img'));
  const specs = row.querySelector('ul');
  const linkP = ps.find((p) => p.querySelector('a'));
  const link = linkP?.querySelector('a');
  const badge = ps.find((p) => p !== linkP && isBefore(p, heading));
  const after = ps.filter((p) => p !== linkP && p !== badge);
  const [price, note] = after;

  const card = document.createElement('a');
  card.className = 'card';
  card.href = link ? link.href : '#';

  const ph = document.createElement('div');
  ph.className = 'ph';
  if (media) ph.append(wrapNode(media, 'media'));
  if (badge) appendSpaced(ph, wrapNode(badge, 'badge'));
  const fav = document.createElement('span');
  fav.className = 'fav';
  fav.setAttribute('role', 'button');
  fav.setAttribute('tabindex', '0');
  fav.setAttribute('aria-label', 'Save');
  fav.setAttribute('aria-pressed', 'false');
  fav.innerHTML = HEART;
  const toggleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    fav.setAttribute('aria-pressed', fav.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
  };
  fav.addEventListener('click', toggleFav);
  fav.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') toggleFav(e);
  });
  ph.append(fav);

  const body = document.createElement('div');
  body.className = 'body';
  if (heading) appendSpaced(body, wrapNode(heading, 'title'));
  if (specs) appendSpaced(body, wrapNode(specs, 'specs'));
  const foot = document.createElement('div');
  foot.className = 'foot';
  const priceBox = document.createElement('div');
  priceBox.className = 'price';
  if (price) appendSpaced(priceBox, wrapNode(price, 'amount'));
  if (note) appendSpaced(priceBox, wrapNode(note, 'note'));
  foot.append(priceBox);
  if (linkP) {
    appendSpaced(foot, wrapNode(linkP, 'view'));
    if (link) link.replaceWith(...link.childNodes);
  }
  appendSpaced(body, foot);
  appendSpaced(card, ph, body);
  return card;
}

export default async function decorate(block) {
  const section = block.closest('.section');
  if (section && !section.id) section.id = 'used';

  const head = buildHead(block);
  const rows = [...block.children];
  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  if (head) wrap.append(head);

  const grid = document.createElement('div');
  grid.className = 'card-grid';
  let filters = null;
  let foot = null;

  rows.forEach((row) => {
    if (row.querySelector('h2, h3, h4')) {
      grid.append(buildCard(row));
      return;
    }
    const list = row.querySelector('ul');
    if (list && !filters) {
      filters = buildChips(list);
      return;
    }
    const ctas = [...row.querySelectorAll('a')].map((a) => a.closest('p') || a);
    if (ctas.length) {
      foot = foot || document.createElement('div');
      foot.className = 'used-foot';
      foot.append(...ctas);
    }
  });

  if (filters) wrap.append(filters);
  wrap.append(grid);
  if (foot) wrap.append(foot);
  block.replaceChildren(wrap);
}
