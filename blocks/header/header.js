import { getMetadata, decorateIcons } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/*
 * Wheeler site header — utility bar, masthead (logo · search · call), black primary nav,
 * and a slide-in drawer below 961px.
 *
 * Nav fragment contract (one section each, order-independent — classified by content):
 *   utility  two <ul> of links; `:icon:` before a label renders the icon
 *   brand    <p><a href="/">Wheeler</a></p> (plain link; the CAT badge is decorative CSS)
 *   sections <ul> of primary links; wrap a link in bold to highlight it in yellow
 *   tools    <p>label</p> + <p><a href="tel:…">number</a></p>
 */

const isDesktop = window.matchMedia('(width >= 961px)');

// Experience Workspace (EW4): presentational clones must not keep editor indices.
function stripInstrumentation(el) {
  el.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  el.removeAttribute('data-prose-index');
  return el;
}

/**
 * Turns raw `:name:` tokens (off-pipeline content) into span.icon, loads every icon
 * and paints it as a currentColor mask so hover colours apply.
 * @param {Element} root container
 */
function paintIcons(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const hits = [];
  while (walker.nextNode()) {
    if (/:[a-z0-9-]+:/.test(walker.currentNode.nodeValue)) hits.push(walker.currentNode);
  }
  hits.forEach((node) => {
    const parts = node.nodeValue.split(/:([a-z0-9-]+):/);
    const frag = document.createDocumentFragment();
    parts.forEach((part, i) => {
      if (i % 2) {
        const span = document.createElement('span');
        span.className = `icon icon-${part}`;
        frag.append(span);
      } else if (part) {
        frag.append(document.createTextNode(part));
      }
    });
    node.replaceWith(frag);
  });
  decorateIcons(root);
  root.querySelectorAll('span.icon').forEach((span) => {
    const img = span.querySelector('img');
    if (!img) return;
    span.style.setProperty('--icon-src', `url("${img.src}")`);
    span.setAttribute('aria-hidden', 'true');
    img.remove();
  });
}

function icon(name) {
  const span = document.createElement('span');
  span.className = `icon icon-${name}`;
  return span;
}

/**
 * Opens or closes the mobile drawer.
 * @param {Element} block header block
 * @param {boolean} [force] desired state
 */
function toggleDrawer(block, force) {
  const drawer = block.querySelector('.nav-drawer');
  const toggle = block.querySelector('.nav-hamburger');
  if (!drawer || !toggle) return;
  const open = typeof force === 'boolean' ? force : toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  drawer.classList.toggle('is-open', open);
  drawer.inert = !open;
  document.body.style.overflowY = open && !isDesktop.matches ? 'hidden' : '';
  if (open) drawer.querySelector('.nav-drawer-close')?.focus();
}

function buildSearch(className) {
  const form = document.createElement('form');
  form.className = className;
  form.setAttribute('role', 'search');
  form.action = '/search';
  form.method = 'get';
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = 'What can we help you find?';
  input.setAttribute('aria-label', 'Search');
  form.append(icon('magnify'), input);
  return form;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : 'https://adobe--sendto--aemcoder.aem.page/adobe/onboarding/nav';
  const fragment = await loadFragment(navPath);
  block.textContent = '';
  if (!fragment) return;

  // classify the fragment sections by content, not position
  const sections = [...fragment.children];
  const tools = sections.find((s) => s.querySelector('a[href^="tel:"]'));
  const utility = sections.find((s) => s !== tools && s.querySelectorAll('ul').length > 1);
  const brand = sections.find((s) => ![tools, utility].includes(s) && !s.querySelector('ul') && s.querySelector('a'));
  const primary = sections.find((s) => ![tools, utility, brand].includes(s) && s.querySelector('ul'));

  // links authored inside paragraphs never ship as buttons in the chrome
  fragment.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary', 'accent'));
  fragment.querySelectorAll('p.button-wrapper').forEach((p) => p.classList.remove('button-wrapper'));
  // normalise li > p > a (some editors paragraph-wrap list items)
  fragment.querySelectorAll('li > p').forEach((p) => p.replaceWith(...p.childNodes));

  const wrap = (className, ...children) => {
    const div = document.createElement('div');
    div.className = className;
    div.append(...children.filter(Boolean));
    return div;
  };

  // utility bar
  let utilityBar = null;
  if (utility) {
    const [left, right] = utility.querySelectorAll('ul');
    utilityBar = wrap('nav-utility', wrap(
      'nav-wrap',
      left ? wrap('nav-utility-left', left) : null,
      right ? wrap('nav-utility-right', right) : null,
    ));
  }

  // masthead: brand · search · call + hamburger
  const brandBox = wrap('nav-brand');
  const brandLink = brand?.querySelector('a');
  if (brandLink) {
    brandBox.append(brandLink.closest('p') || brandLink);
    brandLink.setAttribute('aria-label', `${brandLink.textContent.trim()} home`);
  }

  const toolsBox = wrap('nav-tools');
  const phone = tools?.querySelector('a[href^="tel:"]');
  if (phone) {
    const call = document.createElement('a');
    call.className = 'nav-call';
    call.href = phone.href;
    call.setAttribute('aria-label', 'Call');
    call.append(icon('phone'));
    toolsBox.append(call, wrap('nav-phone', ...tools.querySelectorAll('.default-content-wrapper > *')));
  }
  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-controls', 'nav-drawer');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'Open menu');
  hamburger.append(icon('menu'));
  toolsBox.append(hamburger);

  const masthead = wrap('nav-masthead', wrap('nav-wrap', brandBox, buildSearch('nav-search'), toolsBox));

  // primary nav
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.className = 'nav-primary';
  nav.setAttribute('aria-label', 'Main');
  const primaryList = primary?.querySelector('ul');
  nav.append(wrap('nav-wrap', primaryList ? wrap('nav-sections', primaryList) : null));

  // mobile drawer (presentational copies of brand, nav and phone)
  const drawer = wrap('nav-drawer');
  drawer.id = 'nav-drawer';
  drawer.inert = true;
  const panel = wrap('nav-drawer-panel');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', 'Menu');
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'nav-drawer-close';
  close.setAttribute('aria-label', 'Close menu');
  close.append(icon('close'));
  panel.append(wrap(
    'nav-drawer-head',
    brandLink ? stripInstrumentation(brandBox.cloneNode(true)) : null,
    close,
  ));
  panel.append(buildSearch('nav-drawer-search'));
  if (primaryList) panel.append(wrap('nav-drawer-links', stripInstrumentation(primaryList.cloneNode(true))));
  if (phone) {
    const mphone = document.createElement('a');
    mphone.className = 'nav-drawer-phone';
    mphone.href = phone.href;
    mphone.append(icon('phone'), document.createTextNode(phone.textContent));
    panel.append(mphone);
  }
  drawer.append(panel);

  const bar = wrap('nav-bar', masthead, nav);
  block.append(...[utilityBar, bar, drawer].filter(Boolean));
  paintIcons(block);

  // behaviour
  hamburger.addEventListener('click', () => toggleDrawer(block));
  close.addEventListener('click', () => {
    toggleDrawer(block, false);
    hamburger.focus();
  });
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer || e.target.closest('a')) toggleDrawer(block, false);
  });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
      toggleDrawer(block, false);
      hamburger.focus();
    }
  });
  isDesktop.addEventListener('change', () => toggleDrawer(block, false));

  // lift the bar once the page scrolls
  const updateScrolled = () => block.classList.toggle('is-scrolled', window.scrollY > 8);
  updateScrolled();
  window.addEventListener('scroll', updateScrolled, { passive: true });
}
