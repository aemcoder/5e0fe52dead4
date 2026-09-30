export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // Query content before moving
  const heading = block.querySelector('h1, h2');
  const ps = [...block.querySelectorAll('p')];
  const lede = ps.find((p) => !p.querySelector('a, picture, img') && p.textContent.trim().length > 30);
  const ctas = ps.filter((p) => p.querySelector('a'));

  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  if (heading) {
    const headlineWrap = document.createElement('div');
    headlineWrap.className = 'headline';
    headlineWrap.append(heading);
    wrap.append(headlineWrap);
  }

  const content = document.createElement('div');
  content.className = 'content';

  if (lede) {
    const ledeWrap = document.createElement('div');
    ledeWrap.className = 'lede';
    ledeWrap.append(lede);
    content.append(ledeWrap);
  }

  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'actions';
    ctas.forEach((p) => actions.append(p));
    content.append(actions);
  }

  wrap.append(content);
  block.replaceChildren(wrap);
}
