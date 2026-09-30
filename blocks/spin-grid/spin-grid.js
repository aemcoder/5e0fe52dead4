export default async function decorate(block) {
  const nodes = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length) nodes.push(...kids);
    else if (cell.textContent.trim()) {
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      nodes.push(p);
    }
  });

  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  const textCol = document.createElement('div');
  textCol.className = 'text-col';

  const heading = nodes.find((n) => n.matches && n.matches('h2, h3, h4'));
  const textNodes = nodes.filter((n) => {
    if (n === heading) return false;
    if (n.matches && n.matches('h1, h2, h3, h4, h5, h6')) return false;
    return true;
  });

  const eyebrowNode = textNodes.find((n) => n.textContent.trim().length < 30);
  const bodyNode = textNodes.find((n) => n !== eyebrowNode && n.textContent.trim().length > 30);

  if (eyebrowNode) {
    const ey = document.createElement('span');
    ey.className = 'eyebrow';
    ey.textContent = eyebrowNode.textContent.trim();
    textCol.append(ey);
  }

  if (heading) {
    const hw = document.createElement('div');
    hw.className = 'headline';
    hw.append(heading);
    textCol.append(hw);
  }

  if (bodyNode) {
    const bw = document.createElement('div');
    bw.className = 'body';
    bw.append(bodyNode);
    textCol.append(bw);
  }

  wrap.append(textCol);

  // Build the 4x4 grid
  const gridCol = document.createElement('div');
  gridCol.className = 'grid-col';
  // Pattern: accent, dark alternating with offset rows
  const pattern = [
    'accent', 'dark', 'accent', 'dark',
    'dark', 'accent', 'dark', 'accent',
    'accent', 'dark', 'accent', 'dark',
  ];
  const ranges = [30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60, 63];

  pattern.forEach((cls, i) => {
    const sq = document.createElement('div');
    sq.className = `sq ${cls}`;
    sq.style.animationRange = `entry cover ${ranges[i]}%`;
    gridCol.append(sq);
  });

  wrap.append(gridCol);
  block.replaceChildren(wrap);
}
