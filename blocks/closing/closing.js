/**
 * Closing — dark centered section with decorative element, heading, body, divider
 *
 * Authoring (flat siblings in one cell):
 *   <h2> heading — <em> wraps the accent word
 *   <p> body paragraph
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
  wrap.className = 'closing-wrap';

  const inner = document.createElement('div');
  inner.className = 'closing-inner';

  // Decorative circle/dot element
  inner.innerHTML = `
    <div class="closing-ornament" aria-hidden="true">
      <div class="closing-dot"></div>
    </div>
  `;

  // Heading
  const h2 = nodes.find((n) => n.matches?.('h2'));
  if (h2) {
    h2.className = 'closing-headline';
    inner.append(h2);
  }

  // Body paragraph(s)
  const paragraphs = nodes.filter((n) => n.matches?.('p'));
  paragraphs.forEach((p) => {
    const body = document.createElement('p');
    body.className = 'closing-body';
    body.innerHTML = p.innerHTML;
    inner.append(body);
  });

  // Bottom divider line
  const divider = document.createElement('div');
  divider.className = 'closing-divider';
  divider.setAttribute('aria-hidden', 'true');
  inner.append(divider);

  wrap.append(inner);
  block.replaceChildren(wrap);
}
