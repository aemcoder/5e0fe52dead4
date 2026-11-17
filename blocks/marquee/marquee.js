/**
 * marquee — a looping ticker of short phrases separated by accent squares.
 * Speeds up with scroll velocity (WAAPI playbackRate). Paused under reduced motion.
 *
 * Authoring: one cell holding a <ul>, one phrase per item.
 * Variant `reverse` runs right-to-left → left-to-right.
 */

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function stripInstrumentation(el) {
  el.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  el.removeAttribute('data-prose-index');
  return el;
}

export default async function decorate(block) {
  const list = block.querySelector('ul, ol');
  if (!list) return;
  const track = document.createElement('div');
  track.className = 'marquee-track';
  const group = document.createElement('div');
  group.className = 'marquee-group';
  group.append(list);
  const copy = stripInstrumentation(group.cloneNode(true));
  copy.setAttribute('aria-hidden', 'true');
  track.append(group, copy);
  block.replaceChildren(track);

  const anim = track.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
    {
      duration: block.classList.contains('slow') ? 60000 : 45000,
      iterations: Infinity,
      direction: block.classList.contains('reverse') ? 'reverse' : 'normal',
    },
  );
  if (reduced()) {
    anim.pause();
    return;
  }

  let lastY = window.scrollY;
  let boost = 0;
  let rate = 1;
  const tick = () => {
    const y = window.scrollY;
    boost = Math.max(boost * 0.93, Math.min(Math.abs(y - lastY) * 0.06, 5));
    lastY = y;
    const r = 1 + boost;
    if (Math.abs(r - rate) > 0.01) {
      rate = r;
      anim.playbackRate = r;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
