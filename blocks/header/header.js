import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/*
 * Field Guide header — template-slotted chrome.
 *
 * Nav document contract (fragments/header.html, one section each):
 *   1. brand link (plain <a>)
 *   2. <ul> of mega-menu trigger labels (Chapters / Techniques / Media)
 *   3. tools — the primary CTA (<strong><a>)
 *   4..N. one panel per trigger, in the same order. A panel is default content:
 *      kicker <p>, lead link <p>, then columns:
 *        - a <ul> whose items hold nested lists → one group column per item
 *          (item text = group title, optional <em>count</em> — defaults to the
 *          number of nested items; nested items = <a>name</a> + api text,
 *          optionally led by <code>number</code>)
 *        - a <ul> of flat items → chapter cards (<a>title</a> desc <em>meta</em>)
 *        - <p><strong>Title</strong></p> starts a new column (numeric title = callout)
 *        - <p> with a picture, followed by a link <p> → featured card
 *        - <p> with a video URL → hover-to-preview clip
 *        - <p> with several image links → thumbnail grid
 *        - anything else is appended to the current column
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const pad = (n) => String(n).padStart(2, '0');
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(pointer: fine)').matches;
const isVideoUrl = (href) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(href || '');

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  children.forEach((c) => c && node.append(c));
  return node;
}

function makeVideo(href) {
  const v = document.createElement('video');
  v.src = href;
  v.muted = true;
  v.loop = true;
  v.playsInline = true;
  v.preload = 'metadata';
  v.setAttribute('playsinline', '');
  v.setAttribute('muted', '');
  return v;
}

function textAfter(node) {
  // collects the text nodes / inline elements that follow `node` inside its parent
  const out = [];
  let n = node.nextSibling;
  while (n) {
    const next = n.nextSibling;
    if (!(n.nodeType === 1 && ['UL', 'EM'].includes(n.tagName))) out.push(n);
    n = next;
  }
  return out;
}

function buildCards(ul) {
  const grid = el('div', 'mega-cards');
  [...ul.children].forEach((li, i) => {
    const link = li.querySelector('a');
    if (!link) return;
    const meta = li.querySelector('em');
    const card = el('a', 'mega-card');
    card.href = link.getAttribute('href');
    card.dataset.mi = '';
    const title = el('span', 'mega-card-title');
    const desc = el('span', 'mega-card-desc');
    desc.append(...textAfter(link));
    title.append(...link.childNodes);
    card.append(el('span', 'mega-card-num', document.createTextNode(pad(i + 1))), title, desc);
    if (meta) card.append(el('span', 'mega-card-meta', ...meta.childNodes));
    grid.append(card);
  });
  return grid;
}

function buildGroup(li) {
  const col = el('div', 'mega-col mega-group');
  col.dataset.mi = '';
  const nested = li.querySelector('ul');
  const title = el('span', 'mega-group-title');
  const authoredCount = [...li.childNodes].find((n) => n.nodeName === 'EM');
  [...li.childNodes].forEach((n) => { if (n !== nested && n !== authoredCount) title.append(n); });
  const items = nested ? [...nested.children] : [];
  const count = el('span', 'mega-group-count');
  if (authoredCount) count.append(...authoredCount.childNodes);
  else count.textContent = pad(items.length);
  const head = el('div', 'mega-group-head', title, count);
  col.append(head);
  items.forEach((item) => {
    const link = item.querySelector('a');
    if (!link) return;
    const code = item.querySelector('code');
    const a = el('a', code ? 'mega-link numbered' : 'mega-link');
    a.href = link.getAttribute('href');
    if (code) a.append(el('span', 'mega-link-num', ...code.childNodes));
    a.append(el('span', 'mega-link-name', ...link.childNodes));
    const rest = textAfter(link).filter((n) => n !== code && n.textContent.trim());
    if (!code && rest.length) a.append(el('span', 'mega-link-api', ...rest));
    col.append(a);
  });
  return col;
}

function buildPanel(wrapper) {
  const nodes = [...wrapper.children];
  const panel = el('div', 'mega-panel');
  const inner = el('div', 'mega-inner');
  panel.append(inner);
  const top = el('div', 'mega-top');
  top.dataset.mi = '';
  if (nodes[0] && nodes[0].tagName === 'P' && !nodes[0].querySelector('a')) {
    top.append(el('span', 'mega-kicker', ...nodes.shift().childNodes));
  }
  if (nodes[0] && nodes[0].tagName === 'P' && nodes[0].querySelectorAll('a').length === 1
    && !nodes[0].querySelector('picture, img')) {
    const link = nodes.shift().querySelector('a');
    link.className = 'mega-lead';
    top.append(link);
  }
  inner.append(top);
  const grid = el('div', 'mega-grid');
  inner.append(grid);

  let col = null;
  let cards = null;
  let pendingFeature = null;
  const ensureCol = () => {
    if (!col) {
      col = el('div', 'mega-col');
      col.dataset.mi = '';
      grid.append(col);
    }
    return col;
  };

  nodes.forEach((node) => {
    if (node.tagName === 'UL') {
      const hasGroups = [...node.children].some((li) => li.querySelector('ul'));
      if (hasGroups) {
        [...node.children].forEach((li) => {
          col = buildGroup(li);
          grid.append(col);
        });
      } else {
        cards = buildCards(node);
        grid.classList.add('has-cards');
        grid.append(...cards.children);
        cards = grid;
        col = null;
      }
      return;
    }
    if (node.tagName !== 'P') {
      ensureCol().append(node);
      return;
    }
    const links = [...node.querySelectorAll('a')];
    const pics = node.querySelectorAll('picture, img');
    const strong = node.querySelector(':scope > strong');
    if (strong && !links.length && node.textContent.trim() === strong.textContent.trim()) {
      const numeric = /^\d+$/.test(strong.textContent.trim());
      col = el('div', numeric ? 'mega-col mega-callout' : 'mega-col');
      col.dataset.mi = '';
      col.append(el('span', numeric ? 'mega-callout-num' : 'mega-col-title', ...strong.childNodes));
      grid.append(col);
      return;
    }
    if (pics.length && !links.length) {
      pendingFeature = pics[0].closest('picture') || pics[0];
      return;
    }
    if (pendingFeature && links.length === 1) {
      const feature = el('a', 'mega-feature');
      feature.href = links[0].getAttribute('href');
      feature.dataset.mi = '';
      feature.append(
        el('span', 'mega-feature-media grayscale', pendingFeature),
        el('span', 'mega-feature-label', ...links[0].childNodes),
      );
      pendingFeature = null;
      (cards || ensureCol()).append(feature);
      return;
    }
    if (links.length === 1 && isVideoUrl(links[0].href) && links[0].textContent.trim() === links[0].href) {
      const box = el('div', 'mega-video grayscale', makeVideo(links[0].href), el('span', 'mega-video-badge', document.createTextNode('Hover to preview')));
      const target = ensureCol();
      target.classList.add('has-video');
      target.addEventListener('mouseenter', () => { const v = box.querySelector('video'); v.muted = true; v.play().catch(() => {}); });
      target.addEventListener('mouseleave', () => box.querySelector('video').pause());
      target.append(box);
      return;
    }
    if (links.length > 1 && pics.length) {
      const thumbs = el('div', 'mega-thumbs');
      links.forEach((a) => {
        a.className = 'mega-thumb grayscale';
        thumbs.append(a);
      });
      ensureCol().append(thumbs);
      return;
    }
    if (links.length > 1) node.classList.add('mega-chips');
    if (links.length === 1 && node.textContent.trim() === links[0].textContent.trim()) {
      node.classList.add('mega-more');
    }
    ensureCol().append(node);
  });
  if (grid.querySelector('.mega-callout')) grid.classList.add('has-callout');
  return panel;
}

function initCursor() {
  if (document.querySelector('.cursor-dot') || !finePointer() || reduced()) return;
  const dot = el('div', 'cursor-dot');
  dot.setAttribute('aria-hidden', 'true');
  document.body.append(dot);
  const p = {
    x: -200, y: -200, cx: -200, cy: -200, s: 1, big: false,
  };
  window.addEventListener('pointermove', (e) => { p.x = e.clientX; p.y = e.clientY; }, { passive: true });
  window.addEventListener('pointerover', (e) => {
    const t = e.target;
    p.big = !!(t && t.closest && t.closest('a, button, label, video, canvas, [data-hover]'));
  });
  const tick = () => {
    p.cx += (p.x - p.cx) * 0.2;
    p.cy += (p.y - p.cy) * 0.2;
    p.s += ((p.big ? 3.4 : 1) - p.s) * 0.18;
    dot.style.transform = `translate3d(${(p.cx - 7).toFixed(1)}px,${(p.cy - 7).toFixed(1)}px,0) scale(${p.s.toFixed(3)})`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  if (!fragment) return;
  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const wrap = (s) => (s ? s.querySelector('.default-content-wrapper') || s : null);
  const [brandSec, linksSec, toolsSec, ...panelSecs] = sections.map(wrap);

  const nav = el('nav', 'nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');

  // brand
  const brandLink = brandSec && brandSec.querySelector('a');
  if (brandLink) {
    brandLink.className = 'nav-brand';
    nav.append(brandLink);
  }

  // triggers + panels
  const triggers = el('div', 'nav-triggers');
  const mega = el('div', 'nav-mega');
  mega.hidden = true;
  const labels = linksSec ? [...linksSec.querySelectorAll(':scope > ul > li')] : [];
  const panels = [];
  labels.forEach((li, i) => {
    const panelSec = panelSecs[i];
    const btn = el('button', 'nav-trigger');
    btn.type = 'button';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    const label = li.querySelector(':scope > p') || li;
    btn.append(...label.childNodes, el('span', 'nav-chevron'));
    triggers.append(btn);
    const panel = panelSec ? buildPanel(panelSec) : el('div', 'mega-panel');
    panel.id = `nav-panel-${i}`;
    panel.hidden = true;
    btn.setAttribute('aria-controls', panel.id);
    mega.append(panel);
    panels.push({ btn, panel });
  });
  nav.append(triggers);

  // tools
  const tools = el('div', 'nav-tools');
  if (toolsSec) tools.append(...toolsSec.childNodes);
  nav.append(tools);

  const progress = el('div', 'nav-progress');
  progress.setAttribute('aria-hidden', 'true');
  const backdrop = el('div', 'nav-backdrop');
  backdrop.hidden = true;

  block.append(backdrop, nav, mega, progress);

  // ── mega menu state ──
  let open = -1;
  let timer;
  let openedAtY = 0;
  let hoverOpenedAt = 0;
  const setMenu = (k) => {
    clearTimeout(timer);
    if (k === open) return;
    const prev = open;
    open = k;
    panels.forEach(({ btn, panel }, i) => {
      const on = i === k;
      btn.setAttribute('aria-expanded', on ? 'true' : 'false');
      panel.hidden = !on;
    });
    mega.hidden = k < 0;
    backdrop.hidden = k < 0;
    if (k < 0) return;
    openedAtY = window.scrollY;
    if (reduced()) return;
    if (prev < 0) {
      mega.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 480, easing: EASE });
      backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
    }
    panels[k].panel.querySelectorAll('[data-mi]').forEach((item, i) => item.animate(
      [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
      {
        duration: 420, delay: (prev >= 0 ? 0 : 120) + i * 35, easing: EASE, fill: 'backwards',
      },
    ));
  };

  panels.forEach(({ btn }, i) => {
    btn.addEventListener('click', () => {
      // a click that lands right after hover opened this panel keeps it open
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
  block.addEventListener('mouseleave', () => {
    clearTimeout(timer);
    if (open >= 0) timer = setTimeout(() => setMenu(-1), 240);
  });
  block.addEventListener('mouseenter', () => { if (open >= 0) clearTimeout(timer); });
  backdrop.addEventListener('click', () => setMenu(-1));
  mega.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(-1); });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open >= 0) {
      const { btn } = panels[open];
      setMenu(-1);
      btn.focus();
    }
  });

  // ── reading progress + close-on-scroll ──
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progress.style.transform = `scaleX(${p})`;
    if (open >= 0 && Math.abs(window.scrollY - openedAtY) > 80) setMenu(-1);
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  initCursor();
}
