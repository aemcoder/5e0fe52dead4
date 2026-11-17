import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Footer — a quiet centered sign-off line on the paper ground.
 * Footer document: one or more sections of default content, rendered in order.
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  const footer = document.createElement('div');
  footer.className = 'footer-inner';
  if (fragment) while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
  block.replaceChildren(footer);
}
