const STATES = [
  // Grid (default)
  (squares) => squares.forEach((sq) => {
    sq.style.transform = 'none';
    sq.style.opacity = '1';
    sq.style.backgroundColor = 'var(--color-neutral-900)';
  }),
  // Rule — flatten each to 1/7 height
  (squares) => squares.forEach((sq) => {
    sq.style.transform = 'scaleY(0.14)';
    sq.style.opacity = '1';
    sq.style.backgroundColor = 'var(--color-neutral-900)';
  }),
  // Accent — one cell grows, rest fade
  (squares) => squares.forEach((sq, i) => {
    if (i === 5) {
      sq.style.transform = 'scale(2.1) translate(25%, 25%)';
      sq.style.opacity = '1';
      sq.style.backgroundColor = 'var(--color-accent)';
    } else {
      sq.style.transform = 'none';
      sq.style.opacity = '0.12';
      sq.style.backgroundColor = 'var(--color-neutral-900)';
    }
  }),
  // Motion — rotate with stagger
  (squares) => squares.forEach((sq, i) => {
    sq.style.transform = 'rotate(45deg)';
    sq.style.transitionDelay = `${i * 60}ms`;
    sq.style.opacity = '1';
    sq.style.backgroundColor = i % 2 === 0 ? 'var(--color-accent)' : 'var(--color-neutral-900)';
  }),
];

const STATE_NAMES = ['Grid', 'Rule', 'Accent', 'Motion'];

export default async function decorate(block) {
  const rows = [...block.children];

  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  // Figure column
  const figCol = document.createElement('div');
  figCol.className = 'figure-col';

  const gridFigure = document.createElement('div');
  gridFigure.className = 'grid-figure';
  const squares = [];
  for (let i = 0; i < 16; i += 1) {
    const sq = document.createElement('div');
    sq.className = 'sq';
    gridFigure.append(sq);
    squares.push(sq);
  }
  figCol.append(gridFigure);

  const gridCaption = document.createElement('div');
  gridCaption.className = 'grid-caption';
  const stepNum = document.createElement('span');
  stepNum.className = 'step-num';
  stepNum.textContent = '01';
  const stepName = document.createElement('span');
  stepName.className = 'step-name';
  stepName.textContent = 'Grid';
  const stepTotal = document.createElement('span');
  stepTotal.className = 'step-total';
  stepTotal.textContent = `of ${String(rows.length || 4).padStart(2, '0')}`;
  gridCaption.append(stepNum, stepName, stepTotal);
  figCol.append(gridCaption);

  wrap.append(figCol);

  // Steps column
  const stepsCol = document.createElement('div');
  stepsCol.className = 'steps-col';

  const steps = [];
  rows.forEach((row, i) => {
    const cells = [...row.children];
    const step = document.createElement('div');
    step.className = `step${i > 0 ? ' inactive' : ''}`;
    step.dataset.step = i;

    const label = document.createElement('span');
    label.className = 'step-label';
    label.textContent = cells[0]?.textContent?.trim() || `State ${String(i + 1).padStart(2, '0')}`;

    const textWrap = document.createElement('div');
    textWrap.className = 'step-text';
    const p = cells[1]?.querySelector('p');
    if (p) textWrap.append(p);
    else {
      const newP = document.createElement('p');
      newP.textContent = cells[1]?.textContent?.trim() || '';
      textWrap.append(newP);
    }

    step.append(label, textWrap);
    stepsCol.append(step);
    steps.push(step);
  });

  wrap.append(stepsCol);
  block.replaceChildren(wrap);

  // Apply initial state
  STATES[0](squares);

  // Observe steps
  let activeStep = 0;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const idx = parseInt(entry.target.dataset.step, 10);
      if (idx === activeStep) return;
      activeStep = idx;

      steps.forEach((s, i) => s.classList.toggle('inactive', i !== idx));

      // Reset delays
      squares.forEach((sq) => { sq.style.transitionDelay = '0ms'; });

      if (STATES[idx]) STATES[idx](squares);

      stepNum.textContent = String(idx + 1).padStart(2, '0');
      stepName.textContent = STATE_NAMES[idx] || '';
    });
  }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

  steps.forEach((s) => observer.observe(s));
}
