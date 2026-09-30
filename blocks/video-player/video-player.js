function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const cells = [];
  rows.forEach((row) => {
    [...row.children].forEach((cell) => {
      const kids = [...cell.children];
      if (kids.length) cells.push(...kids);
      else if (cell.textContent.trim()) cells.push(cell);
    });
  });

  // Find video URL (a link)
  const linkEl = cells.find((c) => c.querySelector && c.querySelector('a'));
  const link = linkEl?.querySelector('a');
  const videoUrl = link?.href || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';

  // Find image for poster
  const imgEl = cells.find((c) => c.querySelector && c.querySelector('picture, img'));
  const poster = imgEl?.querySelector('img')?.src || '';

  // Get text cells
  const textCells = cells.filter((c) => !c.querySelector || (!c.querySelector('a') && !c.querySelector('picture, img')));
  const captionTitle = textCells[0]?.textContent?.trim() || '';
  const captionDetail = textCells[1]?.textContent?.trim() || '';

  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  // Video
  const frame = document.createElement('div');
  frame.className = 'video-frame';
  const video = document.createElement('video');
  video.src = videoUrl;
  video.preload = 'metadata';
  video.playsInline = true;
  if (poster) video.poster = poster;
  frame.append(video);
  wrap.append(frame);

  // Controls
  const controls = document.createElement('div');
  controls.className = 'controls';

  const playBtn = document.createElement('button');
  playBtn.className = 'btn btn-play';
  playBtn.type = 'button';
  playBtn.textContent = 'Play';

  const scrub = document.createElement('div');
  scrub.className = 'scrub';
  const scrubTrack = document.createElement('div');
  scrubTrack.className = 'scrub-track';
  const scrubFill = document.createElement('div');
  scrubFill.className = 'scrub-fill';
  scrubTrack.append(scrubFill);
  scrub.append(scrubTrack);

  const timeDisplay = document.createElement('span');
  timeDisplay.className = 'time';
  timeDisplay.textContent = '0:00 / 0:00';

  const muteBtn = document.createElement('button');
  muteBtn.className = 'btn';
  muteBtn.type = 'button';
  muteBtn.textContent = 'Mute';

  controls.append(playBtn, scrub, timeDisplay, muteBtn);
  wrap.append(controls);

  // Caption
  if (captionTitle || captionDetail) {
    const caption = document.createElement('div');
    caption.className = 'caption';
    if (captionTitle) {
      const t = document.createElement('span');
      t.textContent = captionTitle;
      caption.append(t);
    }
    if (captionDetail) {
      const d = document.createElement('span');
      d.className = 'caption-detail';
      d.textContent = captionDetail;
      caption.append(d);
    }
    wrap.append(caption);
  }

  block.replaceChildren(wrap);

  // Wire up controls
  playBtn.addEventListener('click', () => {
    if (video.paused) {
      video.play();
      playBtn.textContent = 'Pause';
    } else {
      video.pause();
      playBtn.textContent = 'Play';
    }
  });

  video.addEventListener('click', () => playBtn.click());

  muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? 'Unmute' : 'Mute';
  });

  video.addEventListener('timeupdate', () => {
    if (!video.duration) return;
    const progress = video.currentTime / video.duration;
    scrubFill.style.transform = `scaleX(${progress})`;
    timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
  });

  scrub.addEventListener('click', (e) => {
    if (!video.duration) return;
    const rect = scrubTrack.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    video.currentTime = ratio * video.duration;
  });
}
