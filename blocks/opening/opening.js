/**
 * opening — the page lead: a two-line masked headline, lede and CTAs, then a
 * full-bleed hero video that unmasks (clip-path) and settles (scale) as you scroll,
 * with a caption bar under it. Template-slotted.
 *
 * Authoring rows:
 *   1. one cell: <h1> (lines split with Shift+Enter), lede <p>,
 *      CTAs — <strong><a> primary, <em><a> secondary
 *   2. media (video URL link or image) | caption | meta
 *
 * @ew-exempt <p> video source link (row 2, cell 1) — metadata
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
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

/** Splits the heading's content at <br> into masked line spans (presentation only). */
function splitLines(heading) {
  const lines = [[]];
  [...heading.childNodes].forEach((n) => {
    if (n.nodeName === 'BR') {
      n.remove();
      lines.push([]);
    } else lines[lines.length - 1].push(n);
  });
  const filled = lines.filter((l) => l.some((n) => n.textContent.trim()));
  if (filled.length < 2) return [];
  return filled.map((nodes) => {
    const mask = document.createElement('span');
    mask.className = 'line';
    const inner = document.createElement('span');
    inner.className = 'line-inner';
    inner.append(...nodes);
    mask.append(inner);
    heading.append(mask);
    return inner;
  });
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
  const rows = [...block.children];
  const lead = rows[0];
  const heading = block.querySelector('h1, h2');
  const paras = lead ? [...lead.querySelectorAll('p')] : [];
  const ctas = paras.filter((p) => p.querySelector('a'));
  const lede = paras.find((p) => !p.querySelector('a, picture, img'));

  const mediaRow = rows.find((r, i) => i > 0 && r.querySelector('picture, img, a[href]'));
  const mediaCells = mediaRow ? [...mediaRow.children] : [];
  const media = mediaFrom(mediaCells[0]);
  const caption = mediaCells[1] && mediaCells[1].querySelector('p');
  const meta = mediaCells[2] && mediaCells[2].querySelector('p');

  // ── lead ──
  const intro = wrapNode(null, 'opening-intro');
  let lines = [];
  if (heading) {
    lines = splitLines(heading);
    intro.append(wrapNode(heading, 'headline'));
  }
  const row = wrapNode(null, 'opening-row');
  if (lede) row.append(wrapNode(lede, 'lede'));
  if (ctas.length) {
    const actions = wrapNode(null, 'actions');
    actions.append(...ctas);
    row.append(actions);
  }
  intro.append(row);

  // ── hero media ──
  const stage = wrapNode(null, 'opening-media');
  if (media) {
    const frame = wrapNode(media, 'opening-frame grayscale');
    stage.append(frame);
    const img = media.querySelector ? media.querySelector('img') : null;
    if (img) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
    }
  }
  const capBar = wrapNode(null, 'opening-caption');
  if (caption) capBar.append(wrapNode(caption, 'caption'));
  if (meta) capBar.append(wrapNode(meta, 'meta'));

  block.replaceChildren(intro, stage, capBar);

  // ── entrance (WAAPI, fill: backwards — content stays visible without JS) ──
  if (!reduced()) {
    lines.forEach((line, i) => line.animate(
      [{ transform: 'translateY(105%)' }, { transform: 'none' }],
      {
        duration: 1200, delay: 120 + i * 140, easing: EASE, fill: 'backwards',
      },
    ));
    [...row.children].forEach((el, i) => el.animate(
      [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }],
      {
        duration: 900, delay: 560 + i * 120, easing: EASE, fill: 'backwards',
      },
    ));
  }

  // ── in-view playback ──
  const video = stage.querySelector('video');
  if (video) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        video.muted = true;
        video.play().catch(() => {});
      } else video.pause();
    }), { threshold: 0.2 });
    io.observe(video);
  }

  // ── scroll-linked unmask ──
  const target = stage.querySelector('video, img');
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    const p = reduced() ? 1 : clamp(window.scrollY / (vh * 0.6));
    const e = Math.min(72, window.innerWidth * 0.05);
    stage.style.clipPath = `inset(0 ${((1 - p) * e).toFixed(1)}px)`;
    if (target) target.style.transform = `scale(${(1.12 - 0.12 * p).toFixed(4)})`;
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
