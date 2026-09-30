export default async function decorate(block) {
  const nodes = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length) nodes.push(...kids);
    else if (cell.textContent.trim()) {
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      nodes.push(p);
    }
  });

  const heading = nodes.find((n) => n.matches && n.matches('h1, h2, h3, h4'));
  const ctaParas = nodes.filter((n) => n.querySelector && n.querySelector('a'));

  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  if (heading) {
    const hw = document.createElement('div');
    hw.className = 'headline';
    hw.append(heading);
    wrap.append(hw);
  }

  if (ctaParas.length) {
    const actions = document.createElement('div');
    actions.className = 'actions';
    ctaParas.forEach((p) => actions.append(p));
    wrap.append(actions);
  }

  // Build marquee
  const marqueeWrap = document.createElement('div');
  marqueeWrap.className = 'closing-marquee';
  const track = document.createElement('div');
  track.className = 'marquee-track';

  const items = ['Field Guide', 'The page moves'];
  const buildSet = () => {
    const set = document.createElement('div');
    set.className = 'marquee-set';
    items.forEach((text) => {
      const span = document.createElement('span');
      span.textContent = text;
      set.append(span);
      const dot = document.createElement('span');
      dot.className = 'marquee-dot';
      dot.setAttribute('aria-hidden', 'true');
      set.append(dot);
    });
    return set;
  };

  track.append(buildSet());
  track.append(buildSet());
  marqueeWrap.append(track);

  block.replaceChildren(wrap, marqueeWrap);
}
