/**
 * Loads and decorates the hero block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // Collect all nodes from cells
  const nodes = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    nodes.push(...cell.children);
  });
  if (!nodes.length) return;

  const wrap = document.createElement('div');
  wrap.className = 'hero-wrap';

  // Decorative circles (generated in CSS via ::before/::after on wrap, plus one extra div)
  const decor = document.createElement('div');
  decor.className = 'hero-decor';
  wrap.append(decor);

  // Find elements by type
  const heading = block.querySelector('h1, h2');
  const allPs = [...block.querySelectorAll('p')];
  // Eyebrow: first short p before heading
  const eyebrow = allPs.find(p => !p.querySelector('a, picture, img') && p.textContent.trim().length < 80);
  // Lede: next p after eyebrow that's not the eyebrow
  const lede = allPs.find(p => p !== eyebrow && !p.querySelector('a, picture, img'));

  if (eyebrow) {
    const eyebrowWrap = document.createElement('div');
    eyebrowWrap.className = 'hero-eyebrow';
    eyebrowWrap.append(eyebrow);
    wrap.append(eyebrowWrap);
  }

  if (heading) {
    const headlineWrap = document.createElement('div');
    headlineWrap.className = 'hero-headline';
    headlineWrap.append(heading);
    wrap.append(headlineWrap);
  }

  // Decorative line
  const line = document.createElement('div');
  line.className = 'hero-line';
  wrap.append(line);

  if (lede) {
    const ledeWrap = document.createElement('div');
    ledeWrap.className = 'hero-lede';
    ledeWrap.append(lede);
    wrap.append(ledeWrap);
  }

  block.replaceChildren(wrap);
}
