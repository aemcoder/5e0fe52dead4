/**
 * Used equipment — certified-used inventory: section head, filter chips,
 * machine cards and a trailing "browse" CTA.
 *
 * Authoring:
 *   Section default content BEFORE the block (reabsorbed into the head, EW8):
 *     <p> eyebrow, <h2> title, <p> intro, <p><a> "View all …" link,
 *     <ul> filter chips (first = active; visual filter only)
 *   Block rows:
 *     - (legacy) a row holding a <ul> and no heading → filter chips
 *     - card rows: | image (optional) | <p>badge</p> <h3>machine</h3>
 *                   <ul><li>hours</li><li>location</li></ul>
 *                   <p>price</p> <p>finance note</p> <p><a>Details</a></p> |
 *   Section default content AFTER the block (moved into the footer row):
 *     <p><em><strong><a>Browse Full Inventory</a></strong></em></p>
 * The section gets id="used" (in-page anchor) unless it already has one.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function el(tag, className) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20s-7-4.6-9.2-9A4.6 4.6 0 0 1 12 6a4.6 4.6 0 0 1 9.2 5C19 15.4 12 20 12 20z"/></svg>';

/** Flatten a cell into its element nodes, expanding a wrapTextNodes <p> (#104). */
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

/**
 * Reabsorb the section head (and the filter list) from the preceding default
 * content (EW8). Returns { head, list }.
 */
function buildHead(block) {
  const prev = block.parentElement && block.parentElement.previousElementSibling;
  if (!prev || !prev.classList.contains('default-content-wrapper')) return {};
  const head = el('div', 'sec-head');
  const text = el('div', 'sec-head-text');
  const aside = el('div', 'sec-head-link');
  const nodes = [...prev.children];
  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const hIndex = heading ? nodes.indexOf(heading) : -1;
  let list = null;
  nodes.forEach((node, i) => {
    if (node === heading) text.append(wrapNode(node, 'sec-title'));
    else if ((node.tagName === 'UL' || node.tagName === 'OL') && !list) list = node;
    else if (node.querySelector('a[href]')) aside.append(node);
    else if (i < hIndex) text.append(wrapNode(node, 'kicker'));
    else text.append(wrapNode(node, 'sec-intro'));
  });
  head.append(text);
  if (aside.children.length) head.append(aside);
  prev.remove();
  return { head, list };
}

function buildFilters(list) {
  const filters = el('div', 'filters');
  filters.append(list);
  const chips = [...list.querySelectorAll('li')];
  const activate = (chip) => {
    chips.forEach((c) => {
      c.classList.toggle('active', c === chip);
      c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
    });
  };
  chips.forEach((chip) => {
    chip.setAttribute('role', 'button');
    chip.tabIndex = 0;
    chip.addEventListener('click', () => activate(chip));
    chip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate(chip);
      }
    });
  });
  if (chips.length) activate(chips[0]);
  return filters;
}

function buildCard(row) {
  const nodes = [...row.children].flatMap(cellNodes);
  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const link = nodes.map((n) => (n.matches('a[href]') ? n : n.querySelector('a[href]'))).find(Boolean);

  const card = el(link ? 'a' : 'div', 'card');
  if (link) card.href = link.href;
  const ph = el('div', 'ph');
  const body = el('div', 'card-body');
  const specs = el('div', 'specs');
  const foot = el('div', 'foot');
  const price = el('div', 'price');
  const view = el('div', 'view');

  const hIndex = heading ? nodes.indexOf(heading) : -1;
  let priced = false;
  nodes.forEach((node, i) => {
    if (node.matches('picture, img') || (node.querySelector('picture, img') && !node.textContent.trim())) {
      ph.prepend(wrapNode(node, 'ph-media'));
    } else if (node === heading) {
      body.append(wrapNode(node, 'card-title'));
    } else if (i < hIndex) {
      ph.append(wrapNode(node, 'badge'));
    } else if (node.tagName === 'UL' || node.tagName === 'OL') {
      specs.append(node);
    } else if (link && node.contains(link)) {
      view.append(node);
    } else if (!priced) {
      price.append(wrapNode(node, 'price-value'));
      priced = true;
    } else {
      price.append(wrapNode(node, 'price-note'));
    }
  });
  // card-as-link (EW6): keep the indexed <p>, drop the nested anchor
  if (link) link.replaceWith(...link.childNodes);

  const fav = el('span', 'fav');
  fav.setAttribute('aria-hidden', 'true');
  fav.innerHTML = HEART;
  fav.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    fav.classList.toggle('saved');
  });
  ph.append(fav);

  if (specs.children.length) body.append(specs);
  if (price.children.length) foot.append(price);
  if (view.children.length) foot.append(view);
  if (foot.children.length) body.append(foot);
  card.append(ph, body);
  return card;
}

export default function decorate(block) {
  const section = block.closest('.section');
  if (section && !section.id) section.id = 'used';

  const { head, list: headList } = buildHead(block);
  const rows = [...block.children];
  const grid = el('div', 'cards');
  let filters = headList ? buildFilters(headList) : null;

  rows.forEach((row) => {
    const hasHeading = row.querySelector('h1, h2, h3, h4, h5, h6');
    const list = row.querySelector('ul, ol');
    if (!hasHeading && list && !filters) {
      filters = buildFilters(list);
    } else if (hasHeading || row.textContent.trim()) {
      grid.append(buildCard(row));
    }
  });

  const children = [];
  if (head) children.push(head);
  if (filters) children.push(filters);
  children.push(grid);

  // trailing default content → centred browse CTA
  const next = block.parentElement && block.parentElement.nextElementSibling;
  if (next && next.classList.contains('default-content-wrapper')) {
    const foot = el('div', 'used-foot');
    foot.append(...next.children);
    next.remove();
    children.push(foot);
  }

  block.replaceChildren(...children);
}
