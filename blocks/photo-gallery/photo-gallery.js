/**
 * loads and decorates the photo-gallery block
 * @param {Element} block The photo-gallery block element
 */
export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // Parse first row for filter options
  const filterRow = rows[0];
  const filterDiv = filterRow.querySelector(':scope > div');
  const filterText = filterDiv?.textContent?.trim() || 'All | Roll 1 | Roll 2 | Roll 3';

  // Parse filter options from text or use defaults
  const filterOptions = filterText.split('|').map((o) => o.trim()).filter((o) => o);

  // Collect photo data from remaining rows
  const photos = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const cells = [...row.querySelectorAll(':scope > div')];
    if (cells.length >= 2) {
      const imgDiv = cells[0];
      const labelDiv = cells[1];
      const picture = imgDiv.querySelector('picture');
      const label = labelDiv.textContent.trim();

      if (picture) {
        photos.push({
          picture: picture.cloneNode(true),
          label,
          roll: extractRoll(label),
        });
      }
    }
  }

  // Clear the block
  block.innerHTML = '';

  // Create filter bar
  const filterBar = document.createElement('div');
  filterBar.className = 'photo-gallery-filter-bar';

  // Create segmented control
  const segmented = document.createElement('div');
  segmented.className = 'photo-gallery-seg';

  filterOptions.forEach((option, idx) => {
    const label = document.createElement('label');
    const input = document.createElement('input');

    input.type = 'radio';
    input.name = 'photo-gallery-filter';
    input.value = option === 'All' ? 'all' : option;
    input.dataset.filter = input.value;
    if (idx === 0) input.checked = true;

    label.className = 'photo-gallery-seg-opt';
    label.append(input);
    label.append(document.createTextNode(option));

    segmented.append(label);
  });

  filterBar.append(segmented);

  // Create counter
  const counter = document.createElement('span');
  counter.className = 'photo-gallery-counter';
  counter.textContent = `${photos.length} frames`;
  filterBar.append(counter);

  block.append(filterBar);

  // Create photo grid
  const grid = document.createElement('div');
  grid.className = 'photo-gallery-grid';

  photos.forEach((photo) => {
    const card = document.createElement('div');
    card.className = 'photo-gallery-card';
    card.dataset.roll = photo.roll;

    // Determine if image is portrait
    const img = photo.picture.querySelector('img');
    if (img) {
      const onLoad = () => {
        const ar = img.naturalWidth / img.naturalHeight;
        if (ar < 1) {
          // Portrait aspect ratio
          card.classList.add('photo-gallery-card-portrait');
        }
      };

      if (img.complete) {
        onLoad();
      } else {
        img.addEventListener('load', onLoad);
      }
    }

    card.append(photo.picture);

    const labelEl = document.createElement('div');
    labelEl.className = 'photo-gallery-label';
    labelEl.textContent = photo.label;
    card.append(labelEl);

    grid.append(card);
  });

  block.append(grid);

  // Add filter logic
  addFilterLogic(block, filterOptions);
}

/**
 * Extract roll information from label
 * @param {string} label The photo label text
 * @returns {string} The roll identifier (e.g., 'Roll 1', 'all')
 */
function extractRoll(label) {
  const match = label.match(/(Roll \d+)/i);
  return match ? match[1] : 'all';
}

/**
 * Add filter logic to the gallery
 * @param {Element} block The photo-gallery block
 * @param {string[]} filterOptions The available filter options
 */
function addFilterLogic(block, filterOptions) {
  const radios = block.querySelectorAll('input[name="photo-gallery-filter"]');
  const cards = block.querySelectorAll('.photo-gallery-card');

  const applyFilter = (selectedFilter) => {
    cards.forEach((card) => {
      const roll = card.dataset.roll;
      const matches = selectedFilter === 'all'
        || roll.toLowerCase() === selectedFilter.toLowerCase();

      if (matches) {
        card.classList.remove('photo-gallery-card-hidden');
      } else {
        card.classList.add('photo-gallery-card-hidden');
      }
    });
  };

  radios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      applyFilter(e.target.value);
    });
  });

  // Initialize with all visible
  applyFilter('all');
}
