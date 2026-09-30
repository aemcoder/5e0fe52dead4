import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Wheeler header — template-slotted chrome built from the authored /nav document.
 *
 * Nav document contract (one section each, default content only):
 *   1. brand   — <p><a href="/">Wheeler</a></p>
 *   2. links   — <ul> of primary nav links; <strong><a> renders the yellow "featured" links
 *   3. tools   — <p>Call us today</p><p><a href="tel:…">801-436-3672</a></p>
 *   4. utility — two <ul>s (left / right) for the black utility bar; a leading :icon: token
 *                is inlined as SVG, a <strong><a> renders as the yellow location pill
 *
 * Authored elements are MOVED into the chrome layout (Experience Workspace safe);
 * presentational copies for the mobile panel are stripped of editor instrumentation.
 */

// media query match that indicates the desktop layout (prototype breakpoint)
const isDesktop = window.matchMedia('(min-width: 961px)');

const SVG = {
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.2-3.2"></path></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"></path></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>',
};

function stripInstrumentation(el) {
  el.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  el.removeAttribute('data-prose-index');
  return el;
}

/**
 * Turns off-pipeline `:name:` text tokens into icon spans, then inlines every
 * icon span's SVG so it can inherit currentColor.
 * @param {Element} root container
 */
async function inlineIcons(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const tokens = [];
  while (walker.nextNode()) {
    if (/:[a-z0-9-]+:/.test(walker.currentNode.nodeValue)) tokens.push(walker.currentNode);
  }
  tokens.forEach((node) => {
    const m = node.nodeValue.match(/^(\s*):([a-z0-9-]+):\s*/);
    if (!m) return;
    const span = document.createElement('span');
    span.className = `icon icon-${m[2]}`;
    node.nodeValue = node.nodeValue.slice(m[0].length);
    node.before(span);
  });
  const spans = [...root.querySelectorAll('span.icon')];
  await Promise.all(spans.map(async (span) => {
    const name = [...span.classList].find((c) => c.startsWith('icon-'))?.slice(5);
    if (!name) return;
    try {
      const resp = await fetch(`${window.hlx?.codeBasePath || ''}/icons/${name}.svg`);
      if (!resp.ok) return;
      const svg = (await resp.text()).trim();
      if (svg.startsWith('<svg')) span.innerHTML = svg;
    } catch (e) {
      // keep the <img> fallback
    }
  }));
}

function sectionContent(section) {
  if (!section) return null;
  return section.querySelector('.default-content-wrapper') || section;
}

function buildSearch(extraClass) {
  const form = document.createElement('form');
  form.className = `search ${extraClass || ''}`.trim();
  form.action = '/search';
  form.setAttribute('role', 'search');
  form.innerHTML = `${SVG.search}<input type="search" name="q" placeholder="What can we help you find?" aria-label="Search">`;
  return form;
}

function toggleMenu(header, nav, button, forceOpen = null) {
  const open = forceOpen !== null ? forceOpen : nav.getAttribute('aria-expanded') !== 'true';
  const effective = open && !isDesktop.matches;
  nav.setAttribute('aria-expanded', effective ? 'true' : 'false');
  header.classList.toggle('menu-open', effective);
  button.setAttribute('aria-expanded', effective ? 'true' : 'false');
  button.setAttribute('aria-label', effective ? 'Close menu' : 'Open menu');
  document.body.style.overflowY = effective ? 'hidden' : '';
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const [brandSrc, linksSrc, toolsSrc, utilitySrc] = sections.map(sectionContent);

  block.textContent = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';

  // ── utility bar ──
  if (utilitySrc) {
    const utility = document.createElement('div');
    utility.className = 'utility';
    const wrap = document.createElement('div');
    wrap.className = 'wrap';
    const lists = [...utilitySrc.querySelectorAll(':scope > ul')];
    ['u-left', 'u-right'].forEach((cls, i) => {
      const slot = document.createElement('div');
      slot.className = cls;
      if (lists[i]) slot.append(lists[i]);
      wrap.append(slot);
    });
    utility.append(wrap);
    wrapper.append(utility);
  }

  // ── masthead ──
  const site = document.createElement('div');
  site.className = 'site';
  const siteWrap = document.createElement('div');
  siteWrap.className = 'wrap';
  const masthead = document.createElement('div');
  masthead.className = 'masthead';

  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  if (brandSrc) brand.append(...brandSrc.childNodes);
  const brandLink = brand.querySelector('a');
  if (brandLink) {
    brandLink.classList.remove('button', 'primary', 'secondary', 'accent');
    brandLink.closest('.button-wrapper')?.classList.remove('button-wrapper');
    brandLink.setAttribute('aria-label', `${brandLink.textContent.trim()} home`);
  }
  const cat = document.createElement('span');
  cat.className = 'cat';
  cat.setAttribute('aria-hidden', 'true');
  cat.textContent = 'CAT';
  brand.append(cat);
  masthead.append(brand);

  masthead.append(buildSearch());

  const mastCta = document.createElement('div');
  mastCta.className = 'mast-cta';
  const telLink = toolsSrc?.querySelector('a[href^="tel:"]');
  const callBtn = document.createElement('a');
  callBtn.className = 'iconbtn call';
  callBtn.href = telLink ? telLink.href : '#';
  callBtn.setAttribute('aria-label', 'Call');
  callBtn.innerHTML = SVG.phone;
  mastCta.append(callBtn);

  const tools = document.createElement('div');
  tools.className = 'nav-tools phone-cta';
  if (toolsSrc) tools.append(...toolsSrc.childNodes);
  mastCta.append(tools);

  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'iconbtn menu-toggle';
  hamburger.setAttribute('aria-controls', 'nav');
  hamburger.setAttribute('aria-label', 'Open menu');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = SVG.menu;
  mastCta.append(hamburger);
  masthead.append(mastCta);
  siteWrap.append(masthead);
  site.append(siteWrap);

  // ── primary nav (black bar on desktop, slide-in panel on mobile) ──
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.className = 'primary';
  nav.setAttribute('aria-label', 'Primary');
  nav.setAttribute('aria-expanded', 'false');
  const navWrap = document.createElement('div');
  navWrap.className = 'wrap';

  const mhead = document.createElement('div');
  mhead.className = 'mhead';
  const mlogo = stripInstrumentation(brand.cloneNode(true));
  mlogo.className = 'nav-brand mlogo';
  mlogo.querySelectorAll('a').forEach((a) => a.setAttribute('tabindex', '-1'));
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'mclose';
  closeBtn.setAttribute('aria-label', 'Close menu');
  closeBtn.innerHTML = SVG.close;
  mhead.append(mlogo, closeBtn);
  navWrap.append(mhead, buildSearch('msearch'));

  const navSections = document.createElement('div');
  navSections.className = 'nav-sections';
  if (linksSrc) navSections.append(...linksSrc.childNodes);
  navWrap.append(navSections);

  if (telLink) {
    const mphone = document.createElement('a');
    mphone.className = 'mphone';
    mphone.href = telLink.href;
    mphone.innerHTML = `${SVG.phone}<span></span>`;
    mphone.querySelector('span').textContent = telLink.textContent.trim();
    navWrap.append(mphone);
  }
  nav.append(navWrap);
  site.append(nav);
  wrapper.append(site);

  const backdrop = document.createElement('div');
  backdrop.className = 'mnav-backdrop';
  wrapper.append(backdrop);
  block.append(wrapper);

  await inlineIcons(wrapper);

  // ── behaviour ──
  const headerEl = block.closest('header') || document.querySelector('header');
  hamburger.addEventListener('click', () => toggleMenu(headerEl, nav, hamburger));
  closeBtn.addEventListener('click', () => {
    toggleMenu(headerEl, nav, hamburger, false);
    hamburger.focus();
  });
  backdrop.addEventListener('click', () => toggleMenu(headerEl, nav, hamburger, false));
  navSections.addEventListener('click', (e) => {
    if (e.target.closest('a')) toggleMenu(headerEl, nav, hamburger, false);
  });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(headerEl, nav, hamburger, false);
      hamburger.focus();
    }
  });
  isDesktop.addEventListener('change', () => toggleMenu(headerEl, nav, hamburger, false));

  const updateScrolled = () => {
    headerEl.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  updateScrolled();
  window.addEventListener('scroll', updateScrolled, { passive: true });
}
