export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const grid = document.createElement('div');
  grid.className = 'benefits-grid';

  rows.forEach((row, i) => {
    const cell = row.querySelector(':scope > div');
    if (!cell) return;

    const card = document.createElement('div');
    card.className = 'benefits-card';

    // Find heading
    const heading = cell.querySelector('h3, h4');
    // All paragraphs
    const allPs = [...cell.querySelectorAll('p')];

    // Number: first short <p> that looks like a number (01, 02, etc.)
    const numP = allPs.find(p => /^\d{1,2}$/.test(p.textContent.trim()));
    // Body: paragraph that's not the number
    const bodyP = allPs.find(p => p !== numP);

    // Number display
    const numEl = document.createElement('div');
    numEl.className = 'benefits-num';
    numEl.textContent = numP ? numP.textContent.trim() : String(i + 1).padStart(2, '0');
    card.append(numEl);

    if (heading) {
      const titleWrap = document.createElement('div');
      titleWrap.className = 'benefits-title';
      titleWrap.append(heading);
      card.append(titleWrap);
    }

    // Decorative line
    const line = document.createElement('div');
    line.className = 'benefits-line';
    card.append(line);

    if (bodyP) {
      const bodyWrap = document.createElement('div');
      bodyWrap.className = 'benefits-body';
      bodyWrap.append(bodyP);
      card.append(bodyWrap);
    }

    grid.append(card);
  });

  block.replaceChildren(grid);
}
