import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * header — fixed, translucent dark bar: logo mark + brand link, spacer, tagline.
 * Decode tier: template-slotted. The nav document follows the section contract:
 *   section 1 = brand (a plain link to the home page)
 *   section 2 = tagline / links (optional)
 *   section 3 = tools (optional)
 * Authored nodes are MOVED into the chrome template; the leaf logo mark is a
 * fixed brand asset rendered inline (aria-hidden).
 */

const LOGO_SVG = `<svg class="nav-logo" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
  <circle cx="16" cy="16" r="15" stroke="#C4703F" stroke-width="1" fill="none" opacity="0.4"></circle>
  <path d="M16 6 C10 12, 10 22, 16 26 C22 22, 22 12, 16 6Z" fill="#2D4A3E" opacity="0.9"></path>
  <line x1="16" y1="10" x2="16" y2="23" stroke="#C4703F" stroke-width="1" opacity="0.6"></line>
  <line x1="13" y1="15" x2="16" y2="13" stroke="#C4703F" stroke-width="0.75" opacity="0.5"></line>
  <line x1="19" y1="17" x2="16" y2="15" stroke="#C4703F" stroke-width="0.75" opacity="0.5"></line>
</svg>`;

function sectionContent(section) {
  if (!section) return [];
  const wrapper = section.querySelector('.default-content-wrapper') || section;
  return [...wrapper.children];
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  const sections = fragment ? [...fragment.children] : [];

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');

  // brand slot
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  const brandNodes = sectionContent(sections[0]);
  brandNodes.forEach((n) => {
    const link = n.matches('a') ? n : n.querySelector('a');
    if (link) {
      link.classList.remove('button', 'primary', 'secondary', 'accent');
      const wrapperP = link.closest('p');
      if (wrapperP) wrapperP.className = '';
    }
  });
  brand.append(...brandNodes);
  const brandLink = brand.querySelector('a');
  if (brandLink) brandLink.insertAdjacentHTML('afterbegin', LOGO_SVG);
  else brand.insertAdjacentHTML('afterbegin', LOGO_SVG);
  nav.append(brand);

  const spacer = document.createElement('div');
  spacer.className = 'nav-spacer';
  nav.append(spacer);

  // tagline / sections slot
  const tagNodes = sectionContent(sections[1]);
  if (tagNodes.length) {
    const tagline = document.createElement('div');
    tagline.className = 'nav-sections';
    tagline.append(...tagNodes);
    nav.append(tagline);
  }

  // tools slot
  const toolNodes = sectionContent(sections[2]);
  if (toolNodes.length) {
    const tools = document.createElement('div');
    tools.className = 'nav-tools';
    tools.append(...toolNodes);
    nav.append(tools);
  }

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.replaceChildren(navWrapper);
}
