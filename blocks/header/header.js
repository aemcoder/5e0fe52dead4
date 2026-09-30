import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * header — Wheeler chrome: utility bar, masthead (logo, search, phone) and the
 * black primary-nav bar, plus a slide-in mobile panel.
 *
 * Nav document contract (fragments/header.html, sections in order):
 *   1. brand   — one link, e.g. <a href="/">Wheeler CAT</a> (last word renders as the CAT badge)
 *   2. links   — <ul> of primary nav links; wrap a link in <strong> to highlight it (yellow)
 *   3. tools   — label <p>, a tel: link (phone CTA) and a search link
 *                (href = search page, text = input placeholder)
 *   4. utility — two <ul>s (left / right); the first left item renders as the
 *                yellow location pill. Icons use the EDS :name: syntax.
 */

const isDesktop = window.matchMedia('(min-width: 961px)');

const SVG = {
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.2-3.2"></path></svg>',
  phone: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"></path></svg>',
  menu: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>',
  close: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>',
};

/** Convert un-rendered `:name:` icon tokens (off-pipeline content) into EDS icon spans. */
function renderIconTokens(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const hits = [];
  while (walker.nextNode()) {
    if (/:[a-z0-9-]+:/.test(walker.currentNode.nodeValue)) hits.push(walker.currentNode);
  }
  hits.forEach((node) => {
    const frag = document.createDocumentFragment();
    node.nodeValue.split(/(:[a-z0-9-]+:)/).forEach((part) => {
      const m = part.match(/^:([a-z0-9-]+):$/);
      if (m) {
        const span = document.createElement('span');
        span.className = `icon icon-${m[1]}`;
        const img = document.createElement('img');
        img.src = `${window.hlx?.codeBasePath || ''}/icons/${m[1]}.svg`;
        img.alt = '';
        span.append(img);
        frag.append(span);
      } else if (part) frag.append(document.createTextNode(part));
    });
    node.replaceWith(frag);
  });
}

/** Tint EDS icons with currentColor (mask) so hover colours apply. */
function tintIcons(root) {
  root.querySelectorAll('span.icon').forEach((span) => {
    const img = span.querySelector('img');
    if (img) span.style.setProperty('--icon', `url("${img.getAttribute('src')}")`);
  });
}

function buildLogo(link) {
  const a = document.createElement('a');
  a.className = 'logo';
  a.href = link ? link.getAttribute('href') : '/';
  const words = (link ? link.textContent : 'Wheeler CAT').trim().split(/\s+/);
  const badge = words.length > 1 ? words.pop() : '';
  a.setAttribute('aria-label', `${words.join(' ')} home`);
  const mark = document.createElement('span');
  mark.className = 'mark';
  mark.textContent = words.join(' ');
  a.append(mark);
  if (badge) {
    const cat = document.createElement('span');
    cat.className = 'cat';
    cat.textContent = badge;
    a.append(cat);
  }
  return a;
}

function buildSearch(searchLink, className) {
  const form = document.createElement('form');
  form.className = className;
  form.setAttribute('role', 'search');
  form.action = searchLink ? searchLink.getAttribute('href') : '/search';
  form.method = 'get';
  form.innerHTML = SVG.search;
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = searchLink ? searchLink.textContent.trim() : 'Search';
  input.setAttribute('aria-label', 'Search');
  form.append(input);
  return form;
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : 'https://adobe--sendto--aemcoder.aem.page/adobe/onboarding/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;
  renderIconTokens(fragment);

  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const [brandSec, linksSec, toolsSec, utilSec] = sections;

  // --- role slots ---
  const brandLink = brandSec?.querySelector('a');
  const navList = linksSec?.querySelector('ul');
  const toolLinks = toolsSec ? [...toolsSec.querySelectorAll('a')] : [];
  const telLink = toolLinks.find((a) => a.getAttribute('href')?.startsWith('tel:'));
  const searchLink = toolLinks.find((a) => a !== telLink);
  const phoneLabel = toolsSec
    ? [...toolsSec.querySelectorAll('p')].find((p) => !p.querySelector('a'))
    : null;
  const utilLists = utilSec ? [...utilSec.querySelectorAll('ul')] : [];

  // --- utility bar ---
  const utility = document.createElement('div');
  utility.className = 'utility';
  const uWrap = document.createElement('div');
  uWrap.className = 'wrap';
  ['u-left', 'u-right'].forEach((cls, i) => {
    const col = document.createElement('div');
    col.className = cls;
    const list = utilLists[i];
    if (list) {
      list.querySelectorAll('li').forEach((li, j) => {
        const a = li.querySelector('a');
        if (!a) return;
        a.className = '';
        if (i === 0 && j === 0) a.classList.add('pill');
        col.append(a);
      });
    }
    uWrap.append(col);
  });
  utility.append(uWrap);

  // --- masthead ---
  const site = document.createElement('div');
  site.className = 'site';
  const mWrap = document.createElement('div');
  mWrap.className = 'wrap';
  const masthead = document.createElement('div');
  masthead.className = 'masthead';
  masthead.append(buildLogo(brandLink));
  masthead.append(buildSearch(searchLink, 'search'));

  const cta = document.createElement('div');
  cta.className = 'mast-cta';
  const telHref = telLink ? telLink.getAttribute('href') : null;
  if (telHref) {
    const callBtn = document.createElement('a');
    callBtn.className = 'iconbtn';
    callBtn.href = telHref;
    callBtn.setAttribute('aria-label', 'Call');
    callBtn.innerHTML = SVG.phone;
    cta.append(callBtn);

    const phone = document.createElement('div');
    phone.className = 'phone-cta';
    const l = document.createElement('span');
    l.className = 'l';
    l.textContent = phoneLabel ? phoneLabel.textContent.trim() : '';
    const n = document.createElement('a');
    n.className = 'n';
    n.href = telHref;
    n.textContent = telLink.textContent.trim();
    phone.append(l, n);
    cta.append(phone);
  }
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'iconbtn menu-toggle';
  toggle.setAttribute('aria-label', 'Open menu');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'mnav');
  toggle.innerHTML = SVG.menu;
  cta.append(toggle);
  masthead.append(cta);
  mWrap.append(masthead);
  site.append(mWrap);

  // --- primary nav bar ---
  const nav = document.createElement('nav');
  nav.className = 'primary';
  nav.setAttribute('aria-label', 'Primary');
  const nWrap = document.createElement('div');
  nWrap.className = 'wrap';
  const ul = document.createElement('ul');
  if (navList) {
    navList.querySelectorAll(':scope > li').forEach((li) => {
      const a = li.querySelector('a');
      if (!a) return;
      const strong = !!(li.querySelector('strong') || a.closest('strong'));
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = a.textContent.trim();
      if (strong) link.classList.add('strong');
      item.append(link);
      ul.append(item);
    });
  }
  nWrap.append(ul);
  nav.append(nWrap);
  site.append(nav);

  // --- mobile panel ---
  const mnav = document.createElement('div');
  mnav.id = 'mnav';
  mnav.className = 'mnav';
  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Menu');
  const mhead = document.createElement('div');
  mhead.className = 'mhead';
  mhead.append(buildLogo(brandLink));
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'x';
  close.setAttribute('aria-label', 'Close menu');
  close.innerHTML = SVG.close;
  mhead.append(close);
  panel.append(mhead, buildSearch(searchLink, 'msearch'));
  ul.querySelectorAll('a').forEach((a) => {
    const ml = document.createElement('a');
    ml.className = a.classList.contains('strong') ? 'ml y' : 'ml';
    ml.href = a.getAttribute('href');
    ml.textContent = a.textContent;
    panel.append(ml);
  });
  if (telHref) {
    const mphone = document.createElement('a');
    mphone.className = 'mphone';
    mphone.href = telHref;
    mphone.innerHTML = SVG.phone;
    mphone.append(` ${telLink.textContent.trim()}`);
    panel.append(mphone);
  }
  mnav.append(panel);

  const setOpen = (open) => {
    mnav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflowY = open ? 'hidden' : '';
    if (open) close.focus();
  };
  toggle.addEventListener('click', () => setOpen(true));
  close.addEventListener('click', () => { setOpen(false); toggle.focus(); });
  mnav.addEventListener('click', (e) => {
    if (e.target === mnav) setOpen(false);
    if (e.target.closest('a.ml')) setOpen(false);
  });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && mnav.classList.contains('open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  isDesktop.addEventListener('change', () => { if (isDesktop.matches) setOpen(false); });

  block.replaceChildren(utility, site, mnav);
  tintIcons(block);

  // header shadow once the page scrolls
  const onScroll = () => site.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}
