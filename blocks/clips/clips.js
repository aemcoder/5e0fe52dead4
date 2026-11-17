/**
 * clips — a row of short muted clips that play while hovered (tap toggles on touch).
 *
 * Authoring: one row per clip — video URL link | number | title.
 *
 * @ew-exempt <p> video source link (cell 1) — metadata
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isVideoUrl = (href) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(href || '');

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  if (node) w.append(node);
  return w;
}

function mediaFrom(cell) {
  if (!cell) return null;
  const pic = cell.querySelector('picture, img');
  const link = [...cell.querySelectorAll('a[href]')].find((a) => isVideoUrl(a.href));
  if (link) {
    const v = document.createElement('video');
    v.src = link.href;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = 'metadata';
    v.setAttribute('playsinline', '');
    v.setAttribute('muted', '');
    if (pic) v.poster = (pic.querySelector('img') || pic).src;
    return v;
  }
  return pic ? pic.closest('picture') || pic : null;
}

export default async function decorate(block) {
  const grid = wrapNode(null, 'clips-grid');
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const media = mediaFrom(cells[0]);
    if (!media) return;
    const fig = document.createElement('figure');
    fig.className = 'clip';
    const frame = wrapNode(media, 'clip-media grayscale');
    if (media.tagName === 'VIDEO') {
      const badge = document.createElement('span');
      badge.className = 'clip-badge';
      badge.textContent = 'Hover to play';
      frame.append(badge);
    }
    fig.append(frame);
    const cap = wrapNode(null, 'clip-caption');
    const num = cells[1] && cells[1].querySelector('p');
    const title = cells[2] && cells[2].querySelector('p');
    if (num) cap.append(wrapNode(num, 'clip-num'));
    if (title) cap.append(wrapNode(title, 'clip-title'));
    fig.append(cap);
    grid.append(fig);

    const video = fig.querySelector('video');
    if (video) {
      const start = () => {
        video.muted = true;
        video.play().catch(() => {});
      };
      fig.addEventListener('mouseenter', start);
      fig.addEventListener('mouseleave', () => video.pause());
      fig.addEventListener('click', () => (video.paused ? start() : video.pause()));
    }
  });
  block.replaceChildren(grid);

  if (reduced()) return;
  const figs = [...grid.children];
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    e.target.style.opacity = '';
    e.target.animate(
      [{ opacity: 0, transform: 'translateY(48px)' }, { opacity: 1, transform: 'none' }],
      {
        duration: 1000, delay: figs.indexOf(e.target) * 100, easing: EASE, fill: 'backwards',
      },
    );
  }), { threshold: 0.12 });
  figs.forEach((f) => {
    if (f.getBoundingClientRect().top > window.innerHeight * 0.9) {
      f.style.opacity = '0';
      io.observe(f);
    }
  });
}
