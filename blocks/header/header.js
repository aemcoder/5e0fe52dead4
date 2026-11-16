import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the header — brand mark + tagline, fixed over the page.
 * Nav document contract: section 1 = brand link, last section = tagline/tools,
 * any section in between = nav links.
 * @param {Element} block The header block element
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
    sections.forEach((section, i) => {
      if (i === 0) section.classList.add('nav-brand');
      else if (i === sections.length - 1) section.classList.add('nav-tools');
      else section.classList.add('nav-sections');
      nav.append(section);
    });
  }

  // the brand link is never a button, even if authored with emphasis
  const brandLink = nav.querySelector('.nav-brand a');
  if (brandLink) {
    brandLink.classList.remove('button', 'primary', 'secondary', 'accent');
    brandLink.closest('.button-wrapper')?.classList.remove('button-wrapper');
  }

  // spacer between brand and tools, as in the prototype's flex row
  const spacer = document.createElement('div');
  spacer.className = 'nav-spacer';
  const tools = nav.querySelector('.nav-tools');
  if (tools) tools.before(spacer);
  else nav.append(spacer);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
