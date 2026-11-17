/**
 * video-player — the native <video> element with its default controls replaced:
 * play/pause, a pointer-draggable scrub bar, elapsed/total time and mute.
 * Click the picture to toggle playback.
 *
 * Authoring: one row — video URL link (optionally a poster image in the same cell)
 *            | caption | meta.
 *
 * @ew-exempt <p> video source link (cell 1) — metadata
 */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const pad = (n) => String(n).padStart(2, '0');
const fmt = (s) => {
  const t = Number.isFinite(s) ? s : 0;
  return `${Math.floor(t / 60)}:${pad(Math.floor(t % 60))}`;
};
const isVideoUrl = (href) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(href || '');

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  if (node) w.append(node);
  return w;
}

function button(className, text) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = className;
  b.textContent = text;
  return b;
}

export default async function decorate(block) {
  const row = [...block.children].find((r) => r.querySelector('a[href]')) || block.firstElementChild;
  if (!row) return;
  const cells = [...row.children];
  const link = [...cells[0].querySelectorAll('a[href]')].find((a) => isVideoUrl(a.href));
  const poster = cells[0].querySelector('img');
  const caption = cells[1] && cells[1].querySelector('p');
  const meta = cells[2] && cells[2].querySelector('p');
  if (!link) return;

  const video = document.createElement('video');
  video.src = link.href;
  video.preload = 'metadata';
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  if (poster) video.poster = poster.currentSrc || poster.src;

  const frame = wrapNode(video, 'vp-frame grayscale');

  const play = button('button primary vp-play', 'Play');
  const mute = button('button secondary vp-mute', 'Mute');
  const fill = wrapNode(null, 'vp-fill');
  const scrub = wrapNode(wrapNode(fill, 'vp-track'), 'vp-scrub');
  scrub.setAttribute('role', 'slider');
  scrub.setAttribute('aria-label', 'Seek');
  scrub.setAttribute('aria-valuemin', '0');
  scrub.setAttribute('aria-valuemax', '100');
  scrub.setAttribute('aria-valuenow', '0');
  scrub.tabIndex = 0;
  const time = document.createElement('span');
  time.className = 'vp-time';
  time.textContent = '0:00 / 0:00';
  const controls = wrapNode(null, 'vp-controls');
  controls.append(play, scrub, time, mute);

  const capBar = wrapNode(null, 'vp-caption');
  if (caption) capBar.append(wrapNode(caption, 'caption'));
  if (meta) capBar.append(wrapNode(meta, 'meta'));

  block.replaceChildren(frame, controls, capBar);

  const render = () => {
    const d = video.duration || 0;
    const c = video.currentTime || 0;
    fill.style.transform = `scaleX(${d ? c / d : 0})`;
    time.textContent = `${fmt(c)} / ${fmt(d)}`;
    scrub.setAttribute('aria-valuenow', String(d ? Math.round((c / d) * 100) : 0));
  };
  let raf = 0;
  const loop = () => {
    render();
    if (!video.paused) raf = requestAnimationFrame(loop);
  };
  const toggle = () => {
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };
  play.addEventListener('click', toggle);
  video.addEventListener('click', toggle);
  video.addEventListener('play', () => {
    play.textContent = 'Pause';
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  });
  video.addEventListener('pause', () => { play.textContent = 'Play'; render(); });
  video.addEventListener('loadedmetadata', render);
  video.addEventListener('timeupdate', () => { if (video.paused) render(); });
  mute.addEventListener('click', () => {
    video.muted = !video.muted;
    mute.textContent = video.muted ? 'Unmute' : 'Mute';
  });

  const seekTo = (clientX) => {
    const r = scrub.getBoundingClientRect();
    const p = clamp((clientX - r.left) / r.width);
    if (video.duration) video.currentTime = p * video.duration;
    render();
  };
  scrub.addEventListener('pointerdown', (e) => {
    seekTo(e.clientX);
    if (scrub.setPointerCapture) scrub.setPointerCapture(e.pointerId);
    const move = (ev) => seekTo(ev.clientX);
    const up = () => {
      scrub.removeEventListener('pointermove', move);
      scrub.removeEventListener('pointerup', up);
    };
    scrub.addEventListener('pointermove', move);
    scrub.addEventListener('pointerup', up);
  });
  scrub.addEventListener('keydown', (e) => {
    if (!video.duration) return;
    if (e.key === 'ArrowRight') video.currentTime = Math.min(video.duration, video.currentTime + 5);
    else if (e.key === 'ArrowLeft') video.currentTime = Math.max(0, video.currentTime - 5);
    else return;
    e.preventDefault();
    render();
  });
}
