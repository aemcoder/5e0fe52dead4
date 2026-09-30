/**
 * marquee — an endless ticker whose speed reacts to scroll velocity.
 *
 * Authoring: one cell holding a bulleted list; each item is one ticker entry.
 * Variants:
 *   (default)  — technique ticker between rules, accent square separators
 *   reverse    — runs right-to-left-reversed, oversized, for the closing band
 *
 * The authored <ul> is moved into the track; a presentational copy (with the
 * editor's indices stripped, aria-hidden) closes the loop.
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
  let list = block.querySelector('ul, ol');
  if (!list) {
    // fallback: one paragraph per entry
    list = document.createElement('ul');
    block.querySelectorAll('p').forEach((p) => {
      const li = document.createElement('li');
      li.append(...p.childNodes);
      list.append(li);
    });
  }

  const viewport = document.createElement('div');
  viewport.className = 'marquee-viewport';
  const track = document.createElement('div');
  track.className = 'marquee-track';
  const copy = stripInstrumentation(list.cloneNode(true));
  copy.setAttribute('aria-hidden', 'true');
  track.append(list, copy);
  viewport.append(track);
  block.replaceChildren(viewport);

  const isReverse = block.classList.contains('reverse');
  const anim = track.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
    {
      duration: isReverse ? 60000 : 45000,
      iterations: Infinity,
      direction: isReverse ? 'reverse' : 'normal',
    },
  );
  if (reduced()) {
    anim.pause();
    return;
  }

  // velocity boost: faster while the page is being scrolled, decays back
  let boost = 0;
  let lastY = window.scrollY;
  let rate = 1;
  let raf = 0;
  const tick = () => {
    const y = window.scrollY;
    const vel = y - lastY;
    lastY = y;
    boost = Math.max(boost * 0.93, Math.min(Math.abs(vel) * 0.06, 5));
    const r = 1 + boost;
    if (Math.abs(r - rate) > 0.01) {
      rate = r;
      anim.playbackRate = r;
    }
    raf = requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => entries.forEach((entry) => {
    cancelAnimationFrame(raf);
    if (entry.isIntersecting) {
      lastY = window.scrollY;
      raf = requestAnimationFrame(tick);
    }
  }));
  io.observe(block);
}
