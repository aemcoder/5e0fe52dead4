/**
 * story — scrollytelling: a pinned 4×4 figure beside a column of steps. The step
 * nearest the middle of the screen becomes active and the same sixteen cells
 * transform into its state (grid → rule → accent → motion).
 *
 * Authoring: one row per step — cells: eyebrow ("State 01 — Grid") | paragraph.
 * The figure caption shows the active step's number and the label after the
 * dash in its eyebrow, read from the authored eyebrow.
 */

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = (n) => String(n).padStart(2, '0');

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

/** transforms for state `a` (0 grid, 1 rule, 2 accent, 3 motion) */
function stateFor(a, j) {
  const r = Math.floor(j / 4);
  const c = j % 4;
  const s = {
    tf: 'none', accent: false, op: '1', dl: 0, z: '',
  };
  const k = a % 4;
  if (k === 1) {
    s.tf = 'scaleY(0.14)';
    s.dl = j * 20;
  } else if (k === 2) {
    if (j === 5) {
      s.tf = 'translate(calc(50% + 6px), calc(50% + 6px)) scale(2.1)';
      s.accent = true;
      s.z = '1';
    } else s.op = '0.12';
  } else if (k === 3) {
    s.tf = 'rotate(45deg) scale(0.62)';
    s.accent = (r + c) % 2 === 0;
    s.dl = (r + c) * 60;
  }
  return s;
}

export default function decorate(block) {
  const rows = [...block.children];
  const steps = rows.map((row) => {
    const [eyebrowCell, ...rest] = [...row.children];
    const step = document.createElement('div');
    step.className = 'story-step';
    const eyebrow = eyebrowCell?.querySelector('p') || eyebrowCell;
    if (eyebrow) step.append(wrapNode(eyebrow, 'story-eyebrow'));
    const body = document.createElement('div');
    body.className = 'story-body';
    rest.forEach((c) => body.append(...c.children));
    step.append(body);
    const label = eyebrow ? eyebrow.textContent.split(/[—–-]/).pop().trim() : '';
    return { step, label };
  });

  const figure = document.createElement('div');
  figure.className = 'story-figure';
  const grid = document.createElement('div');
  grid.className = 'story-grid';
  grid.setAttribute('aria-hidden', 'true');
  const cells = Array.from({ length: 16 }, () => {
    const d = document.createElement('div');
    d.className = 'story-cell';
    grid.append(d);
    return d;
  });
  const cap = document.createElement('div');
  cap.className = 'story-caption';
  cap.setAttribute('aria-hidden', 'true');
  const num = document.createElement('span');
  num.className = 'story-num';
  const lab = document.createElement('span');
  lab.className = 'story-label';
  const of = document.createElement('span');
  of.className = 'story-of';
  of.textContent = `of ${pad(steps.length)}`;
  cap.append(num, lab, of);
  figure.append(grid, cap);

  const list = document.createElement('div');
  list.className = 'story-steps';
  list.append(...steps.map((s) => s.step));
  block.replaceChildren(figure, list);

  let active = -1;
  const apply = (a) => {
    active = a;
    steps.forEach((s, i) => s.step.classList.toggle('active', i === a));
    num.textContent = pad(a + 1);
    lab.textContent = steps[a]?.label || '';
    cells.forEach((el, j) => {
      const s = stateFor(a, j);
      el.style.transitionDelay = reduced() ? '0ms' : `${s.dl}ms`;
      el.style.transform = s.tf;
      el.classList.toggle('accent', s.accent);
      el.style.opacity = s.op;
      el.style.zIndex = s.z;
    });
  };
  apply(0);

  let queued = false;
  const update = () => {
    queued = false;
    const vh = window.innerHeight;
    let a = 0;
    steps.forEach((s, i) => { if (s.step.getBoundingClientRect().top < vh * 0.6) a = i; });
    if (a !== active) apply(a);
  };
  window.addEventListener('scroll', () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
}
