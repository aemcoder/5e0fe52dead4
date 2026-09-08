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
 * Toggles the mobile menu.
 * @param {Element} nav the nav element
 * @param {Boolean} forceExpanded optional forced state
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
}

/**
 * Closes the mobile menu when focus leaves the nav.
 * @param {Event} e the focusout event
 */
function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (nav.contains(e.relatedTarget)) return;
  if (!isDesktop.matches) toggleMenu(nav, false);
}

/**
 * Closes the mobile menu on escape.
 * @param {Event} e the keydown event
 */
function closeOnEscape(e) {
  if (e.code !== 'Escape') return;
  const nav = document.getElementById('nav');
  if (nav && !isDesktop.matches) toggleMenu(nav, false);
}

/**
 * loads and decorates the header, mainly the nav
 *
 * The /nav document is authored as sections, in order:
 *   1. the brand link
 *   2. an optional list of navigation links
 *   3. the tagline / tools line
 *
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const sections = [...nav.children];
  const [brand] = sections;
  if (brand) brand.classList.add('nav-brand');

  const links = sections.find((s, i) => i > 0 && s.querySelector('ul'));
  if (links) links.classList.add('nav-sections');

  const tools = sections.filter((s, i) => i > 0 && s !== links).pop();
  if (tools) tools.classList.add('nav-tools');

  if (brand) {
    // the brand link is authored as a plain link — strip any button decoration
    const brandLink = brand.querySelector('a');
    if (brandLink) {
      brandLink.className = '';
      const wrapper = brandLink.closest('p');
      if (wrapper) wrapper.className = '';
    }
    brand.insertAdjacentHTML('afterbegin', BRAND_MARK);
  }

  if (links) {
    // the delivery pipeline wraps each list item's link in a <p> — unwrap it
    links.querySelectorAll('li > p').forEach((p) => p.replaceWith(...p.childNodes));

    const hamburger = document.createElement('div');
    hamburger.className = 'nav-hamburger';
    hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
        <span class="nav-hamburger-icon"></span>
      </button>`;
    hamburger.addEventListener('click', () => toggleMenu(nav));
    nav.prepend(hamburger);
    nav.setAttribute('aria-expanded', 'false');
    nav.addEventListener('focusout', closeOnFocusLost);
    window.addEventListener('keydown', closeOnEscape);
    isDesktop.addEventListener('change', () => toggleMenu(nav, isDesktop.matches));
  }

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.replaceChildren(navWrapper);
}
