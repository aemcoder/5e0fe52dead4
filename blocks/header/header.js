import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// Bespoke "Simply Enough" logo mark (inline SVG — no shared asset).
const LOGO = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
  <circle cx="16" cy="16" r="15" stroke="#C4703F" stroke-width="1" fill="none" opacity="0.4"></circle>
  <path d="M16 6 C10 12, 10 22, 16 26 C22 22, 22 12, 16 6Z" fill="#2D4A3E" opacity="0.9"></path>
  <line x1="16" y1="10" x2="16" y2="23" stroke="#C4703F" stroke-width="1" opacity="0.6"></line>
  <line x1="13" y1="15" x2="16" y2="13" stroke="#C4703F" stroke-width="0.75" opacity="0.5"></line>
  <line x1="19" y1="17" x2="16" y2="15" stroke="#C4703F" stroke-width="0.75" opacity="0.5"></line>
</svg>`;

/**
 * Loads and decorates the header (fixed brand bar).
 *
 * Nav fragment sections (default content):
 *   1. brand   — a plain <a> logo/brand link (never wrapped in <strong>/<em>)
 *   2. tagline — a short line of meta text (right-aligned)
 *
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/fragments/header';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  if (fragment) {
    while (fragment.firstElementChild) nav.append(fragment.firstElementChild);
  }

  const sections = [...nav.children];
  const brand = sections[0];
  const tagline = sections[sections.length - 1];

  if (brand) {
    brand.classList.add('nav-brand');
    // prepend the logo mark to the brand link (or the brand section)
    const target = brand.querySelector('a') || brand.firstElementChild || brand;
    const mark = document.createElement('span');
    mark.className = 'nav-logo';
    mark.innerHTML = LOGO;
    target.prepend(mark);
  }

  if (tagline && tagline !== brand) {
    tagline.classList.add('nav-tagline');
  }

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
