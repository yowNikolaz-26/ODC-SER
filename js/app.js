/* ===================================================
   app.js — Inicialización general y coordinación
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Coordinar navegación con efectos ---- */
  // Patch navigation to call interactions on screen change
  const origShow = ODCNav.showScreen.bind(ODCNav);

  // Override screen transitions to trigger particles and reveals
  const btnNext = document.getElementById('btnNext');
  const btnPrev = document.getElementById('btnPrev');

  function onScreenChange(n) {
    if (window.ODCInteractions) {
      ODCInteractions.resumeParticles(n);
    }
  }

  // Observe which screen becomes active using MutationObserver
  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      if (m.type === 'attributes' && m.attributeName === 'class') {
        const target = m.target;
        if (target.classList.contains('active') && target.classList.contains('screen')) {
          const n = parseInt(target.dataset.screen);
          onScreenChange(n);
        }
      }
    });
  });

  document.querySelectorAll('.screen').forEach(s => {
    observer.observe(s, { attributes: true });
  });

  /* ---- reveal-zone ya viene en el HTML como clase estática ---- */
  // No se agrega dinámicamente para evitar que queden en opacity:0 sin revelar

  /* ---- Add data-count to stat values for counter animation ---- */
  document.querySelectorAll('.stat-value').forEach(el => {
    const text = el.textContent.trim();
    const num = parseFloat(text.replace('%', '').replace(',', '.'));
    if (!isNaN(num)) {
      el.dataset.count = num;
      if (text.includes('%')) el.dataset.suffix = '%';
      el.textContent = '0' + (text.includes('%') ? '%' : '');
    }
  });

  /* ---- Smooth scroll to top on nav click ---- */
  document.getElementById('btnNext')?.addEventListener('click', () => window.scrollTo({ top: 0 }));
  document.getElementById('btnPrev')?.addEventListener('click', () => window.scrollTo({ top: 0 }));

  /* ---- Nav visibility on scroll ---- */
  let lastScroll = 0;
  const nav = document.querySelector('.global-nav');
  window.addEventListener('scroll', () => {
    const curr = window.scrollY;
    if (curr > lastScroll + 80 && curr > 200) {
      nav?.classList.add('hidden-nav');
    } else if (curr < lastScroll - 20 || curr < 100) {
      nav?.classList.remove('hidden-nav');
    }
    lastScroll = curr;
  }, { passive: true });

  /* ---- Trigger initial reveals ---- */
  setTimeout(() => {
    if (window.ODCInteractions) {
      ODCInteractions.triggerReveal();
      ODCInteractions.triggerCounters();
    }
  }, 400);

  console.log('ODC inicializado correctamente ✓');
});