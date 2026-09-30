import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/*
 * Wheeler footer.
 * Footer fragment sections:
 *   1. brand:   <p><a href="/">Wheeler CAT</a></p> <p>About text</p>
 *               <ul> of social links (Facebook, YouTube, LinkedIn, Instagram)
 *   2..n-1.     link columns: <h2>Heading</h2> <ul>…</ul>
 *   n. bottom:  <p>© line</p> <ul> of legal links
 */

const SOCIAL = {
  facebook: '<path d="M14 9h3V6h-3a4 4 0 0 0-4 4v2H7v3h3v6h3v-6h3l1-3h-4v-2a1 1 0 0 1 1-1z"/>',
  youtube: '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M11 9.5v5l4-2.5z"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 13v4"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7v.01"/>',
};

function socialName(a) {
  const text = a.textContent.trim().toLowerCase();
  let host = '';
  try {
    host = new URL(a.href).hostname;
  } catch { /* ignore */ }
  return Object.keys(SOCIAL).find((k) => text.includes(k) || host.includes(k));
}

function decorateBrand(section) {
  section.classList.add('footer-brand');
  const link = section.querySelector('p a[href]');
  if (link && !link.querySelector('img')) {
    const text = link.textContent.trim();
    const match = text.match(/^(.*?)\s+(\S+)$/);
    if (match) {
      link.textContent = '';
      const mark = document.createElement('span');
      mark.className = 'footer-brand-mark';
      mark.textContent = match[1];
      const badge = document.createElement('span');
      badge.className = 'footer-brand-badge';
      badge.textContent = match[2];
      link.append(mark, badge);
      link.setAttribute('aria-label', `${text} home`);
    }
    link.className = 'footer-logo';
    link.closest('p')?.classList.add('footer-logo-wrapper');
  }
  const social = section.querySelector('ul');
  if (social) {
    social.classList.add('footer-social');
    social.querySelectorAll('a').forEach((a) => {
      const name = socialName(a);
      if (!name) return;
      const label = document.createElement('span');
      label.className = 'visually-hidden';
      label.append(...a.childNodes);
      const tpl = document.createElement('template');
      tpl.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${SOCIAL[name]}</svg>`;
      a.append(tpl.content.firstElementChild, label);
    });
  }
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;

  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const top = document.createElement('div');
  top.className = 'footer-top';
  const bottom = sections.length > 1 ? sections.pop() : null;

  sections.forEach((section, i) => {
    if (i === 0) decorateBrand(section);
    else section.classList.add('footer-column');
    top.append(section);
  });

  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  inner.append(top);
  if (bottom) {
    bottom.classList.add('footer-bottom');
    inner.append(bottom);
  }

  block.textContent = '';
  block.append(inner);
}
