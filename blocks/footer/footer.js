import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * footer — quiet centred sign-off line on cream ("Less, but better.").
 * The /footer document is default content; every section renders in order.
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-inner';
  if (fragment) {
    while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
  }
  block.append(footer);
}
