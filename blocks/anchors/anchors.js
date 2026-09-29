/**
 * anchors — ruled numbered list ("Five anchors of a frugal life").
 * Each row: a terracotta roman numeral (generated) beside a serif <h3> and body.
 *
 * Decode tier: reconstructive — authors add/remove anchors freely.
 * The section eyebrow + <h2> are authored as DEFAULT CONTENT above the block.
 *
 * Authoring: one row per anchor — <h3> title + paragraph(s). A single-cell
 * flattened shape is segmented on the heading boundary.
 *
 * @ew-exempt numeral — "i.", "ii."… are derived from the row order, not authored.
 */

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];

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
  const list = document.createElement('div');
  list.className = 'list';

  groups.forEach((g, i) => {
    const item = document.createElement('div');
    item.className = 'anchor';

    const num = document.createElement('span');
    num.className = 'numeral';
    num.setAttribute('aria-hidden', 'true');
    num.textContent = `${ROMAN[i] || i + 1}.`;
    item.append(num);

    const text = document.createElement('div');
    text.className = 'text';
    if (g.heading) {
      const title = document.createElement('div');
      title.className = 'title';
      title.append(g.heading);
      text.append(title);
    }
    if (g.body.length) {
      const body = document.createElement('div');
      body.className = 'body';
      body.append(...g.body);
      text.append(body);
    }
    item.append(text);
    list.append(item);
  });

  block.replaceChildren(list);
}
