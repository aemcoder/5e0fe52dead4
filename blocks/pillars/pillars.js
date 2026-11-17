/**
 * Numbered pillars (three-up).
 * Authored shape: one row per pillar, one cell holding an <h3> + body <p>.
 * The section eyebrow + <h2> are default content above the block.
 * Ordinals (01, 02 …) and the accent rule are drawn by CSS.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ol = document.createElement('ol');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'pillars-item';
    [...row.children].forEach((cell) => li.append(...cell.childNodes));
    if (li.textContent.trim()) ol.append(li);
  });
  block.replaceChildren(ol);
}
