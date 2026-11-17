import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * header — fixed translucent bar: brand mark + name (left), tagline (right).
 *
 * Nav document sections:
 *   1. brand — a plain link to the home page (the leaf mark is CSS)
 *   2. tagline / tools — short text shown at the far right
 * Authored nodes move into the bar; nothing is rebuilt from text.
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Site');
  if (fragment) {
    const sections = [...fragment.children];
    const classes = ['brand', 'tools'];
    sections.forEach((section, i) => {
      section.classList.add(`nav-${classes[Math.min(i, classes.length - 1)]}`);
      nav.append(section);
    });
  }

  // the brand link stays a plain link even if an author formats it
  const brandLink = nav.querySelector('.nav-brand a');
  if (brandLink) {
    brandLink.classList.remove('button', 'primary', 'secondary', 'accent');
    brandLink.closest('.button-wrapper')?.classList.remove('button-wrapper');
  }

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
