import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * header — Field Guide sticky nav with three mega-menu panels, a reading-progress
 * rule and the trailing cursor dot.
 *
 * Nav document (sections, in order):
 *   1. brand: one paragraph holding a plain link
 *   2..N-1. one section per menu panel:
 *        <h2> trigger label, <p> panel label, <p><a> "more" link, then content:
 *        - a <ul> of items: <li><strong>num</strong> <a>title</a> description <em>meta</em></li>
 *          (every part but the link is optional)
 *        - <h3>Column title <em>count</em></h3> starts a column; lists follow it
 *        - <p><strong>21</strong></p> starts a stat card (its following paragraphs join it)
 *        - <p><img></p><p><a></a></p> = a featured image card
 *        - <p>label</p><ul> of #roll-* links = a row of chips
 *        - <p><a href="….mp4"></a></p> = a hover-to-preview video
 *   N. tools: CTA paragraph(s), e.g. <strong><a>Inventory</a></strong>
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)');

function wrapNode(node, className, tag = 'div') {
  const w = document.createElement(tag);
  w.className = className;
  w.append(node);
  return w;
}

const isVideoLink = (a) => a && /\.(mp4|webm)(\?|$)/i.test(a.getAttribute('href') || '');

/** builds one card-like anchor from an authored list item, moving its parts */
function buildItem(li) {
  const link = li.querySelector('a');
  const item = document.createElement(link ? 'a' : 'div');
  item.className = 'nav-item';
  item.dataset.mi = '';
  if (link) item.href = link.getAttribute('href');
  const nodes = [...li.childNodes].flatMap((n) => (n.nodeName === 'P' ? [...n.childNodes] : [n]));
  nodes.forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) {
      if (n.textContent.trim()) item.append(wrapNode(n, 'nav-item-desc', 'span'));
    } else if (n.nodeName === 'STRONG') {
      item.append(wrapNode(n, 'nav-item-num', 'span'));
    } else if (n.nodeName === 'EM') {
      item.append(wrapNode(n, 'nav-item-meta', 'span'));
    } else if (n === link) {
      const title = document.createElement('span');
      title.className = 'nav-item-title';
      title.append(...link.childNodes);
      item.append(title);
    } else if (n.nodeType === Node.ELEMENT_NODE) {
      item.append(n);
    }
  });
  return item;
}

function buildVideo(a) {
  const box = document.createElement('div');
  box.className = 'nav-video grayscale';
  const v = document.createElement('video');
  Object.assign(v, {
    muted: true, loop: true, playsInline: true, preload: 'none',
  });
  v.src = a.href;
  v.setAttribute('aria-label', a.textContent.trim());
  box.append(v);
  return box;
}

/** turns one authored panel section into the mega-menu panel DOM */
function buildPanel(section, key) {
  const wrapper = section.querySelector('.default-content-wrapper') || section;
  const nodes = [...wrapper.children];
  const h2 = nodes.find((n) => n.tagName === 'H2');
  const label = h2 ? h2.textContent.trim() : key;

  const panel = document.createElement('div');
  panel.className = `nav-panel nav-panel-${key}`;
  panel.id = `nav-panel-${key}`;
  panel.hidden = true;
  const inner = document.createElement('div');
  inner.className = 'nav-panel-inner';
  panel.append(inner);
  if (h2) inner.append(wrapNode(h2, 'nav-panel-title'));

  const rest = nodes.filter((n) => n !== h2);
  const intro = document.createElement('div');
  intro.className = 'nav-panel-intro';
  intro.dataset.mi = '';
  // the leading label paragraph and the "more" link paragraph
  while (rest.length && rest[0].tagName === 'P' && intro.children.length < 2
    && !rest[0].querySelector('img, picture, strong')) {
    const p = rest.shift();
    intro.append(wrapNode(p, p.querySelector('a') ? 'nav-panel-more' : 'nav-panel-label'));
  }
  if (intro.children.length) inner.append(intro);

  const grid = document.createElement('div');
  grid.className = 'nav-panel-grid';
  inner.append(grid);

  let column = null;
  const newColumn = (className) => {
    column = document.createElement('div');
    column.className = className;
    column.dataset.mi = '';
    grid.append(column);
    return column;
  };

  for (let i = 0; i < rest.length; i += 1) {
    const n = rest[i];
    const onlyStrong = n.tagName === 'P' && n.children.length === 1
      && n.firstElementChild.tagName === 'STRONG' && /^\d+$/.test(n.textContent.trim());
    const media = n.tagName === 'P' ? n.querySelector('img, picture') : null;
    const link = n.tagName === 'P' ? n.querySelector('a') : null;
    if (n.tagName === 'H3') {
      newColumn('nav-col');
      column.append(wrapNode(n, 'nav-col-head'));
    } else if (onlyStrong) {
      newColumn('nav-stat');
      column.append(wrapNode(n, 'nav-stat-num'));
    } else if (n.tagName === 'UL' && column === null) {
      // item cards sit straight in the panel grid
      [...n.children].forEach((li) => grid.append(buildItem(li)));
    } else if (n.tagName === 'UL') {
      const links = [...n.querySelectorAll('a')];
      if (links.length && links.every((a) => (a.getAttribute('href') || '').startsWith('#roll-'))) {
        const chips = document.createElement('div');
        chips.className = 'nav-chips';
        links.forEach((a) => chips.append(a));
        column.append(chips);
      } else {
        const list = document.createElement('div');
        list.className = 'nav-list';
        [...n.children].forEach((li) => list.append(buildItem(li)));
        column.append(list);
      }
    } else if (media) {
      // featured image card: the image paragraph plus the following link paragraph
      const next = rest[i + 1];
      const nextLink = next && next.tagName === 'P' ? next.querySelector('a') : null;
      const card = document.createElement(nextLink ? 'a' : 'div');
      card.className = 'nav-featured';
      card.dataset.mi = '';
      card.append(wrapNode(n, 'nav-featured-media grayscale'));
      if (nextLink) {
        card.href = nextLink.getAttribute('href');
        const cap = document.createElement('span');
        cap.className = 'nav-featured-caption';
        cap.append(...nextLink.childNodes);
        card.append(cap);
        i += 1;
      }
      (column || grid).append(card);
    } else if (isVideoLink(link)) {
      column.append(buildVideo(link));
      column.dataset.hover = '';
    } else if (column) {
      const isCta = link && n.classList.contains('button-wrapper');
      column.append(wrapNode(n, isCta ? 'nav-stat-cta' : 'nav-col-text'));
    } else {
      grid.append(n);
    }
  }
  return { panel, label };
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  block.textContent = '';
  if (!fragment) return;

  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const brandSection = sections.shift();
  const toolsSection = sections.length > 1 ? sections.pop() : null;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.className = 'nav';
  nav.setAttribute('aria-label', 'Main');

  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  const brandLink = brandSection && brandSection.querySelector('a');
  if (brandLink) brand.append(brandLink.closest('p') || brandLink);
  nav.append(brand);

  const triggers = document.createElement('div');
  triggers.className = 'nav-triggers';
  nav.append(triggers);

  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  if (toolsSection) {
    [...toolsSection.querySelectorAll('a')].forEach((a) => tools.append(a.closest('p') || a));
  }
  nav.append(tools);

  const panels = document.createElement('div');
  panels.className = 'nav-panels';

  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  backdrop.hidden = true;

  const progress = document.createElement('div');
  progress.className = 'nav-progress';
  progress.setAttribute('aria-hidden', 'true');

  const entries = sections.map((section, i) => {
    const key = (section.querySelector('h2')?.textContent.trim() || `menu-${i}`)
      .toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { panel, label } = buildPanel(section, key);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-trigger';
    btn.dataset.menu = key;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-controls', panel.id);
    btn.textContent = label;
    const chev = document.createElement('span');
    chev.className = 'nav-chevron';
    chev.setAttribute('aria-hidden', 'true');
    btn.append(chev);
    triggers.append(btn);
    panels.append(panel);
    return { key, btn, panel };
  });

  // ── menu state ──
  let open = null;
  let timer;
  let openY = 0;
  const setMenu = (key) => {
    clearTimeout(timer);
    if (key === open) return;
    const prev = open;
    open = key;
    openY = window.scrollY;
    entries.forEach((e) => {
      const on = e.key === key;
      e.btn.setAttribute('aria-expanded', on ? 'true' : 'false');
      e.panel.hidden = !on;
    });
    backdrop.hidden = !key;
    block.classList.toggle('menu-open', !!key);
    if (!key || reduced()) return;
    const panel = entries.find((e) => e.key === key).panel;
    if (!prev) {
      panels.animate(
        [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }],
        { duration: 480, easing: EASE },
      );
      backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
    }
    panel.querySelectorAll('[data-mi]').forEach((el, i) => el.animate(
      [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
      {
        duration: 420, delay: (prev ? 0 : 120) + i * 35, easing: EASE, fill: 'backwards',
      },
    ));
  };

  entries.forEach(({ key, btn }) => {
    btn.addEventListener('click', () => setMenu(open === key ? null : key));
    btn.addEventListener('mouseenter', () => {
      if (!finePointer.matches) return;
      clearTimeout(timer);
      if (open) setMenu(key);
      else timer = setTimeout(() => setMenu(key), 120);
    });
  });
  block.addEventListener('mouseleave', () => {
    clearTimeout(timer);
    if (open) timer = setTimeout(() => setMenu(null), 240);
  });
  block.addEventListener('mouseenter', () => { if (open) clearTimeout(timer); });
  backdrop.addEventListener('click', () => setMenu(null));
  panels.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(null); });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) {
      const btn = entries.find((x) => x.key === open)?.btn;
      setMenu(null);
      btn?.focus();
    }
  });
  block.addEventListener('focusout', (e) => {
    if (open && !block.contains(e.relatedTarget)) setMenu(null);
  });

  // hover-to-preview videos inside panels
  panels.querySelectorAll('[data-hover]').forEach((col) => {
    const v = col.querySelector('video');
    col.addEventListener('mouseenter', () => { v.muted = true; v.play().catch(() => {}); });
    col.addEventListener('mouseleave', () => v.pause());
  });

  // ── reading-progress rule + close-on-scroll ──
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progress.style.transform = `scaleX(${p})`;
    if (open && Math.abs(window.scrollY - openY) > 80) setMenu(null);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const wrap = document.createElement('div');
  wrap.className = 'nav-wrapper';
  wrap.append(nav, panels, progress);
  block.append(backdrop, wrap);

  // ── trailing cursor dot (fine pointers only, off for reduced motion) ──
  if (finePointer.matches && !reduced()) {
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    dot.setAttribute('aria-hidden', 'true');
    document.body.append(dot);
    const P = {
      x: -200, y: -200, cx: -200, cy: -200, s: 1, big: false,
    };
    window.addEventListener('pointermove', (e) => {
      P.x = e.clientX;
      P.y = e.clientY;
    }, { passive: true });
    window.addEventListener('pointerover', (e) => {
      const big = 'a, button, label, video, [data-hover], [role="button"], .specimen-word';
      P.big = !!e.target.closest?.(big);
    });
    const tick = () => {
      P.cx += (P.x - P.cx) * 0.2;
      P.cy += (P.y - P.cy) * 0.2;
      P.s += ((P.big ? 3.4 : 1) - P.s) * 0.18;
      const x = (P.cx - 7).toFixed(1);
      const y = (P.cy - 7).toFixed(1);
      dot.style.transform = `translate3d(${x}px,${y}px,0) scale(${P.s.toFixed(3)})`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
