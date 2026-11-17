/**
 * scrolly — scrollytelling: a pinned 4×4 figure beside scrolling steps. Each step
 * that reaches the middle of the screen sets a new state of the same sixteen
 * cells (grid → rules → one accent → rotated diagonals). The caption under the
 * figure shows the active step number and the label after the "—" in its eyebrow.
 *
 * Authoring: one row per state — eyebrow ("State 01 — Grid") | paragraph.
 */

const pad = (n) => String(n).padStart(2, '0');
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  if (node) w.append(node);
  return w;
}

function span(className, text) {
  const s = document.createElement('span');
  s.className = className;
  s.textContent = text;
  return s;
}

export default async function decorate(block) {
  const steps = [];
  const stepsCol = wrapNode(null, 'scrolly-steps');
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const eyebrow = cells[0] && cells[0].querySelector('p');
    const body = cells[1] && cells[1].querySelector('p');
    if (!eyebrow && !body) return;
    const step = wrapNode(null, 'scrolly-step');
    if (eyebrow) step.append(wrapNode(eyebrow, 'scrolly-eyebrow'));
    if (body) step.append(wrapNode(body, 'scrolly-text'));
    const raw = eyebrow ? eyebrow.textContent : '';
    step.dataset.label = (raw.split(/\s[—–-]\s/)[1] || raw).trim();
    stepsCol.append(step);
    steps.push(step);
  });

  const cells = [];
  const grid = wrapNode(null, 'scrolly-grid');
  for (let i = 0; i < 16; i += 1) {
    const c = document.createElement('span');
    c.className = 'scrolly-cell';
    grid.append(c);
    cells.push(c);
  }
  const num = span('scrolly-num', '01');
  const label = span('scrolly-label', steps[0] ? steps[0].dataset.label : '');
  const caption = wrapNode(null, 'scrolly-caption');
  caption.append(num, label, span('scrolly-of', `of ${pad(steps.length)}`));
  const figure = wrapNode(null, 'scrolly-figure');
  figure.setAttribute('aria-hidden', 'true');
  figure.append(grid, caption);

  const layout = wrapNode(null, 'scrolly-layout');
  layout.append(figure, stepsCol);
  block.replaceChildren(layout);

  let active = -1;
  const apply = (a) => {
    active = a;
    steps.forEach((s, i) => s.classList.toggle('is-active', i === a));
    num.textContent = pad(a + 1);
    label.textContent = steps[a] ? steps[a].dataset.label : '';
    const state = a % 4;
    cells.forEach((cell, j) => {
      const r = Math.floor(j / 4);
      const c = j % 4;
      let tf = 'none';
      let accent = false;
      let op = '1';
      let dl = 0;
      let z = '';
      if (state === 1) {
        tf = 'scaleY(0.14)';
        dl = j * 20;
      } else if (state === 2) {
        if (j === 5) {
          tf = 'translate(calc(50% + 6px), calc(50% + 6px)) scale(2.1)';
          accent = true;
          z = '1';
        } else op = '0.12';
      } else if (state === 3) {
        tf = 'rotate(45deg) scale(0.62)';
        accent = (r + c) % 2 === 0;
        dl = (r + c) * 60;
      }
      cell.style.transitionDelay = reduced() ? '0ms' : `${dl}ms`;
      cell.style.transform = tf;
      cell.style.opacity = op;
      cell.style.zIndex = z;
      cell.classList.toggle('accent', accent);
    });
  };
  apply(0);

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    let a = 0;
    steps.forEach((s, i) => { if (s.getBoundingClientRect().top < vh * 0.6) a = i; });
    if (a !== active) apply(a);
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}
