import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

/* leaf-in-circle brand mark (fixed brand asset, decorative) */
const LOGO_SVG = `<svg class="nav-logo" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
  <circle cx="16" cy="16" r="15" stroke="#C4703F" stroke-width="1" fill="none" opacity="0.4"></circle>
  <path d="M16 6 C10 12, 10 22, 16 26 C22 22, 22 12, 16 6Z" fill="#2D4A3E" opacity="0.9"></path>
  <line x1="16" y1="10" x2="16" y2="23" stroke="#C4703F" stroke-width="1" opacity="0.6"></line>
  <line x1="13" y1="15" x2="16" y2="13" stroke="#C4703F" stroke-width="0.75" opacity="0.5"></line>
  <line x1="19" y1="17" x2="16" y2="15" stroke="#C4703F" stroke-width="0.75" opacity="0.5"></line>
</svg>`;

function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
}

/**
 * Header — fixed translucent bar: logo + brand name, optional link list,
 * and a tagline on the right.
 *
 * Nav document contract (sections, in order):
 *   1. brand — a paragraph with a plain link to the home page
 *   2. (optional) links — a <ul> of page links
 *   3. tools — tagline text (e.g. "Live with intention")
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');

  const sections = fragment ? [...fragment.children] : [];
  const brand = sections.shift();
  const linksIdx = sections.findIndex((s) => s.querySelector('ul'));
  const links = linksIdx >= 0 ? sections.splice(linksIdx, 1)[0] : null;

  if (brand) {
    brand.classList.add('nav-brand');
    // brand link is a plain link, never a button
    brand.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary', 'accent'));
    brand.querySelectorAll('.button-wrapper').forEach((p) => p.classList.remove('button-wrapper'));
    brand.insertAdjacentHTML('afterbegin', LOGO_SVG);
    nav.append(brand);
  }

  const spacer = document.createElement('div');
  spacer.className = 'nav-spacer';
  nav.append(spacer);

  if (links) {
    links.classList.add('nav-sections');
    nav.append(links);
    const hamburger = document.createElement('div');
    hamburger.className = 'nav-hamburger';
    hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
        <span class="nav-hamburger-icon"></span>
      </button>`;
    hamburger.addEventListener('click', () => toggleMenu(nav));
    nav.append(hamburger);
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && !isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
        toggleMenu(nav, false);
        hamburger.querySelector('button').focus();
      }
    });
  }

  sections.forEach((s) => {
    s.classList.add('nav-tools');
    nav.append(s);
  });

  nav.setAttribute('aria-expanded', 'false');
  toggleMenu(nav, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.replaceChildren(navWrapper);
}
