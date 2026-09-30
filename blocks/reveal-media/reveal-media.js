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

  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  const frame = document.createElement('div');
  frame.className = 'media-frame';
  const img = nodes.find((n) => n.matches && n.matches('picture, img'));
  if (!img) {
    const imgEl = nodes.find((n) => n.querySelector && n.querySelector('picture, img'));
    const pic = imgEl?.querySelector('picture, img');
    if (pic) frame.append(pic);
  } else {
    frame.append(img);
  }
  wrap.append(frame);

  const textNodes = nodes.filter((n) => {
    if (n.querySelector && n.querySelector('picture, img')) return false;
    if (n.matches && n.matches('picture, img')) return false;
    return n.textContent && n.textContent.trim();
  });

  if (textNodes.length) {
    const caption = document.createElement('div');
    caption.className = 'caption';

    const title = document.createElement('span');
    title.className = 'caption-title';
    title.textContent = textNodes[0]?.textContent?.trim() || '';
    caption.append(title);

    if (textNodes[1]) {
      const detail = document.createElement('span');
      detail.className = 'caption-detail';
      detail.textContent = textNodes[1].textContent.trim();
      caption.append(detail);
    }
    wrap.append(caption);
  }

  block.replaceChildren(wrap);
}
