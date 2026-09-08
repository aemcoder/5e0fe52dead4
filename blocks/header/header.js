import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

const MARK = `<svg class="nav-mark" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
    <circle cx="16" cy="16" r="15" stroke="#C4703F" stroke-width="1" fill="none" opacity="0.4"></circle>
    <path d="M16 6 C10 12, 10 22, 16 26 C22 22, 22 12, 16 6Z" fill="#2D4A3E" opacity="0.9"></path>
    <line x1="16" y1="10" x2="16" y2="23" stroke="#C4703F" stroke-width="1" opacity="0.6"></line>
    <line x1="13" y1="15" x2="16" y2="13" stroke="#C4703F" stroke-width="0.75" opacity="0.5"></line>
    <line x1="19" y1="17" x2="16" y2="15" stroke="#C4703F" stroke-width="0.75" opacity="0.5"></line>
  </svg>`;

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    if (!nav) return;
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections || isDesktop.matches) return;
    // eslint-disable-next-line no-use-before-define
    toggleMenu(nav, navSections);
    const button = nav.querySelector('.nav-hamburger button');
    if (button) button.focus();
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (nav.contains(e.relatedTarget)) return;
  const navSections = nav.querySelector('.nav-sections');
  if (!navSections || isDesktop.matches) return;
  // eslint-disable-next-line no-use-before-define
  toggleMenu(nav, navSections, false);
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const sections = [...nav.children];
  const brand = sections[0];
  const tools = sections.length > 1 ? sections[sections.length - 1] : null;
  const links = sections.length > 2 ? sections[1] : null;

  if (brand) {
    brand.classList.add('nav-brand');
    brand.insertAdjacentHTML('afterbegin', MARK);
    // the brand link is a plain anchor — strip any button decoration
    const brandLink = brand.querySelector('a');
    if (brandLink) {
      brandLink.className = '';
      const wrapper = brandLink.closest('.button-wrapper, .button-container');
      if (wrapper) wrapper.className = '';
    }
  }

  if (links) links.classList.add('nav-sections');
  if (tools && tools !== brand) tools.classList.add('nav-tools');

  const spacer = document.createElement('div');
  spacer.className = 'nav-spacer';
  spacer.setAttribute('aria-hidden', 'true');
  if (tools && tools !== brand) nav.insertBefore(spacer, tools);
  else nav.append(spacer);

  if (links) {
    const hamburger = document.createElement('div');
    hamburger.classList.add('nav-hamburger');
    hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
        <span class="nav-hamburger-icon"></span>
      </button>`;
    hamburger.addEventListener('click', () => toggleMenu(nav, links));
    nav.prepend(hamburger);
    nav.setAttribute('aria-expanded', 'false');
    toggleMenu(nav, links, isDesktop.matches);
    isDesktop.addEventListener('change', () => toggleMenu(nav, links, isDesktop.matches));
  }

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
