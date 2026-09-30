/**
 * Home hero — full-bleed dark hero with an optional background picture,
 * a promo ribbon (tag + linked message), the page h1, a lede and CTAs.
 *
 * Authoring (one cell per row, any order of rows):
 *   [picture]                                  (optional background image)
 *   <p>Tag</p>                                 (ribbon tag — text before the heading, no link)
 *   <p><strong>Date</strong> — message <a>Details</a></p>   (ribbon body — text before the heading, with link)
 *   <h1>Headline with <em>highlight</em></h1>
 *   <p>Lede</p>
 *   <p><strong><a>Primary CTA</a></strong></p> <p><em><a>Secondary CTA</a></em></p>
 * Authored elements are moved (never rebuilt) so they stay editable.
 */
export default function decorate(block) {
  const media = document.createElement('div');
  media.className = 'home-hero-media';
  const picture = block.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    if (img) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
    }
    const holder = picture.parentElement;
    media.append(picture);
    if (holder && holder.tagName === 'P' && !holder.textContent.trim() && !holder.children.length) {
      holder.remove();
    }
  } else {
    block.classList.add('no-image');
  }

  const scrim = document.createElement('div');
  scrim.className = 'home-hero-scrim';
  scrim.setAttribute('aria-hidden', 'true');

  const inner = document.createElement('div');
  inner.className = 'home-hero-inner';

  const elements = [...block.querySelectorAll(':scope > div > div > *')]
    .filter((el) => el.textContent.trim() || el.querySelector('img'));
  const heading = elements.find((el) => /^H[1-6]$/.test(el.tagName));
  const headingIndex = elements.indexOf(heading);

  let ribbon;
  let ctas;
  elements.forEach((el, i) => {
    if (el === heading) {
      el.classList.add('home-hero-title');
      inner.append(el);
      return;
    }
    const beforeHeading = heading && i < headingIndex;
    if (beforeHeading) {
      if (!ribbon) {
        ribbon = document.createElement('div');
        ribbon.className = 'home-hero-ribbon';
        inner.append(ribbon);
      }
      const link = el.querySelector('a');
      if (link) {
        el.classList.add('home-hero-ribbon-body');
        link.classList.add('home-hero-ribbon-link');
      } else {
        el.classList.add('home-hero-ribbon-tag');
      }
      ribbon.append(el);
      return;
    }
    if (el.classList.contains('button-wrapper')) {
      if (!ctas) {
        ctas = document.createElement('div');
        ctas.className = 'home-hero-ctas';
        inner.append(ctas);
      }
      ctas.append(el);
      return;
    }
    el.classList.add('home-hero-lede');
    inner.append(el);
  });

  block.replaceChildren(media, scrim, inner);
}
