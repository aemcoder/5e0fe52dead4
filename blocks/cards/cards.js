/**
 * cards — grid of linked cards. Variants (block class):
 *   - equipment : used-equipment listing (photo, badge, save toggle, specs, price, details)
 *   - offers    : image-overlay promo tiles (tag, title, "view offer")
 * Reconstructive: one row per card; authors add/remove rows freely.
 *
 * Authoring — one row per card, fields as flat siblings in one cell (any order
 * around the heading):
 *   <picture>                               → optional photo
 *   <p><strong>Badge</strong></p>           → badge / tag (before the heading)
 *   <h3>Title</h3>                          → card title
 *   <ul><li>2,450 hrs</li><li>City</li></ul> → spec line (1st = hours, 2nd = location)
 *   <p><strong>$189,500</strong> note</p>   → price + small note (after the heading)
 *   <p>Plain text</p>                       → description
 *   <p><a href="…">Details</a></p>          → card link (whole card becomes the link)
 *
 * Section head: eyebrow / <h2> / lede / "view all" link authored as default
 * content before the block (styled in place). A <ul> in that head renders as
 * filter chips that filter the cards by text.
 */

const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.6-9.2-9A4.6 4.6 0 0 1 12 6a4.6 4.6 0 0 1 9.2 5C19 15.4 12 20 12 20z"></path></svg>';

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

/** Flat list of authored elements in a row, expanding media-led wrapper <p>s. */
function collectNodes(row) {
  const out = [];
  row.querySelectorAll(':scope > div').forEach((cell) => {
    let kids = [...cell.children];
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].querySelector('picture, img')
      && kids[0].children.length > 1) {
      kids = [...kids[0].childNodes].map((n) => {
        if (n.nodeType === 1) return n;
        // harness-only fallback: bare text inside the runtime's wrapper <p>
        if (n.textContent.trim()) {
          const p = document.createElement('p');
          p.append(n);
          return p;
        }
        return null;
      }).filter(Boolean);
    }
    out.push(...kids);
  });
  return out;
}

function buildCard(row, variant) {
  const nodes = collectNodes(row);
  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const headingIdx = nodes.indexOf(heading);
  let media = null;
  let badge = null;
  let specs = null;
  let price = null;
  let cta = null;
  const desc = [];

  nodes.forEach((n, i) => {
    if (n === heading) return;
    const pic = n.matches('picture, img') ? n : n.querySelector('picture, img');
    if (pic && !media) {
      media = n.tagName === 'P' && !n.textContent.trim() ? n : pic;
      return;
    }
    if (n.matches('ul, ol')) { specs = n; return; }
    if (n.querySelector('a[href]')) { cta = n; return; }
    const leadStrong = n.firstElementChild && n.firstElementChild.tagName === 'STRONG'
      && n.textContent.trim().startsWith(n.firstElementChild.textContent.trim());
    if ((headingIdx === -1 || i < headingIdx) && !badge) { badge = n; return; }
    if (leadStrong && !price) { price = n; return; }
    desc.push(n);
  });

  const link = cta ? cta.querySelector('a[href]') : null;
  const card = document.createElement(link ? 'a' : 'div');
  card.className = 'card';
  if (link) card.href = link.getAttribute('href');

  const ph = document.createElement('div');
  ph.className = 'ph';
  if (media) {
    const img = media.tagName === 'IMG' ? media : media.querySelector('img');
    if (img) img.loading = 'lazy';
    ph.append(wrapNode(media, 'media'));
  }
  card.append(ph);

  const body = document.createElement('div');
  body.className = 'body';

  if (badge) {
    const b = wrapNode(badge, 'badge');
    if (variant === 'offers') body.append(b);
    else ph.append(b);
  }

  if (variant === 'equipment') {
    const fav = document.createElement('span');
    fav.className = 'fav';
    fav.setAttribute('role', 'button');
    fav.setAttribute('tabindex', '0');
    fav.setAttribute('aria-label', 'Save');
    fav.setAttribute('aria-pressed', 'false');
    fav.innerHTML = HEART;
    const toggle = (e) => {
      e.preventDefault();
      e.stopPropagation();
      fav.setAttribute('aria-pressed', fav.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    };
    fav.addEventListener('click', toggle);
    fav.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') toggle(e); });
    ph.append(fav);
  }

  if (heading) body.append(wrapNode(heading, 'title'));
  if (specs) body.append(wrapNode(specs, 'specs'));
  desc.forEach((d) => body.append(wrapNode(d, 'desc')));

  if (price || cta) {
    const foot = document.createElement('div');
    foot.className = 'foot';
    if (price) foot.append(wrapNode(price, 'price'));
    if (cta) {
      // move the authored paragraph, unwrap the nested anchor (card is the link — EW6)
      cta.className = '';
      const view = wrapNode(cta, 'view');
      if (link) link.replaceWith(...link.childNodes);
      foot.append(view);
    }
    body.append(foot);
  }

  card.append(body);
  return card;
}

/** Wire a <ul> in the section head as filter chips over the cards. */
function wireFilters(block, list) {
  const chips = [...list.querySelectorAll(':scope > li')];
  if (!chips.length) return;
  list.classList.add('chips');
  const cards = [...block.querySelectorAll('.card')];
  const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();
  const apply = (chip) => {
    chips.forEach((c) => c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'));
    const idx = chips.indexOf(chip);
    let term = norm(chip.textContent);
    if (term.length > 3 && term.endsWith('s')) term = term.slice(0, -1);
    const matches = cards.filter((c) => norm(c.textContent).includes(term));
    const showAll = idx === 0 || !matches.length;
    cards.forEach((c) => { c.hidden = !showAll && !matches.includes(c); });
  };
  chips.forEach((chip) => {
    chip.setAttribute('role', 'button');
    chip.setAttribute('tabindex', '0');
    chip.addEventListener('click', () => apply(chip));
    chip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        apply(chip);
      }
    });
  });
  chips.forEach((c, i) => c.setAttribute('aria-pressed', i === 0 ? 'true' : 'false'));
}

export default function decorate(block) {
  let variant = '';
  if (block.classList.contains('equipment')) variant = 'equipment';
  else if (block.classList.contains('offers')) variant = 'offers';

  const grid = document.createElement('div');
  grid.className = 'card-grid';
  [...block.children].forEach((row) => grid.append(buildCard(row, variant)));
  block.replaceChildren(grid);

  // section head (default content before the block) may carry filter chips
  const head = block.parentElement?.previousElementSibling;
  if (head && head.classList.contains('default-content-wrapper')) {
    const list = head.querySelector('ul');
    if (list) wireFilters(block, list);
  }
}
