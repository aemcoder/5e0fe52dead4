import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * footer — Field Guide colophon: one section, its paragraphs laid out in a
 * wrapping row (colophon text first, year last).
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  if (!fragment) return;
  const footer = document.createElement('div');
  footer.className = 'footer-inner';
  fragment.querySelectorAll('.default-content-wrapper > *').forEach((el) => footer.append(el));
  block.append(footer);
}
