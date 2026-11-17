import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Field Guide footer — one authored section: a credits paragraph and a year line.
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  if (!fragment) return;
  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  fragment.querySelectorAll('.default-content-wrapper').forEach((wrapper) => {
    inner.append(...wrapper.children);
  });
  block.append(inner);
}
