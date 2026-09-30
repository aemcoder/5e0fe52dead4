/**
 * Loads and decorates the stats block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const wrap = document.createElement('div');
  wrap.className = 'stats-wrap';

  const grid = document.createElement('div');
  grid.className = 'stats-grid';

  // Process each row
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const statItem = document.createElement('div');
      statItem.className = 'stats-item';

      // First cell: number
      const numCell = cells[0];
      const numDiv = document.createElement('div');
      numDiv.className = 'stat-num';
      while (numCell.firstChild) {
        numDiv.append(numCell.firstChild);
      }
      statItem.append(numDiv);

      // Second cell: label
      const labelCell = cells[1];
      const labelDiv = document.createElement('div');
      labelDiv.className = 'stat-label';
      while (labelCell.firstChild) {
        labelDiv.append(labelCell.firstChild);
      }
      statItem.append(labelDiv);

      grid.append(statItem);
    }
  });

  wrap.append(grid);
  block.replaceChildren(wrap);
}
