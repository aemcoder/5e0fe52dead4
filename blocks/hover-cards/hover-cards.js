export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  rows.forEach((row) => {
    const cells = [...row.children];
    const card = document.createElement('div');
    card.className = 'card';

    const frame = document.createElement('div');
    frame.className = 'media-frame';

    const img = cells[0]?.querySelector('picture, img');
    if (img) frame.append(img);

    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = 'Hover to play';
    frame.append(badge);
    card.append(frame);

    const caption = document.createElement('div');
    caption.className = 'caption';

    const num = document.createElement('span');
    num.className = 'caption-num';
    num.textContent = cells[1]?.textContent?.trim() || '';

    const title = document.createElement('span');
    title.className = 'caption-title';
    title.textContent = cells[2]?.textContent?.trim() || '';

    caption.append(num, title);
    card.append(caption);
    wrap.append(card);
  });

  block.replaceChildren(wrap);
}
