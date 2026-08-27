/**
 * Hero — dark, centered essay intro with decorative circles
 *
 * Authoring (single cell, flat siblings):
 *   <p> eyebrow
 *   <h1> headline — <em> wraps the accent word
 *   <p><em> subtitle / lede (italic)
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

  const h1 = nodes.find((n) => n.matches?.('h1'));
  const eyebrow = nodes.find((n) => n.matches?.('p') && n !== h1 && !n.querySelector('em') && !n.querySelector('a'));
  const lede = nodes.find((n) => n.matches?.('p') && n !== eyebrow && (n.querySelector('em') || n.querySelector('i')));

  const wrap = document.createElement('div');
  wrap.className = 'hero-wrap';

  // Decorative background circles
  wrap.innerHTML = `
    <div class="hero-circle hero-circle-1" aria-hidden="true"></div>
    <div class="hero-circle hero-circle-2" aria-hidden="true"></div>
    <div class="hero-circle hero-circle-3" aria-hidden="true"></div>
  `;

  const content = document.createElement('div');
  content.className = 'hero-content';

  if (eyebrow) {
    eyebrow.className = 'hero-eyebrow';
    content.append(eyebrow);
  }

  if (h1) {
    h1.className = 'hero-headline';
    content.append(h1);
  }

  // Decorative divider line
  const divider = document.createElement('div');
  divider.className = 'hero-divider';
  divider.setAttribute('aria-hidden', 'true');
  content.append(divider);

  if (lede) {
    lede.className = 'hero-lede';
    content.append(lede);
  }

  wrap.append(content);
  block.replaceChildren(wrap);
}
