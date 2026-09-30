/**
 * hscroll — a pinned horizontal gallery: the block is ~3.4 screens tall and
 * its track stays pinned (position: sticky) while vertical scroll is turned
 * into horizontal travel. A progress rule under the track fills as you go.
 * Video plates play only while on screen.
 *
 * Authoring: one row per plate
 *   cell 1: <picture> — or a link to a video file (.mp4)
 *   cell 2: caption paragraphs — plate number, title, kind
 * Last row (no media): progress labels — start label | end label
 *
 * @ew-exempt <p> video source link (cell 1) — metadata, rendered as <video>
 */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

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

export default async function decorate(block) {
  const track = document.createElement('div');
  track.className = 'hscroll-track';
  const labels = [];

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const mediaCell = cells.find((c) => c.querySelector('picture, img, a[href$=".mp4"], a[href*=".mp4?"]'));
    if (!mediaCell) {
      labels.push(...row.querySelectorAll('p'));
      return;
    }
    const figure = document.createElement('figure');
    figure.className = 'hscroll-item';
    const media = document.createElement('div');
    media.className = 'media grayscale';
    const pic = mediaCell.querySelector('picture, img');
    const link = mediaCell.querySelector('a[href]');
    if (pic) {
      media.append(pic.closest('picture') || pic);
    } else if (link) {
      media.append(buildVideo(link.href));
      link.closest('p')?.remove();
    }
    figure.append(media);

    const textCell = cells.find((c) => c !== mediaCell);
    if (textCell) {
      const heading = textCell.querySelector('h2, h3, h4');
      const ps = [...textCell.querySelectorAll('p')];
      const num = ps.find((p) => /^\s*[\d–-]+\s*$/.test(p.textContent));
      const rest = ps.filter((p) => p !== num);
      const title = heading || rest.shift();
      const kind = rest[0];
      const caption = document.createElement('div');
      caption.className = 'caption';
      if (num) caption.append(wrapNode(num, 'num'));
      if (title) caption.append(wrapNode(title, 'title'));
      if (kind) caption.append(wrapNode(kind, 'kind'));
      figure.append(caption);
    }
    track.append(figure);
  });

  const pin = document.createElement('div');
  pin.className = 'hscroll-pin';
  pin.append(track);

  const progress = document.createElement('div');
  progress.className = 'hscroll-progress';
  const bar = document.createElement('div');
  bar.className = 'bar';
  const fill = document.createElement('div');
  fill.className = 'fill';
  bar.append(fill);
  if (labels[0]) progress.append(wrapNode(labels[0], 'start'));
  progress.append(bar);
  if (labels[1]) progress.append(wrapNode(labels[1], 'end'));
  pin.append(progress);

  block.replaceChildren(pin);

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    const vw = document.documentElement.clientWidth;
    const r = block.getBoundingClientRect();
    const total = block.offsetHeight - vh;
    const p = total > 0 ? clamp(-r.top / total) : 0;
    track.style.transform = `translate3d(${(-p * Math.max(0, track.scrollWidth - vw)).toFixed(1)}px,0,0)`;
    fill.style.transform = `scaleX(${p.toFixed(4)})`;
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

  const vio = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.play().catch(() => {});
    else entry.target.pause();
  }), { threshold: 0.2 });
  block.querySelectorAll('video').forEach((v) => vio.observe(v));
}
