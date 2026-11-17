/**
 * Roman-numbered practice list.
 * Authored shape: one row per anchor, one cell holding an <h3> + body <p>.
 * The section eyebrow + <h2> are default content above the block.
 * Numerals (i., ii. …) are drawn by CSS counters.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ol = document.createElement('ol');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'anchors-item';
    const body = document.createElement('div');
    body.className = 'anchors-body';
    [...row.children].forEach((cell) => body.append(...cell.childNodes));
    li.append(body);
    if (body.textContent.trim()) ol.append(li);
  });
  block.replaceChildren(ol);
}
