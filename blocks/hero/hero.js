/**
 * hero — opening band: two-line headline that slides up line by line, a lede and
 * CTAs, then a full-bleed media plate unmasked by scroll (clip-path + scale) with
 * a two-part caption.
 *
 * Authoring rows:
 *   1. <h1> headline (Shift+Enter between lines; each line animates in on its own)
 *   2. lede paragraph
 *   3. CTAs — primary <strong><a>, secondary <em><a>
 *   4. media — an image, and/or a link to an .mp4 (plays muted, looping, in view)
 *   5. caption — two cells: plate label | technique note
 *
 * @ew-exempt integration — the .mp4 link in row 4 is a media source, replaced by <video>
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

const isVideoLink = (a) => a && /\.(mp4|webm)(\?|$)/i.test(a.getAttribute('href') || '');

function buildVideo(a, preload = 'metadata') {
  const v = document.createElement('video');
  Object.assign(v, {
    muted: true, loop: true, playsInline: true, preload,
  });
  v.setAttribute('playsinline', '');
  v.src = a.href;
  v.setAttribute('aria-label', a.textContent.trim());
  return v;
}

/** splits the h1 at its <br>s into line spans (moves the authored nodes) */
function splitLines(h1) {
  const lines = [[]];
  [...h1.childNodes].forEach((n) => {
    if (n.nodeName === 'BR') {
      n.remove();
      lines.push([]);
    } else lines[lines.length - 1].push(n);
  });
  lines.filter((l) => l.some((n) => n.textContent.trim())).forEach((nodes) => {
    const outer = document.createElement('span');
    outer.className = 'line';
    const inner = document.createElement('span');
    inner.className = 'line-inner';
    inner.append(...nodes);
    outer.append(inner);
    h1.append(outer);
  });
}

export default function decorate(block) {
  const rows = [...block.children];
  const h1 = block.querySelector('h1, h2');
  const links = [...block.querySelectorAll('a')];
  const videoLink = links.find(isVideoLink);
  const ctas = links.filter((a) => a !== videoLink).map((a) => a.closest('p') || a);
  const media = block.querySelector('picture') || block.querySelector('img');
  const captionRow = rows.find((r) => r.children.length > 1
    && !r.querySelector('a, picture, img, h1, h2'));
  const lede = [...block.querySelectorAll('p')].find((p) => !p.querySelector('a, picture, img')
    && !captionRow?.contains(p) && p.textContent.trim());

  const copy = document.createElement('div');
  copy.className = 'hero-copy';
  if (h1) {
    splitLines(h1);
    copy.append(wrapNode(h1, 'hero-headline'));
  }
  const sub = document.createElement('div');
  sub.className = 'hero-sub';
  if (lede) sub.append(wrapNode(lede, 'hero-lede'));
  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'hero-actions';
    actions.append(...ctas);
    sub.append(actions);
  }
  copy.append(sub);

  const stage = document.createElement('div');
  stage.className = 'hero-media';
  const layer = document.createElement('div');
  layer.className = 'hero-media-layer grayscale';
  stage.append(layer);
  let video = null;
  if (media) {
    const img = media.querySelector('img') || media;
    img.loading = 'eager';
    img.fetchPriority = 'high';
    layer.append(media.closest('p') || media);
  }
  if (videoLink) {
    video = buildVideo(videoLink, 'auto');
    (videoLink.closest('p') || videoLink).remove();
    layer.append(video);
  }

  const caption = document.createElement('div');
  caption.className = 'hero-caption';
  if (captionRow) [...captionRow.children].forEach((c) => caption.append(...c.children));

  block.replaceChildren(copy, stage, caption);
  if (!media && !videoLink) stage.remove();

  // entrance
  if (!reduced()) {
    block.querySelectorAll('.line-inner').forEach((el, i) => el.animate(
      [{ transform: 'translateY(105%)' }, { transform: 'none' }],
      {
        duration: 1200, delay: 120 + i * 140, easing: EASE, fill: 'backwards',
      },
    ));
    [...sub.children].forEach((el, i) => el.animate(
      [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }],
      {
        duration: 900, delay: 560 + i * 120, easing: EASE, fill: 'backwards',
      },
    ));
  }

  // scroll-linked unmask
  const moving = layer.querySelector('video, img');
  const onScroll = () => {
    const vh = window.innerHeight;
    const p = reduced() ? 1 : clamp(window.scrollY / (vh * 0.6));
    const edge = Math.min(72, window.innerWidth * 0.05);
    stage.style.clipPath = `inset(0 ${((1 - p) * edge).toFixed(1)}px)`;
    if (moving) moving.style.transform = `scale(${(1.12 - 0.12 * p).toFixed(4)})`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  if (video) {
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) video.play().catch(() => {});
      else video.pause();
    }), { threshold: 0.2 }).observe(video);
  }
}
