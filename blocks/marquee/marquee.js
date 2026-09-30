export default async function decorate(block) {
  const items = [];
  [...block.children].forEach((row) => {
    const text = row.textContent.trim();
    if (text) items.push(text);
  });

  if (!items.length) return;

  const buildSet = () => {
    const set = document.createElement('div');
    set.className = 'track-set';
    items.forEach((text) => {
      const span = document.createElement('span');
      span.textContent = text;
      set.append(span);
      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.setAttribute('aria-hidden', 'true');
      set.append(dot);
    });
    return set;
  };

  const track = document.createElement('div');
  track.className = 'track';
  // Two copies for seamless loop
  track.append(buildSet());
  track.append(buildSet());

  block.replaceChildren(track);
}
