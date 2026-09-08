const NUMERALS = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];

export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const list = document.createElement('div');
  list.className = 'anchors-list';

  rows.forEach((row, i) => {
    const cell = row.querySelector(':scope > div');
    if (!cell) return;

    const item = document.createElement('div');
    item.className = 'anchors-item';
    if (i === rows.length - 1) item.classList.add('anchors-item-last');

    // Numeral
    const numeral = document.createElement('span');
    numeral.className = 'anchors-numeral';
    numeral.textContent = NUMERALS[i] || String(i + 1);
    item.append(numeral);

    // Content
    const content = document.createElement('div');
    content.className = 'anchors-content';

    const heading = cell.querySelector('h3, h4');
    if (heading) {
      const hw = document.createElement('div');
      hw.className = 'anchors-title';
      hw.append(heading);
      content.append(hw);
    }

    const bodyP = [...cell.querySelectorAll('p')];
    bodyP.forEach(p => {
      const bw = document.createElement('div');
      bw.className = 'anchors-body';
      bw.append(p);
      content.append(bw);
    });

    item.append(content);
    list.append(item);
  });

  block.replaceChildren(list);
}
