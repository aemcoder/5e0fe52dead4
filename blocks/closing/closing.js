/**
 * closing — the red closing band: a two-line statement, an outline CTA on red,
 * and an oversized ticker under a rule that runs in reverse and speeds up with
 * scroll velocity. Paused under reduced motion.
 *
 * Authoring rows:
 *   1. <h2> statement (lines split with Shift+Enter)
 *   2. CTA — <em><a> (outline on red)
 *   3. <ul> of ticker phrases
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  if (node) w.append(node);
  return w;
}

function stripInstrumentation(el) {
  el.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  el.removeAttribute('data-prose-index');
  return el;
}

function splitLines(heading) {
  const lines = [[]];
  [...heading.childNodes].forEach((n) => {
    if (n.nodeName === 'BR') {
      n.remove();
      lines.push([]);
    } else lines[lines.length - 1].push(n);
  });
  const filled = lines.filter((l) => l.some((n) => n.textContent.trim()));
  if (filled.length < 2) return;
  filled.forEach((nodes) => {
    const s = document.createElement('span');
    s.className = 'line';
    s.append(...nodes);
    heading.append(s);
  });
}

export default async function decorate(block) {
  const heading = block.querySelector('h1, h2, h3');
  const ctas = [...block.querySelectorAll('p')].filter((p) => p.querySelector('a'));
  const list = block.querySelector('ul, ol');

  const inner = wrapNode(null, 'closing-inner');
  if (heading) {
    splitLines(heading);
    inner.append(wrapNode(heading, 'headline'));
  }
  if (ctas.length) {
    const actions = wrapNode(null, 'actions');
    actions.append(...ctas);
    inner.append(actions);
  }
  const parts = [inner];

  let track = null;
  if (list) {
    track = wrapNode(null, 'closing-track');
    const group = wrapNode(list, 'closing-group');
    const copy = stripInstrumentation(group.cloneNode(true));
    copy.setAttribute('aria-hidden', 'true');
    track.append(group, copy);
    parts.push(wrapNode(track, 'closing-ticker'));
  }
  block.replaceChildren(...parts);

  if (reduced()) return;
  const headline = inner.querySelector('.headline');
  if (headline && headline.getBoundingClientRect().top > window.innerHeight * 0.9) {
    headline.style.opacity = '0';
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      headline.style.opacity = '';
      headline.animate(
        [{ opacity: 0, transform: 'translateY(48px)' }, { opacity: 1, transform: 'none' }],
        { duration: 1000, easing: EASE, fill: 'backwards' },
      );
    }), { threshold: 0.12 });
    io.observe(headline);
  }

  if (!track) return;
  const anim = track.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
    { duration: 60000, iterations: Infinity, direction: 'reverse' },
  );
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
