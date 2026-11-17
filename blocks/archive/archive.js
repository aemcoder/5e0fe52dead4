/**
 * archive — a dense photo grid filtered by roll with FLIP transitions, and a
 * keyboard lightbox (←/→ step through the visible roll, Escape closes).
 * Rolls come from the captions ("Roll 2 · Frame 04"); every other frame spans two
 * rows in the prototype's rhythm. Other blocks (e.g. the nav) can link to
 * `#roll-N` / `#roll-all` to filter and `#frame-NN` to open a frame.
 *
 * Authoring: one row per frame — image | caption.
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const SPANS = [2, 1, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1];
const pad = (n) => String(n).padStart(2, '0');
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  if (node) w.append(node);
  return w;
}

function largeSrc(img) {
  const src = img.currentSrc || img.src;
  try {
    const u = new URL(src, window.location.href);
    if (u.searchParams.has('width')) u.searchParams.set('width', '2000');
    return u.href;
  } catch {
    return src;
  }
}

export default async function decorate(block) {
  const frames = [];
  const grid = wrapNode(null, 'archive-grid');
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const pic = cells[0] && cells[0].querySelector('picture, img');
    const caption = cells[1] && cells[1].querySelector('p');
    if (!pic) return;
    const media = pic.closest('picture') || pic;
    const img = media.tagName === 'IMG' ? media : media.querySelector('img');
    const i = frames.length;
    const text = caption ? caption.textContent.trim() : (img.alt || `Frame ${pad(i + 1)}`);
    const roll = (text.match(/roll\s*(\d+)/i) || [])[1] || '1';

    const item = wrapNode(null, 'archive-item');
    item.dataset.roll = roll;
    if (SPANS[i % SPANS.length] === 2) item.classList.add('tall');
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'archive-open';
    open.setAttribute('aria-label', `Open ${text}`);
    open.append(wrapNode(media, 'archive-media grayscale'));
    item.append(open);
    if (caption) item.append(wrapNode(caption, 'archive-caption'));
    grid.append(item);
    frames.push({
      item, img, text, roll,
    });
    if (img) {
      img.loading = 'lazy';
      img.decoding = 'async';
    }
  });

  const rolls = [...new Set(frames.map((f) => f.roll))].sort();
  const seg = wrapNode(null, 'archive-seg');
  seg.setAttribute('role', 'radiogroup');
  seg.setAttribute('aria-label', 'Filter by roll');
  const name = `archive-roll-${Math.random().toString(36).slice(2, 7)}`;
  const radios = {};
  ['all', ...rolls].forEach((value) => {
    const label = document.createElement('label');
    label.className = 'archive-opt';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = name;
    input.value = value;
    if (value === 'all') input.checked = true;
    label.append(input, document.createTextNode(value === 'all' ? 'All' : `Roll ${value}`));
    seg.append(label);
    radios[value] = input;
  });
  const count = document.createElement('span');
  count.className = 'archive-count';
  count.setAttribute('aria-live', 'polite');
  const toolbar = wrapNode(null, 'archive-toolbar');
  toolbar.append(seg, count);
  block.replaceChildren(toolbar, grid);

  let roll = 'all';
  const visible = () => frames.filter((f) => roll === 'all' || f.roll === roll);
  const updateCount = () => { count.textContent = `${pad(visible().length)} frames`; };
  updateCount();

  const applyRoll = (value) => {
    roll = value;
    if (radios[value]) radios[value].checked = true;
    const first = new Map(frames.map((f) => [f.item, f.item.hidden ? null : f.item.getBoundingClientRect()]));
    frames.forEach((f) => { f.item.hidden = !(roll === 'all' || f.roll === roll); });
    updateCount();
    if (reduced()) return;
    frames.forEach(({ item }) => {
      if (item.hidden) return;
      const f = first.get(item);
      const l = item.getBoundingClientRect();
      if (f) {
        const dx = f.left - l.left;
        const dy = f.top - l.top;
        const sx = f.width / l.width;
        const sy = f.height / l.height;
        if (dx || dy || sx !== 1 || sy !== 1) {
          item.animate([
            { transformOrigin: 'top left', transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})` },
            { transformOrigin: 'top left', transform: 'none' },
          ], { duration: 700, easing: EASE });
        }
      } else {
        item.animate(
          [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }],
          {
            duration: 550, delay: 150, easing: EASE, fill: 'backwards',
          },
        );
      }
    });
  };
  seg.addEventListener('change', (e) => applyRoll(e.target.value));

  // ── lightbox ──
  const lb = wrapNode(null, 'archive-lightbox');
  lb.hidden = true;
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  const lbImg = document.createElement('img');
  lbImg.alt = '';
  const lbCaption = document.createElement('span');
  lbCaption.className = 'lb-caption';
  const mk = (cls, label) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.textContent = label;
    return b;
  };
  const prev = mk('button secondary lb-prev', '← Previous');
  const next = mk('button secondary lb-next', 'Next →');
  const close = mk('button primary lb-close', 'Close');
  const lbBar = wrapNode(null, 'lb-bar');
  lbBar.append(lbCaption, prev, next, close);
  const lbPanel = wrapNode(wrapNode(lbImg, 'lb-media grayscale'), 'lb-panel');
  lbPanel.append(lbBar);
  lb.append(lbPanel);
  block.append(lb);

  let current = -1;
  let opener = null;
  const show = (idx, animate) => {
    const f = frames[idx];
    if (!f) return;
    current = idx;
    lbImg.src = largeSrc(f.img);
    lbImg.alt = f.img.alt || f.text;
    lb.setAttribute('aria-label', f.text);
    const vis = visible();
    lbCaption.textContent = `${f.text} — ${pad(vis.indexOf(f) + 1)} / ${pad(vis.length)}`;
    if (reduced()) return;
    if (animate) {
      lb.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
      lbImg.animate([{ transform: 'scale(.94)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 550, easing: EASE });
    } else lbImg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350 });
  };
  const openLb = (idx) => {
    if (!frames[idx]) return;
    if (!visible().includes(frames[idx])) applyRoll('all');
    opener = document.activeElement;
    const wasOpen = !lb.hidden;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    show(idx, !wasOpen);
    close.focus();
  };
  const closeLb = () => {
    if (lb.hidden) return;
    lb.hidden = true;
    current = -1;
    document.body.style.overflow = '';
    if (opener && opener.focus) opener.focus();
  };
  const step = (d) => {
    const vis = visible();
    if (!vis.length || current < 0) return;
    let k = vis.indexOf(frames[current]);
    k = (k + d + vis.length) % vis.length;
    show(frames.indexOf(vis[k]), false);
  };
  frames.forEach((f, i) => f.item.querySelector('.archive-open').addEventListener('click', () => openLb(i)));
  lb.addEventListener('click', closeLb);
  lbPanel.addEventListener('click', (e) => e.stopPropagation());
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  close.addEventListener('click', closeLb);
  window.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  });

  // ── cross-block links: #roll-N, #roll-all, #frame-NN ──
  const handleHash = (hash) => {
    const r = hash.match(/^#roll-(\w+)$/);
    if (r && (r[1] === 'all' || rolls.includes(r[1]))) {
      applyRoll(r[1]);
      const anchor = block.closest('.section') || block;
      anchor.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' });
      return true;
    }
    const f = hash.match(/^#frame-(\d+)$/);
    if (f) {
      openLb(parseInt(f[1], 10) - 1);
      return true;
    }
    return false;
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#roll-"], a[href^="#frame-"]');
    if (a && handleHash(a.getAttribute('href'))) e.preventDefault();
  });
  if (window.location.hash) handleHash(window.location.hash);
}
