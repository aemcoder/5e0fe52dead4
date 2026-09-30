/**
 * archive — a filterable photo archive with a keyboard lightbox.
 * Filtering animates with FLIP (record First, apply Last, Invert, Play).
 * Portrait frames span two grid rows; the grid packs densely.
 *
 * Authoring: one row per frame
 *   cell 1: <picture> (alt text describes the frame)
 *   cell 2: caption paragraph containing the roll, e.g. "Roll 2 · Frame 04"
 * Filters are built from the roll numbers found in the captions.
 *
 * Deep links: #roll-<n> (or #roll-all) filters and scrolls to the archive;
 * #frame-<n> opens frame n in the lightbox.
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = (n) => String(n).padStart(2, '0');

function largeSrc(img) {
  const src = img.currentSrc || img.src;
  try {
    const u = new URL(src, window.location.href);
    if (u.searchParams.has('width')) {
      u.searchParams.set('width', '2000');
      return u.href;
    }
  } catch { /* keep src */ }
  return src;
}

function isPortrait(img) {
  const w = parseInt(img.getAttribute('width'), 10);
  const h = parseInt(img.getAttribute('height'), 10);
  if (w && h) return h > w;
  if (img.naturalWidth) return img.naturalHeight > img.naturalWidth;
  return null;
}

export default async function decorate(block) {
  const frames = [];
  [...block.children].forEach((row) => {
    const img = row.querySelector('img');
    if (!img) return;
    const pic = img.closest('picture') || img;
    const captionP = [...row.querySelectorAll('p')].find((p) => p.textContent.trim() && !p.contains(pic));
    const text = captionP ? captionP.textContent : img.alt;
    const roll = (text.match(/roll\s*(\w+)/i) || [])[1] || '';
    const label = (captionP ? captionP.textContent : img.alt).trim();

    const frame = document.createElement('div');
    frame.className = 'frame';
    frame.dataset.roll = roll;
    const media = document.createElement('div');
    media.className = 'media grayscale';
    media.append(pic);
    frame.append(media);
    if (captionP) {
      const cap = document.createElement('div');
      cap.className = 'caption';
      cap.append(captionP);
      frame.append(cap);
    }
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'open';
    open.setAttribute('aria-label', `Open ${label}`);
    frame.append(open);

    const setSpan = () => {
      const p = isPortrait(img);
      if (p !== null) frame.classList.toggle('tall', p);
    };
    setSpan();
    if (!img.complete) img.addEventListener('load', setSpan, { once: true });

    frames.push({
      frame, img, roll, label, open,
    });
  });

  // filter bar
  const rolls = [...new Set(frames.map((f) => f.roll).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const toolbar = document.createElement('div');
  toolbar.className = 'archive-toolbar';
  const seg = document.createElement('div');
  seg.className = 'seg';
  seg.setAttribute('role', 'radiogroup');
  seg.setAttribute('aria-label', 'Filter by roll');
  const name = `archive-roll-${Math.random().toString(36).slice(2, 7)}`;
  const radios = ['all', ...rolls].map((value) => {
    const opt = document.createElement('label');
    opt.className = 'seg-opt';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = name;
    input.value = value;
    input.checked = value === 'all';
    opt.append(input, document.createTextNode(value === 'all' ? 'All' : `Roll ${value}`));
    seg.append(opt);
    return input;
  });
  const count = document.createElement('span');
  count.className = 'count';
  count.setAttribute('aria-live', 'polite');
  toolbar.append(seg, count);

  const grid = document.createElement('div');
  grid.className = 'archive-grid';
  grid.append(...frames.map((f) => f.frame));
  block.replaceChildren(toolbar, grid);

  let current = 'all';
  const visible = () => frames.filter((f) => current === 'all' || f.roll === current);
  const updateCount = () => { count.textContent = `${pad(visible().length)} frames`; };
  updateCount();

  const applyRoll = (roll) => {
    current = roll;
    radios.forEach((r) => { r.checked = r.value === roll; });
    const first = new Map(frames.map((f) => [f, f.frame.hidden ? null : f.frame.getBoundingClientRect()]));
    frames.forEach((f) => { f.frame.hidden = !(roll === 'all' || f.roll === roll); });
    updateCount();
    if (reduced()) return;
    frames.forEach((f) => {
      if (f.frame.hidden) return;
      const a = first.get(f);
      const b = f.frame.getBoundingClientRect();
      if (a) {
        const dx = a.left - b.left;
        const dy = a.top - b.top;
        const sx = a.width / b.width;
        const sy = a.height / b.height;
        if (dx || dy || sx !== 1 || sy !== 1) {
          f.frame.animate([
            { transformOrigin: 'top left', transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})` },
            { transformOrigin: 'top left', transform: 'none' },
          ], { duration: 700, easing: EASE });
        }
      } else {
        f.frame.animate(
          [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }],
          {
            duration: 550, delay: 150, easing: EASE, fill: 'backwards',
          },
        );
      }
    });
  };
  radios.forEach((r) => r.addEventListener('change', () => applyRoll(r.value)));

  // lightbox
  const lb = document.createElement('div');
  lb.className = 'archive-lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.hidden = true;
  lb.innerHTML = `<div class="lb-panel">
      <div class="lb-media grayscale"></div>
      <div class="lb-bar">
        <span class="lb-caption"></span>
        <button type="button" class="button secondary lb-prev">← Previous</button>
        <button type="button" class="button secondary lb-next">Next →</button>
        <button type="button" class="button primary lb-close">Close</button>
      </div>
    </div>`;
  block.append(lb);
  const lbImg = document.createElement('img');
  lbImg.decoding = 'async';
  const lbCaption = lb.querySelector('.lb-caption');
  let openIdx = -1;
  let lastFocus = null;

  const show = (f, animate) => {
    const vis = visible();
    if (!lbImg.isConnected) lb.querySelector('.lb-media').append(lbImg);
    lbImg.src = largeSrc(f.img);
    lbImg.alt = f.img.alt || f.label;
    lb.setAttribute('aria-label', f.label);
    lbCaption.textContent = `${f.label} — ${pad(vis.indexOf(f) + 1)} / ${pad(vis.length)}`;
    if (animate && !reduced()) lbImg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350 });
  };
  const openLb = (f) => {
    lastFocus = document.activeElement;
    openIdx = frames.indexOf(f);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    show(f, false);
    if (!reduced()) {
      lb.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
      lbImg.animate([{ transform: 'scale(.94)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 550, easing: EASE });
    }
    lb.querySelector('.lb-close').focus();
  };
  const closeLb = () => {
    if (openIdx < 0) return;
    openIdx = -1;
    lb.hidden = true;
    document.body.style.overflow = '';
    lastFocus?.focus?.();
  };
  const step = (d) => {
    const vis = visible();
    if (!vis.length || openIdx < 0) return;
    let k = vis.indexOf(frames[openIdx]);
    k = (k + d + vis.length) % vis.length;
    openIdx = frames.indexOf(vis[k]);
    show(vis[k], true);
  };

  frames.forEach((f) => f.open.addEventListener('click', () => openLb(f)));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  lb.querySelector('.lb-close').addEventListener('click', closeLb);
  lb.querySelector('.lb-prev').addEventListener('click', () => step(-1));
  lb.querySelector('.lb-next').addEventListener('click', () => step(1));
  window.addEventListener('keydown', (e) => {
    if (openIdx < 0) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  });

  // deep links from the nav: #roll-<n>, #frame-<n>
  const onHash = () => {
    const { hash } = window.location;
    const roll = hash.match(/^#roll-(\w+)$/i);
    const frame = hash.match(/^#frame-(\d+)$/i);
    if (!roll && !frame) return;
    const chapter = block.closest('.section')?.querySelector('.chapter[id]');
    if (roll) {
      applyRoll(roll[1] === 'all' || rolls.includes(roll[1]) ? roll[1] : 'all');
      (chapter || block).scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' });
    } else {
      const f = frames[parseInt(frame[1], 10) - 1];
      if (f) {
        if (f.frame.hidden) applyRoll('all');
        openLb(f);
      }
    }
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${chapter ? `#${chapter.id}` : ''}`);
  };
  window.addEventListener('hashchange', onHash);
  onHash();
}
