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

  const backBtn = currentLang === 'sv' ? '← Tillbaka' : '← Back';
  const content = `
    <div style="margin-bottom: 16px;">
      <button onclick="goBackToPlants()" style="background: var(--sage); color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: 600;">${backBtn}</button>
    </div>
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

  // Refit after panel opens and HTML renders
  setTimeout(() => fitStage(), 100);
  // Then zoom to the specific container
  setTimeout(() => zoomToCode(code), 150);
  // Refit one more time to center properly
  setTimeout(() => fitStage(), 200);
}
