/**
 * hero — opening of the Field Guide: display headline, lede + CTAs, a
 * full-bleed media plate unmasked by scroll, and a caption row.
 *
 * Authoring rows:
 *   1. content cell: <h1> (lines separated by <br>), lede <p>,
 *      CTA paragraphs (<strong><a> primary, <em><a> secondary)
 *   2. media cell: image (<picture>/<img>); optional .mp4 link → looping video
 *   3. caption cell: <p> plate label, <p> meta
 * @ew-exempt <a> .mp4 source link (media cell) — metadata, consumed into <video src>
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';

function wrap(className, ...nodes) {
  const el = document.createElement('div');
  el.className = className;
  el.append(...nodes);
  return el;
}

function findVideoLink(cell) {
  return [...cell.querySelectorAll('a[href]')].find((a) => /\.(mp4|webm|mov)(\?|#|$)/i.test(a.href));
}

/* split the authored h1 into per-line spans (moves its own child nodes) */
function splitLines(h1) {
  const nodes = [...h1.childNodes];
  if (!nodes.some((n) => n.nodeName === 'BR')) return [];
  const lines = [];
  let current = [];
  nodes.forEach((n) => {
    if (n.nodeName === 'BR') {
      lines.push(current);
      current = [];
      n.remove();
    } else current.push(n);
  });
  lines.push(current);
  return lines.filter((l) => l.some((n) => n.textContent.trim())).map((line) => {
    const outer = document.createElement('span');
    outer.className = 'hero-line';
    const inner = document.createElement('span');
    inner.className = 'hero-line-inner';
    inner.append(...line);
    outer.append(inner);
    h1.append(outer);
    return inner;
  });
}

export default async function decorate(block) {
  const rows = [...block.children];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const contentCell = rows[0] ? rows[0].firstElementChild : null;
  const mediaCell = rows.slice(1).map((r) => r.firstElementChild)
    .find((c) => c && c.querySelector('picture, img, a[href]'));
  const captionCell = rows.slice(1).map((r) => r.firstElementChild)
    .find((c) => c && c !== mediaCell);

  // intro
  const intro = wrap('hero-intro');
  let lineEls = [];
  const fades = [];
  if (contentCell) {
    const heading = contentCell.querySelector('h1, h2');
    const ps = [...contentCell.querySelectorAll(':scope > p')];
    const ctas = ps.filter((p) => p.querySelector('a'));
    const ledes = ps.filter((p) => !p.querySelector('a'));
    if (heading) {
      intro.append(wrap('hero-headline', heading));
      lineEls = splitLines(heading);
    }
    const grid = wrap('hero-grid');
    if (ledes.length) {
      const lede = wrap('hero-lede', ...ledes);
      grid.append(lede);
      fades.push(lede);
    }
    if (ctas.length) {
      const actions = wrap('hero-actions', ...ctas);
      grid.append(actions);
      fades.push(actions);
    }
    intro.append(grid);
  }

  // media
  const media = wrap('hero-media');
  const frame = wrap('hero-media-frame grayscale');
  media.append(frame);
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
      video.autoplay = !reduced;
      video.preload = 'auto';
      video.src = link.href;
      if (img) video.poster = img.currentSrc || img.src;
      (link.closest('p') || link).remove();
      frame.append(video);
      moving = video;
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !reduced) video.play().catch(() => {});
        else video.pause();
      }, { threshold: 0.2 }).observe(video);
    } else if (pic) {
      frame.append(pic);
      moving = pic;
    }
    if (img) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
    }
  }

  // caption
  const caption = wrap('hero-caption');
  if (captionCell) {
    const ps = [...captionCell.querySelectorAll('p')];
    if (ps[0]) caption.append(wrap('hero-caption-label', ps[0]));
    if (ps.length > 1) caption.append(wrap('hero-caption-meta', ...ps.slice(1)));
  }

  block.replaceChildren(intro, media, caption);

  // scroll-linked unmask: inset(0 Npx) → 0, scale 1.12 → 1 over 60% of a viewport
  const update = () => {
    const vh = window.innerHeight;
    const p = reduced ? 1 : Math.min(1, Math.max(0, window.scrollY / (vh * 0.6)));
    const edge = Math.min(72, window.innerWidth * 0.05);
    media.style.clipPath = `inset(0 ${((1 - p) * edge).toFixed(1)}px)`;
    if (moving) moving.style.transform = `scale(${(1.12 - 0.12 * p).toFixed(4)})`;
  };
  update();
  if (!reduced) {
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

    // entrance
    lineEls.forEach((el, i) => el.animate(
      [{ transform: 'translateY(105%)' }, { transform: 'none' }],
      {
        duration: 1200, delay: 120 + i * 140, easing: EASE, fill: 'backwards',
      },
    ));
    fades.forEach((el, i) => el.animate(
      [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }],
      {
        duration: 900, delay: 560 + i * 120, easing: EASE, fill: 'backwards',
      },
    ));
  }
}
