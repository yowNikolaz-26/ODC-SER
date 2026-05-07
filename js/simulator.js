// js/simulator.js
// Lógica para la simulación interactiva del modelo 1D CNN

(function() {
  var SIMULATION_DATA = {
    audio1: {
      src: 'assets/audio/audio1.mp4',
      emotion: 'Neutral',
      emoji: '😐',
      confidence: 68.4,
      color: '#95a5a6',
      probs: {
        'Neutral': 68.4,
        'Tristeza': 21.2,
        'Calma': 5.1,
        'Miedo': 2.3,
        'Felicidad': 1.1,
        'Sorpresa': 0.8,
        'Disgusto': 0.7,
        'Ira': 0.4
      }
    },
    audio2: {
      src: 'assets/audio/audio2.mp4',
      emotion: 'Ira',
      emoji: '😠',
      confidence: 55.7,
      color: '#e74c3c',
      probs: {
        'Ira': 55.7,
        'Felicidad': 32.1,
        'Sorpresa': 6.5,
        'Disgusto': 2.4,
        'Miedo': 1.5,
        'Neutral': 1.1,
        'Tristeza': 0.5,
        'Calma': 0.2
      }
    }
  };

  var currentAudioId = null;
  var audioEl = new Audio();

  var selectBtns = document.querySelectorAll('.demo-btn-select');
  var playBtn = document.getElementById('demoPlayBtn');
  var analyzeBtn = document.getElementById('demoAnalyzeBtn');
  var statusEl = document.getElementById('demoStatus');
  var resultsEl = document.getElementById('demoResults');
  var emojiEl = document.getElementById('demoEmoji');
  var emotionTextEl = document.getElementById('demoEmotionText');
  var confidenceEl = document.getElementById('demoConfidence');
  var barsContainer = document.getElementById('demoBars');

  if (!playBtn || !analyzeBtn || !statusEl) {
    console.warn('Simulator: DOM elements not found');
    return;
  }

  selectBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      selectBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentAudioId = btn.getAttribute('data-audio');

      var data = SIMULATION_DATA[currentAudioId];
      audioEl.src = data.src;

      playBtn.classList.add('enabled');
      analyzeBtn.classList.add('enabled');
      playBtn.removeAttribute('disabled');
      analyzeBtn.removeAttribute('disabled');
      resultsEl.style.display = 'none';

      statusEl.textContent = '> Audio cargado. Listo para análisis.';
      statusEl.className = 'demo-status';
    });
  });

  playBtn.addEventListener('click', function() {
    if (!currentAudioId) return;
    statusEl.textContent = '> Reproduciendo audio...';
    audioEl.play();
    audioEl.onended = function() {
      statusEl.textContent = '> Reproducción finalizada. Listo para análisis.';
    };
  });

  analyzeBtn.addEventListener('click', function() {
    if (!currentAudioId) return;

    playBtn.classList.remove('enabled');
    analyzeBtn.classList.remove('enabled');
    playBtn.setAttribute('disabled', 'disabled');
    analyzeBtn.setAttribute('disabled', 'disabled');
    selectBtns.forEach(function(b) { b.style.pointerEvents = 'none'; });

    resultsEl.style.display = 'none';
    statusEl.textContent = '> Extrayendo características (MFCC, ZCR, Mel)...';
    statusEl.className = 'demo-status status-analyzing';

    setTimeout(function() {
      statusEl.textContent = '> Ejecutando predicción en 1D CNN...';

      setTimeout(function() {
        showResults(SIMULATION_DATA[currentAudioId]);

        statusEl.textContent = '> Análisis completado exitosamente.';
        statusEl.className = 'demo-status';

        playBtn.classList.add('enabled');
        analyzeBtn.classList.add('enabled');
        playBtn.removeAttribute('disabled');
        analyzeBtn.removeAttribute('disabled');
        selectBtns.forEach(function(b) { b.style.pointerEvents = 'auto'; });
      }, 1500);
    }, 1200);
  });

  function showResults(data) {
    emojiEl.textContent = data.emoji;
    emotionTextEl.textContent = data.emotion;
    emotionTextEl.style.color = data.color;
    confidenceEl.textContent = 'Confianza: ' + data.confidence.toFixed(1) + '%';

    barsContainer.innerHTML = '';

    var entries = Object.entries(data.probs);
    entries.forEach(function(entry) {
      var emotion = entry[0];
      var prob = entry[1];
      var isTop = (emotion === data.emotion);
      var row = document.createElement('div');
      row.className = 'demo-bar-row';

      var labelStyle = isTop ? 'font-weight:bold;color:' + data.color : '';
      var fillBg = isTop ? data.color : '#34495e';

      row.innerHTML =
        '<div class="demo-bar-label" style="' + labelStyle + '">' + emotion + '</div>' +
        '<div class="demo-bar-track">' +
          '<div class="demo-bar-fill" style="background:' + fillBg + '"></div>' +
        '</div>' +
        '<div class="demo-bar-pct">' + prob.toFixed(1) + '%</div>';

      barsContainer.appendChild(row);

      setTimeout(function() {
        row.querySelector('.demo-bar-fill').style.width = prob + '%';
      }, 50);
    });

    resultsEl.style.display = 'flex';
    resultsEl.style.opacity = '0';
    resultsEl.style.transform = 'translateY(10px)';
    resultsEl.style.transition = 'all 0.4s ease';

    requestAnimationFrame(function() {
      resultsEl.style.opacity = '1';
      resultsEl.style.transform = 'translateY(0)';
    });
  }
})();
