export default async function decorate(block) {
  const wrap = document.createElement('div');
  wrap.className = 'closing-wrap';

  // Decorative circle
  const circle = document.createElement('div');
  circle.className = 'closing-circle';
  circle.setAttribute('aria-hidden', 'true');
  const dot = document.createElement('div');
  dot.className = 'closing-dot';
  circle.append(dot);
  wrap.append(circle);

  const heading = block.querySelector('h2, h3');
  if (heading) {
    const hw = document.createElement('div');
    hw.className = 'closing-headline';
    hw.append(heading);
    wrap.append(hw);
  }

  const allPs = [...block.querySelectorAll('p')];
  const bodyP = allPs.find(p => !p.querySelector('a, picture, img'));
  if (bodyP) {
    const bw = document.createElement('div');
    bw.className = 'closing-body';
    bw.append(bodyP);
    wrap.append(bw);
  }

  // Decorative line
  const line = document.createElement('div');
  line.className = 'closing-line';
  wrap.append(line);

  block.replaceChildren(wrap);
}
