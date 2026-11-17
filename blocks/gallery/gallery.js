/**
 * gallery — pinned horizontal track: while the 340vh-tall block scrolls,
 * the sticky stage converts vertical distance into horizontal travel.
 *
 * Authoring rows:
 *   plates (one per row): media cell (image; optional .mp4 link) |
 *                         text cell (<p> number, <h3> title, <p> meta)
 *   footer (a row WITHOUT media): cell <p> range label | cell <p> hint
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

export default async function decorate(block) {
  const track = wrap('gallery-track');
  const footer = wrap('gallery-footer');
  const bar = wrap('gallery-progress');
  const fill = wrap('gallery-progress-fill');
  bar.append(fill);
  let footerCells = [];

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const mediaCell = cells.find((c) => c.querySelector('picture, img') || findVideoLink(c));
    if (!mediaCell) {
      footerCells = cells;
      return;
    }
    const textCell = cells.find((c) => c !== mediaCell);
    const figure = document.createElement('figure');
    figure.className = 'gallery-item';
    const frame = wrap('gallery-frame grayscale');
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
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) video.play().catch(() => {});
        else video.pause();
      }, { threshold: 0.2 }).observe(video);
    } else if (pic) frame.append(pic);
    if (img) img.loading = 'eager';
    figure.append(frame);

    if (textCell) {
      const caption = document.createElement('figcaption');
      caption.className = 'gallery-caption';
      const heading = textCell.querySelector('h1, h2, h3, h4, h5, h6');
      const ps = [...textCell.querySelectorAll('p')];
      // eslint-disable-next-line no-bitwise
      const isBefore = (p) => heading && (p.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING);
      const nums = ps.filter(isBefore);
      const metas = ps.filter((p) => !isBefore(p));
      if (nums.length) caption.append(wrap('gallery-num', ...nums));
      if (heading) caption.append(wrap('gallery-title', heading));
      if (metas.length) caption.append(wrap('gallery-meta', ...metas));
      figure.append(caption);
    }
    track.append(figure);
  });

  const [left, right] = footerCells.map((c) => [...c.childNodes]);
  footer.append(wrap('gallery-footer-label', ...(left || [])), bar);
  if (right) footer.append(wrap('gallery-footer-hint', ...right));

  const stage = wrap('gallery-stage', track, footer);
  block.replaceChildren(stage);

  const update = () => {
    const vh = window.innerHeight;
    const r = block.getBoundingClientRect();
    const total = block.offsetHeight - vh;
    const p = total > 0 ? clamp(-r.top / total) : 0;
    const travel = Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
    track.style.transform = `translate3d(${(-p * travel).toFixed(1)}px, 0, 0)`;
    fill.style.transform = `scaleX(${p.toFixed(4)})`;
  };
  let visible = false;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!visible || ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      update();
    });
  }, { passive: true });
  window.addEventListener('resize', update);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    update();
  }).observe(block);
  update();
}
