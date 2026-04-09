/* ============================================
   NAVIGATION — Manejo de pantallas y progreso
   ============================================ */

const Navigation = (() => {
  const TOTAL_SCREENS = 13;
  let currentScreen = 0;

  // Elementos del DOM
  const screens = () => document.querySelectorAll('.screen');
  const progressFill = () => document.getElementById('progressFill');
  const btnPrev = () => document.getElementById('btnPrev');
  const btnNext = () => document.getElementById('btnNext');

  function init() {
    // Botones de navegación
    btnPrev().addEventListener('click', prev);
    btnNext().addEventListener('click', next);

    // Botón Menú → ir a pantalla 2 (índice 2)
    document.getElementById('btnMenu').addEventListener('click', () => goTo(2));

    // Cards del menú
    document.querySelectorAll('.menu-card[data-goto]').forEach(card => {
      card.addEventListener('click', () => {
        const target = parseInt(card.dataset.goto);
        goTo(target);
      });
    });

    // Teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') {
        // Cerrar modal si está abierto
        const modal = document.getElementById('modalAyuda');
        if (modal.classList.contains('active')) {
          modal.classList.remove('active');
        }
      }
    });

    updateUI();
  }

  function goTo(index) {
    if (index < 0 || index >= TOTAL_SCREENS) return;
    
    const allScreens = screens();
    
    // Ocultar actual
    allScreens[currentScreen].classList.remove('active');
    
    // Mostrar nueva
    currentScreen = index;
    allScreens[currentScreen].classList.add('active');
    
    // Scroll arriba
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    updateUI();

    // Actualizar avatar
    if (typeof Interactions !== 'undefined' && Interactions.updateAvatarVisibility) {
      Interactions.updateAvatarVisibility(currentScreen);
    }
  }

  function next() {
    if (currentScreen < TOTAL_SCREENS - 1) {
      goTo(currentScreen + 1);
    }
  }

  function prev() {
    if (currentScreen > 0) {
      goTo(currentScreen - 1);
    }
  }

  function updateUI() {
    // Progreso
    const pct = ((currentScreen + 1) / TOTAL_SCREENS) * 100;
    progressFill().style.width = pct + '%';

    // Botones prev/next
    btnPrev().disabled = currentScreen === 0;
    btnNext().disabled = currentScreen === TOTAL_SCREENS - 1;
  }

  function getCurrent() {
    return currentScreen;
  }

  return { init, goTo, next, prev, getCurrent };
})();