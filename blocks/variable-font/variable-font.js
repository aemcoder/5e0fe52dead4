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

  const heading = nodes.find((n) => n.matches && n.matches('h2, h3, h4'));
  const textNodes = nodes.filter((n) => {
    if (n === heading) return false;
    if (n.matches && n.matches('h1, h2, h3, h4, h5, h6')) return false;
    return true;
  });

  const eyebrowNode = textNodes.find((n) => n.textContent.trim().length < 30);
  const bodyNode = textNodes.find((n) => n !== eyebrowNode && n.textContent.trim().length > 30);
  const specimenNode = textNodes.find((n) => n !== eyebrowNode && n !== bodyNode);

  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  // Intro
  const intro = document.createElement('div');
  intro.className = 'intro';

  const leftCol = document.createElement('div');
  if (eyebrowNode) {
    const ey = document.createElement('span');
    ey.className = 'eyebrow';
    ey.textContent = eyebrowNode.textContent.trim();
    leftCol.append(ey);
  }
  if (heading) {
    const hw = document.createElement('div');
    hw.className = 'headline';
    hw.append(heading);
    leftCol.append(hw);
  }
  intro.append(leftCol);

  if (bodyNode) {
    const bw = document.createElement('div');
    bw.className = 'body';
    bw.append(bodyNode);
    intro.append(bw);
  }
  wrap.append(intro);

  // Specimen
  const specimenText = specimenNode?.textContent?.trim() || 'Archivo';
  const specimen = document.createElement('div');
  specimen.className = 'specimen';
  specimen.textContent = specimenText;
  wrap.append(specimen);

  // Axes display
  const axes = document.createElement('div');
  axes.className = 'axes';
  const wghtSpan = document.createElement('span');
  wghtSpan.innerHTML = 'wght <span class="axis-value" data-axis="wght">400</span>';
  const wdthSpan = document.createElement('span');
  wdthSpan.innerHTML = 'wdth <span class="axis-value" data-axis="wdth">100</span>';
  axes.append(wghtSpan, wdthSpan);
  wrap.append(axes);

  block.replaceChildren(wrap);

  // Pointer interaction
  let wght = 400;
  let wdth = 100;

  specimen.addEventListener('pointermove', (e) => {
    const rect = specimen.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const yRatio = (e.clientY - rect.top) / rect.height;
    wght = Math.round(100 + xRatio * 800);
    wdth = Math.round(62 + (1 - yRatio) * 63);
    specimen.style.fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}`;
    axes.querySelector('[data-axis="wght"]').textContent = wght;
    axes.querySelector('[data-axis="wdth"]').textContent = wdth;
  });

  specimen.addEventListener('pointerleave', () => {
    wght = 400;
    wdth = 100;
    specimen.style.fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}`;
    axes.querySelector('[data-axis="wght"]').textContent = wght;
    axes.querySelector('[data-axis="wdth"]').textContent = wdth;
  });
}
