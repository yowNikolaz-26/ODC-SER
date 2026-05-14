// js/simulator.js - Simulador SER con pipeline visual + matriz de confusión
(function() {
  var SIMULATION_DATA = {
    audio1: {
      src: 'assets/audio/audio1.mp4',
      actual: 'Neutral',
      emotion: 'Neutral', emoji: '😐', confidence: 68.4, color: '#95a5a6',
      probs: {'Neutral':68.4,'Tristeza':21.2,'Calma':5.1,'Miedo':2.3,'Felicidad':1.1,'Sorpresa':0.8,'Disgusto':0.7,'Ira':0.4},
      focusNote: 'Baja activación: Neutral, Tristeza y Calma se confunden por baja energía y F0 similar.'
    },
    audio2: {
      src: 'assets/audio/audio2.mp4',
      actual: 'Ira',
      emotion: 'Ira', emoji: '😠', confidence: 55.7, color: '#e74c3c',
      probs: {'Ira':55.7,'Felicidad':32.1,'Sorpresa':6.5,'Disgusto':2.4,'Miedo':1.5,'Neutral':1.1,'Tristeza':0.5,'Calma':0.2},
      focusNote: 'Alta activación: Ira y Felicidad comparten energía alta y F0 elevada — el modelo las confunde.'
    },
    audio3: {
      src: 'assets/audio/audio3.mp4',
      actual: 'Miedo',
      emotion: 'Miedo', emoji: '😨', confidence: 47.3, color: '#8e44ad',
      probs: {'Miedo':47.3,'Sorpresa':29.8,'Disgusto':8.2,'Ira':5.9,'Tristeza':4.1,'Felicidad':2.4,'Neutral':1.5,'Calma':0.8},
      focusNote: 'Media-alta activación: Miedo y Sorpresa comparten picos de F0 y variabilidad rápida.'
    }
  };

  // CONVENCIÓN: filas = emoción REAL (ground truth), columnas = predicción del modelo.
  // Cada fila suma 100. La fila correspondiente al audio activo se reemplaza dinámicamente
  // con las probabilidades exactas de ese audio (ver buildDynamicCM).
  var EMOTIONS = ['Neutral','Tristeza','Calma','Miedo','Felicidad','Sorpresa','Disgusto','Ira'];
  var CM_BASELINE = [
    // Pred:  Neu  Tri  Cal  Mie  Fel  Sor  Dis  Ira
    /*Neu*/ [ 68,  21,   5,   2,   1,   1,   1,   1],
    /*Tri*/ [ 15,  68,   7,   3,   1,   1,   3,   2],
    /*Cal*/ [ 10,   8,  74,   3,   1,   1,   2,   1],
    /*Mie*/ [  2,   4,   1,  47,   2,  30,   8,   6],
    /*Fel*/ [  1,   1,   1,   4,  60,   8,   3,  22],
    /*Sor*/ [  2,   1,   1,  28,   7,  53,   4,   4],
    /*Dis*/ [  3,   5,   2,   8,   2,   4,  68,   8],
    /*Ira*/ [  1,   1,   0,   2,  32,   6,   2,  56]
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
        var data = SIMULATION_DATA[currentAudioId];
        showResults(data);
        renderConfusionMatrix(data);
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

  /* ---- Confusion Matrix dinámica ----
     La fila correspondiente a la emoción REAL del audio se reemplaza por las
     probabilidades exactas que muestra el simulador. Así las barras y la matriz
     siempre coinciden numéricamente. */

  function buildDynamicCM(data) {
    // Clon profundo del baseline
    var cm = CM_BASELINE.map(function(row) { return row.slice(); });
    var actualIdx = EMOTIONS.indexOf(data.actual);
    if (actualIdx < 0) return cm;
    // Fila de la emoción real = probs exactas en orden de EMOTIONS
    cm[actualIdx] = EMOTIONS.map(function(em) {
      return data.probs[em] != null ? data.probs[em] : 0;
    });
    return cm;
  }

  function computeFocus(data) {
    // Columnas de confusión = predicciones con prob >= 3% (incluye la diagonal)
    var actualIdx = EMOTIONS.indexOf(data.actual);
    var cols = [];
    EMOTIONS.forEach(function(em, i) {
      var p = data.probs[em] || 0;
      if (p >= 3) cols.push(i);
    });
    if (cols.indexOf(actualIdx) === -1) cols.push(actualIdx);
    return { actualIdx: actualIdx, cols: cols };
  }

  function fmtCell(val, isActiveRow) {
    if (isActiveRow) {
      // Una decimal, sin .0
      var s = val.toFixed(1);
      return s.endsWith('.0') ? s.slice(0, -2) : s;
    }
    return Math.round(val).toString();
  }

  function renderConfusionMatrix(data) {
    if (!cmContainer) return;
    cmContainer.style.display = 'block';
    if (cmEmpty) cmEmpty.style.display = 'none';
    cmContainer.innerHTML = '';

    var cm = buildDynamicCM(data);
    var focus = computeFocus(data);
    var focusColSet = {};
    focus.cols.forEach(function(i) { focusColSet[i] = true; });

    var table = document.createElement('table');
    table.className = 'cm-table';

    // Header
    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    var cornerCell = document.createElement('th');
    cornerCell.className = 'cm-corner';
    cornerCell.innerHTML = '<span class="cm-axis-label cm-axis-pred">Predicho →</span>';
    headerRow.appendChild(cornerCell);
    EMOTIONS.forEach(function(em, ci) {
      var th = document.createElement('th');
      th.className = 'cm-header-cell';
      if (focusColSet[ci]) th.classList.add('cm-col-focus');
      th.textContent = em.substring(0, 3);
      th.title = em;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    var tbody = document.createElement('tbody');
    EMOTIONS.forEach(function(rowEm, ri) {
      var tr = document.createElement('tr');
      var isActiveRow = (ri === focus.actualIdx);
      tr.className = isActiveRow ? 'cm-row-highlight' : 'cm-row-dimmed';

      var labelTd = document.createElement('td');
      labelTd.className = 'cm-row-label';
      labelTd.textContent = rowEm.substring(0, 3);
      labelTd.title = rowEm;
      tr.appendChild(labelTd);

      cm[ri].forEach(function(val, ci) {
        var td = document.createElement('td');
        td.className = 'cm-cell';
        td.textContent = fmtCell(val, isActiveRow);
        td.title = rowEm + ' → ' + EMOTIONS[ci] + ': ' + val.toFixed(1) + '%';

        var intensity = Math.min(val / 100, 1);
        var isDiagonal = (ri === ci);
        var isFocusCell = isActiveRow && focusColSet[ci];

        if (isActiveRow) {
          // Fila del audio actual: colores plenos (verde diagonal, rojo confusión)
          if (isDiagonal) {
            td.style.background = 'rgba(22, 163, 74, ' + (intensity * 0.75 + 0.1) + ')';
            if (intensity > 0.35) td.style.color = '#fff';
          } else if (isFocusCell && val >= 3) {
            td.style.background = 'rgba(192, 32, 43, ' + Math.min(intensity * 1.4 + 0.2, 0.9) + ')';
            td.style.color = '#fff';
            td.classList.add('cm-cell-focus');
          } else if (val >= 1) {
            td.style.background = 'rgba(192, 32, 43, ' + (intensity * 0.5 + 0.05) + ')';
          } else {
            td.style.background = 'rgba(0, 0, 0, 0.03)';
            td.style.color = 'var(--muted)';
          }
        } else {
          // Filas baseline: escala de grises, sin colores que compitan con la fila activa
          td.style.background = 'rgba(20, 20, 20, ' + (intensity * 0.22 + 0.02) + ')';
          td.style.color = intensity > 0.5 ? '#fff' : 'var(--muted)';
          td.style.opacity = '0.85';
        }

        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Caption
    var caption = document.createElement('div');
    caption.className = 'cm-caption';
    caption.innerHTML =
      '<div style="font-size:10.5px;color:var(--muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;">Matriz dinámica · Fila activa = audio analizado</div>' +
      '<strong>🔍 ' + data.actual + ' (real):</strong> ' + data.focusNote;

    // Legend
    var legend = document.createElement('div');
    legend.className = 'cm-legend';
    legend.innerHTML =
      '<span class="cm-legend-item"><span class="cm-swatch cm-swatch-diag"></span>Acierto (predicción = real)</span>' +
      '<span class="cm-legend-item"><span class="cm-swatch cm-swatch-conf"></span>Confusión del audio actual</span>' +
      '<span class="cm-legend-item"><span class="cm-swatch cm-swatch-low"></span>Otras filas (baseline global, en gris)</span>';

    var axisNote = document.createElement('p');
    axisNote.className = 'cm-axis-note';
    axisNote.innerHTML =
      'La <strong style="color:var(--red)">fila resaltada</strong> muestra las probabilidades exactas que el modelo asignó al audio actual (coinciden con las barras de arriba). El resto de filas son el comportamiento global del modelo sobre el dataset.<br>' +
      'Filas = emoción real · Columnas = predicción del modelo · Diagonal = aciertos';

    cmContainer.appendChild(caption);
    cmContainer.appendChild(table);
    cmContainer.appendChild(legend);
    cmContainer.appendChild(axisNote);
  }
})();
