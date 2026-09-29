/**
 * Cards — a grid of link cards. Reconstructive: one row per card, cells classified by content.
 * Variants: `equipment` (inventory cards: badge + save on the photo, specs, price foot)
 *           `offers`    (photo tiles with the copy over a dark gradient)
 *
 * Authoring, one row per card:
 *   cell 1  picture (optional — an empty cell renders the placeholder ground)
 *   cell 2  <p>Badge</p>                  optional, before the heading
 *           <h3>Title</h3>
 *           <ul><li>2,450 hrs</li><li>Salt Lake City, UT</li></ul>   specs (equipment)
 *           <p>$189,500</p><p>Or finance available</p>              price + note (equipment)
 *           <p><a href>Details</a></p>    the card link — the whole card becomes the link
 *
 * Section head (default content right before the block, reabsorbed into the block layout):
 *   <p>eyebrow</p> <h2>title</h2> <p>lede</p> <p><a>view-all link</a></p> <ul>filter chips</ul>
 *   Filter chips match card title/badge text; the first "All" chip resets.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  if (node) w.append(node);
  return w;
}

// read-only classification helper — decisions only, never displayed text
const text = (el) => (el ? el.textContent.trim() : '');
const isLinkOnly = (p) => {
  const links = [...p.querySelectorAll('a[href]')];
  return links.length > 0 && links.map(text).join('') === text(p);
};

function buildHead(block) {
  const wrapper = block.parentElement;
  const prev = wrapper?.previousElementSibling;
  if (!prev || !prev.classList.contains('default-content-wrapper')) return;

  // capture before moving (EW1/EW8)
  const items = [...prev.children];
  const heading = items.find((el) => /^H[1-6]$/.test(el.tagName));
  const chips = items.find((el) => el.tagName === 'UL' || el.tagName === 'OL');
  const link = items.find((el) => el.tagName === 'P' && isLinkOnly(el) && !el.querySelector('.button'));
  const kicker = heading
    ? items.find((el) => el.tagName === 'P' && el !== link && items.indexOf(el) < items.indexOf(heading))
    : null;
  const ledes = items.filter((el) => el.tagName === 'P' && ![kicker, link].includes(el));

  const head = wrapNode(null, 'cards-head');
  const headText = wrapNode(null, 'cards-head-text');
  if (kicker) headText.append(wrapNode(kicker, 'sec-kicker'));
  if (heading) headText.append(wrapNode(heading, 'cards-head-title'));
  if (ledes.length) {
    const lede = wrapNode(null, 'cards-head-lede');
    lede.append(...ledes);
    headText.append(lede);
  }
  head.append(headText);
  if (link) head.append(wrapNode(link, 'cards-head-link'));
  wrapper.prepend(head);

  if (chips) {
    const filters = wrapNode(chips, 'cards-filters');
    filters.setAttribute('role', 'group');
    filters.setAttribute('aria-label', 'Filter');
    head.after(filters);
  }

  // anything unclassified stays as default content
  if (!prev.children.length) prev.remove();
}

function setupFilters(block) {
  const wrapper = block.parentElement;
  const chips = [...(wrapper.querySelectorAll('.cards-filters li') || [])];
  if (!chips.length) return;
  const cards = [...block.querySelectorAll('.cards-card')];
  const normalise = (s) => s.toLowerCase().replace(/[®™]/g, '').replace(/\s+/g, ' ').trim();
  const singular = (s) => s.split(' ').map((w) => w.replace(/(s|es)$/, (m) => (w.length > 4 ? '' : m))).join(' ');

  const apply = (chip) => {
    chips.forEach((c) => c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'));
    const label = singular(normalise(chip.textContent));
    const showAll = chip === chips[0] && /^all\b/.test(label);
    cards.forEach((card) => {
      const hay = singular(normalise(card.dataset.filterText || ''));
      card.hidden = !showAll && !hay.includes(label);
    });
  };

  chips.forEach((chip, i) => {
    chip.setAttribute('role', 'button');
    chip.tabIndex = 0;
    chip.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    chip.addEventListener('click', () => apply(chip));
    chip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        apply(chip);
      }
    });
  });
}

export default function decorate(block) {
  const offers = block.classList.contains('offers');
  const equipment = block.classList.contains('equipment');

  const list = document.createElement('ul');
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const picture = row.querySelector('picture, img');
    const body = cells.find((c) => c.querySelector('h1, h2, h3, h4, h5, h6, p, ul')) || cells[cells.length - 1];
    if (!body) return;

    // classify (capture before moving)
    const kids = [...body.children];
    const heading = kids.find((el) => /^H[1-6]$/.test(el.tagName));
    const hIdx = heading ? kids.indexOf(heading) : -1;
    const ctaP = [...kids].reverse().find((el) => el.tagName === 'P' && isLinkOnly(el));
    const link = ctaP?.querySelector('a[href]');
    const badge = kids.find((el, i) => el.tagName === 'P' && i < hIdx && !el.querySelector('picture'));
    const specs = kids.find((el) => (el.tagName === 'UL' || el.tagName === 'OL') && kids.indexOf(el) > hIdx);
    const after = kids.filter((el) => el.tagName === 'P' && kids.indexOf(el) > hIdx && el !== ctaP);
    const price = equipment ? after.find((el) => /\d/.test(text(el))) : null;
    const notes = after.filter((el) => el !== price);

    const li = document.createElement('li');
    li.className = 'cards-card';
    li.dataset.filterText = `${text(heading)} ${text(badge)}`;
    const card = document.createElement(link ? 'a' : 'div');
    card.className = 'cards-card-link';
    if (link) card.href = link.href;

    const media = wrapNode(null, 'cards-card-image');
    if (picture) {
      const owner = picture.closest('p');
      media.append(picture.closest('picture') || picture);
      if (owner && !text(owner) && !owner.querySelector('img')) owner.remove();
    }

    const content = wrapNode(null, 'cards-card-body');
    if (badge) (offers ? content : media).append(wrapNode(badge, 'cards-card-badge'));
    if (heading) content.append(wrapNode(heading, 'cards-card-title'));
    if (specs) content.append(wrapNode(specs, 'cards-card-specs'));

    const foot = wrapNode(null, 'cards-card-foot');
    if (price || (equipment && notes.length)) {
      const amount = wrapNode(null, 'cards-card-amount');
      if (price) amount.append(wrapNode(price, 'cards-card-price'));
      if (equipment && notes.length) {
        const note = wrapNode(null, 'cards-card-note');
        note.append(...notes);
        amount.append(note);
      }
      foot.append(amount);
    } else if (notes.length) {
      const desc = wrapNode(null, 'cards-card-desc');
      desc.append(...notes);
      content.append(desc);
    }
    if (ctaP) {
      foot.append(wrapNode(ctaP, 'cards-card-cta'));
      link.replaceWith(...link.childNodes); // EW6: the card is the link
    }
    if (foot.children.length) content.append(foot);

    card.append(media, content);
    li.append(card);

    if (equipment) {
      const fav = document.createElement('button');
      fav.type = 'button';
      fav.className = 'cards-card-fav';
      fav.setAttribute('aria-pressed', 'false');
      fav.setAttribute('aria-label', `Save ${text(heading)}`.trim());
      fav.addEventListener('click', () => {
        fav.setAttribute('aria-pressed', fav.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      });
      li.append(fav);
    }
    list.append(li);
  });

  block.replaceChildren(list);
  buildHead(block);
  setupFilters(block);
}
