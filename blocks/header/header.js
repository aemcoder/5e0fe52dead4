import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Simply Enough header — fixed dark bar with SVG logo, brand name, and tagline.
 * Nav fragment sections:
 *   1. brand (link with site name)
 *   2. sections (tagline text)
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta
    ? new URL(navMeta, window.location).pathname
    : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';

  if (fragment) {
    while (fragment.firstElementChild) nav.append(fragment.firstElementChild);
  }

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Strip any auto-applied button class from the brand link
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      const wrapper = brandLink.closest('.button-container, .button-wrapper');
      if (wrapper) wrapper.className = '';
    }
  }

  // Build SVG logo
  const logo = document.createElement('div');
  logo.className = 'nav-brand-logo';
  logo.innerHTML = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="15" stroke="#C4703F" stroke-width="1" fill="none" opacity="0.4"/>
    <path d="M16 6 C10 12, 10 22, 16 26 C22 22, 22 12, 16 6Z" fill="#2D4A3E" opacity="0.9"/>
    <line x1="16" y1="10" x2="16" y2="23" stroke="#C4703F" stroke-width="1" opacity="0.6"/>
    <line x1="13" y1="15" x2="16" y2="13" stroke="#C4703F" stroke-width="0.75" opacity="0.5"/>
    <line x1="19" y1="17" x2="16" y2="15" stroke="#C4703F" stroke-width="0.75" opacity="0.5"/>
  </svg>`;

  // Build spacer
  const spacer = document.createElement('div');
  spacer.className = 'nav-spacer';

  // Assemble the nav wrapper
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';

  navWrapper.append(logo);
  if (navBrand) navWrapper.append(navBrand);
  navWrapper.append(spacer);

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) navWrapper.append(navSections);

  block.append(navWrapper);
}
