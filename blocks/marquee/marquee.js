/**
 * loads and decorates the marquee block
 * @param {Element} block The marquee block element
 */
export default function decorate(block) {
  // Collect all text items from the block
  const items = [];
  const rows = [...block.children];

  rows.forEach((row) => {
    [...row.children].forEach((cell) => {
      const text = cell.textContent.trim();
      if (text) {
        // Split by line breaks if present
        const lines = text.split(/\n+/).map((line) => line.trim()).filter((line) => line);
        items.push(...lines);
      }
    });
  });

  // Clear the block
  block.innerHTML = '';

  // Get duration from data attribute or default to 45s
  const duration = block.dataset.dur || 45000;

  // Create container with border
  const container = document.createElement('div');
  container.className = 'marquee-container';

  // Create the marquee track
  const track = document.createElement('div');
  track.className = 'marquee-track';
  track.style.animationDuration = `${duration}ms`;

  // Build item markup
  const buildTrack = () => {
    const inner = document.createElement('div');
    inner.className = 'marquee-items';

    items.forEach((item, idx) => {
      if (idx > 0) {
        // Add dot separator
        const dot = document.createElement('span');
        dot.className = 'marquee-dot';
        inner.appendChild(dot);
      }

      // Add text item
      const span = document.createElement('span');
      span.className = 'marquee-item';
      span.textContent = item;
      inner.appendChild(span);
    });

    return inner;
  };

  // Add first track
  track.appendChild(buildTrack());

  // Clone track for seamless loop (strip data-dc-tpl attributes)
  const clonedTrack = buildTrack();
  // Strip instrumentation attributes
  clonedTrack.querySelectorAll('[data-dc-tpl]').forEach((el) => {
    el.removeAttribute('data-dc-tpl');
  });
  track.appendChild(clonedTrack);

  container.appendChild(track);
  block.appendChild(container);

  // Skip animation setup if prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Optional: add animation via Web Animations API for better control
  // Currently relying on CSS animation defined in marquee.css
}
