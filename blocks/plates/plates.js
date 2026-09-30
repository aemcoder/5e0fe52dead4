/**
 * plates — captioned photographic / video plates.
 *
 * Authoring: one row per plate
 *   cell 1: <picture> — or a link to a video file (.mp4)
 *   cell 2: caption paragraphs — plate label, then technical note
 *
 * Variants:
 *   (default) two-up, 4:5 plates on a staggered grid; each media layer moves
 *             at its own speed (parallax). The speed is read from the note
 *             ("Layer speed 0.12×"), defaulting to 0.12 / −0.08 alternating.
 *   wide      one 21:9 plate whose frame opens from the centre on scroll
 *             (clip-path inset).
 *
 * @ew-exempt <p> video source link (cell 1) — metadata, rendered as <video>
 */

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function buildVideo(href) {
  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'metadata';
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.src = href;
  return video;
}

function parseSpeed(text, i) {
  const m = text.replace('−', '-').match(/(-?\d*\.\d+|-?\d+)\s*×/);
  if (m) return parseFloat(m[1]);
  return i % 2 ? -0.08 : 0.12;
}

function captionParts(ps) {
  return ps.map((p, i) => {
    const w = document.createElement('div');
    w.className = i === 0 ? 'label' : 'note';
    w.append(p);
    return w;
  });
}

export default async function decorate(block) {
  const wide = block.classList.contains('wide');
  const plates = [];

  [...block.children].forEach((row, i) => {
    const cells = [...row.children];
    const mediaCell = cells.find((c) => c.querySelector('picture, img, a[href]')) || cells[0];
    const captionCell = cells.find((c) => c !== mediaCell);

    const figure = document.createElement('figure');
    figure.className = 'plate';
    const media = document.createElement('div');
    media.className = 'media grayscale';
    let layer = null;
    const pic = mediaCell?.querySelector('picture, img');
    const link = mediaCell?.querySelector('a[href]');
    if (pic) {
      layer = pic.closest('picture') || pic;
      media.append(layer);
    } else if (link) {
      layer = buildVideo(link.href);
      media.append(layer);
      link.closest('p')?.remove();
    }
    figure.append(media);

    const caption = document.createElement('div');
    caption.className = 'caption';
    if (captionCell) caption.append(...captionParts([...captionCell.querySelectorAll('p')]));
    if (caption.children.length) figure.append(caption);

    plates.push({
      figure, media, layer, speed: parseSpeed(caption.textContent, i),
    });
  });

  const grid = document.createElement('div');
  grid.className = 'plates-grid';
  grid.append(...plates.map((p) => p.figure));
  block.replaceChildren(grid);

  // in-view playback for video plates
  const vio = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.play().catch(() => {});
    else entry.target.pause();
  }), { threshold: 0.2 });
  block.querySelectorAll('video').forEach((v) => vio.observe(v));

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    if (wide) {
      plates.forEach(({ media }) => {
        if (reduced()) {
          media.style.clipPath = 'none';
          return;
        }
        const r = media.getBoundingClientRect();
        const p = clamp((vh - r.top) / (vh * 0.85));
        const e = 1 - (1 - p) ** 3;
        media.style.clipPath = `inset(${((1 - e) * 14).toFixed(2)}% ${((1 - e) * 28).toFixed(2)}%)`;
      });
      return;
    }
    if (reduced()) return;
    plates.forEach(({ media, layer, speed }) => {
      if (!layer) return;
      const r = media.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const target = layer.tagName === 'PICTURE' ? layer.querySelector('img') : layer;
      if (target) target.style.transform = `translate3d(0,${(-(r.top + r.height / 2 - vh / 2) * speed).toFixed(1)}px,0)`;
    });
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  requestAnimationFrame(update);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
}
