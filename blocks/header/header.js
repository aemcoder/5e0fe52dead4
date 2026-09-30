import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * header — sticky nav bar with mega-menu panels and a reading-progress rule.
 *
 * Nav document contract (sections, in order):
 *   1. brand — a paragraph with the home/top link (plain <a>)
 *   2. tools — CTA paragraph(s), e.g. <strong><a> primary button
 *   3+ one section per mega-menu panel:
 *      <h2> trigger label, an intro kicker paragraph, a "see all" link
 *      paragraph, then groups, each opened by an <h3>:
 *        - <h3> with a link + description + meta paragraphs  → link card
 *        - <h3> + <picture>                                   → image card
 *        - <h3> (optional <code> count) + list of links       → link list;
 *          list items read "<a>Name</a> detail"; trailing paragraphs with
 *          emphasised links become a button row
 *        - <h3> numeral + text + CTA                          → stat card
 *        - <h3> + video link + text + link                    → video card
 *        - <h3> + linked pictures + note                      → thumbnail grid
 *
 * @ew-exempt <h2> panel label — copied into the trigger button (chrome)
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(pointer: fine)').matches;
const pad = (n) => String(n).padStart(2, '0');
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function el(tag, className, ...children) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  e.append(...children.filter(Boolean));
  return e;
}

/** Splits a panel's flat content into { intro: [], groups: [[h3, ...nodes]] }. */
function segment(nodes) {
  const intro = [];
  const groups = [];
  nodes.forEach((n) => {
    if (n.tagName === 'H3') groups.push([n]);
    else if (groups.length) groups[groups.length - 1].push(n);
    else intro.push(n);
  });
  return { intro, groups };
}

function unwrapLink(link) {
  link.replaceWith(...link.childNodes);
}

function buildListGroup(h3, rest) {
  const group = el('div', 'mega-group mega-list');
  const list = rest.find((n) => n.matches('ul, ol'));
  const code = h3.querySelector('code');
  const count = el('span', 'count');
  if (code) {
    count.append(code);
  } else {
    count.textContent = pad(list ? list.children.length : 0);
  }
  group.append(el('div', 'mega-list-head', el('div', 'title', h3), count));
  if (list) {
    [...list.children].forEach((li) => {
      const link = li.querySelector('a');
      const meta = el('span', 'meta');
      [...li.childNodes].forEach((n) => { if (n !== link) meta.append(n); });
      if (meta.textContent.trim()) {
        li.append(meta);
        if (/^[\d\s–-]+$/.test(meta.textContent.trim())) li.classList.add('indexed');
      }
    });
    group.append(list);
  }
  const extra = rest.filter((n) => n !== list);
  if (extra.length) {
    const rolls = el('div', 'mega-rolls');
    const buttons = el('div', 'buttons');
    extra.forEach((n) => {
      if (n.querySelector('a')) buttons.append(n);
      else rolls.append(el('div', 'label', n));
    });
    if (buttons.children.length) rolls.append(buttons);
    group.append(rolls);
  }
  return group;
}

function buildGroup(nodes, index) {
  const [h3, ...rest] = nodes;
  const h3Link = h3.querySelector('a');
  const pic = rest.map((n) => n.querySelector?.('picture, img') || (n.matches?.('picture, img') ? n : null)).find(Boolean);
  const hasList = rest.some((n) => n.matches?.('ul, ol'));
  const videoLink = rest.map((n) => n.querySelector?.('a[href*=".mp4"]')).find(Boolean);
  const linkedPics = rest.filter((n) => n.querySelector?.('a picture, a img'));

  if (hasList) return { node: buildListGroup(h3, rest), kind: 'list' };

  if (linkedPics.length > 1) {
    const group = el('div', 'mega-group mega-thumbs', el('div', 'title', h3));
    const grid = el('div', 'thumbs');
    linkedPics.forEach((p) => {
      const a = p.querySelector('a');
      a.classList.add('thumb');
      const img = a.querySelector('img');
      if (img) a.setAttribute('aria-label', img.alt || 'Open frame');
      grid.append(p);
    });
    group.append(grid);
    rest.filter((n) => !linkedPics.includes(n)).forEach((n) => group.append(el('div', 'note', n)));
    return { node: group, kind: 'media' };
  }

  if (videoLink) {
    const group = el('div', 'mega-group mega-video', el('div', 'title', h3));
    const video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'none';
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.src = videoLink.href;
    const hint = el('span', 'hint');
    hint.textContent = 'Hover to preview';
    hint.setAttribute('aria-hidden', 'true');
    group.append(el('div', 'screen grayscale', video, hint));
    const linkPara = videoLink.closest('p');
    linkPara?.remove();
    rest.filter((n) => n !== linkPara).forEach((n) => {
      if (n.textContent.trim()) group.append(el('div', n.querySelector('a') ? 'more' : 'desc', n));
    });
    group.addEventListener('mouseenter', () => video.play().catch(() => {}));
    group.addEventListener('mouseleave', () => video.pause());
    return { node: group, kind: 'media' };
  }

  if (pic && h3Link) {
    const card = document.createElement('a');
    card.className = 'mega-group mega-feature';
    card.href = h3Link.getAttribute('href');
    unwrapLink(h3Link);
    const media = pic.closest('picture') || pic;
    card.append(el('span', 'media grayscale', media), el('span', 'caption', h3));
    return { node: card, kind: 'card' };
  }

  if (h3Link) {
    const card = document.createElement('a');
    card.className = 'mega-group mega-card';
    card.href = h3Link.getAttribute('href');
    unwrapLink(h3Link);
    const num = el('span', 'num');
    num.textContent = pad(index + 1);
    num.setAttribute('aria-hidden', 'true');
    const ps = rest.filter((n) => n.tagName === 'P');
    card.append(num, el('span', 'title', h3));
    if (ps[0]) card.append(el('span', 'desc', ps[0]));
    if (ps[1]) card.append(el('span', 'meta', ps[1]));
    return { node: card, kind: 'card' };
  }

  // stat card: numeral heading, text and CTA
  const group = el('div', 'mega-group mega-stat', el('div', 'figure', h3));
  rest.forEach((n) => group.append(el('div', n.querySelector?.('a') ? 'cta' : 'text', n)));
  return { node: group, kind: 'stat' };
}

function buildPanel(section, id) {
  const wrapper = section.querySelector('.default-content-wrapper') || section;
  const nodes = [...wrapper.children];
  const label = nodes.find((n) => n.tagName === 'H2');
  const { intro, groups } = segment(nodes.filter((n) => n !== label));

  const panel = el('div', 'mega-panel');
  panel.id = id;
  panel.hidden = true;
  panel.setAttribute('role', 'region');
  if (intro.length) {
    const head = el('div', 'mega-intro');
    intro.forEach((n) => head.append(el('div', n.querySelector('a') ? 'all' : 'kicker', n)));
    panel.append(head);
  }
  const grid = el('div', 'mega-grid');
  let cardIndex = 0;
  const kinds = new Set();
  groups.forEach((g) => {
    const { node, kind } = buildGroup(g, cardIndex);
    if (node.classList.contains('mega-card')) cardIndex += 1;
    kinds.add(kind);
    grid.append(node);
  });
  if (kinds.has('card')) grid.classList.add('is-cards');
  else if (kinds.has('media')) grid.classList.add('is-media');
  panel.append(grid);
  panel.setAttribute('aria-label', label ? label.textContent.trim() : 'Menu');
  return { panel, label: label ? label.textContent.trim() : 'Menu' };
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : 'https://adobe--sendto--aemcoder.aem.page/adobe/onboarding/nav';
  const fragment = await loadFragment(navPath);
  block.textContent = '';
  if (!fragment) return;

  const sections = [...fragment.children];
  const [brandSection, toolsSection, ...panelSections] = sections;

  const nav = el('nav', 'nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');

  const brand = el('div', 'nav-brand');
  if (brandSection) {
    const wrapper = brandSection.querySelector('.default-content-wrapper') || brandSection;
    brand.append(...wrapper.childNodes);
    brand.querySelectorAll('a.button').forEach((a) => { a.className = ''; });
    brand.querySelectorAll('.button-wrapper').forEach((p) => { p.className = ''; });
  }

  const menus = el('div', 'nav-menus');
  const mega = el('div', 'nav-mega');
  mega.hidden = true;
  const megaInner = el('div', 'nav-mega-inner');
  mega.append(megaInner);
  const backdrop = el('div', 'nav-backdrop');
  backdrop.hidden = true;

  const entries = panelSections.map((section, i) => {
    const { panel, label } = buildPanel(section, `nav-panel-${i}`);
    megaInner.append(panel);
    const btn = el('button', 'nav-menu-btn');
    btn.type = 'button';
    btn.textContent = label;
    btn.append(el('span', 'chevron'));
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-controls', panel.id);
    menus.append(btn);
    return { btn, panel };
  });

  const tools = el('div', 'nav-tools');
  if (toolsSection) {
    const wrapper = toolsSection.querySelector('.default-content-wrapper') || toolsSection;
    tools.append(...wrapper.childNodes);
  }

  nav.append(brand, menus, tools);
  const progress = el('div', 'nav-progress');
  progress.setAttribute('aria-hidden', 'true');
  block.append(backdrop, nav, mega, progress);

  // ── mega-menu state ──
  let open = -1;
  let openedAtY = 0;
  let timer = 0;
  let hoverOpenedAt = 0;
  const setMenu = (k) => {
    clearTimeout(timer);
    if (k === open) return;
    const wasOpen = open >= 0;
    open = k;
    openedAtY = window.scrollY;
    entries.forEach(({ btn, panel }, i) => {
      const on = i === k;
      btn.setAttribute('aria-expanded', String(on));
      panel.hidden = !on;
    });
    mega.hidden = k < 0;
    backdrop.hidden = k < 0;
    if (k < 0 || reduced()) return;
    if (!wasOpen) {
      mega.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 480, easing: EASE });
      backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
    }
    const items = entries[k].panel.querySelectorAll('.mega-intro, .mega-group');
    items.forEach((item, i) => item.animate(
      [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
      {
        duration: 420, delay: (wasOpen ? 0 : 120) + i * 35, easing: EASE, fill: 'backwards',
      },
    ));
  };

  entries.forEach(({ btn }, i) => {
    btn.addEventListener('click', () => {
      // a click right after hover opened this panel confirms it rather than closing it
      if (open === i && performance.now() - hoverOpenedAt < 500) return;
      setMenu(open === i ? -1 : i);
    });
    btn.addEventListener('mouseenter', () => {
      if (!finePointer()) return;
      clearTimeout(timer);
      const hoverOpen = () => {
        if (open !== i) hoverOpenedAt = performance.now();
        setMenu(i);
      };
      if (open >= 0) hoverOpen();
      else timer = setTimeout(hoverOpen, 120);
    });
  });
  const headerEl = block.closest('header') || block;
  headerEl.addEventListener('mouseleave', () => {
    clearTimeout(timer);
    if (open >= 0 && finePointer()) timer = setTimeout(() => setMenu(-1), 240);
  });
  headerEl.addEventListener('mouseenter', () => { if (open >= 0) clearTimeout(timer); });
  backdrop.addEventListener('click', () => setMenu(-1));
  mega.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(-1); });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open >= 0) {
      const { btn } = entries[open];
      setMenu(-1);
      btn.focus();
    }
  });
  nav.addEventListener('focusout', (e) => {
    if (open >= 0 && !headerEl.contains(e.relatedTarget)) setMenu(-1);
  });
  mega.addEventListener('focusout', (e) => {
    if (open >= 0 && e.relatedTarget && !headerEl.contains(e.relatedTarget)) setMenu(-1);
  });

  // ── reading-progress rule + close-on-scroll ──
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? clamp(y / max).toFixed(4) : 0})`;
    if (open >= 0 && Math.abs(y - openedAtY) > 80) setMenu(-1);
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}
