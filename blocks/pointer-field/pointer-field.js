export default async function decorate(block) {
  block.textContent = '';

  const box = document.createElement('div');
  box.className = 'field-box';

  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 442;
  box.append(canvas);

  const label = document.createElement('span');
  label.className = 'field-label';
  label.textContent = 'Pointer field · Canvas 2D';
  box.append(label);

  block.append(box);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const COLS = 32;
  const ROWS = 11;
  let mouseX = -1;
  let mouseY = -1;
  let running = true;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  };

  const draw = () => {
    if (!running) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    const cellW = w / COLS;
    const cellH = h / ROWS;

    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        const cx = c * cellW + cellW / 2;
        const cy = r * cellH + cellH / 2;

        let dist = 9999;
        if (mouseX >= 0) {
          dist = Math.sqrt((mouseX - cx) ** 2 + (mouseY - cy) ** 2);
        }

        const maxDist = Math.sqrt(w ** 2 + h ** 2) * 0.3;
        const t = Math.max(0, 1 - dist / maxDist);
        const size = cellW * 0.15 + cellW * 0.6 * t;
        const isAccent = t > 0.5;

        ctx.fillStyle = isAccent ? '#ec3013' : `rgba(32, 30, 29, ${0.15 + t * 0.6})`;
        ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
      }
    }

    requestAnimationFrame(draw);
  };

  box.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  box.addEventListener('pointerleave', () => {
    mouseX = -1;
    mouseY = -1;
  });

  // Only run when visible
  const observer = new IntersectionObserver(([entry]) => {
    running = entry.isIntersecting;
    if (running) {
      resize();
      requestAnimationFrame(draw);
    }
  }, { threshold: 0.1 });
  observer.observe(box);

  resize();
  window.addEventListener('resize', resize, { passive: true });
  requestAnimationFrame(draw);
}
