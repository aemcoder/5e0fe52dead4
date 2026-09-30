/**
 * Cards — a head + a grid of link cards. Variants:
 *   `cards used`   — inventory cards (photo, badge, save heart, title, specs,
 *                    price + note, "Details" link) on a paper band.
 *   `cards offers` — photo-overlay offer tiles (tag, title, "View offer").
 *
 * Section head (DEFAULT CONTENT placed before the block, reabsorbed here):
 *   <p>Eyebrow</p> <h2>Heading</h2> [<p>Lede</p>] [<p><a>Head link</a></p>]
 *   [<ul><li>Filter chip</li>…</ul>]  (first chip starts active)
 * Trailing default content AFTER the block (a CTA paragraph) is reabsorbed
 * as the centered footer action.
 *
 * Rows: one row per card, two cells:
 *   | <picture> (optional) | <p><strong>Badge</strong></p> <h3>Title</h3>
 *     [<ul><li>2,450 hrs</li><li>Location</li></ul>]
 *     [<p><strong>$Price</strong></p> <p>Price note</p>] <p><a>Details</a></p> |
 * The whole card becomes the link (EW6: inner anchor unwrapped).
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function div(className, ...children) {
  const d = document.createElement('div');
  d.className = className;
  d.append(...children);
  return d;
}

function rowNodes(row) {
  const out = [];
  [...row.children].forEach((cell) => {
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
    if (kids.length) out.push(...kids);
    else if (cell.textContent.trim()) {
      // HARNESS-ONLY fallback: wrap existing text nodes, never synthesize.
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out;
}

const isMedia = (n) => n.matches('picture, img')
  || (n.tagName === 'P' && !!n.querySelector('picture, img') && !n.textContent.trim());

const isStrongOnly = (p) => p.tagName === 'P'
  && !p.querySelector('a')
  && !!p.querySelector('strong')
  && p.textContent.trim() === [...p.querySelectorAll('strong')].map((s) => s.textContent).join('').trim();

const HEART = '<path d="M12 20s-7-4.6-9.2-9A4.6 4.6 0 0 1 12 6a4.6 4.6 0 0 1 9.2 5C19 15.4 12 20 12 20z"/>';

function heart() {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = HEART;
  return s;
}

/** Build the section head from the leading default-content wrapper (EW8: move). */
function buildHead(wrapper) {
  const kids = [...wrapper.children];
  const heading = kids.find((n) => /^H[1-6]$/.test(n.tagName));
  const hIndex = heading ? kids.indexOf(heading) : -1;
  const text = div('sec-text');
  const links = [];
  let filters = null;

  kids.forEach((n, i) => {
    if (n === heading) {
      text.append(wrapNode(n, 'headline'));
    } else if (n.tagName === 'UL' || n.tagName === 'OL') {
      filters = n;
    } else if (n.tagName === 'P' && n.querySelector('a')) {
      links.push(n);
    } else if (hIndex > -1 && i < hIndex) {
      text.append(wrapNode(n, 'kicker'));
    } else {
      text.append(wrapNode(n, 'lede'));
    }
  });

  const head = div('sec-head', text);
  if (links.length) head.append(div('sec-link', ...links));
  wrapper.remove();

  let filterBar = null;
  if (filters) {
    filterBar = div('filters', filters);
    const chips = [...filters.children];
    const activate = (chip) => {
      chips.forEach((c) => {
        c.classList.toggle('is-active', c === chip);
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
  }
  return { head, filterBar };
}

function buildCard(row, variant) {
  const nodes = rowNodes(row);
  if (!nodes.length) return null;
  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const hIndex = heading ? nodes.indexOf(heading) : -1;

  const media = [];
  const badge = [];
  const specs = [];
  const price = [];
  const note = [];
  const extra = [];
  let more = null;
  let link = null;

  nodes.forEach((n, i) => {
    if (n === heading) return;
    if (isMedia(n)) media.push(n);
    else if (n.tagName === 'UL' || n.tagName === 'OL') specs.push(n);
    else if (!more && n.querySelector('a')) {
      more = n;
      link = n.tagName === 'A' ? n : n.querySelector('a');
    } else if (hIndex > -1 && i < hIndex) badge.push(n);
    else if (isStrongOnly(n) && !price.length) price.push(n);
    else if (price.length && !note.length) note.push(n);
    else extra.push(n);
  });

  const card = document.createElement(link ? 'a' : 'div');
  card.className = 'card';
  if (link) {
    card.href = link.getAttribute('href');
    if (link.title) card.title = link.title;
  }

  const ph = div('ph');
  if (media.length) ph.append(div('ph-media', ...media));

  let moreWrap = null;
  if (more) {
    moreWrap = div('more', more);
    // EW6 — unwrap the authored anchor inside the card link; keep its <p>
    if (link && link !== more) link.replaceWith(...link.childNodes);
  }

  if (variant === 'offers') {
    const ov = div('ov');
    const c = div('c');
    if (badge.length) c.append(div('tag', ...badge));
    if (heading) c.append(wrapNode(heading, 'title'));
    if (extra.length) c.append(div('desc', ...extra));
    if (moreWrap) c.append(moreWrap);
    card.append(ph, ov, c);
    return card;
  }

  if (badge.length) ph.append(div('badge', ...badge));
  const fav = document.createElement('span');
  fav.className = 'fav';
  fav.setAttribute('aria-hidden', 'true');
  fav.append(heart());
  ph.append(fav);

  const body = div('body');
  if (heading) body.append(wrapNode(heading, 'title'));
  if (specs.length) body.append(div('specs', ...specs));
  if (extra.length) body.append(div('desc', ...extra));
  const foot = div('foot');
  if (price.length || note.length) {
    const priceWrap = div('price');
    if (price.length) priceWrap.append(div('amount', ...price));
    if (note.length) priceWrap.append(div('note', ...note));
    foot.append(priceWrap);
  }
  if (moreWrap) foot.append(moreWrap);
  if (foot.children.length) body.append(foot);
  card.append(ph, body);
  return card;
}

export default function decorate(block) {
  const variant = block.classList.contains('offers') ? 'offers' : 'used';
  const blockWrapper = block.parentElement;

  // section head — default content immediately before the block (EW8)
  let head = null;
  let filterBar = null;
  const prev = blockWrapper && blockWrapper.previousElementSibling;
  if (prev && prev.classList.contains('default-content-wrapper')) {
    ({ head, filterBar } = buildHead(prev));
  }

  // trailing CTA — default content immediately after the block
  let footActions = null;
  const next = blockWrapper && blockWrapper.nextElementSibling;
  if (next && next.classList.contains('default-content-wrapper')
    && next.querySelector('a') && !next.querySelector('h1, h2, h3, h4, h5, h6')) {
    footActions = div('cards-foot', ...next.children);
    next.remove();
  }

  const grid = div('grid');
  [...block.children].forEach((row) => {
    const card = buildCard(row, variant);
    if (card) grid.append(card);
  });

  const wrap = div('wrap');
  if (head) wrap.append(head);
  if (filterBar) wrap.append(filterBar);
  wrap.append(grid);
  if (footActions) wrap.append(footActions);
  block.replaceChildren(wrap);
}
