import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * header — fixed translucent dark bar: leaf logo mark, serif brand link,
 * and an uppercase tagline pushed to the right.
 *
 * Decode tier: template-slotted. The /nav document contract (default content):
 *   section 1 — brand: a paragraph holding the plain brand link (<a href="/">)
 *   section 2 — optional nav links (<ul>) — rendered inline on desktop,
 *               behind a toggle on mobile
 *   last section — tools: the tagline paragraph
 * When only two sections are authored, the second is treated as tools.
 */

const LOGO = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
  <circle cx="16" cy="16" r="15" stroke="#C4703F" stroke-width="1" fill="none" opacity="0.4"></circle>
  <path d="M16 6 C10 12, 10 22, 16 26 C22 22, 22 12, 16 6Z" fill="#2D4A3E" opacity="0.9"></path>
  <line x1="16" y1="10" x2="16" y2="23" stroke="#C4703F" stroke-width="1" opacity="0.6"></line>
  <line x1="13" y1="15" x2="16" y2="13" stroke="#C4703F" stroke-width="0.75" opacity="0.5"></line>
  <line x1="19" y1="17" x2="16" y2="15" stroke="#C4703F" stroke-width="0.75" opacity="0.5"></line>
</svg>`;

const isDesktop = window.matchMedia('(min-width: 900px)');

function setExpanded(nav, expanded) {
  nav.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  const button = nav.querySelector('.nav-hamburger button');
  if (button) button.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
}

/**
 * loads and decorates the header
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

  const sections = fragment ? [...fragment.children] : [];
  const brandSection = sections[0] || null;
  const toolsSection = sections.length > 1 ? sections[sections.length - 1] : null;
  const linkSection = sections.length > 2 ? sections[1] : null;

  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  const logo = document.createElement('span');
  logo.className = 'nav-logo';
  logo.innerHTML = LOGO;
  brand.append(logo);
  if (brandSection) {
    const content = brandSection.querySelector('.default-content-wrapper') || brandSection;
    brand.append(...content.children);
    // the brand link is never a button, whatever the author formatting
    brand.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary', 'accent'));
    brand.querySelectorAll('.button-wrapper').forEach((p) => p.classList.remove('button-wrapper'));
  }
  nav.append(brand);

  const spacer = document.createElement('div');
  spacer.className = 'nav-spacer';
  nav.append(spacer);

  if (linkSection) {
    const links = document.createElement('div');
    links.className = 'nav-sections';
    const content = linkSection.querySelector('.default-content-wrapper') || linkSection;
    links.append(...content.children);
    nav.append(links);

    const hamburger = document.createElement('div');
    hamburger.className = 'nav-hamburger';
    hamburger.innerHTML = '<button type="button" aria-controls="nav" aria-label="Open navigation"><span class="nav-hamburger-icon"></span></button>';
    hamburger.addEventListener('click', () => setExpanded(nav, nav.getAttribute('aria-expanded') !== 'true'));
    nav.append(hamburger);
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && nav.getAttribute('aria-expanded') === 'true') setExpanded(nav, false);
    });
    isDesktop.addEventListener('change', () => setExpanded(nav, false));
  }

  if (toolsSection) {
    const tools = document.createElement('div');
    tools.className = 'nav-tools';
    const content = toolsSection.querySelector('.default-content-wrapper') || toolsSection;
    tools.append(...content.children);
    nav.append(tools);
  }

  setExpanded(nav, false);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
