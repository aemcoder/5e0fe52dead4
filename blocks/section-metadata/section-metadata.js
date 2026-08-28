/**
 * Section Metadata Block
 * Reads key-value pairs and applies them to the parent section element.
 * Standard EDS boilerplate — applies CSS classes from the Style key.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const meta = {};
  [...block.children].forEach((row) => {
    const [keyEl, valueEl] = [...row.children];
    if (keyEl && valueEl) {
      const key = keyEl.textContent.trim().toLowerCase();
      meta[key] = valueEl.textContent.trim().toLowerCase();
    }
  });

  const section = block.closest('.section');
  if (section) {
    // Apply style as CSS classes (e.g. "full-width" → class "full-width")
    if (meta.style) {
      meta.style.split(',').map((s) => s.trim()).forEach((s) => {
        section.classList.add(s);
      });
    }

    // Apply background color if provided
    if (meta.background) {
      section.style.setProperty('--section-background-color', meta.background);
    }
  }

  // Hide the metadata block from view
  block.closest('.section-metadata-wrapper')?.remove();
}
