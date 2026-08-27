/**
 * Benefits — section with eyebrow + heading, then a 3-column numbered grid
 *
 * Authoring (flat siblings in one cell):
 *   <p> eyebrow text
 *   <h2> section heading
 *   <h3> card title (repeats — each h3 starts a new card)
 *   <p> card description
 *
 * The block auto-numbers cards 01, 02, 03...
 */
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
  wrap.className = 'benefits-wrap';

  // Section head
  const head = document.createElement('div');
  head.className = 'benefits-head';

  const eyebrow = nodes.find((n) => n.matches?.('p') && !n.querySelector('a'));
  const h2 = nodes.find((n) => n.matches?.('h2'));

  if (eyebrow) {
    eyebrow.className = 'benefits-eyebrow';
    head.append(eyebrow);
  }

  if (h2) {
    h2.className = 'benefits-title';
    head.append(h2);
  }

  wrap.append(head);

  // Cards — segment by h3 headings
  const h3s = nodes.filter((n) => n.matches?.('h3'));
  if (h3s.length) {
    const grid = document.createElement('div');
    grid.className = 'benefits-grid';

    h3s.forEach((h3, i) => {
      const card = document.createElement('div');
      card.className = 'benefits-card';

      const num = document.createElement('div');
      num.className = 'benefits-num';
      num.textContent = String(i + 1).padStart(2, '0');
      card.append(num);

      const title = document.createElement('h3');
      title.className = 'benefits-card-title';
      title.textContent = h3.textContent;
      card.append(title);

      const accent = document.createElement('div');
      accent.className = 'benefits-accent';
      accent.setAttribute('aria-hidden', 'true');
      card.append(accent);

      // Collect description: all siblings after this h3 until next h3 or end
      const startIdx = nodes.indexOf(h3);
      const nextH3 = h3s[i + 1];
      const endIdx = nextH3 ? nodes.indexOf(nextH3) : nodes.length;

      for (let j = startIdx + 1; j < endIdx; j += 1) {
        const n = nodes[j];
        if (n.matches?.('p')) {
          const desc = document.createElement('p');
          desc.className = 'benefits-card-desc';
          desc.textContent = n.textContent;
          card.append(desc);
        }
      }

      grid.append(card);
    });

    wrap.append(grid);
  }

  block.replaceChildren(wrap);
}
