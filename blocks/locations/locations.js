/**
 * Locations — yellow call-to-action band: copy + CTA beside a cloud of city chips.
 *
 * Authoring: one row, two cells:
 *   [<p>Eyebrow</p> <h2>…</h2> <p>…</p> <p><strong><em><a>Find Your Nearest Branch</a></em></strong></p>]
 *   [<ul><li>Salt Lake City</li> … <li>+ 7 more</li></ul>]
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  row.className = 'locations-grid';
  const cells = [...row.children];
  const list = row.querySelector('ul, ol');
  const listCell = list ? cells.find((c) => c.contains(list)) : null;
  const copy = cells.find((c) => c !== listCell) || cells[0];

  if (copy) {
    copy.className = 'locations-copy';
    const elements = [...copy.children];
    const heading = elements.find((el) => /^H[1-6]$/.test(el.tagName));
    const headingIndex = elements.indexOf(heading);
    elements.forEach((el, i) => {
      if (heading && i < headingIndex && el.tagName === 'P') el.classList.add('locations-eyebrow');
    });
  }
  if (listCell) {
    listCell.className = 'locations-cities';
    list.classList.add('locations-chips');
  }
}
