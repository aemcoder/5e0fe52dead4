/**
 * essay-closing — the dark coda that ends the essay.
 *
 * Authoring rows (one cell each):
 *   1. closing statement (<h2>; wrap the accent word in <em>)
 *   2. closing paragraph
 *
 * The dot mark above the statement and the hairline below it are decorative and
 * generated here. Authored elements are MOVED into the generated wrappers so
 * they stay inline-editable (EW1/EW2).
 */

/**
 * Recovers the authored elements of one block cell, expanding the single <p>
 * the runtime's wrapTextNodes folds a media-led cell into (#104).
 * @param {Element} cell a block cell
 * @returns {Element[]} the authored elements of that cell
 */
function cellNodes(cell) {
  let kids = [...cell.children];
  if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
    && kids[0].querySelector('picture, img')) {
    kids = [...kids[0].childNodes].map((n) => {
      if (n.nodeType === 1) return n;
      if (n.textContent.trim()) {
        const p = document.createElement('p');
        p.append(n);
        return p;
      }
      return null;
    }).filter(Boolean);
  }
  if (kids.length) return kids;
  if (cell.textContent.trim()) {
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    return [p];
  }
  return [];
}

export default function decorate(block) {
  const nodes = [...block.querySelectorAll(':scope > div > div')]
    .flatMap(cellNodes)
    .filter((n) => n.textContent.trim());
  if (!nodes.length) return;

  const wrap = document.createElement('div');
  wrap.className = 'essay-closing-wrap';

  const mark = document.createElement('span');
  mark.className = 'essay-closing-mark';
  mark.setAttribute('aria-hidden', 'true');
  wrap.append(mark);

  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  if (heading) {
    const statement = document.createElement('div');
    statement.className = 'essay-closing-statement';
    statement.append(heading);
    wrap.append(statement);
  }

  const rest = nodes.filter((n) => n !== heading);
  if (rest.length) {
    const copy = document.createElement('div');
    copy.className = 'essay-closing-copy';
    copy.append(...rest);
    wrap.append(copy);
  }

  const rule = document.createElement('span');
  rule.className = 'essay-closing-rule';
  rule.setAttribute('aria-hidden', 'true');
  wrap.append(rule);

  block.replaceChildren(wrap);
}
