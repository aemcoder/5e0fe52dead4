/**
 * closing — the red closing band: a very large two-line statement, one outline
 * CTA, then a big reverse-running marquee under a rule.
 *
 * Authoring rows:
 *   1. <h2> statement (Shift+Enter between lines)
 *   2. CTA paragraph(s), e.g. <em><a href="#top">Back to the top ↑</a></em>
 *   3. a bulleted list of marquee phrases
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
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

export default function decorate(block) {
  const heading = block.querySelector('h1, h2, h3');
  const ctas = [...block.querySelectorAll('a')].map((a) => a.closest('p') || a);
  const list = block.querySelector('ul, ol');

  const inner = document.createElement('div');
  inner.className = 'closing-inner';
  if (heading) {
    // one block-level line per <br>-separated run (authored nodes move)
    const lines = [[]];
    [...heading.childNodes].forEach((n) => {
      if (n.nodeName === 'BR') {
        n.remove();
        lines.push([]);
      } else lines[lines.length - 1].push(n);
    });
    lines.filter((l) => l.some((n) => n.textContent.trim())).forEach((nodes) => {
      const s = document.createElement('span');
      s.className = 'line';
      s.append(...nodes);
      heading.append(s);
    });
    inner.append(wrapNode(heading, 'closing-heading'));
  }
  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'closing-actions';
    actions.append(...ctas);
    inner.append(actions);
  }
  const parts = [inner];

  let anim = null;
  if (list) {
    list.classList.add('closing-group');
    const band = document.createElement('div');
    band.className = 'closing-marquee';
    const track = document.createElement('div');
    track.className = 'closing-track';
    const clone = stripInstrumentation(list.cloneNode(true));
    clone.setAttribute('aria-hidden', 'true');
    track.append(list, clone);
    band.append(track);
    parts.push(band);
    anim = track.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
      { duration: 60000, iterations: Infinity, direction: 'reverse' },
    );
  }
  block.replaceChildren(...parts);

  if (reduced()) {
    anim?.pause();
    return;
  }
  if (anim) {
    let lastY = window.scrollY;
    let boost = 0;
    let rate = 1;
    const tick = () => {
      const vel = window.scrollY - lastY;
      lastY = window.scrollY;
      boost = Math.max(boost * 0.93, Math.min(Math.abs(vel) * 0.06, 5));
      if (Math.abs(1 + boost - rate) > 0.01) {
        rate = 1 + boost;
        anim.playbackRate = rate;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  const h = inner.querySelector('.closing-heading');
  if (!h) return;
  h.style.opacity = '0';
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(h);
    h.style.opacity = '';
    h.animate([{ opacity: 0, transform: 'translateY(48px)' }, { opacity: 1, transform: 'none' }], {
      duration: 1000, easing: EASE, fill: 'backwards',
    });
  }), { threshold: 0.12 });
  io.observe(h);
}
