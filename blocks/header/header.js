import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Wheeler header — utility bar, masthead (logo, search, phone) and the black
 * primary nav, plus a slide-in mobile menu.
 *
 * Nav fragment (sections, in order; each is recognised by its content):
 *   brand    <p><a href="/">Wheeler</a></p>                     (plain link)
 *   primary  <ul> of nav links; <strong><a> marks a highlighted (yellow) link
 *   tools    <p>search placeholder</p> <p>phone label</p> <p><a href="tel:…">number</a></p>
 *   utility  two <ul>s — left (first item = current branch) and right (account links)
 *
 * @ew-exempt <p> search placeholder (tools section) — text-as-metadata, rendered as an input placeholder
 */

const ICON = {
  pin: '<path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h12"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  burger: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
};

function svg(name, className = 'icon') {
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICON[name]}</svg>`;
}

function el(tag, className) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

function stripInstrumentation(root) {
  root.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  root.removeAttribute('data-prose-index');
  return root;
}

function prependIcon(link, name) {
  if (!link || link.querySelector('svg')) return;
  link.insertAdjacentHTML('afterbegin', svg(name));
}

/** Pick the fragment's sections apart by content, not position. */
function classify(fragment) {
  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const parts = {};
  const pool = sections.length ? sections : [fragment];
  pool.forEach((section) => {
    const lists = [...section.querySelectorAll('ul')];
    const paras = [...section.querySelectorAll('p')];
    if (lists.length >= 2 && !parts.utility) parts.utility = lists;
    else if (lists.length === 1 && !parts.primary) [parts.primary] = lists;
    else if (paras.some((p) => p.querySelector('a[href^="tel:"]')) && !parts.tools) parts.tools = paras;
    else if (paras.length && !parts.brand) [parts.brand] = paras;
  });
  return parts;
}

function buildLogo(brandPara) {
  const wrap = el('div', 'logo');
  if (!brandPara) return wrap;
  const link = brandPara.querySelector('a');
  if (link) {
    link.setAttribute('aria-label', `${link.textContent.trim()} home`);
    const mark = el('span', 'cat');
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = 'CAT';
    link.append(mark);
  }
  wrap.append(brandPara);
  return wrap;
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  const parts = classify(fragment);
  block.textContent = '';

  /* ---------- utility bar ---------- */
  const utility = el('div', 'utility');
  const uWrap = el('div', 'wrap');
  const [uLeft, uRight] = parts.utility || [];
  if (uLeft) {
    const left = el('div', 'u-left');
    left.append(uLeft);
    const first = uLeft.querySelector('li a');
    prependIcon(first, 'pin');
    uWrap.append(left);
  }
  if (uRight) {
    const right = el('div', 'u-right');
    right.append(uRight);
    const names = ['menu', 'chat', 'user'];
    uRight.querySelectorAll('li a').forEach((a, i) => prependIcon(a, names[i % names.length]));
    uWrap.append(right);
  }
  utility.append(uWrap);

  /* ---------- masthead ---------- */
  const site = el('div', 'site');
  const mWrap = el('div', 'wrap');
  const masthead = el('div', 'masthead');
  const logo = buildLogo(parts.brand);
  masthead.append(logo);

  const tools = parts.tools || [];
  const telPara = tools.find((p) => p.querySelector('a[href^="tel:"]'));
  const telLink = telPara ? telPara.querySelector('a') : null;
  const textParas = tools.filter((p) => p !== telPara);
  const searchPara = textParas.length > 1 ? textParas[0] : null;
  const labelPara = textParas.length > 1 ? textParas[1] : textParas[0];
  const placeholder = searchPara ? searchPara.textContent.trim() : 'Search';

  const makeSearch = (className) => {
    const form = el('form', className);
    form.setAttribute('role', 'search');
    form.action = '/search';
    form.innerHTML = `${svg('search')}<input type="search" name="q" autocomplete="off">`;
    const input = form.querySelector('input');
    input.placeholder = placeholder;
    input.setAttribute('aria-label', placeholder);
    return form;
  };
  masthead.append(makeSearch('search'));

  const cta = el('div', 'mast-cta');
  if (telLink) {
    const call = el('a', 'iconbtn call');
    call.href = telLink.href;
    call.setAttribute('aria-label', `Call ${telLink.textContent.trim()}`);
    call.innerHTML = svg('phone');
    cta.append(call);
    const phone = el('div', 'phone-cta');
    if (labelPara) phone.append(labelPara);
    phone.append(telPara);
    cta.append(phone);
  }
  const toggle = el('button', 'iconbtn menu-toggle');
  toggle.type = 'button';
  toggle.setAttribute('aria-label', 'Open menu');
  toggle.setAttribute('aria-controls', 'mnav');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = svg('burger');
  cta.append(toggle);
  masthead.append(cta);
  mWrap.append(masthead);
  site.append(mWrap);

  /* ---------- primary nav ---------- */
  const nav = el('nav', 'primary');
  nav.setAttribute('aria-label', 'Main');
  const nWrap = el('div', 'wrap');
  if (parts.primary) nWrap.append(parts.primary);
  nav.append(nWrap);
  site.append(nav);

  /* ---------- mobile menu (presentational clones, EW4) ---------- */
  const mnav = el('div', 'mnav');
  mnav.id = 'mnav';
  mnav.setAttribute('aria-hidden', 'true');
  const panel = el('div', 'panel');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', 'Menu');
  const mhead = el('div', 'mhead');
  mhead.append(stripInstrumentation(logo.cloneNode(true)));
  const close = el('button', 'x');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close menu');
  close.innerHTML = svg('close');
  mhead.append(close);
  panel.append(mhead, makeSearch('msearch'));
  if (parts.primary) {
    const links = el('div', 'mlinks');
    links.append(stripInstrumentation(parts.primary.cloneNode(true)));
    panel.append(links);
  }
  if (telLink) {
    const mphone = el('a', 'mphone');
    mphone.href = telLink.href;
    mphone.innerHTML = svg('phone');
    mphone.append(telLink.textContent.trim());
    panel.append(mphone);
  }
  mnav.append(panel);

  const setOpen = (open) => {
    mnav.classList.toggle('open', open);
    mnav.setAttribute('aria-hidden', open ? 'false' : 'true');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) close.focus();
  };
  toggle.addEventListener('click', () => setOpen(true));
  close.addEventListener('click', () => {
    setOpen(false);
    toggle.focus();
  });
  mnav.addEventListener('click', (e) => {
    if (e.target === mnav || e.target.closest('.mlinks a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mnav.classList.contains('open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia('(width >= 961px)').addEventListener('change', (mq) => {
    if (mq.matches) setOpen(false);
  });

  /* ---------- scrolled shadow ---------- */
  const onScroll = () => site.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  block.append(utility, site, mnav);
}
