import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Wheeler header — utility bar, masthead (logo, search, call, phone), black
 * primary nav bar, and a slide-in mobile panel.
 *
 * Nav fragment sections (in order):
 *   1. brand   — <p><a href="/">Wheeler CAT</a></p> (last word renders as the
 *                black CAT badge)
 *   2. nav     — <ul> of primary links; <strong> marks the yellow items
 *   3. tools   — <p>search placeholder</p> <p>Call us today</p>
 *                <p><a href="tel:…">801-436-3672</a></p>
 *   4. utility — two <ul>s: left links (first = location pill), right links
 */

const isDesktop = window.matchMedia('(min-width: 961px)');

const SVG_NS = 'http://www.w3.org/2000/svg';
const ICONS = {
  pin: '<path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  lines: '<path d="M4 6h16M4 12h16M4 18h12"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
};

function icon(name) {
  const s = document.createElementNS(SVG_NS, 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('aria-hidden', 'true');
  s.classList.add('icon', `icon-${name}`);
  s.innerHTML = ICONS[name];
  return s;
}

function el(tag, className, ...children) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  e.append(...children);
  return e;
}

/** drop the button decoration the fragment's decorateMain applied */
function unbutton(root) {
  root.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary', 'accent'));
  root.querySelectorAll('.button-wrapper, .button-container').forEach((p) => p.classList.remove('button-wrapper', 'button-container'));
}

function utilityIcon(text) {
  if (/connect/i.test(text)) return 'lines';
  if (/chat/i.test(text)) return 'chat';
  if (/sign|account|log/i.test(text)) return 'user';
  return null;
}

/** logo: <a class="logo"><span class="mark">Wheeler</span><span class="cat">CAT</span></a> */
function buildLogo(link) {
  const a = link || el('a');
  if (!link) a.href = '/';
  a.className = 'logo';
  const words = a.textContent.trim().split(/\s+/);
  const badge = words.length > 1 ? words.pop() : '';
  a.setAttribute('aria-label', `${words.join(' ')} home`);
  a.replaceChildren(el('span', 'mark', words.join(' ')));
  if (badge) a.append(el('span', 'cat', badge));
  return a;
}

function buildSearch(placeholder, className) {
  const form = el('form', className);
  form.setAttribute('role', 'search');
  form.action = '/search';
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = placeholder;
  input.setAttribute('aria-label', 'Search');
  form.append(icon('search'), input);
  return form;
}

function toggleMenu(header, panel, open) {
  const expanded = open ?? !panel.classList.contains('open');
  panel.classList.toggle('open', expanded);
  panel.setAttribute('aria-hidden', expanded ? 'false' : 'true');
  panel.inert = !expanded;
  header.querySelector('.menu-toggle')?.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  document.body.style.overflowY = expanded ? 'hidden' : '';
  if (expanded) panel.querySelector('.x')?.focus();
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
  if (!fragment) return;
  unbutton(fragment);

  const sections = [...fragment.children];
  const [brandSec, navSec, toolsSec, utilSec] = sections;

  // ── utility bar ──
  const utility = el('div', 'utility');
  const utilWrap = el('div', 'wrap');
  const lists = utilSec ? [...utilSec.querySelectorAll('ul')] : [];
  lists.forEach((ul, i) => {
    const side = el('div', i === 0 ? 'u-left' : 'u-right', ul);
    ul.querySelectorAll('a').forEach((a, j) => {
      const name = i === 0 && j === 0 ? 'pin' : utilityIcon(a.textContent);
      if (i === 0 && j === 0) a.classList.add('pill');
      if (name) a.prepend(icon(name));
    });
    utilWrap.append(side);
  });
  utility.append(utilWrap);

  // ── masthead ──
  const brandLink = brandSec ? brandSec.querySelector('a') : null;
  const logo = buildLogo(brandLink);

  const toolPs = toolsSec ? [...toolsSec.querySelectorAll('p')] : [];
  const phoneLink = toolsSec ? toolsSec.querySelector('a[href^="tel:"]') || toolsSec.querySelector('a') : null;
  const plain = toolPs.filter((p) => !p.querySelector('a'));
  const placeholder = plain[0] ? plain[0].textContent.trim() : 'Search';
  const phoneLabel = plain[1] ? plain[1].textContent.trim() : '';

  const mastCta = el('div', 'mast-cta');
  if (phoneLink) {
    const call = el('a', 'iconbtn call', icon('phone'));
    call.href = phoneLink.href;
    call.setAttribute('aria-label', `Call ${phoneLink.textContent.trim()}`);
    mastCta.append(call);
    const phoneCta = el('a', 'phone-cta');
    phoneCta.href = phoneLink.href;
    if (phoneLabel) phoneCta.append(el('span', 'l', phoneLabel));
    phoneCta.append(el('span', 'n', phoneLink.textContent.trim()));
    mastCta.append(phoneCta);
  }
  const menuBtn = el('button', 'iconbtn menu-toggle', icon('menu'));
  menuBtn.type = 'button';
  menuBtn.setAttribute('aria-label', 'Open menu');
  menuBtn.setAttribute('aria-controls', 'mnav');
  menuBtn.setAttribute('aria-expanded', 'false');
  mastCta.append(menuBtn);

  const masthead = el('div', 'wrap', el('div', 'masthead', logo, buildSearch(placeholder, 'search'), mastCta));

  // ── primary nav ──
  const navList = navSec ? navSec.querySelector('ul') : null;
  const primary = el('div', 'primary');
  if (navList) {
    navList.querySelectorAll(':scope > li').forEach((li) => {
      const strong = li.querySelector('strong');
      const a = li.querySelector('a');
      if (strong && a) {
        a.classList.add('strong');
        if (strong.contains(a)) strong.replaceWith(a);
        else if (a.contains(strong)) strong.replaceWith(...strong.childNodes);
      }
    });
    primary.append(el('div', 'wrap', navList));
  }

  const nav = el('nav', 'site', masthead, primary);
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');

  // ── mobile panel (presentational copy of the nav links) ──
  const panel = el('div', 'mnav');
  panel.id = 'mnav';
  const close = el('button', 'x', icon('close'));
  close.type = 'button';
  close.setAttribute('aria-label', 'Close menu');
  const mLogo = logo.cloneNode(true);
  const mhead = el('div', 'mhead', mLogo, close);
  const mlinks = el('div', 'mlinks');
  if (navList) {
    navList.querySelectorAll('a').forEach((a) => {
      const m = a.cloneNode(true);
      m.className = a.classList.contains('strong') ? 'ml y' : 'ml';
      mlinks.append(m);
    });
  }
  const panelInner = el('div', 'panel', mhead, buildSearch(placeholder, 'msearch'), mlinks);
  if (phoneLink) {
    const mphone = el('a', 'mphone', icon('phone'), phoneLink.textContent.trim());
    mphone.href = phoneLink.href;
    panelInner.append(mphone);
  }
  panel.append(panelInner);
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', 'Menu');

  const header = block.closest('header') || document.querySelector('header');
  toggleMenu(header || block, panel, false);

  menuBtn.addEventListener('click', () => toggleMenu(header || block, panel, true));
  close.addEventListener('click', () => {
    toggleMenu(header || block, panel, false);
    menuBtn.focus();
  });
  panel.addEventListener('click', (e) => {
    if (e.target === panel || e.target.closest('a.ml')) toggleMenu(header || block, panel, false);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
      toggleMenu(header || block, panel, false);
      menuBtn.focus();
    }
  });
  isDesktop.addEventListener('change', () => {
    if (isDesktop.matches) toggleMenu(header || block, panel, false);
  });

  const navWrapper = el('div', 'nav-wrapper', utility, nav, panel);
  block.append(navWrapper);

  // elevate the sticky bar once the page scrolls
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
}
