/**
 * archive — filterable photo archive. A segmented control filters frames by roll
 * (with FLIP animation: each frame glides from where it was to where it lands);
 * selecting a frame opens a lightbox — arrow keys step through the visible
 * frames, Escape closes. Portrait images span two grid rows.
 * Links to `#roll-1` … `#roll-all` (e.g. from the nav) set the filter and
 * scroll here.
 *
 * Authoring: one row per frame — cells: image | caption ("Roll 2 · Frame 04").
 * The roll is read from the caption ("Roll <n>"); the filter labels and the
 * frame count are derived from the authored captions.
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = (n) => String(n).padStart(2, '0');

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function markTall(item, img) {
  const set = () => {
    const w = img.naturalWidth || +img.getAttribute('width');
    const h = img.naturalHeight || +img.getAttribute('height');
    item.classList.toggle('tall', !!w && !!h && h > w);
  };
  set();
  if (!img.complete) img.addEventListener('load', set, { once: true });
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

export default function decorate(block) {
  let uid = 0;
  const frames = [...block.children].map((row) => {
    const [mediaCell, capCell] = [...row.children];
    const img = mediaCell?.querySelector('img');
    const pic = mediaCell?.querySelector('picture') || img;
    const cap = capCell?.querySelector('p') || capCell;
    const caption = cap ? cap.textContent.trim() : (img?.alt || '');
    const roll = (caption.match(/roll\s*(\d+)/i) || [])[1] || '';
    const item = document.createElement('div');
    item.className = 'archive-item';
    item.setAttribute('role', 'button');
    item.tabIndex = 0;
    item.setAttribute('aria-label', caption);
    item.dataset.roll = roll;
    uid += 1;
    item.dataset.i = String(uid - 1);
    if (pic) item.append(wrapNode(pic.closest('p') || pic, 'archive-media grayscale'));
    if (cap && cap.textContent.trim()) item.append(wrapNode(cap, 'archive-caption'));
    if (img) {
      img.loading = 'lazy';
      markTall(item, img);
    }
    return {
      item, img, caption, roll,
    };
  });

  const rolls = [...new Set(frames.map((f) => f.roll).filter(Boolean))].sort();
  const controls = document.createElement('div');
  controls.className = 'archive-controls';
  const seg = document.createElement('div');
  seg.className = 'archive-seg';
  seg.setAttribute('role', 'radiogroup');
  seg.setAttribute('aria-label', 'Filter by roll');
  const name = `archive-roll-${Math.random().toString(36).slice(2, 7)}`;
  const radios = [['all', 'All'], ...rolls.map((r) => [r, `Roll ${r}`])].map(([value, label]) => {
    const l = document.createElement('label');
    l.className = 'archive-opt';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = name;
    input.value = value;
    input.checked = value === 'all';
    l.append(input, label);
    seg.append(l);
    return input;
  });
  const count = document.createElement('span');
  count.className = 'archive-count';
  controls.append(seg, count);

  const grid = document.createElement('div');
  grid.className = 'archive-grid';
  grid.append(...frames.map((f) => f.item));
  block.replaceChildren(controls, grid);

  let roll = 'all';
  const visible = () => frames.filter((f) => roll === 'all' || f.roll === roll);
  const setCount = () => { count.textContent = `${pad(visible().length)} frames`; };
  setCount();

  const applyRoll = (value) => {
    roll = value;
    radios.forEach((r) => { r.checked = r.value === value; });
    const first = new Map(frames.map(({ item }) => [
      item, item.hidden ? null : item.getBoundingClientRect(),
    ]));
    frames.forEach((f) => { f.item.hidden = !(value === 'all' || f.roll === value); });
    setCount();
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
            {
              transformOrigin: 'top left',
              transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})`,
            },
            { transformOrigin: 'top left', transform: 'none' }], { duration: 700, easing: EASE });
        }
      } else {
        item.animate([{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], {
          duration: 550, delay: 150, easing: EASE, fill: 'backwards',
        });
      }
    });
  };
  radios.forEach((r) => r.addEventListener('change', () => applyRoll(r.value)));

  // ── lightbox ──
  let lb = null;
  let current = -1;
  let opener = null;
  const close = () => {
    if (!lb) return;
    lb.remove();
    lb = null;
    current = -1;
    document.body.style.overflow = '';
    opener?.focus();
  };
  const show = (i) => {
    const f = frames[i];
    current = i;
    const vis = visible();
    const img = lb.querySelector('.archive-lb-img');
    img.src = largeSrc(f.img);
    img.alt = f.img?.alt || f.caption;
    lb.setAttribute('aria-label', f.caption);
    const pos = `${pad(vis.indexOf(f) + 1)} / ${pad(vis.length)}`;
    lb.querySelector('.archive-lb-caption').textContent = `${f.caption} — ${pos}`;
    if (!reduced()) img.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350 });
  };
  const step = (d) => {
    const vis = visible();
    if (!vis.length) return;
    let k = vis.indexOf(frames[current]);
    k = (k + d + vis.length) % vis.length;
    show(frames.indexOf(vis[k]));
  };
  const open = (i, from) => {
    opener = from;
    lb = document.createElement('div');
    lb.className = 'archive-lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    const panel = document.createElement('div');
    panel.className = 'archive-lb-panel';
    const frame = document.createElement('div');
    frame.className = 'archive-lb-frame grayscale';
    const img = document.createElement('img');
    img.className = 'archive-lb-img';
    frame.append(img);
    const bar = document.createElement('div');
    bar.className = 'archive-lb-bar';
    const cap = document.createElement('span');
    cap.className = 'archive-lb-caption';
    const mk = (label, kind, fn) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `button ${kind}`;
      b.textContent = label;
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        fn();
      });
      return b;
    };
    const closeBtn = mk('Close', 'primary', close);
    const prev = mk('← Previous', 'secondary', () => step(-1));
    const next = mk('Next →', 'secondary', () => step(1));
    bar.append(cap, prev, next, closeBtn);
    panel.append(frame, bar);
    panel.addEventListener('click', (e) => e.stopPropagation());
    lb.append(panel);
    lb.addEventListener('click', close);
    document.body.append(lb);
    document.body.style.overflow = 'hidden';
    show(i);
    closeBtn.focus();
    if (!reduced()) {
      lb.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
      img.animate(
        [{ transform: 'scale(.94)', opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: 550, easing: EASE },
      );
    }
  };
  frames.forEach((f, i) => {
    const activate = (e) => {
      if (e.target.closest('.prosemirror-editor')) return; // editing a caption, not opening
      open(i, f.item);
    };
    f.item.addEventListener('click', activate);
    f.item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate(e);
      }
    });
  });
  window.addEventListener('keydown', (e) => {
    if (!lb) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  });

  // #roll-<n> deep links (nav chips)
  const fromHash = () => {
    const m = window.location.hash.match(/^#roll-(\w+)$/);
    if (!m) return;
    const value = m[1] === 'all' || rolls.includes(m[1]) ? m[1] : 'all';
    applyRoll(value);
    const target = block.closest('.section') || block;
    target.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' });
  };
  window.addEventListener('hashchange', fromHash);
  fromHash();
}
