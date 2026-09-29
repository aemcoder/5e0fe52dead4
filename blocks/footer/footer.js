import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Wheeler footer — brand block + link columns + legal row, on ink.
 *
 * Footer fragment (sections):
 *   brand   <p><a href="/">Wheeler</a></p> <p>about</p> <ul> social links (Facebook, YouTube, …)
 *   columns one section per column: <h2>Column title</h2> <ul> links
 *   legal   <p>© …</p> <ul> legal links   (the last section without a heading)
 */

const SOCIAL = {
  facebook: '<path d="M14 9h3V6h-3a4 4 0 0 0-4 4v2H7v3h3v6h3v-6h3l1-3h-4v-2a1 1 0 0 1 1-1z"/>',
  youtube: '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M11 9.5v5l4-2.5z"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 13v4"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7v.01"/>',
  x: '<path d="M4 4l16 16M20 4 4 20"/>',
  link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
};

function el(tag, className) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

function socialIcon(link) {
  const probe = `${link.textContent} ${link.href}`.toLowerCase();
  const key = Object.keys(SOCIAL).find((k) => k !== 'x' && k !== 'link' && probe.includes(k))
    || (/\btwitter\b|x\.com/.test(probe) ? 'x' : 'link');
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${SOCIAL[key]}</svg>`;
}

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;

  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const columns = sections.filter((s) => s.querySelector('h1, h2, h3, h4, h5, h6'));
  const rest = sections.filter((s) => !columns.includes(s));
  const legal = rest.length > 1 ? rest[rest.length - 1] : null;
  const brand = rest.find((s) => s !== legal);

  const wrap = el('div', 'wrap');
  const top = el('div', 'top');

  if (brand) {
    const brandBlock = el('div', 'brand-block');
    const nodes = [...brand.querySelectorAll('.default-content-wrapper > *')];
    const logoPara = nodes.find((n) => n.tagName === 'P' && n.querySelector('a'));
    nodes.forEach((node) => {
      if (node === logoPara) {
        const logo = el('div', 'logo');
        const link = node.querySelector('a');
        link.setAttribute('aria-label', `${link.textContent.trim()} home`);
        const mark = el('span', 'cat');
        mark.setAttribute('aria-hidden', 'true');
        mark.textContent = 'CAT';
        link.append(mark);
        logo.append(node);
        brandBlock.append(logo);
      } else if (node.tagName === 'UL' || node.tagName === 'OL') {
        const social = el('div', 'social');
        node.querySelectorAll('a').forEach((a) => {
          a.setAttribute('aria-label', a.textContent.trim());
          a.insertAdjacentHTML('afterbegin', socialIcon(a));
        });
        social.append(node);
        brandBlock.append(social);
      } else {
        const about = el('div', 'about');
        about.append(node);
        brandBlock.append(about);
      }
    });
    top.append(brandBlock);
  }

  columns.forEach((section) => {
    const col = el('div', 'col');
    col.append(...section.querySelectorAll('.default-content-wrapper > *'));
    top.append(col);
  });
  wrap.append(top);

  if (legal) {
    const bottom = el('div', 'bottom');
    [...legal.querySelectorAll('.default-content-wrapper > *')].forEach((node) => {
      if (node.tagName === 'UL' || node.tagName === 'OL') {
        const links = el('div', 'links');
        links.append(node);
        bottom.append(links);
      } else {
        const copy = el('div', 'copy');
        copy.append(node);
        bottom.append(copy);
      }
    });
    wrap.append(bottom);
  }

  block.replaceChildren(wrap);
}
