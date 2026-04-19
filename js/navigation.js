/* ===================================================
   navigation.js — Transiciones fade entre pantallas
   =================================================== */

const ODCNav = (() => {
  const TOTAL = 13;
  let current = 0;
  let isAnimating = false;

  function getScreen(n) {
    return document.getElementById('screen-' + n);
  }

  function updateProgress(n) {
    const pct = (n / (TOTAL - 1)) * 100;
    const fill = document.getElementById('progressFill');
    if (fill) fill.style.width = pct + '%';
  }

  function updateNavButtons(n) {
    const prev = document.getElementById('btnPrev');
    const next = document.getElementById('btnNext');
    if (prev) prev.style.opacity = n === 0 ? '0.35' : '1';
    if (next) next.style.opacity = n === TOTAL - 1 ? '0.35' : '1';
  }

  function showScreen(n, direction = 'next') {
    if (isAnimating) return;
    if (n < 0 || n >= TOTAL) return;
    if (n === current) return;

    isAnimating = true;
    const outEl = getScreen(current);
    const inEl  = getScreen(n);

    // Fade out current
    outEl.classList.add('fade-out');

    setTimeout(() => {
      outEl.classList.remove('active', 'fade-out');
      outEl.style.display = 'none';

      inEl.style.display = 'block';
      inEl.classList.add('active');

      current = n;
      updateProgress(n);
      updateNavButtons(n);

      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Trigger zone reveals
      if (window.ODCInteractions) {
        window.ODCInteractions.triggerReveal();
        window.ODCInteractions.triggerCounters();
      }

      setTimeout(() => { isAnimating = false; }, 500);
    }, 200);
  }

  function init() {
    // Prev / Next
    document.getElementById('btnPrev')?.addEventListener('click', () => {
      if (current > 0) showScreen(current - 1, 'prev');
    });
    document.getElementById('btnNext')?.addEventListener('click', () => {
      if (current < TOTAL - 1) showScreen(current + 1, 'next');
    });

    // Menu button
    document.getElementById('btnMenu')?.addEventListener('click', () => showScreen(2));

    // Portada buttons
    document.getElementById('btnIniciar')?.addEventListener('click', () => showScreen(1));
    document.getElementById('btnGoMenu')?.addEventListener('click', () => showScreen(2));

    // Menu cards with data-goto
    document.querySelectorAll('[data-goto]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = parseInt(btn.dataset.goto);
        showScreen(target);
      });
    });

    // Keyboard navigation
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (current < TOTAL - 1) showScreen(current + 1);
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (current > 0) showScreen(current - 1);
      }
    });

    // Init progress
    updateProgress(0);
    updateNavButtons(0);
  }

  return { init, showScreen, getCurrent: () => current };
})();

document.addEventListener('DOMContentLoaded', () => ODCNav.init());