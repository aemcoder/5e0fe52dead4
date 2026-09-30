import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Wheeler footer.
 *
 * Footer fragment sections (in order):
 *   1. brand   — <p><a href="/">Wheeler CAT</a></p>, <p>blurb</p>,
 *                <ul> of social links (Facebook / YouTube / LinkedIn /
 *                Instagram — the icon is chosen from the link text, which
 *                stays as the accessible name)
 *   2. columns — repeated <h2>Heading</h2><ul>links</ul> groups
 *   3. bottom  — <p>© line</p> <ul>legal links</ul>
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const SOCIAL = {
  facebook: '<path d="M14 9h3V6h-3a4 4 0 0 0-4 4v2H7v3h3v6h3v-6h3l1-3h-4v-2a1 1 0 0 1 1-1z"/>',
  youtube: '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M11 9.5v5l4-2.5z"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 13v4"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7v.01"/>',
};

function el(tag, className, ...children) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  e.append(...children);
  return e;
}

function socialIcon(text) {
  const key = Object.keys(SOCIAL).find((k) => text.toLowerCase().includes(k));
  if (!key) return null;
  const s = document.createElementNS(SVG_NS, 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = SOCIAL[key];
  return s;
}

function unbutton(root) {
  root.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary', 'accent'));
  root.querySelectorAll('.button-wrapper, .button-container').forEach((p) => p.classList.remove('button-wrapper', 'button-container'));
}

function buildLogo(a) {
  const words = a.textContent.trim().split(/\s+/);
  const badge = words.length > 1 ? words.pop() : '';
  a.className = 'logo';
  a.setAttribute('aria-label', `${words.join(' ')} home`);
  a.replaceChildren(el('span', 'mark', words.join(' ')));
  if (badge) a.append(el('span', 'cat', badge));
  return a;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  block.textContent = '';
  if (!fragment) return;
  unbutton(fragment);

  const [brandSec, colsSec, bottomSec] = [...fragment.children];
  const top = el('div', 'top');

  // brand block
  if (brandSec) {
    const brand = el('div', 'brand-block');
    const nodes = [...brandSec.querySelectorAll('.default-content-wrapper > *')];
    nodes.forEach((n) => {
      if (n.tagName === 'UL') {
        n.querySelectorAll('a').forEach((a) => {
          const svg = socialIcon(a.textContent);
          if (!svg) return;
          a.setAttribute('aria-label', a.textContent.trim());
          a.replaceChildren(svg, el('span', 'label', ...a.childNodes));
        });
        brand.append(el('div', 'social', n));
      } else if (n === nodes[0] && n.querySelector('a')) {
        buildLogo(n.querySelector('a'));
        brand.append(el('div', 'brand-logo', n));
      } else {
        brand.append(el('div', 'blurb', n));
      }
    });
    top.append(brand);
  }

  // link columns — one per heading
  if (colsSec) {
    let col = null;
    [...colsSec.querySelectorAll('.default-content-wrapper > *')].forEach((n) => {
      if (/^H[1-6]$/.test(n.tagName) || !col) {
        col = el('div', 'col');
        top.append(col);
      }
      col.append(n);
    });
  }

  // bottom bar
  const bottom = el('div', 'bottom');
  if (bottomSec) {
    [...bottomSec.querySelectorAll('.default-content-wrapper > *')].forEach((n) => {
      bottom.append(el('div', n.tagName === 'UL' ? 'links' : 'copy', n));
    });
  }

  block.append(el('div', 'wrap', top, bottom));
}
