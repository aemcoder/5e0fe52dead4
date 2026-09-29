/**
 * pillars — numbered three-up grid ("Frugality heals in three ways").
 * Each unit: a large faint index number (generated), a serif <h3>, a short
 * terracotta rule (generated) and a body paragraph.
 *
 * Decode tier: reconstructive — authors add/remove units freely.
 * The section eyebrow + <h2> are authored as DEFAULT CONTENT above the block
 * and styled in place via .pillars-container .default-content-wrapper.
 *
 * Authoring: one row per unit — <h3> title + paragraph(s). A single-cell
 * flattened shape is segmented on the heading boundary.
 *
 * @ew-exempt number — "01", "02"… are derived from the unit order, not authored.
 */

function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length) out.push(...kids);
    // HARNESS-ONLY fallback (EW5): bare text cell — wrap the existing text nodes.
    else if (cell.textContent.trim()) {
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out;
}

function segment(nodes) {
  const isHeading = (n) => /^H[1-6]$/.test(n.tagName);
  const counts = {};
  nodes.filter(isHeading).forEach((h) => { counts[h.tagName] = (counts[h.tagName] || 0) + 1; });
  const unitTag = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  const groups = [];
  let current = null;
  nodes.forEach((n) => {
    if (n.tagName === unitTag || !current) {
      current = { heading: null, body: [] };
      groups.push(current);
    }
    if (n.tagName === unitTag) current.heading = n;
    else current.body.push(n);
  });
  return groups.filter((g) => g.heading || g.body.length);
}

export default async function decorate(block) {
  const groups = segment(collectNodes(block));
  const grid = document.createElement('div');
  grid.className = 'grid';

  groups.forEach((g, i) => {
    const item = document.createElement('div');
    item.className = 'pillar';

    const num = document.createElement('span');
    num.className = 'num';
    num.setAttribute('aria-hidden', 'true');
    num.textContent = String(i + 1).padStart(2, '0');
    item.append(num);

    if (g.heading) {
      const title = document.createElement('div');
      title.className = 'title';
      title.append(g.heading);
      item.append(title);
    }

    const rule = document.createElement('span');
    rule.className = 'rule';
    rule.setAttribute('aria-hidden', 'true');
    item.append(rule);

    if (g.body.length) {
      const body = document.createElement('div');
      body.className = 'body';
      body.append(...g.body);
      item.append(body);
    }
    grid.append(item);
  });

  block.replaceChildren(grid);
}
