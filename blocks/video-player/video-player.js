/**
 * video-player — the native <video> element with its default controls
 * replaced: play/pause, a pointer-draggable scrub bar, elapsed/total time and
 * mute, all calls to the HTMLMediaElement API.
 *
 * Authoring:
 *   row 1: a link to the video file (.mp4)
 *   row 2: caption paragraphs — plate credit, then technique label
 *
 * @ew-exempt <p> video source link (row 1) — metadata, rendered as <video>
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const pad = (n) => String(n).padStart(2, '0');
const fmt = (s) => {
  const t = Number.isFinite(s) ? s : 0;
  return `${Math.floor(t / 60)}:${pad(Math.floor(t % 60))}`;
};

function whenShown(el, cb) {
  const check = () => (el.getClientRects().length ? cb() : requestAnimationFrame(check));
  check();
}

function reveal(el) {
  whenShown(el, () => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    el.style.opacity = '0';
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      el.style.opacity = '';
      el.animate(
        [{ opacity: 0, transform: 'translateY(48px)' }, { opacity: 1, transform: 'none' }],
        { duration: 1000, easing: EASE, fill: 'backwards' },
      );
    }, { threshold: 0.12 });
    io.observe(el);
  });
}

function button(label, variant) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `button ${variant}`;
  b.textContent = label;
  return b;
}

function captionParts(ps) {
  return ps.map((p, i) => {
    const w = document.createElement('div');
    w.className = i === 0 ? 'label' : 'note';
    w.append(p);
    return w;
  });
}

export default async function decorate(block) {
  const link = block.querySelector('a[href]');
  const captionPs = [...block.querySelectorAll('p')].filter((p) => !p.querySelector('a[href]'));

  const screen = document.createElement('div');
  screen.className = 'screen grayscale';
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  if (link) {
    video.src = link.href;
    link.closest('p')?.remove();
  }
  screen.append(video);

  const controls = document.createElement('div');
  controls.className = 'controls';
  const play = button('Play', 'primary');
  play.classList.add('play');
  play.setAttribute('aria-label', 'Play video');
  const scrub = document.createElement('div');
  scrub.className = 'scrub';
  scrub.setAttribute('role', 'slider');
  scrub.setAttribute('aria-label', 'Seek');
  scrub.setAttribute('aria-valuemin', '0');
  scrub.setAttribute('aria-valuemax', '100');
  scrub.setAttribute('aria-valuenow', '0');
  scrub.tabIndex = 0;
  const track = document.createElement('div');
  track.className = 'scrub-track';
  const fill = document.createElement('div');
  fill.className = 'scrub-fill';
  track.append(fill);
  scrub.append(track);
  const time = document.createElement('span');
  time.className = 'time';
  time.textContent = '0:00 / 0:00';
  const mute = button('Mute', 'secondary');
  mute.classList.add('mute');
  controls.append(play, scrub, time, mute);

  const caption = document.createElement('div');
  caption.className = 'caption';
  caption.append(...captionParts(captionPs));

  const player = document.createElement('div');
  player.className = 'player';
  player.append(screen, controls);
  if (caption.children.length) player.append(caption);
  block.replaceChildren(player);

  const render = () => {
    const d = video.duration || 0;
    const c = video.currentTime || 0;
    fill.style.transform = `scaleX(${d ? c / d : 0})`;
    scrub.setAttribute('aria-valuenow', String(Math.round(d ? (c / d) * 100 : 0)));
    time.textContent = `${fmt(c)} / ${fmt(d)}`;
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
    play.setAttribute('aria-label', 'Pause video');
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  });
  video.addEventListener('pause', () => {
    play.textContent = 'Play';
    play.setAttribute('aria-label', 'Play video');
    render();
  });
  ['loadedmetadata', 'timeupdate', 'seeked'].forEach((ev) => video.addEventListener(ev, render));
  mute.addEventListener('click', () => {
    video.muted = !video.muted;
    mute.textContent = video.muted ? 'Unmute' : 'Mute';
  });

  const seekTo = (clientX) => {
    const r = track.getBoundingClientRect();
    const p = clamp((clientX - r.left) / r.width);
    if (video.duration) video.currentTime = p * video.duration;
    render();
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
    render();
  });

  if (!reduced()) reveal(player);
}
