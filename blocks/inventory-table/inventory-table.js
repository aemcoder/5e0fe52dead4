/**
 * loads and decorates the inventory table block
 * @param {Element} block The inventory-table block element
 */
export default async function decorate(block) {
  // Extract rows from block
  const rows = [...block.children];
  if (rows.length === 0) return;

  // Create table structure
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  // Process rows
  rows.forEach((row, rowIndex) => {
    const cells = [...row.children];
    if (cells.length === 0) return;

    if (rowIndex === 0) {
      // Header row
      const tr = document.createElement('tr');
      cells.forEach((cell) => {
        const th = document.createElement('th');
        th.innerHTML = cell.innerHTML;
        tr.append(th);
      });
      thead.append(tr);
    } else {
      // Data row
      const tr = document.createElement('tr');
      cells.forEach((cell, cellIndex) => {
        const td = document.createElement('td');
        td.innerHTML = cell.innerHTML;
        // First cell gets accent color
        if (cellIndex === 0) {
          td.classList.add('inventory-table-number');
        }
        tr.append(td);
      });
      tbody.append(tr);
    }
  });

  table.append(thead, tbody);

  // Wrap in scrollable container
  const container = document.createElement('div');
  container.className = 'inventory-table-scroll';
  container.append(table);

  // Wrap in content wrapper
  const wrap = document.createElement('div');
  wrap.className = 'inventory-table-wrap';
  wrap.append(container);

  // Clear block and add wrapped content
  block.innerHTML = '';
  block.append(wrap);
}
