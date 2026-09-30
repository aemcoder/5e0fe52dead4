export default async function decorate(block) {
  const p = block.querySelector('p');
  if (!p) return;

  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  wrap.append(p);
  block.replaceChildren(wrap);
}
