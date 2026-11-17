/**
 * marquee — an endless ticker of short phrases between two rules, with square
 * separators. It drifts on its own and speeds up while the page is scrolled fast.
 *
 * Authoring: one cell holding a bulleted list; each list item is one phrase.
 * Variant: `reverse` runs the ticker right-to-left in the opposite direction.
 */

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// presentational clones must not keep the editor's indices (EW4)
function stripInstrumentation(el) {
  el.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  el.removeAttribute('data-prose-index');
  return el;
}

export default function decorate(block) {
  const list = block.querySelector('ul, ol');
  if (!list) return;
  list.classList.add('marquee-group');
  const track = document.createElement('div');
  track.className = 'marquee-track';
  const clone = stripInstrumentation(list.cloneNode(true));
  clone.setAttribute('aria-hidden', 'true');
  track.append(list, clone);
  block.replaceChildren(track);

  const anim = track.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
    {
      duration: 45000,
      iterations: Infinity,
      direction: block.classList.contains('reverse') ? 'reverse' : 'normal',
    },
  );
  if (reduced()) {
    anim.pause();
    return;
  }
  // velocity-reactive: scroll speed boosts the playback rate, then decays
  let lastY = window.scrollY;
  let boost = 0;
  let rate = 1;
  const tick = () => {
    const vel = window.scrollY - lastY;
    lastY = window.scrollY;
    boost = Math.max(boost * 0.93, Math.min(Math.abs(vel) * 0.06, 5));
    const r = 1 + boost;
    if (Math.abs(r - rate) > 0.01) {
      rate = r;
      anim.playbackRate = r;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
