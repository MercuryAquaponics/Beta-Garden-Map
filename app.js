/* ─── GLOBAL STATE ─────────────────────────────────────────────────────────── */
let currentLang = 'sv';
let highlightedPlant = null;
let openPanel = null;

let scale = 1, tx = 0, ty = 0;
let minScale = 0.3, maxScale = 6;

const pinEls = {};

/* ─── LANGUAGE DEFINITIONS (expandable) ───────────────────────────────── */
const LANGUAGES = [
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'is', name: 'Íslenska', flag: '🇮🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sl', name: 'Slovenščina', flag: '🇸🇮' },
  { code: 'et', name: 'Eesti', flag: '🇪🇪' },
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
];

/* ─── INITIALIZATION ───────────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  initLanguagePanel();
  initPlantPanel();
  initPins();
  initMapControls();
  fitStage();
});

/* ─── LANGUAGE PANEL ───────────────────────────────────────────────────── */
function initLanguagePanel() {
  const grid = document.getElementById('lang-grid');
  LANGUAGES.forEach(lang => {
    const btn = document.createElement('button');
    btn.className = 'lang-btn';
    if (lang.code === currentLang) btn.classList.add('active');
    btn.textContent = `${lang.flag} ${lang.name}`;
    btn.onclick = () => setLanguage(lang.code);
    grid.appendChild(btn);
  });

  document.getElementById('lang-btn').onclick = openLangPanel;
}

function setLanguage(code) {
  currentLang = code;
  
  // Update active button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');

  // Update plant panel title
  const plantTitle = document.getElementById('plant-panel-title');
  plantTitle.textContent = currentLang === 'sv' ? 'Växter' : 'Plants';

  // Update plant list
  updatePlantList();

  // Update detail panel if open
  if (openPanel === 'detail') {
    updateDetailPanel();
  }

  closeLangPanel();
}

function openLangPanel() {
  closeAllPanels();
  document.getElementById('lang-panel').classList.add('open');
  openPanel = 'lang';
}

function closeLangPanel() {
  document.getElementById('lang-panel').classList.remove('open');
  if (openPanel === 'lang') openPanel = null;
}

/* ─── PLANT PANEL ──────────────────────────────────────────────────────── */
function initPlantPanel() {
  updatePlantList();
  document.getElementById('plant-panel-title').textContent = 'Växter';
}

function updatePlantList() {
  const list = document.getElementById('plant-list');
  list.innerHTML = '';

  // Get unique plants
  const uniquePlants = new Set();
  Object.values(PLANTS).forEach(plant => {
    if (plant[currentLang]) {
      uniquePlants.add(plant[currentLang]);
    }
  });

  // Sort alphabetically
  const sortedPlants = Array.from(uniquePlants).sort();

  sortedPlants.forEach(plantName => {
    const item = document.createElement('div');
    item.className = 'plant-item';
    if (plantName === highlightedPlant) item.classList.add('active');
    item.textContent = plantName;
    item.onclick = () => selectPlant(plantName);
    list.appendChild(item);
  });
}

function selectPlant(plantName) {
  highlightedPlant = plantName;
  updatePlantList();

  // Highlight containers with this plant
  document.querySelectorAll('.pin').forEach(pin => {
    const code = pin.dataset.code;
    const plant = PLANTS[code];
    const hasPlant = plant && (
      plant[currentLang] === plantName ||
      (plant[currentLang] && plant[currentLang].includes(plantName))
    );
    pin.classList.toggle('active-plant', hasPlant);
  });
}

/* ─── PIN INITIALIZATION ───────────────────────────────────────────────── */
function pinSVG(hex) {
  return `<svg viewBox="0 0 24 34" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 22 12 22S24 21 24 12C24 5.37 18.63 0 12 0z" fill="${hex}" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="4" fill="white" fill-opacity="0.85"/>
  </svg>`;
}

function initPins() {
  const pinsLayer = document.getElementById('pins-layer');
  pinsLayer.innerHTML = '';

  Object.keys(POSITIONS).forEach(code => {
    const pos = POSITIONS[code];
    const cat = CATEGORIES.find(c => c.id === code[0]);

    const pin = document.createElement('div');
    pin.className = 'pin';
    pin.style.left = pos.x + '%';
    pin.style.top = pos.y + '%';
    pin.dataset.code = code;
    pin.dataset.cat = cat.id;

    const dot = document.createElement('div');
    dot.className = 'pin-dot';
    dot.innerHTML = pinSVG(cat.hex);

    const label = document.createElement('div');
    label.className = 'pin-label';
    label.textContent = code;

    pin.appendChild(dot);
    pin.appendChild(label);
    pin.onclick = (e) => {
      e.stopPropagation();
      showContainerDetail(code);
    };

    pinsLayer.appendChild(pin);
    pinEls[code] = pin;
  });
}

/* ─── DETAIL PANEL ───────────────────────────────────────────────────── */
function showContainerDetail(code) {
  closeAllPanels();

  const plant = PLANTS[code];
  const cat = CATEGORIES.find(c => c.id === code[0]);

  let plantContent = '';
  if (plant && plant[currentLang]) {
    const plants = plant[currentLang].split(' & ').map(p => p.trim());
    plantContent = plants.map(p => 
      `<div class="plant-name-link" onclick="showPlantDetail('${p}')">${p}</div>`
    ).join('');
  } else {
    plantContent = `<div class="detail-value">${currentLang === 'sv' ? '(Tom)' : '(Empty)'}</div>`;
  }

  const content = `
    <div class="detail-section">
      <span class="detail-label">${currentLang === 'sv' ? 'Behållare' : 'Container'}</span>
      <span class="detail-value">${code}</span>
    </div>
    <div class="detail-section">
      <span class="detail-label">${currentLang === 'sv' ? 'Typ' : 'Type'}</span>
      <span class="detail-value">${cat.label[currentLang]}</span>
    </div>
    <div class="container-image">
      [${currentLang === 'sv' ? 'Behållarebild' : 'Container image'}]
    </div>
    <div class="detail-section">
      <span class="detail-label">${currentLang === 'sv' ? 'Växter' : 'Plants'}</span>
      <div class="plant-list-in-container">
        ${plantContent}
      </div>
    </div>
  `;

  document.getElementById('detail-title').textContent = `${currentLang === 'sv' ? 'Behållare' : 'Container'} ${code}`;
  document.getElementById('detail-content').innerHTML = content;
  document.getElementById('detail-panel').classList.add('open');
  openPanel = 'detail';

  // Zoom to container
  zoomToCode(code);
}

function showPlantDetail(plantName) {
  const content = `
    <div class="detail-section">
      <span class="detail-label">${currentLang === 'sv' ? 'Beskrivning' : 'Description'}</span>
      <div class="plant-description">
        [${currentLang === 'sv' ? 'Växtbeskrivning - placeholder' : 'Plant description - placeholder'}]
      </div>
    </div>
    <div class="detail-section">
      <span class="detail-label">${currentLang === 'sv' ? 'Rätter' : 'Dishes'}</span>
      <div class="gallery-grid">
        <div class="gallery-item">[${currentLang === 'sv' ? 'Bild 1' : 'Image 1'}]</div>
        <div class="gallery-item">[${currentLang === 'sv' ? 'Bild 2' : 'Image 2'}]</div>
        <div class="gallery-item">[${currentLang === 'sv' ? 'Bild 3' : 'Image 3'}]</div>
        <div class="gallery-item">[${currentLang === 'sv' ? 'Bild 4' : 'Image 4'}]</div>
      </div>
    </div>
  `;

  document.getElementById('detail-title').textContent = plantName;
  document.getElementById('detail-content').innerHTML = content;
  document.getElementById('detail-panel').classList.add('open');
  openPanel = 'detail';
}

function updateDetailPanel() {
  if (openPanel === 'detail') {
    const title = document.getElementById('detail-title').textContent;
    // Re-render based on current title
    if (title.startsWith('Container') || title.startsWith('Behållare')) {
      const code = title.split(' ')[1];
      showContainerDetail(code);
    }
  }
}

function closeDetailPanel() {
  document.getElementById('detail-panel').classList.remove('open');
  if (openPanel === 'detail') openPanel = null;
}

function closePlantPanel() {
  document.getElementById('plant-panel').classList.remove('open');
  if (openPanel === 'plant') openPanel = null;
  highlightedPlant = null;
  updatePlantList();
  document.querySelectorAll('.pin').forEach(pin => {
    pin.classList.remove('active-plant');
  });
}

function closeAllPanels() {
  closeLangPanel();
  closePlantPanel();
  closeDetailPanel();
}

/* ─── MAP CONTROLS ───────────────────────────────────────────────────── */
function initMapControls() {
  const viewport = document.getElementById('map-viewport');

  // Wheel zoom
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 1/1.15;
    zoomAt(e.clientX, e.clientY, factor);
  }, { passive: false });

  // Drag pan
  let dragging = false, lastX = 0, lastY = 0;
  const activePointers = new Map();
  let pinchStartDist = null, pinchStartScale = null;

  viewport.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.pin')) return;
    viewport.setPointerCapture(e.pointerId);
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.size === 1) {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      viewport.classList.add('grabbing');
    } else if (activePointers.size === 2) {
      dragging = false;
      const pts = [...activePointers.values()];
      pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchStartScale = scale;
    }
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!activePointers.has(e.pointerId)) return;
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.size === 2 && pinchStartDist) {
      const pts = [...activePointers.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const midX = (pts[0].x + pts[1].x) / 2;
      const midY = (pts[0].y + pts[1].y) / 2;
      const targetScale = Math.min(maxScale, Math.max(minScale, pinchStartScale * (dist / pinchStartDist)));
      const ratio = targetScale / scale;
      const rect = viewport.getBoundingClientRect();
      const px = midX - rect.left;
      const py = midY - rect.top;
      tx = px - (px - tx) * ratio;
      ty = py - (py - ty) * ratio;
      scale = targetScale;
      applyTransform();
    } else if (dragging && activePointers.size === 1) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      tx += dx;
      ty += dy;
      lastX = e.clientX;
      lastY = e.clientY;
      applyTransform();
    }
  });

  function endPointer(e) {
    activePointers.delete(e.pointerId);
    if (activePointers.size < 2) pinchStartDist = null;
    if (activePointers.size === 0) {
      dragging = false;
      viewport.classList.remove('grabbing');
    }
  }

  viewport.addEventListener('pointerup', endPointer);
  viewport.addEventListener('pointercancel', endPointer);
  viewport.addEventListener('pointerleave', endPointer);

  // Buttons
  document.getElementById('zoom-in').onclick = () => {
    const rect = viewport.getBoundingClientRect();
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 1.3);
  };

  document.getElementById('zoom-out').onclick = () => {
    const rect = viewport.getBoundingClientRect();
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 1 / 1.3);
  };

  document.getElementById('zoom-reset').onclick = () => fitStage();

  window.addEventListener('resize', () => fitStage());
}

function applyTransform() {
  const stage = document.getElementById('map-stage');
  stage.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  document.documentElement.style.setProperty('--zoom', scale);
}

function fitStage(padding = 20) {
  const viewport = document.getElementById('map-viewport');
  const vw = viewport.clientWidth;
  const vh = viewport.clientHeight;
  const s = Math.min((vw - padding * 2) / IMG_W, (vh - padding * 2) / IMG_H);
  scale = Math.max(s, 0.05);
  minScale = scale * 0.6;
  maxScale = scale * 8;
  tx = (vw - IMG_W * scale) / 2;
  ty = (vh - IMG_H * scale) / 2;
  applyTransform();
}

function zoomAt(clientX, clientY, factor) {
  const viewport = document.getElementById('map-viewport');
  const rect = viewport.getBoundingClientRect();
  const px = clientX - rect.left;
  const py = clientY - rect.top;
  const newScale = Math.min(maxScale, Math.max(minScale, scale * factor));
  const ratio = newScale / scale;
  tx = px - (px - tx) * ratio;
  ty = py - (py - ty) * ratio;
  scale = newScale;
  applyTransform();
}

function zoomToCode(code) {
  const pos = POSITIONS[code];
  if (!pos) return;
  const imgX = (pos.x / 100) * IMG_W;
  const imgY = (pos.y / 100) * IMG_H;
  const viewport = document.getElementById('map-viewport');
  const vw = viewport.clientWidth;
  const vh = viewport.clientHeight;
  scale = Math.min(maxScale, Math.max(scale, minScale * 3));
  scale = Math.min(scale, 3);
  tx = vw / 2 - imgX * scale;
  ty = vh / 2 - imgY * scale - 20;
  applyTransform();
}
