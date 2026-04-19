/* ===================================================
   interactions.js
   - Partículas animadas en portada (canvas)
   - Reveal animado de zonas al cambiar pantalla
   - Contadores animados en estadísticas
   - Popups
   =================================================== */

const ODCInteractions = (() => {

  /* ---- PARTÍCULAS (canvas en portada) ---- */
  let particleCanvas, ctx, particles = [], animFrameId;

  function initParticles() {
    particleCanvas = document.getElementById('particleCanvas');
    if (!particleCanvas) return;

    ctx = particleCanvas.getContext('2d');
    resizeCanvas();
    spawnParticles(45);
    animateParticles();

    window.addEventListener('resize', () => {
      resizeCanvas();
      particles = [];
      spawnParticles(45);
    });
  }

  function resizeCanvas() {
    if (!particleCanvas) return;
    const parent = particleCanvas.parentElement;
    particleCanvas.width  = parent.offsetWidth;
    particleCanvas.height = parent.offsetHeight;
  }

  function spawnParticles(count) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x:   Math.random() * particleCanvas.width,
        y:   Math.random() * particleCanvas.height,
        r:   Math.random() * 2.5 + 0.5,
        vx:  (Math.random() - 0.5) * 0.35,
        vy:  (Math.random() - 0.5) * 0.35,
        a:   Math.random() * 0.5 + 0.1,
        hue: Math.random() < 0.3 ? 350 : 20,  // rojo o cálido
      });
    }
  }

  function animateParticles() {
    if (!ctx || !particleCanvas) return;
    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around
      if (p.x < 0) p.x = particleCanvas.width;
      if (p.x > particleCanvas.width) p.x = 0;
      if (p.y < 0) p.y = particleCanvas.height;
      if (p.y > particleCanvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 60%, 55%, ${p.a})`;
      ctx.fill();
    });

    // Draw connecting lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(192, 32, 43, ${0.06 * (1 - dist / 90)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    animFrameId = requestAnimationFrame(animateParticles);
  }

  function pauseParticles() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
  }

  function resumeParticles(screenIndex) {
    if (screenIndex === 0) {
      animateParticles();
    } else {
      pauseParticles();
    }
  }

  /* ---- REVEAL ZONES ---- */
  function triggerReveal() {
    const activeScreen = document.querySelector('.screen.active');
    if (!activeScreen) return;

    const zones = activeScreen.querySelectorAll('.reveal-zone');

    // Primero marcar como ocultas brevemente, luego revelar escalonado
    zones.forEach(z => z.classList.add('reveal-hidden'));

    zones.forEach((zone, i) => {
      setTimeout(() => zone.classList.remove('reveal-hidden'), 60 + i * 80);
    });
  }

  /* ---- CONTADORES ANIMADOS ---- */
  function animateCounter(el, target, duration = 1200) {
    const isFloat = target % 1 !== 0;
    const start = performance.now();
    const startVal = 0;

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quart
      const eased = 1 - Math.pow(1 - progress, 4);
      const val = startVal + (target - startVal) * eased;

      el.textContent = isFloat
        ? val.toFixed(1) + '%'
        : (Number.isInteger(target) && target < 20)
          ? Math.round(val).toString()
          : Math.round(val) + (el.dataset.suffix || '');

      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function triggerCounters() {
    const activeScreen = document.querySelector('.screen.active');
    if (!activeScreen) return;

    activeScreen.querySelectorAll('.stat-value[data-count]').forEach(el => {
      const target = parseFloat(el.dataset.count);
      el.textContent = '0';
      setTimeout(() => animateCounter(el, target), 200);
    });
  }

  /* ---- POPUPS ---- */
  function initPopups() {
    document.querySelectorAll('.popup-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = document.getElementById(btn.dataset.popup);
        if (!panel) return;
        const isOpen = panel.classList.contains('open');
        // Close all
        document.querySelectorAll('.popup-panel.open').forEach(p => p.classList.remove('open'));
        if (!isOpen) panel.classList.add('open');
      });
    });

    // Close popup on outside click
    document.addEventListener('click', e => {
      if (!e.target.closest('.popup-trigger') && !e.target.closest('.popup-panel')) {
        document.querySelectorAll('.popup-panel.open').forEach(p => p.classList.remove('open'));
      }
    });
  }

  /* ---- MODAL ---- */
  function initModal() {
    document.getElementById('btnAyuda')?.addEventListener('click', () => {
      document.getElementById('modalAyuda')?.classList.add('open');
    });
    document.getElementById('modalClose')?.addEventListener('click', () => {
      document.getElementById('modalAyuda')?.classList.remove('open');
    });
    document.getElementById('modalAyuda')?.addEventListener('click', e => {
      if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
    });
  }

  /* ---- HOVER ZONES ---- */
  function initZoneHovers() {
    document.querySelectorAll('.zone-1, .zone-3, .zone-4').forEach(zone => {
      zone.addEventListener('mouseenter', () => {
        zone.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
      });
      zone.addEventListener('mouseleave', () => {
        zone.style.boxShadow = '';
      });
    });
  }

  /* ---- INIT ---- */
  function init() {
    initParticles();
    initPopups();
    initModal();
    initZoneHovers();
    // First screen reveal
    setTimeout(() => {
      triggerReveal();
      triggerCounters();
    }, 300);
  }

  return { init, triggerReveal, triggerCounters, resumeParticles };
})();

document.addEventListener('DOMContentLoaded', () => ODCInteractions.init());