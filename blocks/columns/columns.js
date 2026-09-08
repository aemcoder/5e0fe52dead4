export default async function decorate(block) {
  const rows = [...block.children];
  const wrap = document.createElement('div');
  wrap.className = 'columns-grid';

  // Collect all nodes
  const allNodes = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    allNodes.push(...cell.children);
  });

  // Text column
  const textCol = document.createElement('div');
  textCol.className = 'columns-text';

  // Image column
  const imageCol = document.createElement('div');
  imageCol.className = 'columns-image';

  // Find image
  const media = block.querySelector('picture, img');

  // Classify elements
  const heading = block.querySelector('h2, h3');
  const allPs = [...block.querySelectorAll('p')];
  const eyebrow = allPs.find(p => !p.querySelector('a, picture, img') && p.textContent.trim().length < 60 && p !== heading);

  if (eyebrow) {
    const ew = document.createElement('div');
    ew.className = 'columns-eyebrow';
    ew.append(eyebrow);
    textCol.append(ew);
  }

  if (heading) {
    const hw = document.createElement('div');
    hw.className = 'columns-heading';
    hw.append(heading);
    textCol.append(hw);
  }

  // Body paragraphs: everything that's not eyebrow, heading, or image-containing
  const bodyPs = allPs.filter(p => p !== eyebrow && !p.querySelector('picture, img'));
  if (bodyPs.length) {
    const bw = document.createElement('div');
    bw.className = 'columns-body';
    bodyPs.forEach(p => bw.append(p));
    textCol.append(bw);
  }

  if (media) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'columns-img-wrap';
    const pic = media.closest('picture') || media;
    imgWrap.append(pic);
    imageCol.append(imgWrap);
  }

  wrap.append(textCol);
  wrap.append(imageCol);
  block.replaceChildren(wrap);
}
