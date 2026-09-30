import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * footer — Wheeler dark footer: brand column + link columns, then a legal bar.
 *
 * Footer document contract (fragments/footer.html, sections in order):
 *   1. brand   — logo link (<a href="/">Wheeler CAT</a>), a short <p>, and a <ul>
 *                of social links (icon picked from the link's host)
 *   2..N-1     — link columns: a heading + <ul> of links
 *   N. legal   — copyright <p> + <ul> of legal links
 */

const SOCIAL = {
  facebook: '<path d="M14 9h3V6h-3a4 4 0 0 0-4 4v2H7v3h3v6h3v-6h3l1-3h-4v-2a1 1 0 0 1 1-1z"></path>',
  youtube: '<rect x="3" y="6" width="18" height="12" rx="3"></rect><path d="M11 9.5v5l4-2.5z"></path>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 13v4"></path>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><path d="M17 7v.01"></path>',
};

function socialKey(a) {
  const hay = `${a.getAttribute('href') || ''} ${a.textContent}`.toLowerCase();
  return Object.keys(SOCIAL).find((k) => hay.includes(k));
}

function buildLogo(link) {
  const a = document.createElement('a');
  a.className = 'logo';
  a.href = link.getAttribute('href') || '/';
  const words = link.textContent.trim().split(/\s+/);
  const badge = words.length > 1 ? words.pop() : '';
  a.setAttribute('aria-label', `${words.join(' ')} home`);
  const mark = document.createElement('span');
  mark.className = 'mark';
  mark.textContent = words.join(' ');
  a.append(mark);
  if (badge) {
    const cat = document.createElement('span');
    cat.className = 'cat';
    cat.textContent = badge;
    a.append(cat);
  }
  return a;
}

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : 'https://adobe--sendto--aemcoder.aem.page/adobe/onboarding/footer';
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;

  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const content = (sec) => sec.querySelector('.default-content-wrapper') || sec;

  const root = document.createElement('div');
  root.className = 'wrap';
  const top = document.createElement('div');
  top.className = 'top';
  const bottom = document.createElement('div');
  bottom.className = 'bottom';

  const legal = sections.length > 1 ? sections.pop() : null;
  const brand = sections.shift();

  if (brand) {
    const col = document.createElement('div');
    col.className = 'brand-block';
    const wrap = content(brand);
    const logoP = wrap.querySelector(':scope > p a')?.closest('p');
    const logoLink = logoP?.querySelector('a');
    if (logoLink) col.append(buildLogo(logoLink));
    [...wrap.querySelectorAll(':scope > p')].forEach((p) => {
      if (p !== logoP) col.append(wrapNode(p, 'blurb'));
    });
    const socialList = wrap.querySelector('ul');
    if (socialList) {
      socialList.classList.add('social-list');
      socialList.querySelectorAll('a').forEach((a) => {
        const key = socialKey(a);
        a.setAttribute('aria-label', a.textContent.trim());
        if (key) {
          a.insertAdjacentHTML('afterbegin', `<svg viewBox="0 0 24 24" aria-hidden="true">${SOCIAL[key]}</svg>`);
        }
      });
      col.append(wrapNode(socialList, 'social'));
    }
    top.append(col);
  }

  sections.forEach((sec) => {
    const col = document.createElement('div');
    col.className = 'links';
    col.append(...content(sec).childNodes);
    top.append(col);
  });

  if (legal) {
    const wrap = content(legal);
    const copy = wrap.querySelector('p');
    if (copy) bottom.append(wrapNode(copy, 'copy'));
    const list = wrap.querySelector('ul');
    if (list) bottom.append(wrapNode(list, 'legal-links'));
  }

  root.append(top, bottom);
  block.replaceChildren(root);
}
