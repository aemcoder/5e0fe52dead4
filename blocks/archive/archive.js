/**
 * archive — photo archive filtered by roll (FLIP) with a keyboard lightbox.
 *
 * Authoring rows (one per frame):
 *   media cell:   photograph (<picture>/<img>)
 *   caption cell: <p> "Roll 1 · Frame 01" — the roll number is read from it
 *
 * Tall/short tiles follow a fixed rhythm by index; filter options and the
 * frame counter are generated from the rolls found.
 */

const SPANS = [2, 1, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1];
const EASE = 'cubic-bezier(.2,.8,.1,1)';
const pad = (n) => String(n).padStart(2, '0');
let uid = 0;

function wrap(className, ...nodes) {
  const el = document.createElement('div');
  el.className = className;
  el.append(...nodes);
  return el;
}

function imgOf(el) {
  if (!el) return null;
  return el.tagName === 'IMG' ? el : el.querySelector('img');
}

function largeSrc(img) {
  const src = img.currentSrc || img.src;
  return /[?&]width=\d+/.test(src) ? src.replace(/width=\d+/, 'width=1600') : src;
}

export default async function decorate(block) {
  uid += 1;
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // tiles
  const grid = wrap('archive-grid');
  const frames = [];
  [...block.children].forEach((row, i) => {
    const cells = [...row.children];
    const mediaCell = cells.find((c) => c.querySelector('picture, img')) || cells[0];
    const captionCell = cells.find((c) => c !== mediaCell);
    const media = mediaCell ? (mediaCell.querySelector('picture') || mediaCell.querySelector('img')) : null;
    const captionP = captionCell ? captionCell.querySelector('p') : null;
    const label = (captionP || captionCell || {}).textContent || '';
    const rollMatch = label.match(/Roll\s*(\d+)/i);
    const roll = rollMatch ? rollMatch[1] : '1';

    const tile = wrap('archive-tile');
    tile.setAttribute('role', 'button');
    tile.tabIndex = 0;
    tile.setAttribute('aria-label', `Open ${label.trim()}`);
    tile.dataset.roll = roll;
    tile.style.gridRow = `span ${SPANS[i % SPANS.length]}`;
    if (media) tile.append(wrap('archive-media grayscale', media));
    if (captionP) tile.append(wrap('archive-caption', captionP));
    grid.append(tile);
    frames.push({ tile, roll, img: imgOf(media) });
  });

  // filter toolbar (generated UI)
  const rolls = [...new Set(frames.map((f) => f.roll))].sort();
  const toolbar = wrap('archive-toolbar');
  const seg = wrap('archive-filter');
  seg.setAttribute('role', 'radiogroup');
  seg.setAttribute('aria-label', 'Filter by roll');
  const count = document.createElement('span');
  count.className = 'archive-count';
  [['all', 'All'], ...rolls.map((r) => [r, `Roll ${r}`])].forEach(([value, text], i) => {
    const label = document.createElement('label');
    label.className = 'archive-option';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = `archive-roll-${uid}`;
    input.value = value;
    input.checked = i === 0;
    label.append(input, text);
    seg.append(label);
  });
  toolbar.append(seg, count);

  let current = 'all';
  const visible = () => frames.filter((f) => current === 'all' || f.roll === current);
  const updateCount = () => { count.textContent = `${pad(visible().length)} frames`; };
  updateCount();

  seg.addEventListener('change', (e) => {
    current = e.target.value;
    const first = new Map(frames.map((f) => [f.tile, f.tile.hidden ? null : f.tile.getBoundingClientRect()]));
    frames.forEach((f) => { f.tile.hidden = !(current === 'all' || f.roll === current); });
    updateCount();
    if (reduced()) return;
    frames.forEach(({ tile }) => {
      if (tile.hidden) return;
      const a = first.get(tile);
      const b = tile.getBoundingClientRect();
      if (a) {
        const dx = a.left - b.left;
        const dy = a.top - b.top;
        const sx = a.width / b.width;
        const sy = a.height / b.height;
        if (dx || dy || sx !== 1 || sy !== 1) {
          tile.animate([
            { transformOrigin: 'top left', transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})` },
            { transformOrigin: 'top left', transform: 'none' },
          ], { duration: 700, easing: EASE });
        }
      } else {
        tile.animate([{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], {
          duration: 550, delay: 150, easing: EASE, fill: 'backwards',
        });
      }
    });
  });

  // lightbox
  const box = wrap('archive-lightbox');
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Photograph');
  box.hidden = true;
  const figure = document.createElement('figure');
  figure.className = 'archive-lightbox-figure';
  const big = document.createElement('img');
  big.alt = '';
  const bar = wrap('archive-lightbox-bar');
  const cap = document.createElement('span');
  cap.className = 'archive-lightbox-caption';
  const pos = document.createElement('span');
  pos.className = 'archive-lightbox-count';
  const mkBtn = (cls, text, aria) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `button secondary ${cls}`;
    b.textContent = text;
    b.setAttribute('aria-label', aria);
    return b;
  };
  const prev = mkBtn('archive-prev', '←', 'Previous frame');
  const next = mkBtn('archive-next', '→', 'Next frame');
  const close = mkBtn('archive-close', 'Close', 'Close');
  bar.append(cap, pos, prev, next, close);
  const bigWrap = wrap('archive-lightbox-media grayscale');
  figure.append(bigWrap, bar);
  box.append(figure);

  let open = -1;
  let opener = null;
  const show = (frame, first) => {
    const vis = visible();
    open = frames.indexOf(frame);
    if (!big.isConnected) bigWrap.append(big);
    if (frame.img) {
      big.src = largeSrc(frame.img);
      big.alt = frame.img.alt || '';
    }
    cap.textContent = frame.tile.querySelector('.archive-caption')?.textContent.trim() || '';
    pos.textContent = `${pad(vis.indexOf(frame) + 1)} / ${pad(vis.length)}`;
    if (reduced()) return;
    if (first) {
      box.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
      big.animate([{ transform: 'scale(.94)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 550, easing: EASE });
    } else big.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350 });
  };
  const openBox = (frame) => {
    opener = frame.tile;
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    show(frame, true);
    close.focus();
  };
  const closeBox = () => {
    if (open < 0) return;
    box.hidden = true;
    open = -1;
    document.body.style.overflow = '';
    if (opener) opener.focus();
  };
  const step = (d) => {
    const vis = visible();
    if (!vis.length || open < 0) return;
    const k = (vis.indexOf(frames[open]) + d + vis.length) % vis.length;
    show(vis[k], false);
  };

  frames.forEach((f) => {
    f.tile.addEventListener('click', () => openBox(f));
    f.tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openBox(f);
      }
    });
  });
  prev.addEventListener('click', (e) => { e.stopPropagation(); step(-1); });
  next.addEventListener('click', (e) => { e.stopPropagation(); step(1); });
  close.addEventListener('click', (e) => { e.stopPropagation(); closeBox(); });
  box.addEventListener('click', (e) => { if (e.target === box) closeBox(); });
  window.addEventListener('keydown', (e) => {
    if (open < 0) return;
    if (e.key === 'Escape') closeBox();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'Tab') {
      const btns = [prev, next, close];
      const i = btns.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); close.focus(); }
      else if (!e.shiftKey && i === btns.length - 1) { e.preventDefault(); prev.focus(); }
    }
  });

  block.replaceChildren(toolbar, grid, box);
}
