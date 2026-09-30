/**
 * hero-media — full-bleed looping video that is unmasked as you scroll
 * (clip-path inset shrinks to zero, the video settles from 1.12× to 1×),
 * followed by a two-part plate caption.
 *
 * Authoring:
 *   row 1: a link to the video file (.mp4) — or a <picture> as a still
 *   row 2: caption paragraphs — plate label, then technique label
 *
 * @ew-exempt <p> video source link (row 1) — metadata, rendered as <video>
 */

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function buildVideo(href) {
  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.src = href;
  return video;
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
  const rows = [...block.children];
  const link = block.querySelector('a[href]');
  const picture = block.querySelector('picture, img');
  const captionCell = rows.find((r) => !r.querySelector('a[href], picture, img'));

  const stage = document.createElement('div');
  stage.className = 'stage';
  const media = document.createElement('div');
  media.className = 'media grayscale';
  stage.append(media);

  let video = null;
  if (link) {
    video = buildVideo(link.href);
    media.append(video);
    link.closest('p')?.remove();
  } else if (picture) {
    media.append(picture.closest('picture') || picture);
  }

  const caption = document.createElement('div');
  caption.className = 'caption';
  if (captionCell) caption.append(...captionParts([...captionCell.querySelectorAll('p')]));

  block.replaceChildren(stage);
  if (caption.children.length) block.append(caption);

  const layer = media.firstElementChild;
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    const p = reduced() ? 1 : clamp(window.scrollY / (vh * 0.6));
    const e = Math.min(72, window.innerWidth * 0.05);
    stage.style.clipPath = `inset(0 ${((1 - p) * e).toFixed(1)}px)`;
    if (layer) layer.style.transform = `scale(${(1.12 - 0.12 * p).toFixed(4)})`;
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  if (video) {
    const io = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    }), { threshold: 0.2 });
    io.observe(video);
  }
}
