/**
 * video-player — native <video> with custom controls (Plate 10).
 *
 * Authoring rows:
 *   1. media cell: poster image (<picture>/<img>); optional link to an .mp4
 *      file in the same cell — when present the block builds the <video>.
 *   2. caption cell: <p> plate label, <p> meta ("Custom controls").
 *
 * Without a video link the poster renders with the control bar disabled.
 * @ew-exempt <a> .mp4 source link (media cell) — metadata, consumed into <video src>
 */

const pad = (n) => String(n).padStart(2, '0');
const fmt = (s) => {
  const v = Number.isFinite(s) ? s : 0;
  return `${Math.floor(v / 60)}:${pad(Math.floor(v % 60))}`;
};
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function wrap(className, ...nodes) {
  const el = document.createElement('div');
  el.className = className;
  el.append(...nodes);
  return el;
}

function findVideoLink(cell) {
  return [...cell.querySelectorAll('a[href]')].find((a) => /\.(mp4|webm|mov)(\?|#|$)/i.test(a.href));
}

export default async function decorate(block) {
  const rows = [...block.children];
  const mediaCell = rows[0] ? rows[0].firstElementChild : null;
  const captionCell = rows[1] ? rows[1].firstElementChild : null;

  const stage = wrap('video-player-stage grayscale');
  let video = null;
  if (mediaCell) {
    const media = mediaCell.querySelector('picture') || mediaCell.querySelector('img');
    const link = findVideoLink(mediaCell);
    if (link) {
      video = document.createElement('video');
      video.preload = 'metadata';
      video.playsInline = true;
      video.src = link.href;
      const img = media && (media.tagName === 'IMG' ? media : media.querySelector('img'));
      if (img) video.poster = img.currentSrc || img.src;
      (link.closest('p') || link).remove();
      stage.append(video);
    } else if (media) {
      stage.append(media);
    }
  }

  // controls (generated UI)
  const controls = wrap('video-player-controls');
  const play = document.createElement('button');
  play.type = 'button';
  play.className = 'button primary video-player-play';
  play.textContent = 'Play';
  const scrub = wrap('video-player-scrub');
  const track = wrap('video-player-track');
  const fill = wrap('video-player-fill');
  track.append(fill);
  scrub.append(track);
  scrub.setAttribute('role', 'slider');
  scrub.setAttribute('aria-label', 'Seek');
  scrub.setAttribute('aria-valuemin', '0');
  scrub.setAttribute('aria-valuemax', '100');
  scrub.setAttribute('aria-valuenow', '0');
  const time = document.createElement('span');
  time.className = 'video-player-time';
  time.textContent = '0:00 / 0:00';
  const mute = document.createElement('button');
  mute.type = 'button';
  mute.className = 'button secondary video-player-mute';
  mute.textContent = 'Mute';
  controls.append(play, scrub, time, mute);

  const caption = wrap('video-player-caption');
  if (captionCell) {
    const ps = [...captionCell.querySelectorAll('p')];
    if (ps[0]) caption.append(wrap('video-player-label', ps[0]));
    if (ps.length > 1) caption.append(wrap('video-player-meta', ...ps.slice(1)));
  }

  block.replaceChildren(stage, controls, caption);

  if (!video) {
    block.classList.add('no-video');
    play.disabled = true;
    mute.disabled = true;
    scrub.setAttribute('aria-disabled', 'true');
    return;
  }

  scrub.tabIndex = 0;
  const update = () => {
    const d = video.duration || 0;
    const c = video.currentTime || 0;
    fill.style.transform = `scaleX(${d ? c / d : 0})`;
    time.textContent = `${fmt(c)} / ${fmt(d)}`;
    scrub.setAttribute('aria-valuenow', String(d ? Math.round((c / d) * 100) : 0));
  };
  let raf;
  const loop = () => {
    update();
    if (!video.paused) raf = requestAnimationFrame(loop);
  };
  const toggle = () => {
    if (video.paused) {
      const p = video.play();
      if (p) p.catch(() => {});
    } else video.pause();
  };
  play.addEventListener('click', toggle);
  video.addEventListener('click', toggle);
  video.addEventListener('play', () => {
    play.textContent = 'Pause';
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  });
  video.addEventListener('pause', () => {
    play.textContent = 'Play';
    update();
  });
  video.addEventListener('loadedmetadata', update);
  video.addEventListener('timeupdate', () => { if (video.paused) update(); });
  mute.addEventListener('click', () => {
    video.muted = !video.muted;
    mute.textContent = video.muted ? 'Unmute' : 'Mute';
  });

  const seekTo = (clientX) => {
    const r = track.getBoundingClientRect();
    const p = clamp((clientX - r.left) / r.width);
    if (video.duration) video.currentTime = p * video.duration;
    update();
  };
  scrub.addEventListener('pointerdown', (e) => {
    seekTo(e.clientX);
    scrub.setPointerCapture(e.pointerId);
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
    update();
  });
}
