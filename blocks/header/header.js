import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const LOGO = `<svg class="nav-logo" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="15" stroke="#C4703F" stroke-width="1" fill="none" opacity="0.4"></circle>
    <path d="M16 6 C10 12, 10 22, 16 26 C22 22, 22 12, 16 6Z" fill="#2D4A3E" opacity="0.9"></path>
    <line x1="16" y1="10" x2="16" y2="23" stroke="#C4703F" stroke-width="1" opacity="0.6"></line>
    <line x1="13" y1="15" x2="16" y2="13" stroke="#C4703F" stroke-width="0.75" opacity="0.5"></line>
    <line x1="19" y1="17" x2="16" y2="15" stroke="#C4703F" stroke-width="0.75" opacity="0.5"></line>
  </svg>`;

/**
 * loads and decorates the header (fixed brand bar)
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment && fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'tagline'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // prepend the brand emblem to the brand section
  const brand = nav.querySelector('.nav-brand');
  if (brand) {
    const logo = document.createElement('span');
    logo.className = 'nav-logo-wrap';
    logo.innerHTML = LOGO;
    brand.prepend(logo);
  }

  // spacer keeps the tagline pinned right
  const spacer = document.createElement('div');
  spacer.className = 'nav-spacer';
  const tagline = nav.querySelector('.nav-tagline');
  if (tagline) tagline.before(spacer);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
