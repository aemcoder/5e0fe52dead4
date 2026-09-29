import { getMetadata, decorateIcons } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/*
 * Wheeler footer.
 * Footer fragment contract (classified by content):
 *   brand   <p><a>Wheeler</a></p>, a description <p>, and a <ul> of social links
 *           (`:facebook: Facebook` — the label stays as the accessible name)
 *   columns repeated <h2> + <ul> groups — one column per heading
 *   bottom  copyright <p> + <ul> of legal links (the last section)
 */

function paintIcons(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const hits = [];
  while (walker.nextNode()) {
    if (/:[a-z0-9-]+:/.test(walker.currentNode.nodeValue)) hits.push(walker.currentNode);
  }
  hits.forEach((node) => {
    const parts = node.nodeValue.split(/:([a-z0-9-]+):/);
    const frag = document.createDocumentFragment();
    parts.forEach((part, i) => {
      if (i % 2) {
        const span = document.createElement('span');
        span.className = `icon icon-${part}`;
        frag.append(span);
      } else if (part) {
        frag.append(document.createTextNode(part));
      }
    });
    node.replaceWith(frag);
  });
  decorateIcons(root);
  root.querySelectorAll('span.icon').forEach((span) => {
    const img = span.querySelector('img');
    if (!img) return;
    span.style.setProperty('--icon-src', `url("${img.src}")`);
    span.setAttribute('aria-hidden', 'true');
    img.remove();
  });
}

const wrap = (className, ...children) => {
  const div = document.createElement('div');
  div.className = className;
  div.append(...children.filter(Boolean));
  return div;
};

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : 'https://adobe--sendto--aemcoder.aem.page/adobe/onboarding/footer';
  const fragment = await loadFragment(footerPath);
  block.textContent = '';
  if (!fragment) return;

  fragment.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary', 'accent'));
  fragment.querySelectorAll('p.button-wrapper').forEach((p) => p.classList.remove('button-wrapper'));
  fragment.querySelectorAll('li > p').forEach((p) => p.replaceWith(...p.childNodes));

  const sections = [...fragment.children];
  const columnsSection = sections.find((s) => s.querySelector('h2, h3, h4'));
  const last = sections[sections.length - 1];
  const bottomSection = sections.length > 2 && last !== columnsSection ? last : null;
  const brandSection = sections.find((s) => s !== columnsSection && s !== bottomSection);

  const top = wrap('footer-top');

  if (brandSection) {
    const items = [...brandSection.querySelectorAll('.default-content-wrapper > *')];
    const logo = items.find((el) => el.tagName === 'P' && el.querySelector('a') && el.textContent.trim() === el.querySelector('a').textContent.trim());
    const social = items.find((el) => el.tagName === 'UL');
    const brand = wrap('footer-brand');
    if (logo) brand.append(wrap('footer-logo', logo));
    const copy = items.filter((el) => el !== logo && el !== social);
    if (copy.length) brand.append(wrap('footer-about', ...copy));
    if (social) brand.append(wrap('footer-social', social));
    top.append(brand);
  }

  if (columnsSection) {
    // segment the flat heading + list run into one column per heading (capture before moving)
    const nodes = [...columnsSection.querySelectorAll('.default-content-wrapper > *')];
    let col = null;
    nodes.forEach((el) => {
      if (/^H[1-6]$/.test(el.tagName) || !col) {
        col = wrap('footer-col');
        top.append(col);
      }
      col.append(el);
    });
  }

  const bottom = bottomSection
    ? wrap('footer-bottom', ...bottomSection.querySelectorAll('.default-content-wrapper > *'))
    : null;

  block.append(wrap('footer-wrap', top, bottom));
  paintIcons(block);
}
