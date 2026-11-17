/**
 * scrolly — scrollytelling: a pinned 4×4 figure beside scrolling steps;
 * the step reaching the middle of the screen sets the figure's state
 * (grid → rules → accent → motion). Nothing is redrawn — only transforms.
 *
 * Authoring rows (one per state):
 *   one cell: <p> eyebrow ("State 01 — Grid"), <p> body
 * The caption label under the figure is derived from the eyebrow text
 * after the dash (generated UI).
 */

const pad = (n) => String(n).padStart(2, '0');

function wrap(className, ...nodes) {
  const el = document.createElement('div');
  el.className = className;
  el.append(...nodes);
  return el;
}

function applyState(cells, a, reduced) {
  cells.forEach((el, j) => {
    const r = Math.floor(j / 4);
    const c = j % 4;
    let tf = 'none';
    let accent = false;
    let op = '1';
    let dl = 0;
    let z = '';
    if (a === 1) {
      tf = 'scaleY(0.14)';
      dl = j * 20;
    } else if (a === 2) {
      if (j === 5) {
        tf = 'translate(calc(50% + 6px), calc(50% + 6px)) scale(2.1)';
        accent = true;
        z = '1';
      } else op = '0.12';
    } else if (a === 3) {
      tf = 'rotate(45deg) scale(0.62)';
      accent = (r + c) % 2 === 0;
      dl = (r + c) * 60;
    }
    el.style.transitionDelay = reduced ? '0ms' : `${dl}ms`;
    el.style.transform = tf;
    el.style.opacity = op;
    el.style.zIndex = z;
    el.classList.toggle('is-accent', accent);
  });
}

export default async function decorate(block) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const steps = [];
  const labels = [];
  const list = wrap('scrolly-steps');
  [...block.children].forEach((row) => {
    const ps = [...row.querySelectorAll('p')];
    if (!ps.length) return;
    const step = wrap('scrolly-step');
    const [eyebrow, ...body] = ps.length > 1 ? ps : [null, ...ps];
    if (eyebrow) step.append(wrap('scrolly-eyebrow', eyebrow));
    if (body.length) step.append(wrap('scrolly-body', ...body));
    const label = eyebrow ? eyebrow.textContent.split(/[—–-]\s*/).pop().trim() : '';
    labels.push(label);
    list.append(step);
    steps.push(step);
  });

  const grid = wrap('scrolly-grid');
  grid.setAttribute('aria-hidden', 'true');
  const cells = Array.from({ length: 16 }, () => {
    const c = document.createElement('span');
    c.className = 'scrolly-cell';
    grid.append(c);
    return c;
  });
  const num = document.createElement('span');
  num.className = 'scrolly-state-num';
  const label = document.createElement('span');
  label.className = 'scrolly-state-label';
  const of = document.createElement('span');
  of.className = 'scrolly-state-of';
  of.textContent = `of ${pad(steps.length)}`;
  const caption = wrap('scrolly-caption', num, label, of);
  caption.setAttribute('aria-hidden', 'true');
  const figure = wrap('scrolly-figure', grid, caption);

  block.replaceChildren(wrap('scrolly-layout', figure, list));

  let active = -1;
  const setActive = (a) => {
    if (a === active) return;
    active = a;
    steps.forEach((s, i) => s.classList.toggle('is-active', i === a));
    num.textContent = pad(a + 1);
    label.textContent = labels[a] || '';
    applyState(cells, a, reduced);
  };
  setActive(0);

  const update = () => {
    const vh = window.innerHeight;
    let line = vh * 0.6;
    if (window.innerWidth < 900) {
      // the figure pins full-width at the top: measure from its bottom edge
      const fb = figure.getBoundingClientRect().bottom;
      line = fb + (vh - fb) * 0.6;
    }
    let a = 0;
    steps.forEach((s, i) => {
      if (s.getBoundingClientRect().top < line) a = i;
    });
    setActive(a);
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
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) update();
  }).observe(block);
}
