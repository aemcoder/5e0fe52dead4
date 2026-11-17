/**
 * gallery-track — a pinned horizontal gallery. The block is several screens tall;
 * its stage sticks to the viewport while vertical scroll moves the track sideways.
 * A progress rule under the track follows along. Videos play only while in view.
 *
 * Authoring:
 *   one row per plate — media (image or video URL link) | number | title | kind
 *   a final row without media — left label | right label (the progress bar ends)
 *
 * @ew-exempt <p> video source link (media cell) — metadata
 */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
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

export default async function decorate(block) {
  const track = wrapNode(null, 'gt-track');
  const bar = wrapNode(null, 'gt-bar');
  const fill = wrapNode(null, 'gt-progress-fill');
  const progress = wrapNode(fill, 'gt-progress');
  progress.setAttribute('aria-hidden', 'true');
  let barLeft = null;
  let barRight = null;

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const media = mediaFrom(cells[0]);
    if (!media) {
      const ps = cells.map((c) => c.querySelector('p')).filter(Boolean);
      [barLeft, barRight] = ps;
      return;
    }
    const fig = document.createElement('figure');
    fig.className = 'gt-item';
    fig.append(wrapNode(media, 'gt-media grayscale'));
    const cap = wrapNode(null, 'gt-caption');
    const [num, title, kind] = cells.slice(1).map((c) => c.querySelector('p'));
    if (num) cap.append(wrapNode(num, 'gt-num'));
    if (title) cap.append(wrapNode(title, 'gt-title'));
    if (kind) cap.append(wrapNode(kind, 'gt-kind'));
    fig.append(cap);
    track.append(fig);
  });

  bar.append(wrapNode(barLeft, 'gt-bar-left'), progress, wrapNode(barRight, 'gt-bar-right'));
  const sticky = wrapNode(null, 'gt-sticky');
  sticky.append(track, bar);
  block.replaceChildren(sticky);

  const videos = [...track.querySelectorAll('video')];
  if (videos.length) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.muted = true;
        e.target.play().catch(() => {});
      } else e.target.pause();
    }), { threshold: 0.2 });
    videos.forEach((v) => io.observe(v));
  }

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    const vw = document.documentElement.clientWidth;
    const r = block.getBoundingClientRect();
    const total = block.offsetHeight - vh;
    const p = total > 0 ? clamp(-r.top / total) : 0;
    const dist = Math.max(0, track.scrollWidth - vw);
    track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
    fill.style.transform = `scaleX(${p.toFixed(4)})`;
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}
