import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * header — Field Guide sticky nav with mega panels, reading-progress rule
 * and trailing cursor.
 *
 * Nav document contract (three sections):
 *   1. brand: one paragraph holding a plain link (Field Guide → #top)
 *   2. sections: a <ul>; each top-level <li> is one mega menu:
 *        <p>Label</p> <p>panel intro line</p> <p><a>panel link →</a></p>
 *        <ul> panel items </ul>
 *      Panel items (<li>) are one of:
 *        - card: <p><a>Title</a></p> <p>description</p> <p>meta</p>
 *        - photo tile: <p><a><img></a></p> <p>caption</p>
 *        - group: <p>Title</p> [<p>count</p>] <ul> of <li><p><a>Name</a></p><p>detail</p></li>
 *        - feature: paragraphs only (big number / kicker / image / text / CTA)
 *   3. tools: CTA paragraph(s) — <strong><a> renders as the primary button.
 */

const pad = (n) => String(n).padStart(2, '0');
const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(pointer: fine)').matches;

function div(className, ...children) {
  const el = document.createElement('div');
  if (className) el.className = className;
  el.append(...children);
  return el;
}

function directChildren(el, selector) {
  return [...el.children].filter((c) => c.matches(selector));
}

/* wraps loose text nodes of an <li> into <p> so tight and loose lists decode alike */
function normalizeItem(li) {
  const loose = [...li.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
  loose.forEach((n) => {
    const p = document.createElement('p');
    n.replaceWith(p);
    p.append(n);
  });
  [...li.children].forEach((c) => {
    if (c.tagName === 'A' || c.tagName === 'PICTURE' || c.tagName === 'IMG') {
      const p = document.createElement('p');
      c.replaceWith(p);
      p.append(c);
    }
  });
}

/* card-as-link: the whole tile is the anchor; inner authored anchor is unwrapped */
function buildCard(li, index) {
  const ps = directChildren(li, 'p');
  const linkP = ps.find((p) => p.querySelector('a'));
  const link = linkP.querySelector('a');
  const card = document.createElement('a');
  card.className = 'mega-card';
  card.href = link.getAttribute('href');
  const num = document.createElement('span');
  num.className = 'mega-card-num';
  num.textContent = pad(index + 1);
  const title = div('mega-card-title', linkP);
  link.replaceWith(...link.childNodes);
  card.append(num, title);
  const rest = ps.filter((p) => p !== linkP);
  if (rest[0]) card.append(div('mega-card-desc', rest[0]));
  if (rest[1]) card.append(div('mega-card-meta', ...rest.slice(1)));
  return card;
}

function buildPhoto(li) {
  const ps = directChildren(li, 'p');
  const mediaP = ps.find((p) => p.querySelector('picture, img'));
  const link = mediaP.querySelector('a');
  const tile = document.createElement('a');
  tile.className = 'mega-photo';
  tile.href = link ? link.getAttribute('href') : '#';
  const media = mediaP.querySelector('picture') || mediaP.querySelector('img');
  tile.append(div('mega-photo-media grayscale', media));
  const caption = ps.find((p) => p !== mediaP);
  if (caption) tile.append(div('mega-photo-caption', caption));
  return tile;
}

function buildGroup(li) {
  const ps = directChildren(li, 'p');
  const list = li.querySelector(':scope > ul');
  const group = div('mega-group');
  const head = div('mega-group-head');
  if (ps[0]) head.append(div('mega-group-title', ps[0]));
  if (ps[1]) head.append(div('mega-group-count', ps[1]));
  else {
    const count = document.createElement('span');
    count.className = 'mega-group-count';
    count.textContent = pad(list.children.length);
    head.append(count);
  }
  group.append(head);
  [...list.children].forEach((item) => {
    normalizeItem(item);
    const ips = directChildren(item, 'p');
    const linkP = ips.find((p) => p.querySelector('a'));
    if (!linkP) return;
    const link = linkP.querySelector('a');
    const row = document.createElement('a');
    row.className = 'mega-link';
    row.href = link.getAttribute('href');
    row.append(div('mega-link-name', linkP));
    link.replaceWith(...link.childNodes);
    ips.filter((p) => p !== linkP).forEach((p) => row.append(div('mega-link-detail', p)));
    group.append(row);
  });
  return group;
}

function buildFeature(li) {
  const feature = div('mega-feature');
  const ps = directChildren(li, 'p');
  const textPs = ps.filter((p) => !p.querySelector('a, picture, img') && !/^\s*\d+\s*$/.test(p.textContent));
  ps.forEach((p) => {
    let role = 'text';
    if (p.querySelector('picture, img')) role = 'media grayscale';
    else if (p.querySelector('a')) role = 'action';
    else if (/^\s*\d+\s*$/.test(p.textContent)) role = 'num';
    else if (textPs.length > 1 && p === textPs[0]) role = 'kicker';
    feature.append(div(`mega-feature-${role}`, p));
  });
  return feature;
}

function buildPanel(li, key) {
  const ps = directChildren(li, 'p');
  const items = li.querySelector(':scope > ul');
  const panel = div('mega');
  panel.id = `mega-${key}`;
  panel.hidden = true;
  const inner = div('mega-inner');
  const head = div('mega-head');
  ps.slice(1).forEach((p) => {
    head.append(div(p.querySelector('a') ? 'mega-more' : 'mega-intro', p));
  });
  inner.append(head);

  const grid = div('mega-grid');
  if (items) {
    let cardIndex = 0;
    [...items.children].forEach((item) => {
      normalizeItem(item);
      let tile;
      if (item.querySelector(':scope > ul')) tile = buildGroup(item);
      else if (item.querySelector(':scope > p a picture, :scope > p a img')) tile = buildPhoto(item);
      else if (item.querySelector(':scope > p:first-child > a:not(.button)')) {
        tile = buildCard(item, cardIndex);
        cardIndex += 1;
      } else tile = buildFeature(item);
      tile.dataset.mi = '';
      grid.append(tile);
    });
    if (grid.querySelector('.mega-card')) grid.classList.add('mega-grid-cards');
  }
  inner.append(grid);
  panel.append(inner);
  return panel;
}

function initCursor() {
  if (!finePointer() || prefersReduced() || document.querySelector('.cursor-dot')) return;
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.setAttribute('aria-hidden', 'true');
  document.body.append(dot);
  const P = {
    x: -200, y: -200, cx: -200, cy: -200, s: 1, big: false,
  };
  window.addEventListener('pointermove', (e) => { P.x = e.clientX; P.y = e.clientY; }, { passive: true });
  window.addEventListener('pointerover', (e) => {
    const t = e.target;
    P.big = !!(t && t.closest && t.closest('a, button, label, video, [role="button"], canvas, .type-specimen'));
  });
  const tick = () => {
    P.cx += (P.x - P.cx) * 0.2;
    P.cy += (P.y - P.cy) * 0.2;
    P.s += ((P.big ? 3.4 : 1) - P.s) * 0.18;
    dot.style.transform = `translate3d(${(P.cx - 7).toFixed(1)}px,${(P.cy - 7).toFixed(1)}px,0) scale(${P.s.toFixed(3)})`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');
  if (!fragment) {
    block.append(div('nav-wrapper', nav));
    return;
  }

  const sections = [...fragment.children];
  const [brandSection, menuSection, toolsSection] = sections;

  // brand
  if (brandSection) {
    const brand = div('nav-brand');
    const content = brandSection.querySelector('.default-content-wrapper') || brandSection;
    brand.append(...content.children);
    const brandLink = brand.querySelector('a');
    if (brandLink) {
      brandLink.classList.remove('button', 'primary', 'secondary', 'accent');
      const wrap = brandLink.closest('.button-wrapper');
      if (wrap) wrap.classList.remove('button-wrapper');
    }
    nav.append(brand);
  }

  // mega menus
  const menus = div('nav-menus');
  const panels = div('nav-panels');
  const triggers = [];
  if (menuSection) {
    const list = menuSection.querySelector('ul');
    if (list) {
      [...list.children].forEach((li, i) => {
        normalizeItem(li);
        const labelP = li.querySelector(':scope > p');
        const key = (labelP ? labelP.textContent : `menu-${i}`).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'nav-trigger';
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-haspopup', 'true');
        button.setAttribute('aria-controls', `mega-${key}`);
        const label = document.createElement('span');
        label.className = 'nav-trigger-label';
        if (labelP) label.append(...labelP.childNodes);
        const chevron = document.createElement('span');
        chevron.className = 'nav-chevron';
        chevron.setAttribute('aria-hidden', 'true');
        button.append(label, chevron);
        const panel = buildPanel(li, key);
        menus.append(button);
        panels.append(panel);
        triggers.push({ button, panel, key });
      });
    }
  }
  nav.append(menus);

  // tools
  if (toolsSection) {
    const tools = div('nav-tools');
    const content = toolsSection.querySelector('.default-content-wrapper') || toolsSection;
    tools.append(...content.children);
    nav.append(tools);
  }

  const progress = div('nav-progress');
  progress.setAttribute('aria-hidden', 'true');
  const backdrop = div('nav-backdrop');
  backdrop.hidden = true;

  const wrapper = div('nav-wrapper', nav, panels, progress);
  block.append(wrapper);
  document.body.append(backdrop);

  // menu state
  let open = null;
  let openY = 0;
  let timer;
  const setMenu = (key) => {
    clearTimeout(timer);
    if (key === open) return;
    const wasOpen = !!open;
    open = key;
    openY = window.scrollY;
    triggers.forEach((t) => {
      const on = t.key === key;
      t.button.setAttribute('aria-expanded', on ? 'true' : 'false');
      t.panel.hidden = !on;
      if (on && !prefersReduced()) {
        if (!wasOpen) {
          t.panel.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 480, easing: 'cubic-bezier(.2,.8,.1,1)' });
          backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
        }
        t.panel.querySelectorAll('[data-mi], .mega-head').forEach((el, i) => el.animate(
          [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
          {
            duration: 420, delay: (wasOpen ? 0 : 120) + i * 35, easing: 'cubic-bezier(.2,.8,.1,1)', fill: 'backwards',
          },
        ));
      }
    });
    backdrop.hidden = !key;
  };

  triggers.forEach(({ button, key }) => {
    button.addEventListener('click', () => setMenu(open === key ? null : key));
    button.addEventListener('mouseenter', () => {
      if (!finePointer()) return;
      clearTimeout(timer);
      if (open) setMenu(key);
      else timer = setTimeout(() => setMenu(key), 120);
    });
  });
  wrapper.addEventListener('mouseleave', () => {
    clearTimeout(timer);
    if (open) timer = setTimeout(() => setMenu(null), 240);
  });
  wrapper.addEventListener('mouseenter', () => { if (open) clearTimeout(timer); });
  panels.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(null); });
  backdrop.addEventListener('click', () => setMenu(null));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) {
      const t = triggers.find((x) => x.key === open);
      setMenu(null);
      if (t) t.button.focus();
    }
  });
  wrapper.addEventListener('focusout', (e) => {
    if (open && !wrapper.contains(e.relatedTarget)) setMenu(null);
  });

  // reading-progress rule + close-on-scroll
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, y / max)) : 0})`;
    if (open && Math.abs(y - openY) > 80) setMenu(null);
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  initCursor();
}
