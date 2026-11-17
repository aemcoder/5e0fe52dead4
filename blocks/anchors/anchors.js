/**
 * anchors — ruled, roman-numbered list of practices (title + description per item).
 * The numerals (i., ii., …) are a CSS counter; decorate() adds no words.
 * The section head (eyebrow + <h2>) is authored as default content before the block.
 *
 * Authoring rows: one row per item — a single cell holding <h3> title + description <p>.
 */

export default function decorate(block) {
  const ol = document.createElement('ol');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const body = document.createElement('div');
    body.className = 'anchors-body';
    [...row.children].forEach((cell) => body.append(...cell.childNodes));
    if (!body.textContent.trim()) return;
    li.append(body);
    ol.append(li);
  });
  block.replaceChildren(ol);
}
