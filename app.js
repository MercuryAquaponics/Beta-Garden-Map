  // Buttons
  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  const zoomCenterBtn = document.getElementById('zoom-center');
  
  console.log('Zoom buttons found:', { zoomInBtn, zoomOutBtn, zoomCenterBtn });
  
  if (zoomInBtn) {
    zoomInBtn.onclick = () => {
      const rect = viewport.getBoundingClientRect();
      zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 1.3);
    };
  }
  
  if (zoomOutBtn) {
    zoomOutBtn.onclick = () => {
      const rect = viewport.getBoundingClientRect();
      zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 1 / 1.3);
    };
  }
  
  if (zoomCenterBtn) {
    zoomCenterBtn.onclick = () => fitStage();
  }
