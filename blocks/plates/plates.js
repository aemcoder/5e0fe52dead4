/**
 * plates — numbered figure plates (photograph or video) with a ruled caption.
 * One block, four layouts chosen by variant class:
 *   (default) staggered pair — two tall plates on parallax layers moving at
 *             different speeds
 *   wide      one 21:9 plate whose frame opens from the centre on scroll
 *   track     pinned horizontal gallery — vertical scroll moves the track
 *             sideways; a progress rule fills underneath
 *   clips     grid of video clips that play while hovered
 *
 * Authoring: one row per plate — cells:
 *   1. media: an image, or a link to an .mp4 (plays muted when on screen)
 *   2..4. caption parts: an optional number (digits), a title, an optional note
 * track only: a final row WITHOUT media — cells: bar label | bar note.
 *
 * @variants block: wide | track | clips (default staggered pair)
 * @ew-exempt integration — .mp4 links in cell 1 are media sources, replaced by <video>
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const PARALLAX = [0.12, -0.08];

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

const isVideoLink = (a) => a && /\.(mp4|webm)(\?|$)/i.test(a.getAttribute('href') || '');

function buildVideo(a, preload) {
  const v = document.createElement('video');
  Object.assign(v, {
    muted: true, loop: true, playsInline: true, preload,
  });
  v.setAttribute('playsinline', '');
  v.src = a.href;
  v.setAttribute('aria-label', a.textContent.trim());
  return v;
}

function reveal(els, step = 0) {
  if (reduced()) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    e.target.style.opacity = '';
    e.target.animate([
        { opacity: 0, transform: 'translateY(48px)' },
        { opacity: 1, transform: 'none' },
      ], {
      duration: 1000, delay: +(e.target.dataset.delay || 0), easing: EASE, fill: 'backwards',
    });
  }), { threshold: 0.12 });
  els.forEach((el, i) => {
    el.dataset.delay = String(i * step);
    el.style.opacity = '0';
    io.observe(el);
  });
}

function onScrollFrame(fn) {
  let queued = false;
  const run = () => {
    queued = false;
    fn();
  };
  const req = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(run);
    }
  };
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  req();
}

export default function decorate(block) {
  const variant = ['wide', 'track', 'clips'].find((v) => block.classList.contains(v)) || 'pair';
  const rows = [...block.children];
  const figures = [];
  let bar = null;

  rows.forEach((row) => {
    const cells = [...row.children];
    const mediaCell = cells.find((c) => c.querySelector('picture, img')
      || isVideoLink(c.querySelector('a')));
    if (!mediaCell) {
      if (variant === 'track' && cells.length) bar = cells;
      return;
    }
    const fig = document.createElement('figure');
    fig.className = 'plate';
    const frame = document.createElement('div');
    frame.className = 'plate-media grayscale';
    const pic = mediaCell.querySelector('picture') || mediaCell.querySelector('img');
    const link = mediaCell.querySelector('a');
    if (pic) {
      frame.append(pic.closest('p') || pic);
    } else if (isVideoLink(link)) {
      const v = buildVideo(link, variant === 'clips' ? 'none' : 'metadata');
      if (variant !== 'clips') v.dataset.autoplay = '';
      (link.closest('p') || link).remove();
      frame.append(v);
      fig.dataset.hover = '';
    }
    fig.append(frame);

    const caption = document.createElement('figcaption');
    caption.className = 'plate-caption';
    let titled = false;
    cells.filter((c) => c !== mediaCell).forEach((c) => {
      const p = c.querySelector('p') || c;
      if (!p.textContent.trim()) return;
      if (/^\d+$/.test(p.textContent.trim())) caption.append(wrapNode(p, 'plate-num'));
      else if (!titled) {
        caption.append(wrapNode(p, 'plate-title'));
        titled = true;
      } else caption.append(wrapNode(p, 'plate-meta'));
    });
    if (caption.children.length) fig.append(caption);
    figures.push(fig);
  });

  const list = document.createElement('div');
  list.className = 'plates-list';
  list.append(...figures);

  if (variant === 'track') {
    const pin = document.createElement('div');
    pin.className = 'plates-pin';
    pin.append(list);
    if (bar) {
      const b = document.createElement('div');
      b.className = 'plates-bar';
      const [label, note] = bar;
      if (label) b.append(wrapNode(label.querySelector('p') || label, 'bar-label'));
      const line = document.createElement('div');
      line.className = 'bar-line';
      const fill = document.createElement('div');
      fill.className = 'bar-fill';
      line.append(fill);
      b.append(line);
      if (note) b.append(wrapNode(note.querySelector('p') || note, 'bar-note'));
      pin.append(b);
    }
    block.replaceChildren(pin);
    const fill = block.querySelector('.bar-fill');
    onScrollFrame(() => {
      const vh = window.innerHeight;
      const r = block.getBoundingClientRect();
      const total = block.offsetHeight - vh;
      const p = total > 0 ? clamp(-r.top / total) : 0;
      const dist = Math.max(0, list.scrollWidth - window.innerWidth);
      list.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
      if (fill) fill.style.transform = `scaleX(${p.toFixed(4)})`;
    });
  } else {
    block.replaceChildren(list);
  }

  if (variant === 'pair' && !reduced()) {
    const layers = figures.map((f, i) => {
      const el = f.querySelector('.plate-media img, .plate-media video');
      if (el) el.classList.add('plate-layer');
      return { el, speed: PARALLAX[i % PARALLAX.length] };
    }).filter((l) => l.el);
    onScrollFrame(() => {
      const vh = window.innerHeight;
      layers.forEach(({ el, speed }) => {
        const r = el.closest('.plate-media').getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const y = -(r.top + r.height / 2 - vh / 2) * speed;
        el.style.transform = `translate3d(0,${y.toFixed(1)}px,0)`;
      });
    });
  }

  if (variant === 'wide') {
    const frames = figures.map((f) => f.querySelector('.plate-media'));
    onScrollFrame(() => {
      const vh = window.innerHeight;
      frames.forEach((el) => {
        if (reduced()) {
          el.style.clipPath = 'none';
          return;
        }
        const r = el.getBoundingClientRect();
        const p = clamp((vh - r.top) / (vh * 0.85));
        const e = 1 - (1 - p) ** 3;
        el.style.clipPath = `inset(${((1 - e) * 14).toFixed(2)}% ${((1 - e) * 28).toFixed(2)}%)`;
      });
    });
  }

  if (variant === 'clips') {
    figures.forEach((f) => {
      const v = f.querySelector('video');
      if (!v) return;
      f.addEventListener('mouseenter', () => { v.muted = true; v.play().catch(() => {}); });
      f.addEventListener('mouseleave', () => v.pause());
      f.addEventListener('click', () => {
        if (v.paused) v.play().catch(() => {});
        else v.pause();
      });
    });
    reveal(figures, 100);
  }

  const autoplay = [...block.querySelectorAll('video[data-autoplay]')];
  if (autoplay.length) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) e.target.play().catch(() => {});
      else e.target.pause();
    }), { threshold: 0.2 });
    autoplay.forEach((v) => io.observe(v));
  }
}
