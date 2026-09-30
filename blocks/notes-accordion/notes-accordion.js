export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  // Check if first row is a heading (the "Notes" intro)
  const nodes = [];
  rows.forEach((row) => {
    [...row.children].forEach((cell) => {
      const kids = [...cell.children];
      if (kids.length) nodes.push(...kids);
      else if (cell.textContent.trim()) {
        const p = document.createElement('p');
        p.append(...cell.childNodes);
        nodes.push(p);
      }
    });
  });

  // Find heading and eyebrow (for the intro text)
  const heading = nodes.find((n) => n.matches && n.matches('h2, h3, h4'));
  const eyebrowNode = nodes.find((n) => {
    if (n === heading) return false;
    if (n.matches && n.matches('h1, h2, h3, h4, h5, h6')) return false;
    return n.textContent.trim().length < 20;
  });

  // Remaining nodes are Q/A pairs
  const qaNodes = nodes.filter((n) => n !== heading && n !== eyebrowNode);

  // Build head section
  if (heading || eyebrowNode) {
    const head = document.createElement('div');
    head.className = 'head';
    if (eyebrowNode) {
      const ey = document.createElement('span');
      ey.className = 'eyebrow';
      ey.textContent = eyebrowNode.textContent.trim();
      head.append(ey);
    }
    if (heading) {
      const hw = document.createElement('div');
      hw.className = 'headline';
      hw.append(heading);
      head.append(hw);
    }
    wrap.append(head);
  }

  // Build accordion
  const list = document.createElement('div');
  list.className = 'accordion-list';

  // Pair up: odd = question, even = answer
  for (let i = 0; i < qaNodes.length; i += 2) {
    const question = qaNodes[i]?.textContent?.trim() || '';
    const answer = qaNodes[i + 1];

    const item = document.createElement('div');
    item.className = 'accordion-item';
    item.setAttribute('aria-expanded', i === 0 ? 'true' : 'false');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'accordion-trigger';

    const num = document.createElement('span');
    num.className = 'accordion-num';
    num.textContent = String(Math.floor(i / 2) + 1).padStart(2, '0');

    const title = document.createElement('span');
    title.className = 'accordion-title';
    title.textContent = question;

    const icon = document.createElement('span');
    icon.className = 'accordion-icon';

    trigger.append(num, title, icon);

    const panel = document.createElement('div');
    panel.className = 'accordion-panel';
    const panelInner = document.createElement('div');
    panelInner.className = 'accordion-panel-inner';
    if (answer) panelInner.append(answer);
    panel.append(panelInner);

    item.append(trigger, panel);

    trigger.addEventListener('click', () => {
      const isOpen = item.getAttribute('aria-expanded') === 'true';
      item.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });

    list.append(item);
  }

  wrap.append(list);
  block.replaceChildren(wrap);
}
