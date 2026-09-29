/**
 * quote — centred pull quote on a forest-green band (Block Collection "quote" shape).
 *
 * Decode tier: template-slotted. Authored elements are MOVED, never rebuilt.
 *
 * Authoring rows:
 *   1. the quotation (one or more paragraphs)
 *   2. attribution (optional) — authored as displayed, e.g. "— Epictetus"
 */

function collectCells(block) {
  return [...block.querySelectorAll(':scope > div > div')];
}

function cellParas(cell) {
  const kids = [...cell.children];
  if (kids.length) return kids;
  // HARNESS-ONLY fallback (EW5): bare text cell — wrap the existing text nodes.
  if (!cell.textContent.trim()) return [];
  const p = document.createElement('p');
  p.append(...cell.childNodes);
  return [p];
}

export default async function decorate(block) {
  const cells = collectCells(block).filter((c) => c.textContent.trim());
  if (!cells.length) return;
  const quoteCell = cells[0];
  const attrCell = cells.length > 1 ? cells[cells.length - 1] : null;

  const inner = document.createElement('div');
  inner.className = 'inner';

  const mark = document.createElement('span');
  mark.className = 'mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.textContent = '"';
  inner.append(mark);

  const bq = document.createElement('blockquote');
  const existing = quoteCell.querySelector('blockquote');
  if (existing) bq.append(...existing.children);
  else bq.append(...cellParas(quoteCell));
  inner.append(bq);

  if (attrCell) {
    const attr = document.createElement('div');
    attr.className = 'attribution';
    attr.append(...cellParas(attrCell));
    inner.append(attr);
  }

  block.replaceChildren(inner);
}
