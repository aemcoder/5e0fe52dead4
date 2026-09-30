/**
 * squares — a short text panel beside a 4×3 grid of squares that spin and
 * scale into place with CSS scroll-driven animation (animation-timeline:
 * view()); no script drives the motion. Browsers without support show the
 * squares at rest.
 *
 * Authoring: one cell — kicker paragraph, <h3> title, body paragraph
 * (inline <code> allowed).
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// accent squares turn from ink to red as they settle; ink squares only spin
const PATTERN = 'abab' + 'baba' + 'abab';

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
  const heading = block.querySelector('h2, h3, h4');
  const ps = [...block.querySelectorAll('p')];
  // eslint-disable-next-line no-bitwise
  const isBefore = (p) => heading && (p.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING);
  const kicker = ps.find((p) => isBefore(p));
  const body = ps.filter((p) => p !== kicker);

  const text = document.createElement('div');
  text.className = 'squares-text';
  if (kicker) text.append(wrapNode(kicker, 'eyebrow'));
  if (heading) text.append(wrapNode(heading, 'headline'));
  if (body.length) {
    const b = document.createElement('div');
    b.className = 'body';
    b.append(...body);
    text.append(b);
  }

  const grid = document.createElement('div');
  grid.className = 'squares-grid';
  grid.setAttribute('aria-hidden', 'true');
  [...PATTERN].forEach((kind, i) => {
    const sq = document.createElement('div');
    sq.className = `square square-${kind}`;
    sq.style.setProperty('--range', `${30 + i * 3}%`);
    grid.append(sq);
  });

  const layout = document.createElement('div');
  layout.className = 'squares-layout';
  layout.append(text, grid);
  block.replaceChildren(layout);

  if (!reduced()) reveal(text);
}
