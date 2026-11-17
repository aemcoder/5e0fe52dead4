/**
 * numbered-cards — responsive grid of numbered pillars (01, 02, 03 …).
 * Decode tier: reconstructive (authors add/remove cards).
 *
 * Section head (eyebrow + <h2>) is DEFAULT CONTENT authored above the block;
 * it is styled in place via `.numbered-cards-container .default-content-wrapper`.
 *
 * Authoring: one row per card — cell holds an <h3> title + body paragraph(s).
 * Flattened single-cell content is segmented on the card heading.
 * Numbers and the accent rule are generated (CSS counter, aria-hidden).
 */

function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    let kids = [...cell.children];
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].querySelector('picture, img')) {
      kids = [...kids[0].childNodes].filter((n) => n.nodeType === 1);
    }
    if (kids.length) out.push(...kids);
    else if (cell.textContent.trim()) {
      // harness-only fallback: wrap existing text nodes (never fires on DA content)
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out;
}

function segment(block) {
  const rows = [...block.children];
  const headingRows = rows.filter((r) => r.querySelector('h2, h3, h4, h5, h6'));
  if (headingRows.length >= 2) {
    return headingRows.map((r) => [...r.querySelectorAll(':scope > div > *')]);
  }
  const nodes = collectNodes(block);
  const groups = [];
  nodes.forEach((n) => {
    if (/^H[2-6]$/.test(n.tagName) || !groups.length) groups.push([]);
    groups[groups.length - 1].push(n);
  });
  return groups;
}

export default function decorate(block) {
  const groups = segment(block);
  const list = document.createElement('ul');
  list.className = 'numbered-cards-list';

  groups.forEach((nodes) => {
    const li = document.createElement('li');
    li.className = 'numbered-card';

    const number = document.createElement('div');
    number.className = 'numbered-card-number';
    number.setAttribute('aria-hidden', 'true');
    li.append(number);

    const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
    if (heading) {
      const title = document.createElement('div');
      title.className = 'numbered-card-title';
      title.append(heading);
      li.append(title);
    }

    const rule = document.createElement('div');
    rule.className = 'numbered-card-rule';
    rule.setAttribute('aria-hidden', 'true');
    li.append(rule);

    const rest = nodes.filter((n) => n !== heading);
    if (rest.length) {
      const body = document.createElement('div');
      body.className = 'numbered-card-body';
      body.append(...rest);
      li.append(body);
    }
    list.append(li);
  });

  block.replaceChildren(list);
}
