import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * footer — a single colophon line: credits on the left, year on the right.
 * Footer document: one section of paragraphs; the first is the credit line,
 * the rest sit at the right edge.
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : 'https://adobe--sendto--aemcoder.aem.page/adobe/onboarding/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-inner';
  if (fragment) {
    fragment.querySelectorAll('.default-content-wrapper').forEach((w) => footer.append(...w.children));
    if (!footer.children.length) while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
  }
  block.append(footer);
}
