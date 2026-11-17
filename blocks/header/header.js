import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(width >= 900px)');

// decorative brand mark (leaf in a ring) — presentational, not authored content
const MARK = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
  <circle cx="16" cy="16" r="15" stroke="#C4703F" stroke-width="1" fill="none" opacity="0.4"/>
  <path d="M16 6 C10 12, 10 22, 16 26 C22 22, 22 12, 16 6Z" fill="#2D4A3E" opacity="0.9"/>
  <line x1="16" y1="10" x2="16" y2="23" stroke="#C4703F" stroke-width="1" opacity="0.6"/>
  <line x1="13" y1="15" x2="16" y2="13" stroke="#C4703F" stroke-width="0.75" opacity="0.5"/>
  <line x1="19" y1="17" x2="16" y2="15" stroke="#C4703F" stroke-width="0.75" opacity="0.5"/>
</svg>`;

function toggleMenu(nav, force = null) {
  const expanded = force !== null ? !force : nav.getAttribute('aria-expanded') === 'true';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  const button = nav.querySelector('.nav-hamburger button');
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
}

/**
 * loads and decorates the header — template-slotted from the /nav document:
 * section 1 = brand link, section 2 = optional link list, section 3 = tagline/tools
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');
  if (fragment) while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // fixed role contract: first section = brand, the one holding a list = links,
  // any remaining section = tools (tolerates an omitted/empty links section)
  const sections = [...nav.children];
  const [brand] = sections;
  if (brand) brand.classList.add('nav-brand');
  const links = sections.find((s, i) => i > 0 && s.querySelector('ul'));
  if (links) links.classList.add('nav-sections');
  const rest = sections.filter((s) => s !== brand && s !== links && s.textContent.trim());
  rest.forEach((s) => s.classList.add('nav-tools'));

  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    // the brand link is a plain link, never a button
    navBrand.querySelectorAll('.button').forEach((a) => {
      a.classList.remove('button', 'primary', 'secondary', 'accent');
    });
    navBrand.querySelectorAll('.button-wrapper').forEach((p) => {
      p.classList.remove('button-wrapper');
    });
    const mark = document.createElement('span');
    mark.className = 'nav-mark';
    mark.innerHTML = MARK;
    navBrand.prepend(mark);
  }

  const navSections = nav.querySelector('.nav-sections');
  const hasLinks = navSections && navSections.querySelector('a');
  if (navSections && !hasLinks) navSections.remove();

  // the spacer pushes the tools/tagline to the far edge
  const spacer = document.createElement('div');
  spacer.className = 'nav-spacer';
  const tools = nav.querySelector('.nav-tools');
  if (tools) tools.before(spacer);
  else nav.append(spacer);

  if (hasLinks) {
    const hamburger = document.createElement('div');
    hamburger.className = 'nav-hamburger';
    hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
        <span class="nav-hamburger-icon"></span>
      </button>`;
    hamburger.addEventListener('click', () => toggleMenu(nav));
    nav.append(hamburger);
    toggleMenu(nav, isDesktop.matches);
    isDesktop.addEventListener('change', () => toggleMenu(nav, isDesktop.matches));
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && !isDesktop.matches) toggleMenu(nav, false);
    });
  }

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
