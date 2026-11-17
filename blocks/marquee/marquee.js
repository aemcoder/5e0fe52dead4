/**
 * marquee — full-bleed ticker of technique names; speeds up with scroll
 * velocity.
 *
 * Authoring rows:
 *   1. one cell: <ul> — one <li> per item
 * The list is duplicated once (presentational, aria-hidden) for a seamless loop.
 */

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
  const list = block.querySelector('ul, ol');
  if (!list) return;
  const track = document.createElement('div');
  track.className = 'marquee-track';
  const copy = stripInstrumentation(list.cloneNode(true));
  copy.setAttribute('aria-hidden', 'true');
  track.append(list, copy);
  block.replaceChildren(track);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !track.animate) return;
  const anim = track.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
    { duration: 45000, iterations: Infinity },
  );

  // velocity boost
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
  }).observe(block);
}
