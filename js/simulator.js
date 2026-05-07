// js/simulator.js - Simulador SER con pipeline visual
(function() {
  var SIMULATION_DATA = {
    audio1: {
      src: 'assets/audio/audio1.mp4',
      emotion: 'Neutral', emoji: '😐', confidence: 68.4, color: '#95a5a6',
      probs: {'Neutral':68.4,'Tristeza':21.2,'Calma':5.1,'Miedo':2.3,'Felicidad':1.1,'Sorpresa':0.8,'Disgusto':0.7,'Ira':0.4}
    },
    audio2: {
      src: 'assets/audio/audio2.mp4',
      emotion: 'Ira', emoji: '😠', confidence: 55.7, color: '#e74c3c',
      probs: {'Ira':55.7,'Felicidad':32.1,'Sorpresa':6.5,'Disgusto':2.4,'Miedo':1.5,'Neutral':1.1,'Tristeza':0.5,'Calma':0.2}
    }
  };

  var currentAudioId = null;
  var audioEl = new Audio();
  var screenEl = document.getElementById('screen-9');
  var selectBtns = document.querySelectorAll('.demo-btn-select');
  var playBtn = document.getElementById('demoPlayBtn');
  var analyzeBtn = document.getElementById('demoAnalyzeBtn');
  var statusEl = document.getElementById('demoStatus');
  var emojiEl = document.getElementById('demoEmoji');
  var emotionTextEl = document.getElementById('demoEmotionText');
  var confidenceEl = document.getElementById('demoConfidence');
  var barsContainer = document.getElementById('demoBars');
  var pipelineSteps = document.querySelectorAll('.pipeline-step');

  if (!playBtn || !analyzeBtn || !statusEl) return;

  function setPipelineState(activeIdx) {
    pipelineSteps.forEach(function(step, i) {
      step.classList.remove('is-active', 'is-done');
      if (i < activeIdx) step.classList.add('is-done');
      else if (i === activeIdx) step.classList.add('is-active');
    });
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
      screenEl && screenEl.classList.remove('sim-analyzed');
      statusEl.textContent = '> Audio cargado. Listo para análisis.';
      statusEl.className = 'demo-status';
      setPipelineState(0);
    });
  });

  playBtn.addEventListener('click', function() {
    if (!currentAudioId) return;
    statusEl.textContent = '> Reproduciendo audio...';
    setPipelineState(0);
    try { audioEl.play(); } catch(e) {}
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
    screenEl && screenEl.classList.remove('sim-analyzed');

    setPipelineState(1);
    statusEl.textContent = '> Extrayendo características (MFCC, ZCR, Mel)...';
    statusEl.className = 'demo-status status-analyzing';

    setTimeout(function() {
      setPipelineState(2);
      statusEl.textContent = '> Ejecutando predicción en 1D CNN...';
      setTimeout(function() {
        setPipelineState(3);
        showResults(SIMULATION_DATA[currentAudioId]);
        statusEl.textContent = '> Análisis completado exitosamente.';
        statusEl.className = 'demo-status';
        playBtn.classList.add('enabled');
        analyzeBtn.classList.add('enabled');
        playBtn.removeAttribute('disabled');
        analyzeBtn.removeAttribute('disabled');
        selectBtns.forEach(function(b) { b.style.pointerEvents = 'auto'; });
      }, 1300);
    }, 1100);
  });

  function showResults(data) {
    emojiEl.textContent = data.emoji;
    emotionTextEl.textContent = data.emotion;
    emotionTextEl.style.color = data.color;
    confidenceEl.textContent = 'Confianza: ' + data.confidence.toFixed(1) + '% · ' + (data.confidence >= 60 ? 'Alta' : 'Media');
    barsContainer.innerHTML = '';
    var entries = Object.entries(data.probs);
    entries.forEach(function(entry) {
      var emotion = entry[0], prob = entry[1];
      var isTop = (emotion === data.emotion);
      var row = document.createElement('div');
      row.className = 'demo-bar-row';
      var labelStyle = isTop ? 'font-weight:bold;color:' + data.color : '';
      var fillBg = isTop ? data.color : '#34495e';
      row.innerHTML =
        '<div class="demo-bar-label" style="' + labelStyle + '">' + emotion + '</div>' +
        '<div class="demo-bar-track"><div class="demo-bar-fill" style="background:' + fillBg + '"></div></div>' +
        '<div class="demo-bar-pct">' + prob.toFixed(1) + '%</div>';
      barsContainer.appendChild(row);
      setTimeout(function() {
        row.querySelector('.demo-bar-fill').style.width = prob + '%';
      }, 50);
    });
    screenEl && screenEl.classList.add('sim-analyzed');
  }
})();
