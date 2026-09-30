export default async function decorate(block) {
  const line = document.createElement('div');
  line.className = 'line';
  block.replaceChildren(line);
}
