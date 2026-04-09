/* ============================================
   INTERACTIONS — Pop-ups, modales, +info, avatar
   ============================================ */

const Interactions = (() => {

  function init() {
    initModal();
    initPopups();
    initAvatars();
  }

  // ——— Modal de Ayuda ———
  function initModal() {
    const overlay = document.getElementById('modalAyuda');
    const btnAyuda = document.getElementById('btnAyuda');
    const btnClose = document.getElementById('modalClose');

    btnAyuda.addEventListener('click', () => overlay.classList.add('active'));
    btnClose.addEventListener('click', () => overlay.classList.remove('active'));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  }

  // ——— Pop-ups +info ———
  function initPopups() {
    document.querySelectorAll('.popup-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const targetId = trigger.dataset.popup;
        const panel = document.getElementById(targetId);
        if (panel) {
          panel.classList.toggle('active');
          trigger.textContent = panel.classList.contains('active') ? '− info' : '+ info';
        }
      });
    });
  }

  // ——— Avatar Widget ———
  function initAvatars() {
    document.querySelectorAll('.avatar-widget').forEach(widget => {
      const toggle = widget.querySelector('.avatar-toggle');
      const body = widget.querySelector('.avatar-body');
      const video = widget.querySelector('.avatar-video');

      toggle.addEventListener('click', () => {
        const isOpen = body.classList.contains('active');
        body.classList.toggle('active');
        toggle.classList.toggle('active');
        
        // Pausar video al cerrar
        if (isOpen && video) {
          video.pause();
        }
      });
    });
  }

  // Mostrar/ocultar avatar según pantalla activa
  function updateAvatarVisibility(screenIndex) {
    // Ocultar todos primero
    document.querySelectorAll('.avatar-widget').forEach(w => {
      w.style.display = 'none';
      const body = w.querySelector('.avatar-body');
      const toggle = w.querySelector('.avatar-toggle');
      const video = w.querySelector('.avatar-video');
      if (body) body.classList.remove('active');
      if (toggle) toggle.classList.remove('active');
      if (video) video.pause();
    });

    // Mostrar el avatar de la pantalla actual
    const activeScreen = document.getElementById('screen-' + screenIndex);
    if (activeScreen) {
      const avatar = activeScreen.querySelector('.avatar-widget');
      if (avatar) {
        avatar.style.display = 'flex';
      }
    }
  }

  return { init, updateAvatarVisibility };
})();