export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  rows.forEach((row) => {
    const cells = [...row.children];
    const figure = document.createElement('div');
    figure.className = 'figure';

    const frame = document.createElement('div');
    frame.className = 'media-frame';
    const img = cells[0]?.querySelector('picture, img');
    if (img) frame.append(img);
    figure.append(frame);

    const caption = document.createElement('div');
    caption.className = 'caption';
    const title = document.createElement('span');
    title.className = 'caption-title';
    title.textContent = cells[1]?.textContent?.trim() || '';
    const detail = document.createElement('span');
    detail.className = 'caption-detail';
    detail.textContent = cells[2]?.textContent?.trim() || '';
    caption.append(title, detail);
    figure.append(caption);

    wrap.append(figure);
  });

  block.replaceChildren(wrap);
}
