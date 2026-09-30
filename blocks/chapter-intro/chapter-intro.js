export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // Collect all nodes from the flattened structure
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

  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  const head = document.createElement('div');
  head.className = 'head';

  // Find heading
  const heading = nodes.find((n) => n.matches && n.matches('h1, h2, h3, h4'));
  // First short text before heading is likely the chapter number
  // Second short text is the eyebrow
  const textNodes = nodes.filter((n) => {
    if (n === heading) return false;
    if (n.matches && n.matches('h1, h2, h3, h4, h5, h6')) return false;
    if (n.querySelector && n.querySelector('a')) return false;
    return true;
  });

  // Chapter number: very short text, usually 2 chars
  const numNode = textNodes.find((n) => n.textContent.trim().length <= 3);
  // Eyebrow: short text with "Chapter" or contains " — "
  const eyebrowNode = textNodes.find((n) => n !== numNode && n.textContent.trim().length < 60);
  // Body: longer text
  const bodyNode = textNodes.find((n) => n !== numNode && n !== eyebrowNode && n.textContent.trim().length > 40);

  if (numNode) {
    const numDiv = document.createElement('div');
    numDiv.className = 'chapter-number';
    numDiv.textContent = numNode.textContent.trim();
    head.append(numDiv);
  }

  if (eyebrowNode) {
    const eyeDiv = document.createElement('span');
    eyeDiv.className = 'eyebrow';
    eyeDiv.textContent = eyebrowNode.textContent.trim();
    head.append(eyeDiv);
  }

  if (heading) {
    const headlineWrap = document.createElement('div');
    headlineWrap.className = 'headline';
    headlineWrap.append(heading);
    head.append(headlineWrap);
  }

  wrap.append(head);

  if (bodyNode) {
    const bodyWrap = document.createElement('div');
    bodyWrap.className = 'body';
    bodyWrap.append(bodyNode);
    wrap.append(bodyWrap);
  }

  block.replaceChildren(wrap);
}
