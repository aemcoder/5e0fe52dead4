export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  const grid = document.createElement('div');
  grid.className = 'stat-grid';

  rows.forEach((row) => {
    const cells = [...row.children];
    const stat = document.createElement('div');
    stat.className = 'stat';

    const numEl = document.createElement('p');
    numEl.className = 'stat-number';
    const targetNum = parseInt(cells[0]?.textContent?.trim() || '0', 10);
    numEl.textContent = '0';
    numEl.dataset.target = targetNum;

    const labelEl = document.createElement('p');
    labelEl.className = 'stat-label';
    labelEl.textContent = cells[1]?.textContent?.trim() || '';

    stat.append(numEl, labelEl);
    grid.append(stat);
  });

  wrap.append(grid);
  block.replaceChildren(wrap);

  // Count-up animation with IntersectionObserver
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const numbers = grid.querySelectorAll('.stat-number');

  if (prefersReducedMotion) {
    numbers.forEach((el) => { el.textContent = el.dataset.target; });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const target = parseInt(entry.target.dataset.target, 10);
      const duration = 1200;
      const start = performance.now();
      const animate = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - (1 - progress) ** 3;
        entry.target.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    });
  }, { threshold: 0.3 });

  numbers.forEach((el) => observer.observe(el));
}
