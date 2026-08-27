/**
 * Anchors — numbered list of principles with roman-numeral markers
 *
 * Authoring (flat siblings in one cell):
 *   <p> eyebrow
 *   <h2> section heading
 *   <h3> anchor title (repeats — each h3 starts a new item)
 *   <p> anchor description
 *
 * The block auto-adds roman numeral markers (i. ii. iii. iv. v.)
 */
const NUMERALS = ['i.', 'ii.', 'iii.', 'iv.', 'v.', 'vi.', 'vii.', 'viii.', 'ix.', 'x.'];

export default async function decorate(block) {
  const nodes = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length) nodes.push(...kids);
    else if (cell.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = cell.textContent.trim();
      nodes.push(p);
    }
  });
  if (!nodes.length) return;

  const wrap = document.createElement('div');
  wrap.className = 'anchors-wrap';

  // Section head
  const head = document.createElement('div');
  head.className = 'anchors-head';

  const eyebrow = nodes.find((n) => n.matches?.('p') && !n.querySelector('a'));
  const h2 = nodes.find((n) => n.matches?.('h2'));

  if (eyebrow) {
    eyebrow.className = 'anchors-eyebrow';
    head.append(eyebrow);
  }

  if (h2) {
    h2.className = 'anchors-title';
    head.append(h2);
  }

  wrap.append(head);

  // Items — segment by h3 headings
  const headings = nodes.filter((n) => n.matches?.('h3, h4'));
  if (headings.length) {
    const list = document.createElement('div');
    list.className = 'anchors-list';

    headings.forEach((heading, i) => {
      const item = document.createElement('div');
      item.className = 'anchors-item';
      if (i === headings.length - 1) item.classList.add('anchors-item-last');

      const numeral = document.createElement('span');
      numeral.className = 'anchors-numeral';
      numeral.textContent = NUMERALS[i] || `${i + 1}.`;

      const content = document.createElement('div');
      content.className = 'anchors-item-content';

      const title = document.createElement('h3');
      title.className = 'anchors-item-title';
      title.textContent = heading.textContent;
      content.append(title);

      // Collect description: all siblings after this heading until next heading or end
      const startIdx = nodes.indexOf(heading);
      const nextH = headings[i + 1];
      const endIdx = nextH ? nodes.indexOf(nextH) : nodes.length;

      for (let j = startIdx + 1; j < endIdx; j += 1) {
        const n = nodes[j];
        if (n.matches?.('p')) {
          const desc = document.createElement('p');
          desc.className = 'anchors-item-desc';
          desc.textContent = n.textContent;
          content.append(desc);
        }
      }

      item.append(numeral, content);
      list.append(item);
    });

    wrap.append(list);
  }

  block.replaceChildren(wrap);
}
