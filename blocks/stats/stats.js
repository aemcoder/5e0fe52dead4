/**
 * stats — dark band with a hazard stripe: intro cell + grid of big yellow numbers.
 * Decode tier: reconstructive (authors add/remove stats).
 *
 * Intro: authored as DEFAULT CONTENT before the block (<h2> — <em> renders yellow — and
 * a <p>); reabsorbed as the first grid cell because it shares the stats grid.
 * Block rows: one per stat — <p>number</p><p>label</p> (one cell, or two cells).
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default async function decorate(block) {
  const grid = document.createElement('div');
  grid.className = 'grid';

  const source = block.parentElement?.previousElementSibling;
  if (source && source.classList.contains('default-content-wrapper')) {
    const intro = document.createElement('div');
    intro.className = 'item intro';
    const heading = source.querySelector('h1, h2, h3');
    if (heading) intro.append(wrapNode(heading, 'headline'));
    const text = document.createElement('div');
    text.className = 'intro-text';
    text.append(...source.children);
    if (text.children.length) intro.append(text);
    grid.append(intro);
    source.remove();
  }

  [...block.children].forEach((row) => {
    const ps = [...row.querySelectorAll('p, h2, h3, h4')];
    if (!ps.length) return;
    const [num, ...rest] = ps;
    const item = document.createElement('div');
    item.className = 'item';
    item.append(wrapNode(num, 'num'));
    if (rest.length) {
      const lab = document.createElement('div');
      lab.className = 'lab';
      lab.append(...rest);
      item.append(lab);
    }
    grid.append(item);
  });

  const stripe = document.createElement('div');
  stripe.className = 'stripe';
  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  wrap.append(grid);
  block.replaceChildren(stripe, wrap);
}
