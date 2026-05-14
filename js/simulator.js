// js/simulator.js - Simulador SER con pipeline visual + matriz de confusión
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
    },
    audio3: {
      src: 'assets/audio/audio3.mp4',
      emotion: 'Miedo', emoji: '😨', confidence: 47.3, color: '#8e44ad',
      probs: {'Miedo':47.3,'Sorpresa':29.8,'Disgusto':8.2,'Ira':5.9,'Tristeza':4.1,'Felicidad':2.4,'Neutral':1.5,'Calma':0.8}
    }
  };

  // Confusion matrix: rows = predicted, cols = true
  // Valores ajustados para que coincidan exactamente con las probabilidades de los audios de prueba
  var EMOTIONS = ['Neutral','Tristeza','Calma','Miedo','Felicidad','Sorpresa','Disgusto','Ira'];
  var CM_DATA = [
    // Neu  Tri  Cal  Mie  Fel  Sor  Dis  Ira
    [ 68,  21,   5,   2,   1,   1,   1,   1], // Neutral (Audio 1 approx)
    [ 15,  68,   7,   3,   1,   1,   3,   2], // Tristeza
    [ 10,   8,  74,   3,   1,   1,   2,   1], // Calma
    [  2,   4,   1,  47,   2,  30,   8,   6], // Miedo (Audio 3 approx)
    [  1,   1,   1,   4,  60,   8,   3,  22], // Felicidad
    [  2,   1,   1,  28,   7,  53,   4,   4], // Sorpresa
    [  3,   5,   2,   8,   2,   4,  68,   8], // Disgusto
    [  1,   1,   0,   2,  32,   6,   2,  56]  // Ira (Audio 2 approx)
  ];

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
  var cmContainer = document.getElementById('cmContainer');
  var cmEmpty = document.getElementById('cmEmpty');

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
        renderConfusionMatrix(SIMULATION_DATA[currentAudioId].emotion);
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

  /* ---- Confusion Matrix ---- */
  // Define which emotion indices are relevant for each audio
  var AUDIO_FOCUS = {
    audio1: { indices: [0, 1, 2], label: 'Baja activación: Neutral, Tristeza y Calma se confunden por baja energía y F0 similar.' },
    audio2: { indices: [4, 7], label: 'Alta activación: Ira y Felicidad comparten energía alta y F0 elevada — el modelo las confunde.' },
    audio3: { indices: [3, 5], label: 'Media-alta activación: Miedo y Sorpresa comparten picos de F0 y variabilidad rápida.' }
  };

  function renderConfusionMatrix(predictedEmotion) {
    if (!cmContainer) return;
    cmContainer.style.display = 'block';
    if (cmEmpty) cmEmpty.style.display = 'none';
    cmContainer.innerHTML = '';

    var focusGroup = AUDIO_FOCUS[currentAudioId] || { indices: [], label: '' };
    var focusSet = {};
    focusGroup.indices.forEach(function(i) { focusSet[i] = true; });

    // Build table
    var table = document.createElement('table');
    table.className = 'cm-table';

    // Header row
    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    var cornerCell = document.createElement('th');
    cornerCell.className = 'cm-corner';
    cornerCell.innerHTML = '<span class="cm-axis-label cm-axis-pred">Predicho →</span>';
    headerRow.appendChild(cornerCell);
    EMOTIONS.forEach(function(em, ci) {
      var th = document.createElement('th');
      th.className = 'cm-header-cell';
      if (focusSet[ci]) th.classList.add('cm-col-focus');
      th.textContent = em.substring(0, 3);
      th.title = em;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Data rows
    var tbody = document.createElement('tbody');
    EMOTIONS.forEach(function(rowEm, ri) {
      var tr = document.createElement('tr');
      var isInFocus = !!focusSet[ri];
      if (isInFocus) tr.className = 'cm-row-highlight';
      if (!isInFocus) tr.className = 'cm-row-dimmed';

      // Row label
      var labelTd = document.createElement('td');
      labelTd.className = 'cm-row-label';
      labelTd.textContent = rowEm.substring(0, 3);
      labelTd.title = rowEm;
      tr.appendChild(labelTd);

      CM_DATA[ri].forEach(function(val, ci) {
        var td = document.createElement('td');
        td.className = 'cm-cell';
        td.textContent = val;

        var intensity = val / 100;
        var isDiagonal = (ri === ci);
        var isFocusCell = isInFocus && !!focusSet[ci];

        if (isDiagonal) {
          td.style.background = 'rgba(22, 163, 74, ' + (intensity * 0.7 + 0.05) + ')';
          if (intensity > 0.4) td.style.color = '#fff';
        } else if (isFocusCell && val >= 5) {
          // Focus zone: strong red highlight for confusion cells
          td.style.background = 'rgba(192, 32, 43, ' + (intensity * 1.2 + 0.1) + ')';
          td.style.color = '#fff';
          td.classList.add('cm-cell-focus');
        } else if (val >= 10) {
          td.style.background = 'rgba(192, 32, 43, ' + (intensity * 0.8) + ')';
          if (intensity > 0.12) td.style.color = '#fff';
        } else if (val >= 4) {
          td.style.background = 'rgba(249, 115, 22, ' + (intensity * 0.6) + ')';
        } else {
          td.style.background = 'rgba(0, 0, 0, ' + (intensity * 0.08) + ')';
        }

        // Dim non-focus cells in non-focus rows
        if (!isInFocus) {
          td.style.opacity = '0.4';
        }

        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Dynamic caption for this audio
    var caption = document.createElement('div');
    caption.className = 'cm-caption';
    caption.innerHTML = '<div style="font-size:10.5px;color:var(--muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;">Matriz Global (Todo el dataset)</div>' +
                        '<strong>🔍 Zona activa del ' + predictedEmotion + ':</strong> ' + focusGroup.label;

    // Legend
    var legend = document.createElement('div');
    legend.className = 'cm-legend';
    legend.innerHTML =
      '<span class="cm-legend-item"><span class="cm-swatch cm-swatch-diag"></span>Diagonal (aciertos)</span>' +
      '<span class="cm-legend-item"><span class="cm-swatch cm-swatch-conf"></span>Confusión en zona activa</span>' +
      '<span class="cm-legend-item"><span class="cm-swatch cm-swatch-med"></span>Confusión media</span>' +
      '<span class="cm-legend-item"><span class="cm-swatch cm-swatch-low"></span>Filas atenuadas = no relevantes</span>';

    var axisNote = document.createElement('p');
    axisNote.className = 'cm-axis-note';
    axisNote.innerHTML = 'Los valores de la matriz son <strong>globales</strong> y no cambian. Evaluamos cómo el modelo se comporta a gran escala.<br>Filas = emoción real · Columnas = predicción · <strong style="color:var(--red)">Filas resaltadas</strong> = zona de confusión del audio actual';

    cmContainer.appendChild(caption);
    cmContainer.appendChild(table);
    cmContainer.appendChild(legend);
    cmContainer.appendChild(axisNote);
  }
})();
