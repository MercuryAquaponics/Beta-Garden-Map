// Clarion Hotel Stockholm — Garden Map app logic
// Requires data.js loaded first (defines global DATA)

const LANGUAGES = DATA.languages;
const VERIFIED = new Set(DATA.verifiedLangs);
const SPECIES = DATA.species;
const CATEGORIES = DATA.categories;
const UI = DATA.ui;
const CONTAINERS = DATA.containers;
const POSITIONS = DATA.positions;
const PLANT_INFO = DATA.plantInfo;
const IMG = DATA.img;
const IMG_W = IMG.w, IMG_H = IMG.h;

// ─── STATE ──────────────────────────────────────────────────────────────────
let currentLang = 'sv';
const catVisible = { R:true, F:true, T:true, K:true };
let openTooltipCode = null;
let plantsFilter = null;          // null = all species, or 'R'/'F'/'T'/'K'
let speciesBackTarget = null;     // {type:'container',code} | {type:'allplants', filter}
let clickTimers = {};

function catOf(code) { return code[0]; }
function ui(key) { return (UI[key] && (UI[key][currentLang] || UI[key].en)) || ''; }

function speciesName(id, lang) {
  const sp = SPECIES[id];
  if (!sp) return id;
  return sp.names[lang] || sp.names.en || sp.latin;
}
function speciesLatin(id) { return (SPECIES[id] || {}).latin || ''; }

function containerName(code, lang) {
  const c = CONTAINERS[code];
  if (!c || !c.species.length) return null;
  return c.species.map(id => speciesName(id, lang)).join(' ' + c.joiner + ' ');
}
function containerLatin(code) {
  const c = CONTAINERS[code];
  if (!c || !c.species.length) return null;
  return c.species.map(id => speciesLatin(id)).join(' ' + c.joiner + ' ');
}

// ─── HEADER: CATEGORY PILLS + "OUR PLANTS" PILL ────────────────────────────
const layerPanel = document.getElementById('layer-panel');

Object.keys(CATEGORIES).forEach(catId => {
  const cat = CATEGORIES[catId];
  const pill = document.createElement('label');
  pill.className = 'pill checked';
  pill.dataset.catId = catId;
  pill.innerHTML = `<input type="checkbox" checked><span class="dot" style="background:${cat.hex}"></span><span class="pill-label">${cat.label.sv}</span>`;
  pill.querySelector('input').addEventListener('change', e => {
    catVisible[catId] = e.target.checked;
    pill.classList.toggle('checked', e.target.checked);
    document.querySelectorAll(`.pin[data-cat="${catId}"]`).forEach(p => p.classList.toggle('hidden-cat', !e.target.checked));
  });
  layerPanel.appendChild(pill);
});

const ourPlantsPill = document.createElement('div');
ourPlantsPill.className = 'pill';
ourPlantsPill.id = 'our-plants-pill';
ourPlantsPill.innerHTML = `<span class="pill-label">${ui('ourPlants')}</span>`;
ourPlantsPill.addEventListener('click', () => openPlantsPanel(null));
layerPanel.appendChild(ourPlantsPill);

// ─── LANGUAGE PANEL ─────────────────────────────────────────────────────────
const langGrid = document.getElementById('lang-grid');
LANGUAGES.forEach(([code, label]) => {
  const btn = document.createElement('button');
  btn.className = 'lang-btn' + (code === 'sv' ? ' active' : '');
  btn.dataset.lang = code;
  btn.innerHTML = label + (VERIFIED.has(code) ? '' : ' <span class="lang-unverified-mark">*</span>');
  btn.addEventListener('click', () => { setLang(code); closePanel('lang-panel'); });
  langGrid.appendChild(btn);
});

document.getElementById('lang-btn').addEventListener('click', () => openPanel('lang-panel'));

// ─── PANEL MANAGEMENT (only one open at a time) ────────────────────────────
const PANEL_IDS = ['lang-panel', 'plants-panel', 'detail-panel'];

function openPanel(id) {
  PANEL_IDS.forEach(pid => document.getElementById(pid).classList.toggle('open', pid === id));
  setTimeout(centerImage, 310);
}
function closePanel(id) {
  document.getElementById(id).classList.remove('open');
  setTimeout(centerImage, 310);
}
function closeAllPanels() {
  PANEL_IDS.forEach(pid => document.getElementById(pid).classList.remove('open'));
  setTimeout(centerImage, 310);
}
PANEL_IDS.forEach(pid => {
  document.querySelector(`#${pid} .panel-close`).addEventListener('click', () => closeAllPanels());
});

// ─── LANGUAGE SWITCH ────────────────────────────────────────────────────────
function setLang(lang) {
  currentLang = lang;
  document.getElementById('search').placeholder = ui('searchPlaceholder');
  document.querySelectorAll('.pill[data-cat-id]').forEach(pill => {
    const cat = CATEGORIES[pill.dataset.catId];
    pill.querySelector('.pill-label').textContent = cat.label[lang] || cat.label.en;
  });
  document.querySelector('#our-plants-pill .pill-label').textContent = ui('ourPlants');
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  document.getElementById('lang-panel-title').textContent = ui('languagesTitle');

  if (openTooltipCode) renderTooltip(openTooltipCode);
  buildLegend();

  // Re-render whichever panel is currently showing, preserving its state
  if (document.getElementById('plants-panel').classList.contains('open')) renderPlantsPanel();
  if (document.getElementById('detail-panel').classList.contains('open') && window.__currentDetail) {
    if (window.__currentDetail.type === 'container') renderContainerDetail(window.__currentDetail.code);
    else renderSpeciesDetail(window.__currentDetail.id);
  }
}

// ─── LEGEND ─────────────────────────────────────────────────────────────────
function buildLegend() {
  const box = document.getElementById('legend-box');
  box.innerHTML = Object.keys(CATEGORIES).map(catId => {
    const cat = CATEGORIES[catId];
    return `<div class="leg-row"><span class="leg-swatch" style="background:${cat.hex}"></span>${cat.label[currentLang] || cat.label.en}</div>`;
  }).join('');
}

// ─── "VÅRA VÄXTER" PANEL: category filter buttons + species/container list ─
function openPlantsPanel(filter) {
  plantsFilter = filter;
  openPanel('plants-panel');
  renderPlantsPanel();
}

function renderPlantsPanel() {
  document.getElementById('plants-panel-title').textContent = ui('ourPlants');

  const catBtns = document.getElementById('category-buttons');
  catBtns.innerHTML = Object.keys(CATEGORIES).map(catId => {
    const cat = CATEGORIES[catId];
    const active = plantsFilter === catId;
    return `<button class="category-btn${active ? ' active' : ''}" data-cat="${catId}"
      style="border-color:${cat.hex}; color:${active ? cat.hex : '#555'}">${cat.label[currentLang] || cat.label.en}</button>`;
  }).join('');
  catBtns.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.dataset.cat;
      plantsFilter = (plantsFilter === catId) ? null : catId; // click again to clear filter
      renderPlantsPanel();
    });
  });

  const items = document.getElementById('plant-items');
  items.innerHTML = '';

  if (plantsFilter) {
    // Container list for this category (image 5 style)
    const codes = Object.keys(POSITIONS).filter(c => catOf(c) === plantsFilter)
      .sort((a,b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
    codes.forEach(code => {
      const name = containerName(code, currentLang);
      const cat = CATEGORIES[catOf(code)];
      const row = document.createElement('div');
      row.className = 'container-item';
      row.style.borderLeftColor = cat.hex;
      row.innerHTML = `<div class="container-code">${code}</div>
        <div class="container-plants${name ? '' : ' empty'}">${name || '(' + ui('empty') + ')'}</div>`;
      row.addEventListener('click', () => openContainerDetail(code, { type:'allplants', filter: plantsFilter }));
      items.appendChild(row);
    });
  } else {
    // Deduplicated species list (image 4 style) — every SPECIES entry, no duplicates, no codes
    const ids = Object.keys(SPECIES).sort((a,b) =>
      speciesName(a, currentLang).localeCompare(speciesName(b, currentLang), currentLang));
    ids.forEach(id => {
      const row = document.createElement('div');
      row.className = 'plant-item';
      row.innerHTML = `<div>${speciesName(id, currentLang)}</div><div class="pi-latin">${speciesLatin(id)}</div>`;
      row.addEventListener('click', () => openSpeciesDetail(id, { type:'allplants', filter: plantsFilter }));
      items.appendChild(row);
    });
  }
}

// ─── DETAIL PANEL: container page ──────────────────────────────────────────
window.__currentDetail = null;

function openContainerDetail(code, backCtx) {
  // backCtx is only used to remember where we came from for species pages opened from here;
  // the container page's own Back always returns to the All Plants list filtered to its category.
  window.__currentDetail = { type:'container', code, backCtx: backCtx || null };
  openPanel('detail-panel');
  renderContainerDetail(code);
}

function renderContainerDetail(code) {
  const cat = CATEGORIES[catOf(code)];
  const c = CONTAINERS[code];
  document.getElementById('detail-panel-title').textContent = ui('container') + ' ' + code;

  const plantsHTML = (c && c.species.length)
    ? c.species.map(id =>
        `<button class="plant-name-link" data-id="${id}">${speciesName(id, currentLang)}</button>`
      ).join('')
    : `<div class="container-plants empty">(${ui('empty')})</div>`;

  document.getElementById('detail-content').innerHTML = `
    <button class="back-btn" id="detail-back-btn">← ${ui('back')}</button>
    <div class="detail-section">
      <span class="detail-label">${ui('container')}</span>
      <span class="detail-value">${code}</span>
    </div>
    <div class="detail-section">
      <span class="detail-label">${ui('type')}</span>
      <span class="detail-value">${cat.label[currentLang] || cat.label.en}</span>
    </div>
    <div class="container-image">[${ui('container')} — photo pending]</div>
    <div class="detail-section">
      <span class="detail-label">${ui('plants')}</span>
      <div class="plant-list-in-container">${plantsHTML}</div>
    </div>
  `;

  document.getElementById('detail-back-btn').addEventListener('click', () => {
    // Container page's Back always goes to the All Plants list, filtered to this container's own category
    openPlantsPanel(catOf(code));
  });
  document.querySelectorAll('#detail-content .plant-name-link').forEach(btn => {
    btn.addEventListener('click', () => openSpeciesDetail(btn.dataset.id, { type:'container', code }));
  });
}

// ─── DETAIL PANEL: species page ────────────────────────────────────────────
function openSpeciesDetail(id, backCtx) {
  speciesBackTarget = backCtx;
  window.__currentDetail = { type:'species', id };
  openPanel('detail-panel');
  renderSpeciesDetail(id);
}

function getDescriptionHTML(id) {
  const info = PLANT_INFO[id] || {};
  if (currentLang === 'sv' && info.sv) {
    return `<div class="plant-description">${info.sv}</div>`;
  }
  if (info.en) {
    const fallback = currentLang !== 'en';
    return `<div class="plant-description">${info.en}</div>` +
      (fallback ? `<div class="fallback-note">⚠ ${ui('englishFallbackNote')}</div>` : '');
  }
  return `<div class="plant-description placeholder">${ui('noDescriptionYet')}</div>`;
}

function renderSpeciesDetail(id) {
  const name = speciesName(id, currentLang);
  const latin = speciesLatin(id);
  document.getElementById('detail-panel-title').textContent = name;

  const info = PLANT_INFO[id] || { dishes: [] };
  const dishes = info.dishes && info.dishes.length ? info.dishes : [null, null, null, null];
  const galleryHTML = dishes.map((dish, i) => {
    if (!dish) return `<div class="gallery-item">[${ui('dishes')} ${i+1}]</div>`;
    return `<div class="gallery-item" data-dish-id="${dish.id}">
      ${dish.image ? `<img src="${dish.image}" alt="">` : (dish.name?.[currentLang] || dish.name?.en || '')}
    </div>`;
  }).join('');

  document.getElementById('detail-content').innerHTML = `
    <button class="back-btn" id="detail-back-btn">← ${ui('back')}</button>
    <div class="detail-section">
      <span class="detail-value" style="font-family:'Playfair Display',serif; font-size:1.2rem;">${name}</span><br>
      <span class="detail-value latin">${latin}</span>
    </div>
    <div class="detail-section">
      <span class="detail-label">${ui('description')}</span>
      ${getDescriptionHTML(id)}
    </div>
    <div class="detail-section">
      <span class="detail-label">${ui('dishes')}</span>
      <div class="gallery-grid">${galleryHTML}</div>
    </div>
  `;

  document.getElementById('detail-back-btn').addEventListener('click', () => {
    if (speciesBackTarget && speciesBackTarget.type === 'container') {
      openContainerDetail(speciesBackTarget.code);
    } else {
      openPlantsPanel(speciesBackTarget ? speciesBackTarget.filter : null);
    }
  });
}

// ─── PIN ICON ───────────────────────────────────────────────────────────────
function pinSVG(hex) {
  return `<svg viewBox="0 0 24 34" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 22 12 22S24 21 24 12C24 5.37 18.63 0 12 0z" fill="${hex}" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="4" fill="white" fill-opacity="0.85"/>
  </svg>`;
}

const pinsLayer = document.getElementById('pins-layer');
const pinEls = {};

Object.keys(POSITIONS).forEach(code => {
  const cat = CATEGORIES[catOf(code)];
  const pos = POSITIONS[code];
  const pin = document.createElement('div');
  pin.className = 'pin';
  pin.style.left = pos.x + '%';
  pin.style.top = pos.y + '%';
  pin.dataset.code = code;
  pin.dataset.cat = catOf(code);

  const dot = document.createElement('div');
  dot.className = 'pin-dot';
  dot.innerHTML = pinSVG(cat.hex);
  pin.appendChild(dot);

  const hint = document.createElement('div');
  hint.className = 'pin-hint';
  hint.textContent = code;
  pin.appendChild(hint);

  const tooltip = document.createElement('div');
  tooltip.className = 'pin-tooltip';
  pin.appendChild(tooltip);

  pin.addEventListener('click', e => {
    e.stopPropagation();
    if (clickTimers[code]) return;
    clickTimers[code] = setTimeout(() => { toggleTooltip(code); delete clickTimers[code]; }, 220);
  });
  pin.addEventListener('dblclick', e => {
    e.stopPropagation();
    clearTimeout(clickTimers[code]); delete clickTimers[code];
    closeAllTooltips();
    openContainerDetail(code);
  });

  pinsLayer.appendChild(pin);
  pinEls[code] = { pinEl: pin, tooltipEl: tooltip };
});

function renderTooltip(code) {
  const cat = CATEGORIES[catOf(code)];
  const name = containerName(code, currentLang);
  const latin = containerLatin(code);
  const nameHTML = name
    ? `<div class="pin-tooltip-name">${name}</div>`
    : `<div class="pin-tooltip-name pin-tooltip-empty">(${ui('empty')})</div>`;
  const latinHTML = latin ? `<div class="pin-tooltip-latin">${latin}</div>` : '';
  pinEls[code].tooltipEl.innerHTML = `
    <button class="pin-tooltip-close" data-code="${code}">✕</button>
    <div class="pin-tooltip-cat" style="color:${cat.hex}">${cat.label[currentLang] || cat.label.en}</div>
    <div class="pin-tooltip-code">${code}</div>
    ${nameHTML}${latinHTML}
    <div class="pin-tooltip-hint">${currentLang === 'sv' ? 'Dubbelklicka för detaljer' : 'Double-click for details'}</div>
  `;
  pinEls[code].tooltipEl.querySelector('.pin-tooltip-close').addEventListener('click', e => {
    e.stopPropagation();
    closeAllTooltips();
  });
}

function toggleTooltip(code) {
  if (openTooltipCode === code) { closeAllTooltips(); return; }
  closeAllTooltips();
  renderTooltip(code);
  pinEls[code].tooltipEl.classList.add('open');
  openTooltipCode = code;
}
function closeAllTooltips() {
  Object.values(pinEls).forEach(({ tooltipEl }) => tooltipEl.classList.remove('open'));
  openTooltipCode = null;
}
document.getElementById('map-viewport').addEventListener('click', () => closeAllTooltips());

// ─── SEARCH ─────────────────────────────────────────────────────────────────
function matchesQuery(code, q) {
  if (code.toLowerCase().includes(q)) return true;
  const latin = containerLatin(code);
  if (latin && latin.toLowerCase().includes(q)) return true;
  const c = CONTAINERS[code];
  if (!c) return false;
  return LANGUAGES.some(([lang]) => {
    const name = containerName(code, lang);
    return name && name.toLowerCase().includes(q);
  });
}
function doSearch(query) {
  const box = document.getElementById('search-results');
  if (!query || query.length < 1) { box.style.display = 'none'; return; }
  const q = query.toLowerCase();
  const hits = Object.keys(POSITIONS).filter(code => matchesQuery(code, q)).slice(0, 30);
  if (!hits.length) {
    box.innerHTML = `<div class="search-item">${currentLang === 'sv' ? 'Inga träffar' : 'No matches'}</div>`;
    box.style.display = 'block';
    return;
  }
  box.innerHTML = hits.map(code => {
    const name = containerName(code, currentLang) || '(' + ui('empty') + ')';
    return `<div class="search-item" data-code="${code}"><span class="si-code">${code}</span>${name}</div>`;
  }).join('');
  box.style.display = 'block';
  box.querySelectorAll('.search-item[data-code]').forEach(el => {
    el.addEventListener('click', () => {
      const code = el.dataset.code;
      zoomToCode(code);
      closeAllTooltips();
      renderTooltip(code);
      pinEls[code].tooltipEl.classList.add('open');
      openTooltipCode = code;
      box.style.display = 'none';
      document.getElementById('search').value = '';
    });
  });
}
document.getElementById('search').addEventListener('input', e => doSearch(e.target.value));
document.addEventListener('click', e => { if (!e.target.closest('.search-wrap')) document.getElementById('search-results').style.display = 'none'; });

// ─── PAN / ZOOM ENGINE ──────────────────────────────────────────────────────
const viewport = document.getElementById('map-viewport');
const stage = document.getElementById('map-stage');
let scale = 1, tx = 0, ty = 0, minScale = 0.3, maxScale = 6;

function applyTransform() {
  stage.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  document.documentElement.style.setProperty('--zoom', scale);
}
function fitStage(padding = 20) {
  const vw = viewport.clientWidth, vh = viewport.clientHeight;
  const s = Math.min((vw - padding*2) / IMG_W, (vh - padding*2) / IMG_H);
  scale = Math.max(s, 0.05);
  minScale = scale * 0.6; maxScale = scale * 8;
  tx = (vw - IMG_W*scale)/2; ty = (vh - IMG_H*scale)/2;
  applyTransform();
}
function centerImage() {
  const vw = viewport.clientWidth, vh = viewport.clientHeight;
  tx = vw/2 - (IMG_W/2)*scale;
  ty = vh/2 - (IMG_H/2)*scale;
  applyTransform();
}
function zoomAt(clientX, clientY, factor) {
  const rect = viewport.getBoundingClientRect();
  const px = clientX-rect.left, py = clientY-rect.top;
  const newScale = Math.min(maxScale, Math.max(minScale, scale*factor));
  const ratio = newScale/scale;
  tx = px-(px-tx)*ratio; ty = py-(py-ty)*ratio;
  scale = newScale; applyTransform();
}
function zoomToCode(code) {
  const pos = POSITIONS[code]; if (!pos) return;
  const imgX = pos.x/100*IMG_W, imgY = pos.y/100*IMG_H;
  const vw = viewport.clientWidth, vh = viewport.clientHeight;
  scale = Math.min(maxScale, Math.max(scale, minScale*3)); scale = Math.min(scale, 3.2);
  tx = vw/2 - imgX*scale; ty = vh/2 - imgY*scale - 30;
  applyTransform();
}
viewport.addEventListener('wheel', e => {
  e.preventDefault();
  zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.15 : 1/1.15);
}, { passive:false });

let dragging = false, lastX = 0, lastY = 0;
const activePointers = new Map();
let pinchStartDist = null, pinchStartScale = null;

viewport.addEventListener('pointerdown', e => {
  if (e.target.closest('.pin')) return;
  viewport.setPointerCapture(e.pointerId);
  activePointers.set(e.pointerId, { x:e.clientX, y:e.clientY });
  if (activePointers.size === 1) {
    dragging = true; lastX = e.clientX; lastY = e.clientY; viewport.classList.add('grabbing');
  } else if (activePointers.size === 2) {
    dragging = false;
    const pts = [...activePointers.values()];
    pinchStartDist = Math.hypot(pts[0].x-pts[1].x, pts[0].y-pts[1].y);
    pinchStartScale = scale;
  }
});
viewport.addEventListener('pointermove', e => {
  if (!activePointers.has(e.pointerId)) return;
  activePointers.set(e.pointerId, { x:e.clientX, y:e.clientY });
  if (activePointers.size === 2) {
    const pts = [...activePointers.values()];
    const dist = Math.hypot(pts[0].x-pts[1].x, pts[0].y-pts[1].y);
    if (pinchStartDist) {
      const midX = (pts[0].x+pts[1].x)/2, midY = (pts[0].y+pts[1].y)/2;
      const targetScale = Math.min(maxScale, Math.max(minScale, pinchStartScale*(dist/pinchStartDist)));
      const ratio = targetScale/scale;
      const rect = viewport.getBoundingClientRect();
      const px = midX-rect.left, py = midY-rect.top;
      tx = px-(px-tx)*ratio; ty = py-(py-ty)*ratio; scale = targetScale; applyTransform();
    }
  } else if (dragging && activePointers.size === 1) {
    const dx = e.clientX-lastX, dy = e.clientY-lastY;
    tx += dx; ty += dy; lastX = e.clientX; lastY = e.clientY; applyTransform();
  }
});
function endPointer(e) {
  activePointers.delete(e.pointerId);
  if (activePointers.size < 2) pinchStartDist = null;
  if (activePointers.size === 0) { dragging = false; viewport.classList.remove('grabbing'); }
}
viewport.addEventListener('pointerup', endPointer);
viewport.addEventListener('pointercancel', endPointer);
viewport.addEventListener('pointerleave', endPointer);

document.getElementById('zoom-in').addEventListener('click', () => { const r = viewport.getBoundingClientRect(); zoomAt(r.left+r.width/2, r.top+r.height/2, 1.3); });
document.getElementById('zoom-out').addEventListener('click', () => { const r = viewport.getBoundingClientRect(); zoomAt(r.left+r.width/2, r.top+r.height/2, 1/1.3); });
document.getElementById('zoom-center').addEventListener('click', () => centerImage());
window.addEventListener('resize', () => fitStage());

// ─── INIT ───────────────────────────────────────────────────────────────────
buildLegend();
setLang('sv');
document.getElementById('lang-panel-title').textContent = ui('languagesTitle');
document.getElementById('search').placeholder = ui('searchPlaceholder');
requestAnimationFrame(() => fitStage());
