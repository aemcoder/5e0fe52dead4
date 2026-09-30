/**
 * scrolly — scrollytelling: a pinned figure of sixteen cells beside a column
 * of state descriptions. Each description that reaches the middle of the
 * screen sets the figure's state; the same cells transform into it.
 *
 * Authoring: one row per state — a kicker paragraph ("State 01 — Grid") and a
 * body paragraph. The status readout under the figure (01 · Grid · of 04) is
 * derived from the kicker and the number of rows.
 *
 * States map to rows in order: 1 grid, 2 rules (scaleY), 3 single accent,
 * 4 rotated checkerboard; extra rows repeat the cycle.
 */

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = (n) => String(n).padStart(2, '0');

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function applyState(cells, state) {
  const ink = 'var(--color-text)';
  const red = 'var(--color-accent)';
  cells.forEach((el, j) => {
    const r = Math.floor(j / 4);
    const c = j % 4;
    let tf = 'none';
    let bg = ink;
    let op = '1';
    let dl = 0;
    let z = '';
    if (state === 1) {
      tf = 'scaleY(0.14)';
      dl = j * 20;
    } else if (state === 2) {
      if (j === 5) {
        tf = 'translate(calc(50% + 6px), calc(50% + 6px)) scale(2.1)';
        bg = red;
        z = '1';
      } else op = '0.12';
    } else if (state === 3) {
      tf = 'rotate(45deg) scale(0.62)';
      bg = (r + c) % 2 === 0 ? red : ink;
      dl = (r + c) * 60;
    }
    el.style.transitionDelay = reduced() ? '0ms' : `${dl}ms`;
    el.style.transform = tf;
    el.style.backgroundColor = bg;
    el.style.opacity = op;
    el.style.zIndex = z;
  });
}

export default async function decorate(block) {
  const steps = [];
  const labels = [];
  [...block.children].forEach((row) => {
    const ps = [...row.querySelectorAll('p')];
    if (!ps.length) return;
    const step = document.createElement('div');
    step.className = 'step';
    const kicker = ps.length > 1 ? ps[0] : null;
    if (kicker) step.append(wrapNode(kicker, 'eyebrow'));
    const body = document.createElement('div');
    body.className = 'body';
    body.append(...ps.filter((p) => p !== kicker));
    step.append(body);
    steps.push(step);
    const t = kicker ? kicker.textContent : '';
    labels.push((t.split(/[—–-]/).pop() || '').trim());
  });

  const figure = document.createElement('div');
  figure.className = 'scrolly-figure';
  figure.setAttribute('aria-hidden', 'true');
  const grid = document.createElement('div');
  grid.className = 'cells';
  const cells = Array.from({ length: 16 }, () => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    grid.append(cell);
    return cell;
  });
  const status = document.createElement('div');
  status.className = 'status';
  const num = document.createElement('span');
  num.className = 'step-num';
  const label = document.createElement('span');
  label.className = 'step-label';
  const of = document.createElement('span');
  of.className = 'step-of';
  of.textContent = `of ${pad(steps.length)}`;
  status.append(num, label, of);
  figure.append(grid, status);

  const column = document.createElement('div');
  column.className = 'scrolly-steps';
  column.append(...steps);

  const layout = document.createElement('div');
  layout.className = 'scrolly-layout';
  layout.append(figure, column);
  block.replaceChildren(layout);

  let active = -1;
  const setActive = (a) => {
    if (a === active) return;
    active = a;
    steps.forEach((s, i) => s.classList.toggle('is-active', i === a));
    num.textContent = pad(a + 1);
    label.textContent = labels[a] || '';
    applyState(cells, a % 4);
  };
  setActive(0);

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    let a = 0;
    steps.forEach((s, i) => {
      if (s.getBoundingClientRect().top < vh * 0.6) a = i;
    });
    setActive(a);
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
}
