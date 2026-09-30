export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  const table = document.createElement('table');

  // First row is header
  const headerRow = rows[0];
  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  [...headerRow.children].forEach((cell) => {
    const th = document.createElement('th');
    th.textContent = cell.textContent.trim();
    tr.append(th);
  });
  thead.append(tr);
  table.append(thead);

  // Data rows
  const tbody = document.createElement('tbody');
  rows.slice(1).forEach((row) => {
    const dataRow = document.createElement('tr');
    [...row.children].forEach((cell) => {
      const td = document.createElement('td');
      td.textContent = cell.textContent.trim();
      dataRow.append(td);
    });
    tbody.append(dataRow);
  });
  table.append(tbody);

  wrap.append(table);
  block.replaceChildren(wrap);
}
