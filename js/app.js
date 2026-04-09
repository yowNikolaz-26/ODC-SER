/* ============================================
   APP — Inicialización principal del ODC
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar módulos
  Navigation.init();
  Interactions.init();
  Quiz.init();

  // Botón Iniciar de la portada → ir a pantalla 2 (REA)
  document.getElementById('btnIniciar').addEventListener('click', () => {
    Navigation.goTo(1);
  });

  console.log('ODC — Reconocimiento Emocional por Voz · Inicializado');
});