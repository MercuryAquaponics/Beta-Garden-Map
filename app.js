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

  document.getElementById('zoom-center').onclick = () => fitStage();

  window.addEventListener('resize', () => fitStage());
}
