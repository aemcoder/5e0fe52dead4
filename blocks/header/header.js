import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/*
 * Wheeler header — utility bar, masthead (logo, search, phone), black primary
 * nav, and a slide-in drawer below 960px.
 *
 * Nav fragment sections (detected by content, order does not matter):
 *   brand:   <p><a href="/">Wheeler CAT</a></p>   (trailing "CAT" becomes the badge)
 *   nav:     <ul> of links; <strong>-wrapped links render highlighted
 *   tools:   <p><a href="/search">Search placeholder</a></p> <p>Call us today</p>
 *            <p><a href="tel:…">801-436-3672</a></p>
 *   utility: two <ul>s (left / right); links may lead with an :icon:
 */

const isDesktop = window.matchMedia('(min-width: 960px)');

const ICONS = {
  pin: '<path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  connect: '<path d="M4 6h16M4 12h16M4 18h12"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  find: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
};
ICONS.search = ICONS.find;

function svg(name) {
  const tpl = document.createElement('template');
  tpl.innerHTML = `<svg class="nav-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
  return tpl.content.firstElementChild;
}

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

/** remove Experience Workspace instrumentation from cloned nodes */
function stripInstrumentation(node) {
  [node, ...node.querySelectorAll('*')].forEach((n) => {
    [...n.attributes].forEach(({ name }) => {
      if (name.startsWith('data-prose') || name.startsWith('data-image') || name.startsWith('data-block-index')) {
        n.removeAttribute(name);
      }
    });
  });
  return node;
}

/** swap decorated icon <img>s for inline SVG so they follow currentColor */
function inlineIcons(root) {
  root.querySelectorAll('span.icon').forEach((span) => {
    const cls = [...span.classList].find((c) => c.startsWith('icon-'));
    const name = cls && cls.substring(5);
    if (name && ICONS[name]) span.replaceChildren(svg(name));
  });
}

function buildBrand(section) {
  const link = section?.querySelector('a[href]');
  const brand = el('a', 'nav-brand', { href: link ? link.href : '/' });
  const text = (link || section)?.textContent.trim() || 'Wheeler CAT';
  const match = text.match(/^(.*?)\s+(\S+)$/);
  const mark = el('span', 'nav-brand-mark');
  mark.textContent = match ? match[1] : text;
  brand.append(mark);
  if (match) {
    const badge = el('span', 'nav-brand-badge');
    badge.textContent = match[2];
    brand.append(badge);
  }
  brand.setAttribute('aria-label', `${text} home`);
  return brand;
}

function buildSearch(link, className) {
  const form = el('form', className, { role: 'search' });
  let action = '/search';
  if (link) {
    try {
      action = new URL(link.href, window.location).pathname;
    } catch { /* keep default */ }
  }
  form.action = action;
  form.method = 'get';
  const input = el('input', '', {
    type: 'search',
    name: 'q',
    placeholder: link ? link.textContent.trim() : 'Search',
    'aria-label': 'Search',
  });
  form.append(svg('find'), input);
  return form;
}

function buildUtility(section) {
  const bar = el('div', 'nav-utility');
  const inner = el('div', 'nav-inner');
  const lists = [...section.querySelectorAll('ul')];
  lists.forEach((ul, i) => {
    ul.className = i === 0 ? 'nav-utility-left' : 'nav-utility-right';
    ul.querySelectorAll(':scope > li').forEach((li) => {
      if (li.querySelector('.icon') && i === 0) li.classList.add('nav-pill');
    });
    inlineIcons(ul);
    inner.append(ul);
  });
  bar.append(inner);
  return bar;
}

function buildPrimary(section) {
  const ul = section.querySelector('ul');
  ul.className = 'nav-primary-list';
  ul.querySelectorAll('a').forEach((a) => {
    a.classList.remove('button', 'primary', 'secondary', 'accent');
    const strong = a.closest('strong');
    if (strong) {
      a.classList.add('nav-strong');
      strong.replaceWith(a);
    }
  });
  const bar = el('div', 'nav-primary');
  const inner = el('div', 'nav-inner');
  inner.append(ul);
  bar.append(inner);
  return bar;
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const tools = sections.find((s) => s.querySelector('a[href^="tel:"]'));
  const utility = sections.find((s) => s !== tools && s.querySelectorAll('ul').length > 1);
  const primary = sections.find((s) => s !== tools && s !== utility && s.querySelector('ul'));
  const brandSection = sections.find((s) => ![tools, utility, primary].includes(s));

  const nav = el('nav', 'nav', { id: 'nav', 'aria-label': 'Main' });

  // utility bar
  if (utility) nav.append(buildUtility(utility));

  // masthead
  const mastBar = el('div', 'nav-mast');
  const mast = el('div', 'nav-inner nav-masthead');
  const brand = buildBrand(brandSection);
  mast.append(brand);

  const phoneLink = tools?.querySelector('a[href^="tel:"]');
  const searchLink = tools && [...tools.querySelectorAll('a[href]')].find((a) => a !== phoneLink);
  mast.append(buildSearch(searchLink, 'nav-search'));

  const cta = el('div', 'nav-cta');
  if (phoneLink) {
    const call = el('a', 'nav-iconbtn nav-call', { href: phoneLink.href, 'aria-label': `Call ${phoneLink.textContent.trim()}` });
    call.append(svg('phone'));
    cta.append(call);
    const phone = el('div', 'nav-phone');
    const label = [...tools.querySelectorAll('p')].find((p) => !p.querySelector('a'));
    if (label) {
      label.className = 'nav-phone-label';
      phone.append(label);
    }
    const numberP = phoneLink.closest('p') || phoneLink;
    numberP.className = 'nav-phone-number';
    phoneLink.className = '';
    phone.append(numberP);
    cta.append(phone);
  }
  const hamburger = el('button', 'nav-iconbtn nav-hamburger', {
    type: 'button', 'aria-controls': 'nav-drawer', 'aria-expanded': 'false', 'aria-label': 'Open menu',
  });
  hamburger.append(svg('menu'));
  cta.append(hamburger);
  mast.append(cta);
  mastBar.append(mast);
  nav.append(mastBar);

  // primary nav
  let primaryBar;
  if (primary) {
    primaryBar = buildPrimary(primary);
    nav.append(primaryBar);
  }

  // mobile drawer
  const drawer = el('div', 'nav-drawer', { id: 'nav-drawer', hidden: '' });
  const panel = el('div', 'nav-drawer-panel', { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Menu' });
  const head = el('div', 'nav-drawer-head');
  const close = el('button', 'nav-drawer-close', { type: 'button', 'aria-label': 'Close menu' });
  close.append(svg('close'));
  head.append(stripInstrumentation(brand.cloneNode(true)), close);
  panel.append(head, buildSearch(searchLink, 'nav-drawer-search'));
  if (primaryBar) {
    const links = el('ul', 'nav-drawer-links');
    primaryBar.querySelectorAll('a').forEach((a) => {
      const li = el('li');
      li.append(stripInstrumentation(a.cloneNode(true)));
      links.append(li);
    });
    panel.append(links);
  }
  if (phoneLink) {
    const mphone = el('a', 'nav-drawer-phone', { href: phoneLink.href });
    mphone.append(svg('phone'), document.createTextNode(phoneLink.textContent.trim()));
    panel.append(mphone);
  }
  drawer.append(panel);
  nav.append(drawer);

  let closeTimer;
  const setOpen = (open) => {
    clearTimeout(closeTimer);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflowY = open ? 'hidden' : '';
    if (open) {
      drawer.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => drawer.classList.add('open')));
      close.focus();
    } else {
      drawer.classList.remove('open');
      closeTimer = setTimeout(() => { drawer.hidden = true; }, 300);
    }
  };
  hamburger.addEventListener('click', () => setOpen(true));
  close.addEventListener('click', () => {
    setOpen(false);
    hamburger.focus();
  });
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer || e.target.closest('.nav-drawer-links a')) setOpen(false);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      setOpen(false);
      hamburger.focus();
    }
  });
  isDesktop.addEventListener('change', () => {
    if (isDesktop.matches && !drawer.hidden) setOpen(false);
  });

  // shadow once the page scrolls
  const header = block.closest('header');
  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  block.textContent = '';
  block.append(nav);
}
