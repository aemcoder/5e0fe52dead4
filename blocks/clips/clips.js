/**
 * clips — a grid of short video clips that play while hovered (tap toggles
 * on touch). Nothing is fetched for a clip until it is first played.
 *
 * Authoring: one row per clip
 *   cell 1: a link to the video file (.mp4) — or a <picture>
 *   cell 2: caption paragraphs — clip number, then title
 *
 * @ew-exempt <p> video source link (cell 1) — metadata, rendered as <video>
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function whenShown(el, cb) {
  const check = () => (el.getClientRects().length ? cb() : requestAnimationFrame(check));
  check();
}

function reveal(el, delay) {
  whenShown(el, () => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    el.style.opacity = '0';
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      el.style.opacity = '';
      el.animate(
        [{ opacity: 0, transform: 'translateY(48px)' }, { opacity: 1, transform: 'none' }],
        {
          duration: 1000, delay, easing: EASE, fill: 'backwards',
        },
      );
    }, { threshold: 0.12 });
    io.observe(el);
  });
}

export default async function decorate(block) {
  const grid = document.createElement('div');
  grid.className = 'clips-grid';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const mediaCell = cells.find((c) => c.querySelector('picture, img, a[href]'));
    const textCell = cells.find((c) => c !== mediaCell);
    const figure = document.createElement('figure');
    figure.className = 'clip';
    const media = document.createElement('div');
    media.className = 'media grayscale';
    const link = mediaCell?.querySelector('a[href]');
    const pic = mediaCell?.querySelector('picture, img');
    let video = null;
    if (link) {
      video = document.createElement('video');
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'none';
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.src = link.href;
      media.append(video);
      link.closest('p')?.remove();
      const hint = document.createElement('span');
      hint.className = 'hint';
      hint.setAttribute('aria-hidden', 'true');
      hint.textContent = 'Hover to play';
      media.append(hint);
    } else if (pic) {
      media.append(pic.closest('picture') || pic);
    }
    figure.append(media);

    if (textCell) {
      const heading = textCell.querySelector('h2, h3, h4');
      const ps = [...textCell.querySelectorAll('p')];
      const num = ps.find((p) => /^\s*[\d–-]+\s*$/.test(p.textContent));
      const title = heading || ps.find((p) => p !== num);
      const caption = document.createElement('div');
      caption.className = 'caption';
      if (num) caption.append(wrapNode(num, 'num'));
      if (title) caption.append(wrapNode(title, 'title'));
      figure.append(caption);
    }

    if (video) {
      const start = () => video.play().catch(() => {});
      figure.addEventListener('mouseenter', start);
      figure.addEventListener('mouseleave', () => video.pause());
      figure.addEventListener('click', () => (video.paused ? start() : video.pause()));
    }
    grid.append(figure);
  });

  block.replaceChildren(grid);
  if (!reduced()) [...grid.children].forEach((f, i) => reveal(f, i * 100));
}
