/**
 * plates — captioned photographic plates.
 *
 * Authoring rows (one per plate):
 *   media cell:   image (<picture>/<img>); optional .mp4 link → looping video
 *   caption cell: <p> plate label, <p> meta
 *
 * Default: staggered pair with parallax layers. The layer speed is read
 * from the meta text ("Layer speed −0.08×"); fallback 0.12 / −0.08.
 * Variant `wide`: one 21:9 frame whose clip-path opens from the centre.
 * @ew-exempt <a> .mp4 source link (media cell) — metadata, consumed into <video src>
 */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function wrap(className, ...nodes) {
  const el = document.createElement('div');
  el.className = className;
  el.append(...nodes);
  return el;
}

function findVideoLink(cell) {
  return [...cell.querySelectorAll('a[href]')].find((a) => /\.(mp4|webm|mov)(\?|#|$)/i.test(a.href));
}

function parseSpeed(text, i) {
  const m = (text || '').replace('−', '-').match(/(-?\d*\.?\d+)\s*×/);
  if (m) return parseFloat(m[1]);
  return i % 2 === 0 ? 0.12 : -0.08;
}

export default async function decorate(block) {
  const wide = block.classList.contains('wide');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const list = wrap('plates-list');
  const layers = [];
  const clips = [];

  [...block.children].forEach((row, i) => {
    const cells = [...row.children];
    const mediaCell = cells.find((c) => c.querySelector('picture, img, a[href]')) || cells[0];
    const captionCell = cells.find((c) => c !== mediaCell);
    const figure = document.createElement('figure');
    figure.className = 'plates-figure';

    const frame = wrap('plates-frame grayscale');
    let moving = null;
    if (mediaCell) {
      const pic = mediaCell.querySelector('picture') || mediaCell.querySelector('img');
      const img = pic && (pic.tagName === 'IMG' ? pic : pic.querySelector('img'));
      const link = findVideoLink(mediaCell);
      if (link) {
        const video = document.createElement('video');
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'metadata';
        video.src = link.href;
        if (img) video.poster = img.currentSrc || img.src;
        (link.closest('p') || link).remove();
        frame.append(video);
        moving = video;
        new IntersectionObserver(([e]) => {
          if (e.isIntersecting) video.play().catch(() => {});
          else video.pause();
        }, { threshold: 0.2 }).observe(video);
      } else if (pic) {
        frame.append(pic);
        moving = pic;
      }
    }
    figure.append(frame);

    const ps = captionCell ? [...captionCell.querySelectorAll('p')] : [];
    if (ps.length) {
      const caption = document.createElement('figcaption');
      caption.className = 'plates-caption';
      caption.append(wrap('plates-label', ps[0]));
      if (ps.length > 1) caption.append(wrap('plates-meta', ...ps.slice(1)));
      figure.append(caption);
    }
    list.append(figure);

    if (wide) clips.push(frame);
    else if (moving) layers.push({ el: moving, frame, speed: parseSpeed(ps.slice(1).map((p) => p.textContent).join(' '), i) });
  });
  block.replaceChildren(list);

  if (reduced) return;

  const update = () => {
    const vh = window.innerHeight;
    layers.forEach(({ el, frame, speed }) => {
      const r = frame.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      el.style.transform = `translate3d(0, ${(-(r.top + r.height / 2 - vh / 2) * speed).toFixed(1)}px, 0)`;
    });
    clips.forEach((frame) => {
      const r = frame.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh * 0.85));
      const e = 1 - (1 - p) ** 3;
      frame.style.clipPath = `inset(${((1 - e) * 14).toFixed(2)}% ${((1 - e) * 28).toFixed(2)}%)`;
    });
  };
  block.classList.add('is-animated');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      update();
    });
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
}
