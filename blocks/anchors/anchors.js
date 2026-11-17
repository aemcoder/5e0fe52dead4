/**
 * anchors — ruled list of practices with roman numerals (i., ii., iii. …).
 * Decode tier: reconstructive (authors add/remove items).
 *
 * Section head (eyebrow + <h2>) is DEFAULT CONTENT authored above the block,
 * styled in place via `.anchors-container .default-content-wrapper`.
 *
 * Authoring: one row per item — cell holds an <h3> title + description paragraph(s).
 * Flattened single-cell content is segmented on the item heading.
 * Numerals are generated (CSS counter, aria-hidden).
 */

function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const kids = [...cell.children];
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
  const groups = [];
  collectNodes(block).forEach((n) => {
    if (/^H[2-6]$/.test(n.tagName) || !groups.length) groups.push([]);
    groups[groups.length - 1].push(n);
  });
  return groups;
}

export default function decorate(block) {
  const list = document.createElement('ol');
  list.className = 'anchors-list';

  segment(block).forEach((nodes) => {
    const li = document.createElement('li');
    li.className = 'anchor-item';

    const numeral = document.createElement('div');
    numeral.className = 'anchor-numeral';
    numeral.setAttribute('aria-hidden', 'true');

    const body = document.createElement('div');
    body.className = 'anchor-body';
    const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
    if (heading) {
      const title = document.createElement('div');
      title.className = 'anchor-title';
      title.append(heading);
      body.append(title);
    }
    const rest = nodes.filter((n) => n !== heading);
    if (rest.length) {
      const text = document.createElement('div');
      text.className = 'anchor-text';
      text.append(...rest);
      body.append(text);
    }

    li.append(numeral, body);
    list.append(li);
  });

  block.replaceChildren(list);
}
