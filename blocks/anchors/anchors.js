/**
 * anchors — a numbered list of practice items ("Five anchors of a frugal life").
 *
 * Section head (eyebrow + h2) is authored as default content ABOVE this block
 * and styled via .anchors-container .default-content-wrapper (D1).
 *
 * Authoring: one row per anchor; each cell holds an <h4> title and a <p>.
 * Falls back to segmenting a single flattened cell on the <h4> boundary (#52).
 * The lower-roman numeral is a CSS counter; authored h4/p are MOVED (EW1).
 */
function collectGroups(block) {
  const rows = [...block.children];
  const rowGroups = rows
    .map((row) => [...row.children].flatMap((cell) => [...cell.children]))
    .filter((nodes) => nodes.some((n) => /^H[1-6]$/.test(n.tagName)));
  if (rowGroups.length >= 2) return rowGroups;

  const flat = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => flat.push(...cell.children));
  const groups = [];
  let current = null;
  flat.forEach((node) => {
    if (/^H[1-6]$/.test(node.tagName)) {
      current = [];
      groups.push(current);
    }
    if (current) current.push(node);
  });
  return groups.length ? groups : rowGroups;
}

export default async function decorate(block) {
  const groups = collectGroups(block);

  const list = document.createElement('div');
  list.className = 'anchors-list';

  groups.forEach((nodes) => {
    const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
    const body = nodes.filter((n) => n.tagName === 'P');

    const item = document.createElement('div');
    item.className = 'anchors-item';

    const num = document.createElement('span');
    num.className = 'anchors-num';
    num.setAttribute('aria-hidden', 'true');
    item.append(num);

    const content = document.createElement('div');
    content.className = 'anchors-content';
    if (heading) {
      const t = document.createElement('div');
      t.className = 'anchors-title';
      t.append(heading);
      content.append(t);
    }
    if (body.length) content.append(...body);
    item.append(content);

    list.append(item);
  });

  block.replaceChildren(list);
}
