/**
 * closing — full-bleed accent band: two-line headline, back-to-top CTA and
 * a reverse marquee of the site name.
 *
 * Authoring rows:
 *   1. one cell: <h2> (lines separated by <br>), CTA paragraph (<em><a>)
 *   2. one cell: <ul> of marquee items
 * The marquee list is duplicated once (presentational, aria-hidden).
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';

function wrap(className, ...nodes) {
  const el = document.createElement('div');
  el.className = className;
  el.append(...nodes);
  return el;
}

function stripInstrumentation(el) {
  el.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  el.removeAttribute('data-prose-index');
  el.removeAttribute('data-image-index');
  return el;
}

export default async function decorate(block) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heading = block.querySelector('h1, h2, h3');
  const list = block.querySelector('ul, ol');
  const ctas = [...block.querySelectorAll('p')].filter((p) => p.querySelector('a'));

  const inner = wrap('closing-inner');
  if (heading) inner.append(wrap('closing-title', heading));
  if (ctas.length) inner.append(wrap('closing-actions', ...ctas));

  const band = wrap('closing-band');
  let anim = null;
  if (list) {
    const track = wrap('closing-track');
    const copy = stripInstrumentation(list.cloneNode(true));
    copy.setAttribute('aria-hidden', 'true');
    track.append(list, copy);
    band.append(track);
    if (!reduced && track.animate) {
      anim = track.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
        { duration: 60000, iterations: Infinity, direction: 'reverse' },
      );
    }
  }
  block.replaceChildren(inner, band);

  if (reduced) return;

  // headline reveal on enter
  if (heading) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      heading.animate(
        [{ opacity: 0, transform: 'translateY(48px)' }, { opacity: 1, transform: 'none' }],
        { duration: 1000, easing: EASE, fill: 'backwards' },
      );
    }, { threshold: 0.12 });
    io.observe(heading);
  }

  // velocity boost for the marquee
  if (!anim) return;
  let lastY = window.scrollY;
  let boost = 0;
  let rate = 1;
  let visible = false;
  let raf = 0;
  const tick = () => {
    const y = window.scrollY;
    boost = Math.max(boost * 0.93, Math.min(Math.abs(y - lastY) * 0.06, 5));
    lastY = y;
    const r = 1 + boost;
    if (Math.abs(r - rate) > 0.01) {
      rate = r;
      anim.playbackRate = r;
    }
    if (visible) raf = requestAnimationFrame(tick);
  };
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    cancelAnimationFrame(raf);
    if (visible) {
      lastY = window.scrollY;
      anim.play();
      raf = requestAnimationFrame(tick);
    } else anim.pause();
  }).observe(band);
}
