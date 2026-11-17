/**
 * player — the native video element with custom controls: play/pause, a
 * draggable scrub bar, elapsed / total time and mute, over a ruled caption.
 *
 * Authoring: one row — cells: media (link to an .mp4, optional poster image) |
 * caption label | caption note.
 *
 * @ew-exempt integration — the .mp4 link in cell 1 is the media source, replaced by <video>
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const pad = (n) => String(n).padStart(2, '0');
const fmt = (s) => {
  const t = Number.isFinite(s) ? s : 0;
  return `${Math.floor(t / 60)}:${pad(Math.floor(t % 60))}`;
};

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function button(label, kind) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `button ${kind}`;
  b.textContent = label;
  return b;
}

export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const [mediaCell, ...captionCells] = [...row.children];
  const link = [...(mediaCell?.querySelectorAll('a') || [])]
    .find((a) => /\.(mp4|webm)(\?|$)/i.test(a.href));
  const poster = mediaCell?.querySelector('img');

  const stage = document.createElement('div');
  stage.className = 'player-media grayscale';
  const video = document.createElement('video');
  Object.assign(video, { preload: 'metadata', playsInline: true });
  video.setAttribute('playsinline', '');
  if (link) {
    video.src = link.href;
    video.setAttribute('aria-label', link.textContent.trim());
  }
  if (poster) video.poster = poster.currentSrc || poster.src;
  stage.append(video);

  const controls = document.createElement('div');
  controls.className = 'player-controls';
  const play = button('Play', 'primary');
  const scrub = document.createElement('div');
  scrub.className = 'player-scrub';
  scrub.setAttribute('role', 'slider');
  scrub.setAttribute('aria-label', 'Seek');
  scrub.setAttribute('aria-valuemin', '0');
  scrub.setAttribute('aria-valuemax', '100');
  scrub.setAttribute('aria-valuenow', '0');
  scrub.tabIndex = 0;
  const rail = document.createElement('div');
  rail.className = 'player-rail';
  const fill = document.createElement('div');
  fill.className = 'player-fill';
  rail.append(fill);
  scrub.append(rail);
  const time = document.createElement('span');
  time.className = 'player-time';
  time.textContent = '0:00 / 0:00';
  const mute = button('Mute', 'secondary');
  controls.append(play, scrub, time, mute);

  const caption = document.createElement('div');
  caption.className = 'player-caption';
  captionCells.forEach((c, i) => {
    const p = c.querySelector('p') || c;
    if (p.textContent.trim()) caption.append(wrapNode(p, i ? 'player-meta' : 'player-label'));
  });

  const box = document.createElement('div');
  box.className = 'player-box';
  box.append(stage, controls, caption);
  block.replaceChildren(box);

  const sync = () => {
    const d = video.duration || 0;
    const c = video.currentTime || 0;
    fill.style.transform = `scaleX(${d ? c / d : 0})`;
    scrub.setAttribute('aria-valuenow', String(Math.round(d ? (c / d) * 100 : 0)));
    time.textContent = `${fmt(c)} / ${fmt(d)}`;
  };
  const toggle = () => {
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };
  play.addEventListener('click', toggle);
  video.addEventListener('click', toggle);
  video.addEventListener('play', () => { play.textContent = 'Pause'; });
  video.addEventListener('pause', () => { play.textContent = 'Play'; });
  ['timeupdate', 'loadedmetadata', 'seeked'].forEach((ev) => video.addEventListener(ev, sync));
  mute.addEventListener('click', () => {
    video.muted = !video.muted;
    mute.textContent = video.muted ? 'Unmute' : 'Mute';
  });
  const seekTo = (clientX) => {
    const r = rail.getBoundingClientRect();
    if (video.duration) video.currentTime = clamp((clientX - r.left) / r.width) * video.duration;
    sync();
  };
  scrub.addEventListener('pointerdown', (e) => {
    seekTo(e.clientX);
    scrub.setPointerCapture?.(e.pointerId);
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
  });
  // smooth progress while playing
  const frame = () => {
    if (!video.paused) sync();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  if (reduced()) return;
  box.style.opacity = '0';
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(box);
    box.style.opacity = '';
    box.animate([
      { opacity: 0, transform: 'translateY(48px)' },
      { opacity: 1, transform: 'none' },
    ], {
      duration: 1000, easing: EASE, fill: 'backwards',
    });
  }), { threshold: 0.12 });
  io.observe(box);
}
