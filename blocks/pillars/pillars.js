/**
 * pillars — numbered feature cards ("Frugality heals in three ways").
 *
 * The section eyebrow + heading are authored as DEFAULT CONTENT above the block
 * (styled via .pillars-container). This block holds only the cards.
 *
 * Authoring: one row per card, each cell:
 *   1. <h3> card title
 *   2. <p>  description
 * The big index number and the rule are generated (decorative), not authored.
 */
function segment(block) {
  const rows = [...block.children];
  const withHeading = rows.filter((r) => r.querySelector('h2, h3, h4'));
  if (withHeading.length >= 2) {
    return rows.map((r) => [...(r.firstElementChild ? r.firstElementChild.children : r.children)]);
  }
  // flattened single-cell fallback — segment by heading boundary
  const cell = rows[0] && rows[0].firstElementChild ? rows[0].firstElementChild : rows[0];
  const nodes = cell ? [...cell.children] : [];
  const groups = [];
  let cur = null;
  nodes.forEach((n) => {
    if (n.matches('h2, h3, h4')) {
      cur = [n];
      groups.push(cur);
    } else if (cur) {
      cur.push(n);
    }
  });
  return groups;
}

export default async function decorate(block) {
  const cards = segment(block);

  const grid = document.createElement('div');
  grid.className = 'pillars-grid';

  cards.forEach((nodes, i) => {
    if (!nodes.length) return;
    const card = document.createElement('div');
    card.className = 'pillar';

    const num = document.createElement('div');
    num.className = 'pillar-num';
    num.setAttribute('aria-hidden', 'true');
    num.textContent = String(i + 1).padStart(2, '0');
    card.append(num);

    const heading = nodes.find((n) => n.matches && n.matches('h1, h2, h3, h4, h5, h6'));
    if (heading) {
      const hw = document.createElement('div');
      hw.className = 'pillar-title';
      hw.append(heading);
      card.append(hw);
    }

    const rule = document.createElement('div');
    rule.className = 'pillar-rule';
    rule.setAttribute('aria-hidden', 'true');
    card.append(rule);

    const body = nodes.filter((n) => n !== heading);
    if (body.length) {
      const bw = document.createElement('div');
      bw.className = 'pillar-body';
      bw.append(...body);
      card.append(bw);
    }

    grid.append(card);
  });

  block.replaceChildren(grid);
}
