/**
 * table — Block Collection table (inventory of motion systems).
 *
 * Authoring rows: first row = column headers, every following row = one
 * data row; up to four columns. Cell content is MOVED into th/td.
 */

export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  rows.forEach((row, i) => {
    const tr = document.createElement('tr');
    [...row.children].forEach((cell) => {
      const c = document.createElement(i === 0 ? 'th' : 'td');
      if (i === 0) c.scope = 'col';
      c.append(...cell.childNodes);
      tr.append(c);
    });
    (i === 0 ? thead : tbody).append(tr);
  });

  table.append(thead, tbody);
  const scroller = document.createElement('div');
  scroller.className = 'table-scroll';
  scroller.append(table);
  block.replaceChildren(scroller);
}
