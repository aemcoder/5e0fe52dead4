import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// decorative brand mark (leaf in a ring) — presentation only, the brand name is authored
const LOGO_MARK = `<svg class="nav-mark" width="32" height="32" viewBox="0 0 32 32" fill="none"
  aria-hidden="true" focusable="false">
  <circle cx="16" cy="16" r="15" stroke="#C4703F" stroke-width="1" opacity="0.4"/>
  <path d="M16 6 C10 12, 10 22, 16 26 C22 22, 22 12, 16 6Z" fill="#2D4A3E" opacity="0.9"/>
  <line x1="16" y1="10" x2="16" y2="23" stroke="#C4703F" stroke-width="1" opacity="0.6"/>
  <line x1="13" y1="15" x2="16" y2="13" stroke="#C4703F" stroke-width="0.75" opacity="0.5"/>
  <line x1="19" y1="17" x2="16" y2="15" stroke="#C4703F" stroke-width="0.75" opacity="0.5"/>
</svg>`;

/**
 * loads and decorates the header
 * Nav document: section 1 = brand link, optional middle section = nav links,
 * last section = tagline / tools.
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
  const [brandSection, ...others] = sections;
  const toolsSection = others.length ? others.pop() : null;

  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  brand.innerHTML = LOGO_MARK;
  if (brandSection) {
    const content = brandSection.querySelector('.default-content-wrapper') || brandSection;
    brand.append(...content.childNodes);
    brand.querySelectorAll('.button').forEach((a) => a.classList.remove('button', 'primary'));
  }
  nav.append(brand);

  others.forEach((section) => {
    const links = document.createElement('div');
    links.className = 'nav-sections';
    const content = section.querySelector('.default-content-wrapper') || section;
    links.append(...content.childNodes);
    nav.append(links);
  });

  const spacer = document.createElement('div');
  spacer.className = 'nav-spacer';
  nav.append(spacer);

  if (toolsSection) {
    const tools = document.createElement('div');
    tools.className = 'nav-tools';
    const content = toolsSection.querySelector('.default-content-wrapper') || toolsSection;
    tools.append(...content.childNodes);
    nav.append(tools);
  }

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.replaceChildren(navWrapper);
}
