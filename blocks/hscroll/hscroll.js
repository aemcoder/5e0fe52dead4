export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const sticky = document.createElement('div');
  sticky.className = 'sticky';

  const track = document.createElement('div');
  track.className = 'track';

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

    const num = document.createElement('span');
    num.className = 'caption-num';
    num.textContent = cells[1]?.textContent?.trim() || '';

    const title = document.createElement('span');
    title.className = 'caption-title';
    title.textContent = cells[2]?.textContent?.trim() || '';

    const type = document.createElement('span');
    type.className = 'caption-type';
    type.textContent = cells[3]?.textContent?.trim() || '';

    caption.append(num, title, type);
    figure.append(caption);
    track.append(figure);
  });

  sticky.append(track);

  // Progress bar
  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  const label = document.createElement('span');
  label.className = 'progress-label';
  label.textContent = `Plates`;

  const progressTrack = document.createElement('div');
  progressTrack.className = 'progress-track';
  const progressFill = document.createElement('div');
  progressFill.className = 'progress-fill';
  progressTrack.append(progressFill);

  const hint = document.createElement('span');
  hint.className = 'progress-hint';
  hint.textContent = 'Keep scrolling ↓';

  bar.append(label, progressTrack, hint);
  sticky.append(bar);

  block.replaceChildren(sticky);

  // Horizontal scroll driven by vertical scroll
  const isSmall = window.matchMedia('(max-width: 599px)');
  if (isSmall.matches) return;

  const onScroll = () => {
    const rect = block.getBoundingClientRect();
    const sectionHeight = block.offsetHeight - window.innerHeight;
    if (sectionHeight <= 0) return;

    const progress = Math.max(0, Math.min(1, -rect.top / sectionHeight));
    const maxTranslate = track.scrollWidth - window.innerWidth;
    track.style.transform = `translate3d(${-progress * maxTranslate}px, 0, 0)`;
    progressFill.style.transform = `scaleX(${progress})`;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
