/**
 * Used equipment — filter chips + a grid of machine cards + a footer CTA.
 * The section head (eyebrow, h2, lede, "view all" link) is default content
 * in the same section and is styled in place by this block's CSS.
 *
 * Authoring, one row per unit:
 *   filters: one cell with a <ul> of category names (first = active)
 *   machine: [picture (optional)] | [<p>Badge</p> <h3>Title</h3>
 *            <ul><li>2,450 hrs</li><li>Location</li></ul>
 *            <p><strong>$189,500</strong></p> <p>Or finance available</p>
 *            <p><a href="…">Details</a></p>]
 *   footer:  one cell with a button link (<strong><em><a>…</a></em></strong>)
 */

const SVG = {
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pin: '<path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.4"/>',
  heart: '<path d="M12 20s-7-4.6-9.2-9A4.6 4.6 0 0 1 12 6a4.6 4.6 0 0 1 9.2 5C19 15.4 12 20 12 20z"/>',
};

function svg(name) {
  const tpl = document.createElement('template');
  tpl.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${SVG[name]}</svg>`;
  return tpl.content.firstElementChild;
}

function div(className) {
  const el = document.createElement('div');
  el.className = className;
  return el;
}

function decorateFilters(row, list) {
  const filters = div('used-equipment-filters');
  list.setAttribute('aria-label', 'Filter by category');
  [...list.children].forEach((li, i) => {
    li.setAttribute('role', 'button');
    li.tabIndex = 0;
    li.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    if (i === 0) li.classList.add('active');
  });
  const select = (chip) => {
    list.querySelectorAll('li').forEach((li) => {
      const on = li === chip;
      li.classList.toggle('active', on);
      li.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  };
  list.addEventListener('click', (e) => {
    const chip = e.target.closest('li');
    if (chip && list.contains(chip)) select(chip);
  });
  list.addEventListener('keydown', (e) => {
    const chip = e.target.closest('li');
    if (chip && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      select(chip);
    }
  });
  filters.append(list);
  row.replaceWith(filters);
  return filters;
}

function decorateCard(row) {
  const elements = [...row.querySelectorAll(':scope > div > *')];
  const picture = row.querySelector('picture');
  const heading = elements.find((el) => /^H[2-6]$/.test(el.tagName));
  const link = row.querySelector('a[href]');

  const card = document.createElement(link ? 'a' : 'div');
  card.className = 'used-equipment-card';
  if (link) card.href = link.href;

  const media = div('used-equipment-media');
  if (picture) {
    const holder = picture.parentElement;
    media.append(picture);
    if (holder?.tagName === 'P' && !holder.textContent.trim()) holder.remove();
  }
  const fav = document.createElement('span');
  fav.className = 'used-equipment-fav';
  fav.setAttribute('aria-hidden', 'true');
  fav.append(svg('heart'));
  fav.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    fav.classList.toggle('saved');
  });
  media.append(fav);

  const body = div('used-equipment-body');
  const foot = div('used-equipment-foot');
  const price = div('used-equipment-price');
  const headingIndex = elements.indexOf(heading);
  let seenPrice = false;

  elements.forEach((el, i) => {
    if (el.contains(picture) || !el.isConnected) return;
    if (!el.textContent.trim()) return;
    if (el === heading) {
      body.append(el);
    } else if (heading && i < headingIndex) {
      el.classList.add('used-equipment-badge');
      media.append(el);
    } else if (el.tagName === 'UL' || el.tagName === 'OL') {
      el.classList.add('used-equipment-specs');
      [...el.children].forEach((li, n) => li.prepend(svg(n === 0 ? 'clock' : 'pin')));
      body.append(el);
    } else if (link && el.contains(link)) {
      el.classList.add('used-equipment-view');
      el.classList.remove('button-wrapper');
      link.replaceWith(...link.childNodes);
      foot.append(el);
    } else if (!seenPrice && el.querySelector('strong')) {
      seenPrice = true;
      el.classList.add('used-equipment-amount');
      price.append(el);
    } else if (seenPrice) {
      el.classList.add('used-equipment-note');
      price.append(el);
    } else {
      body.append(el);
    }
  });

  if (price.children.length) foot.prepend(price);
  if (foot.children.length) body.append(foot);
  card.append(media, body);
  return card;
}

export default function decorate(block) {
  const grid = div('used-equipment-grid');
  const rows = [...block.children];
  const out = [];

  rows.forEach((row) => {
    const hasHeading = row.querySelector('h2, h3, h4, h5, h6');
    const list = row.querySelector('ul, ol');
    if (!hasHeading && list) {
      out.push(decorateFilters(row, list));
    } else if (!hasHeading && row.querySelector('a.button, .button-wrapper')) {
      const foot = div('used-equipment-more');
      row.querySelectorAll(':scope > div > *').forEach((el) => foot.append(el));
      row.remove();
      out.push(foot);
    } else {
      grid.append(decorateCard(row));
      row.remove();
      if (!out.includes(grid)) out.push(grid);
    }
  });

  block.replaceChildren(...out);
}
