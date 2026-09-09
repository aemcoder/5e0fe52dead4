import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

// the brand mark — a leaf inside a ring, inlined so the chrome needs no asset
const BRAND_MARK = `<svg class="nav-mark" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
    <circle cx="16" cy="16" r="15" stroke="#C4703F" stroke-width="1" fill="none" opacity="0.4"></circle>
    <path d="M16 6 C10 12, 10 22, 16 26 C22 22, 22 12, 16 6Z" fill="#2D4A3E" opacity="0.9"></path>
    <line x1="16" y1="10" x2="16" y2="23" stroke="#C4703F" stroke-width="1" opacity="0.6"></line>
    <line x1="13" y1="15" x2="16" y2="13" stroke="#C4703F" stroke-width="0.75" opacity="0.5"></line>
    <line x1="19" y1="17" x2="16" y2="15" stroke="#C4703F" stroke-width="0.75" opacity="0.5"></line>
  </svg>`;

/**
 * Closes the mobile menu when escape is pressed.
 * @param {Event} e the keyboard event
 */
function closeOnEscape(e) {
  if (e.code !== 'Escape') return;
  const nav = document.getElementById('nav');
  if (!nav || nav.getAttribute('aria-expanded') !== 'true') return;
  nav.setAttribute('aria-expanded', 'false');
  document.body.style.overflowY = '';
  const button = nav.querySelector('.nav-hamburger button');
  if (button) {
    button.setAttribute('aria-label', 'Open navigation');
    button.focus();
  }
}

/**
 * Toggles the mobile menu.
 * @param {Element} nav the nav element
 * @param {Boolean} forceExpanded optional forced state
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  const button = nav.querySelector('.nav-hamburger button');
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const sections = [...nav.children];
  if (sections[0]) sections[0].classList.add('nav-brand');
  if (sections.length > 1) sections[sections.length - 1].classList.add('nav-tools');
  sections.slice(1, -1).forEach((section) => section.classList.add('nav-sections'));

  // brand: prepend the inline mark to the authored brand link
  const brandLink = nav.querySelector('.nav-brand a');
  if (brandLink && !brandLink.querySelector('svg')) {
    brandLink.insertAdjacentHTML('afterbegin', BRAND_MARK);
  } else if (!brandLink) {
    const brand = nav.querySelector('.nav-brand');
    if (brand) brand.insertAdjacentHTML('afterbegin', BRAND_MARK);
  }

  // a flexible spacer keeps the tools group pinned to the right edge
  const spacer = document.createElement('div');
  spacer.className = 'nav-spacer';
  spacer.setAttribute('aria-hidden', 'true');
  const tools = nav.querySelector('.nav-tools');
  if (tools) nav.insertBefore(spacer, tools);
  else nav.append(spacer);

  // hamburger only makes sense when there are navigation links to reveal
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    const hamburger = document.createElement('div');
    hamburger.className = 'nav-hamburger';
    hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
        <span class="nav-hamburger-icon"></span>
      </button>`;
    hamburger.addEventListener('click', () => toggleMenu(nav));
    nav.prepend(hamburger);
    nav.setAttribute('aria-expanded', 'false');
    isDesktop.addEventListener('change', () => toggleMenu(nav, isDesktop.matches));
    window.addEventListener('keydown', closeOnEscape);
  }

  block.append(nav);
}
