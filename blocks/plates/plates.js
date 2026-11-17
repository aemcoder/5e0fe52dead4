/**
 * plates — captioned figures ("Plate 01 — Still"), photograph or looping video,
 * printed in grayscale with a rule-topped caption bar.
 *
 * Authoring: one row per plate — media (image, or a video URL link) | caption | meta.
 * Variants:
 *   parallax — two staggered 4:5 plates whose media drift at the layer speed
 *              written in the meta cell ("Layer speed 0.12×").
 *   clip     — one 21:9 plate whose frame opens from the centre as it scrolls in.
 *
 * @ew-exempt <p> video source link (media cell) — metadata
 */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isVideoUrl = (href) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(href || '');

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  if (node) w.append(node);
  return w;
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

function mediaFrom(cell) {
  if (!cell) return null;
  const pic = cell.querySelector('picture, img');
  if (pic) return pic.closest('picture') || pic;
  const link = cell.querySelector('a[href]');
  if (link && isVideoUrl(link.href)) {
    const v = makeVideo(link.href);
    (link.closest('p') || link).remove();
    return v;
  }
  return null;
}

/** parses a signed decimal from text such as "Layer speed −0.08×" */
function speedFrom(text) {
  const m = (text || '').replace('−', '-').match(/-?\d*\.\d+|-?\d+/);
  return m ? parseFloat(m[0]) : 0;
}

export default async function decorate(block) {
  const parallax = block.classList.contains('parallax');
  const clip = block.classList.contains('clip');
  const list = wrapNode(null, 'plates-list');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const media = mediaFrom(cells[0]);
    const caption = cells[1] && cells[1].querySelector('p');
    const meta = cells[2] && cells[2].querySelector('p');
    if (!media && !caption) return;
    const fig = document.createElement('figure');
    fig.className = 'plate';
    const frame = wrapNode(media, 'plate-media grayscale');
    fig.append(frame);
    const bar = wrapNode(null, 'plate-caption');
    if (caption) bar.append(wrapNode(caption, 'caption'));
    if (meta) bar.append(wrapNode(meta, 'meta'));
    fig.append(bar);
    if (parallax && media) {
      const target = media.tagName === 'PICTURE' ? media.querySelector('img') : media;
      if (target) target.dataset.speed = String(speedFrom(meta && meta.textContent));
    }
    list.append(fig);
  });
  block.replaceChildren(list);

  // looping videos play only while on screen
  const videos = [...list.querySelectorAll('video')];
  if (videos.length) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.muted = true;
        e.target.play().catch(() => {});
      } else e.target.pause();
    }), { threshold: 0.2 });
    videos.forEach((v) => io.observe(v));
  }

  if (reduced() || (!parallax && !clip)) return;
  const layers = [...list.querySelectorAll('[data-speed]')];
  const frames = clip ? [...list.querySelectorAll('.plate-media')] : [];
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    layers.forEach((layer) => {
      const r = layer.parentElement.closest('.plate-media').getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const y = -(r.top + r.height / 2 - vh / 2) * Number(layer.dataset.speed);
      layer.style.transform = `translate3d(0,${y.toFixed(1)}px,0)`;
    });
    frames.forEach((f) => {
      const r = f.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh * 0.85));
      const e = 1 - (1 - p) ** 3;
      f.style.clipPath = `inset(${((1 - e) * 14).toFixed(2)}% ${((1 - e) * 28).toFixed(2)}%)`;
    });
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}
