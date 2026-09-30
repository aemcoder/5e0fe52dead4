/**
 * closing — the accent-red closing band: a two-line display statement and a
 * "back to the top" link. Pair it with a `marquee (reverse)` block in the same
 * section for the oversized ticker that ends the page.
 *
 * Authoring (decoded by content):
 *   - heading (<h2>); use a line break between the two lines
 *   - CTA paragraph: <em><a> (outline button on the accent band)
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

function reveal(el) {
  whenShown(el, () => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    el.style.opacity = '0';
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      el.style.opacity = '';
      el.animate(
        [{ opacity: 0, transform: 'translateY(48px)' }, { opacity: 1, transform: 'none' }],
        { duration: 1000, easing: EASE, fill: 'backwards' },
      );
    }, { threshold: 0.12 });
    io.observe(el);
  });
}

export default async function decorate(block) {
  const heading = block.querySelector('h1, h2, h3');
  const ctas = [...block.querySelectorAll('p')].filter((p) => p.querySelector('a'));
  const rest = [...block.querySelectorAll('p')].filter((p) => !ctas.includes(p) && p.textContent.trim());

  const inner = document.createElement('div');
  inner.className = 'closing-inner';
  let headline = null;
  if (heading) {
    headline = wrapNode(heading, 'headline');
    inner.append(headline);
  }
  if (rest.length) {
    const body = document.createElement('div');
    body.className = 'body';
    body.append(...rest);
    inner.append(body);
  }
  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.append(...ctas);
    inner.append(actions);
  }
  block.replaceChildren(inner);

  if (headline && !reduced()) reveal(headline);
}
