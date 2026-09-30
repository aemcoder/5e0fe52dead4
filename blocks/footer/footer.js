import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Wheeler footer — template-slotted from the authored /footer document.
 *
 * Footer document contract (one section each, default content only):
 *   first   — brand: <p><a>Wheeler</a></p>, blurb <p>, social <ul> (each link leads with an
 *             :icon: token followed by the network name, visually hidden)
 *   middle  — link columns: <h2> column title + <ul> of links (any number of columns)
 *   last    — bottom bar: copyright <p> + legal links <ul>
 *
 * Authored wrappers are MOVED into the layout (Experience Workspace safe).
 */

async function inlineIcons(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const tokens = [];
  while (walker.nextNode()) {
    if (/:[a-z0-9-]+:/.test(walker.currentNode.nodeValue)) tokens.push(walker.currentNode);
  }
  tokens.forEach((node) => {
    const m = node.nodeValue.match(/^(\s*):([a-z0-9-]+):\s*/);
    if (!m) return;
    const span = document.createElement('span');
    span.className = `icon icon-${m[2]}`;
    node.nodeValue = node.nodeValue.slice(m[0].length);
    node.before(span);
  });
  const spans = [...root.querySelectorAll('span.icon')];
  await Promise.all(spans.map(async (span) => {
    const name = [...span.classList].find((c) => c.startsWith('icon-'))?.slice(5);
    if (!name) return;
    try {
      const resp = await fetch(`${window.hlx?.codeBasePath || ''}/icons/${name}.svg`);
      if (!resp.ok) return;
      const svg = (await resp.text()).trim();
      if (svg.startsWith('<svg')) span.innerHTML = svg;
    } catch (e) {
      // keep the <img> fallback
    }
  }));
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

  const sections = [...fragment.querySelectorAll(':scope > .section')]
    .map((s) => s.querySelector('.default-content-wrapper') || s);

  block.textContent = '';
  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  const top = document.createElement('div');
  top.className = 'top';
  const bottom = document.createElement('div');
  bottom.className = 'bottom';

  const brandSrc = sections.length > 1 ? sections[0] : null;
  const bottomSrc = sections.length > 2 ? sections[sections.length - 1] : null;
  const columns = sections.filter((s) => s !== brandSrc && s !== bottomSrc);

  if (brandSrc) {
    brandSrc.className = 'brand-block';
    const logo = brandSrc.querySelector('a');
    if (logo) {
      logo.classList.remove('button', 'primary', 'secondary', 'accent');
      logo.closest('.button-wrapper')?.classList.remove('button-wrapper');
      const logoWrap = document.createElement('div');
      logoWrap.className = 'logo';
      const para = logo.closest('p') || logo;
      para.before(logoWrap);
      logoWrap.append(para);
      const cat = document.createElement('span');
      cat.className = 'cat';
      cat.setAttribute('aria-hidden', 'true');
      cat.textContent = 'CAT';
      logoWrap.append(cat);
    }
    const social = brandSrc.querySelector(':scope > ul');
    if (social) {
      const socialWrap = document.createElement('div');
      socialWrap.className = 'social';
      social.before(socialWrap);
      socialWrap.append(social);
    }
    top.append(brandSrc);
  }

  columns.forEach((col) => {
    col.className = 'col';
    top.append(col);
  });

  if (bottomSrc) {
    bottomSrc.className = 'bottom-inner';
    const links = bottomSrc.querySelector(':scope > ul');
    if (links) {
      const linksWrap = document.createElement('div');
      linksWrap.className = 'links';
      links.before(linksWrap);
      linksWrap.append(links);
    }
    bottom.append(bottomSrc);
  }

  wrap.append(top, bottom);
  block.append(wrap);
  await inlineIcons(wrap);
}
