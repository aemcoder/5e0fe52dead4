/**
 * Prose — centered essay text with lead paragraph (serif) + body paragraph (sans)
 *
 * Authoring (one row per paragraph):
 *   Row 1: lead paragraph (rendered in display serif, larger)
 *   Row 2+: body paragraphs (rendered in body sans)
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
  wrap.className = 'prose-wrap';

  const paragraphs = nodes.filter((n) => n.matches?.('p'));
  paragraphs.forEach((p, i) => {
    if (i === 0) {
      p.className = 'prose-lead';
    } else {
      p.className = 'prose-body';
    }
    wrap.append(p);
  });

  block.replaceChildren(wrap);
}
