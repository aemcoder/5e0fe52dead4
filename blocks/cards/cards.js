/**
 * cards — numbered feature cards ("Frugality heals in three ways").
 *
 * Section head (eyebrow + h2) is authored as default content ABOVE this block
 * and styled in place via .cards-container .default-content-wrapper (D1).
 *
 * Authoring: one row per card; each card cell holds an <h3> title and a <p>.
 * Falls back to segmenting a single flattened cell on the <h3> boundary (#52).
 * The big index number and hairline rule are decorative CSS; authored h3/p are
 * MOVED into wrappers (EW1).
 */
function collectNodes(block) {
  const rows = [...block.children];
  // one-row-per-card
  const rowGroups = rows
    .map((row) => [...row.children].flatMap((cell) => [...cell.children]))
    .filter((nodes) => nodes.some((n) => /^H[1-6]$/.test(n.tagName)));
  if (rowGroups.length >= 2) return rowGroups;

  // flattened single cell → segment on heading boundary
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
  const groups = collectNodes(block);

  const grid = document.createElement('div');
  grid.className = 'cards-grid';

  groups.forEach((nodes) => {
    const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
    const body = nodes.filter((n) => n.tagName === 'P');

    const card = document.createElement('div');
    card.className = 'cards-card';

    const num = document.createElement('span');
    num.className = 'cards-num';
    num.setAttribute('aria-hidden', 'true');
    card.append(num);

    if (heading) {
      const t = document.createElement('div');
      t.className = 'cards-title';
      t.append(heading);
      card.append(t);
    }

    const rule = document.createElement('span');
    rule.className = 'cards-rule';
    rule.setAttribute('aria-hidden', 'true');
    card.append(rule);

    if (body.length) {
      const b = document.createElement('div');
      b.className = 'cards-body';
      b.append(...body);
      card.append(b);
    }

    grid.append(card);
  });

  block.replaceChildren(grid);
}
