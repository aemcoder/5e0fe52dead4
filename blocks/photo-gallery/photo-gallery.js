export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  const frames = [];
  rows.forEach((row) => {
    const cells = [...row.children];
    const img = cells[0]?.querySelector('picture, img');
    const labelText = cells[1]?.textContent?.trim() || '';
    // Parse roll from label like "Roll 1 · Frame 01"
    const rollMatch = labelText.match(/Roll\s*(\d+)/i);
    const roll = rollMatch ? rollMatch[1] : 'all';
    frames.push({ img, label: labelText, roll });
  });

  // Toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'toolbar';

  const seg = document.createElement('div');
  seg.className = 'seg';
  seg.setAttribute('role', 'radiogroup');
  seg.setAttribute('aria-label', 'Filter by roll');

  const rolls = ['all', '1', '2', '3'];
  const rollLabels = ['All', 'Roll 1', 'Roll 2', 'Roll 3'];

  rolls.forEach((val, i) => {
    const label = document.createElement('label');
    label.className = 'seg-opt';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'fg-roll';
    input.value = val;
    if (i === 0) input.checked = true;
    label.append(input);
    label.append(document.createTextNode(rollLabels[i]));
    seg.append(label);
  });

  toolbar.append(seg);

  const countSpan = document.createElement('span');
  countSpan.className = 'frame-count';
  countSpan.textContent = `${frames.length} frames`;
  toolbar.append(countSpan);

  wrap.append(toolbar);

  // Grid
  const grid = document.createElement('div');
  grid.className = 'grid';

  const frameEls = [];
  frames.forEach(({ img, label, roll }) => {
    const frameEl = document.createElement('div');
    frameEl.className = 'frame';
    frameEl.dataset.roll = roll;
    if (img) frameEl.append(img);

    const labelEl = document.createElement('span');
    labelEl.className = 'frame-label';
    labelEl.textContent = label;
    frameEl.append(labelEl);

    grid.append(frameEl);
    frameEls.push(frameEl);
  });

  wrap.append(grid);
  block.replaceChildren(wrap);

  // Filter logic
  seg.addEventListener('change', (e) => {
    const val = e.target.value;
    let visCount = 0;
    frameEls.forEach((el) => {
      const show = val === 'all' || el.dataset.roll === val;
      el.classList.toggle('hidden', !show);
      if (show) visCount += 1;
    });
    countSpan.textContent = `${visCount} frame${visCount !== 1 ? 's' : ''}`;
  });
}
