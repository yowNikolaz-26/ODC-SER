/* ============================================
   QUIZ — Lógica de actividades y evaluación
   ============================================ */

const Quiz = (() => {

  const feedbackMessages = {
    vf: {
      'm1-0-correct': '¡Correcto! Los asistentes actuales aún no detectan emociones de forma nativa. Responden al contenido semántico, no al estado emocional.',
      'm1-0-incorrect': 'Incorrecto. Los asistentes virtuales actuales no detectan emociones automáticamente. Procesan comandos de voz pero no analizan el tono emocional.',
      'm1-1-correct': '¡Correcto! El SER analiza características prosódicas y acústicas como tono, energía, ritmo y MFCCs para inferir la emoción del hablante.',
      'm1-1-incorrect': 'Incorrecto. El SER sí analiza estas características acústicas. Ese es precisamente su propósito principal.',
      'm1-2-correct': '¡Correcto! La computación afectiva abarca múltiples modalidades: voz, texto, expresión facial, señales fisiológicas y movimiento corporal.',
      'm1-2-incorrect': 'Incorrecto. La computación afectiva incluye voz (SER), texto, expresión facial, señales fisiológicas y muchas otras modalidades.',
    },
    mc: {
      'm4-0-b': '¡Correcto! Es fusión tardía porque cada modelo se entrena independientemente y las predicciones se combinan al final (promediando probabilidades).',
      'm4-0-wrong': 'Incorrecto. Cuando los modelos se entrenan por separado y se combinan las predicciones al final, se trata de fusión tardía (decision-level).',
      'm4-1-a': '¡Correcto! Es fusión temprana porque las características se concatenan en un solo vector antes de enviarse al clasificador.',
      'm4-1-wrong': 'Incorrecto. Concatenar características en un solo vector antes de clasificar es fusión temprana (feature-level).',
      'm4-2-c': '¡Correcto! Es fusión híbrida porque combina la fusión de features (prosódicos + espectrogramas) con mecanismo de atención antes de la clasificación.',
      'm4-2-wrong': 'Incorrecto. Usar mecanismo de atención para combinar diferentes tipos de features es una estrategia de fusión híbrida.',
      'm6-0-b': '¡Correcto! IEMOCAP usa escenas improvisadas entre actores, lo que lo hace semi-natural, a diferencia de RAVDESS o TESS que son completamente actuados.',
      'm6-0-wrong': 'Incorrecto. IEMOCAP es el dataset semi-natural; utiliza improvisaciones entre actores en lugar de lecturas guionizadas.',
      'm6-1-c': '¡Correcto! F1-Score y Unweighted Accuracy (UA) dan igual peso a cada clase, por lo que son más adecuadas con datasets desbalanceados.',
      'm6-1-wrong': 'Incorrecto. Accuracy (WA) puede ser engañosa con clases desbalanceadas. F1-Score y UA son más apropiadas.',
      'm6-2-a': '¡Correcto! Los Mel-espectrogramas superan a los MFCCs tradicionales por 3-5 puntos porcentuales según estudios recientes.',
      'm6-2-wrong': 'Incorrecto. Son los Mel-espectrogramas los que superan a los MFCCs por ese margen.',
    },
    case: {
      'm5-b': '¡Correcto! El SER a través del micrófono es la opción más práctica: no requiere hardware adicional, no es invasiva y la voz es un indicador natural del estado emocional. Los micrófonos ya están integrados en la mayoría de dispositivos.',
      'm5-wrong': 'No es la mejor opción. El SER por micrófono es más práctico que cámaras (privacidad) o sensores fisiológicos (hardware adicional). Los micrófonos ya están integrados en casi todos los dispositivos.',
    }
  };

  function init() {
    initVF();
    initMC();
    initSort();
    initMatch();
    initCase();
    initEval();
  }

  // ——— Verdadero / Falso ———
  function initVF() {
    document.querySelectorAll('.quiz-vf').forEach(quiz => {
      const quizId = quiz.id; // quiz-m1
      const moduleKey = quizId.replace('quiz-', '');
      
      quiz.querySelectorAll('.vf-item').forEach((item, idx) => {
        const correct = item.dataset.correct;
        const buttons = item.querySelectorAll('.vf-btn');
        const feedback = item.querySelector('.vf-feedback');

        buttons.forEach(btn => {
          btn.addEventListener('click', () => {
            if (btn.disabled) return;
            buttons.forEach(b => b.disabled = true);

            const answer = btn.dataset.answer;
            const isCorrect = answer === correct;

            btn.classList.add(isCorrect ? 'correct' : 'incorrect');
            if (!isCorrect) {
              buttons.forEach(b => {
                if (b.dataset.answer === correct) b.classList.add('correct');
              });
            }

            const fbKey = `${moduleKey}-${idx}-${isCorrect ? 'correct' : 'incorrect'}`;
            feedback.textContent = feedbackMessages.vf[fbKey] || (isCorrect ? '¡Correcto!' : 'Incorrecto.');
            feedback.className = `vf-feedback show ${isCorrect ? 'correct-fb' : 'incorrect-fb'}`;
          });
        });
      });
    });
  }

  // ——— Selección Múltiple ———
  function initMC() {
    document.querySelectorAll('.quiz-mc').forEach(quiz => {
      const quizId = quiz.id;
      const moduleKey = quizId.replace('quiz-', '');

      quiz.querySelectorAll('.mc-item').forEach((item, idx) => {
        const correct = item.dataset.correct;
        const buttons = item.querySelectorAll('.mc-btn');
        const feedback = item.querySelector('.mc-feedback');

        buttons.forEach(btn => {
          btn.addEventListener('click', () => {
            if (btn.disabled) return;
            buttons.forEach(b => b.disabled = true);

            const answer = btn.dataset.option;
            const isCorrect = answer === correct;

            btn.classList.add(isCorrect ? 'correct' : 'incorrect');
            if (!isCorrect) {
              buttons.forEach(b => {
                if (b.dataset.option === correct) b.classList.add('correct');
              });
            }

            const fbKey = isCorrect ? `${moduleKey}-${idx}-${correct}` : `${moduleKey}-${idx}-wrong`;
            feedback.textContent = feedbackMessages.mc[fbKey] || (isCorrect ? '¡Correcto!' : 'Incorrecto.');
            feedback.className = `mc-feedback show ${isCorrect ? 'correct-fb' : 'incorrect-fb'}`;
          });
        });
      });
    });
  }

  // ——— Ordenar (Drag & Drop) ———
  function initSort() {
    document.querySelectorAll('.sort-activity').forEach(container => {
      let dragItem = null;

      container.querySelectorAll('.sort-item').forEach(item => {
        item.addEventListener('dragstart', () => {
          dragItem = item;
          setTimeout(() => item.classList.add('dragging'), 0);
        });

        item.addEventListener('dragend', () => {
          item.classList.remove('dragging');
          dragItem = null;
        });

        item.addEventListener('dragover', (e) => {
          e.preventDefault();
          if (item !== dragItem) {
            const rect = item.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            if (e.clientY < midY) {
              container.insertBefore(dragItem, item);
            } else {
              container.insertBefore(dragItem, item.nextSibling);
            }
          }
        });

        // Touch support
        let touchY = 0;
        item.addEventListener('touchstart', (e) => {
          dragItem = item;
          touchY = e.touches[0].clientY;
          item.classList.add('dragging');
        });

        item.addEventListener('touchmove', (e) => {
          e.preventDefault();
          const currentY = e.touches[0].clientY;
          const items = [...container.querySelectorAll('.sort-item')];
          const target = items.find(i => {
            if (i === dragItem) return false;
            const rect = i.getBoundingClientRect();
            return currentY > rect.top && currentY < rect.bottom;
          });
          if (target) {
            const rect = target.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            if (currentY < midY) {
              container.insertBefore(dragItem, target);
            } else {
              container.insertBefore(dragItem, target.nextSibling);
            }
          }
        }, { passive: false });

        item.addEventListener('touchend', () => {
          item.classList.remove('dragging');
          dragItem = null;
        });
      });
    });

    // Check buttons
    document.querySelectorAll('.btn-check-sort').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.id.replace('checkSort-', '');
        const container = document.getElementById('sort-' + id);
        const feedback = document.getElementById('sort-feedback-' + id);
        const items = container.querySelectorAll('.sort-item');
        
        let allCorrect = true;
        items.forEach((item, idx) => {
          const expected = idx + 1;
          const actual = parseInt(item.dataset.order);
          if (actual === expected) {
            item.classList.add('correct-order');
            item.classList.remove('wrong-order');
          } else {
            item.classList.add('wrong-order');
            item.classList.remove('correct-order');
            allCorrect = false;
          }
        });

        if (allCorrect) {
          feedback.textContent = '¡Correcto! El orden es: Entrada → Convolución → Pooling → Dropout → Fully Connected + Softmax.';
          feedback.style.color = 'var(--accent)';
        } else {
          feedback.textContent = 'Algunas capas no están en el orden correcto. Recuerda: la señal entra como espectrograma, pasa por convolución y pooling para extraer features, dropout regulariza, y las capas densas clasifican.';
          feedback.style.color = 'var(--accent-warm)';
        }
      });
    });
  }

  // ——— Matching ———
  function initMatch() {
    document.querySelectorAll('.match-activity').forEach(activity => {
      let selectedTerm = null;
      let matchCount = 0;
      const totalPairs = activity.querySelectorAll('.match-terms .match-item').length;
      const feedbackEl = activity.querySelector('.match-feedback');

      activity.querySelectorAll('.match-item').forEach(item => {
        item.addEventListener('click', () => {
          if (item.classList.contains('matched')) return;

          const col = item.closest('.match-col');
          const isTerm = col.classList.contains('match-terms');

          if (!selectedTerm && isTerm) {
            // Select term
            activity.querySelectorAll('.match-terms .match-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            selectedTerm = item;
          } else if (selectedTerm && !isTerm) {
            // Check match
            if (selectedTerm.dataset.match === item.dataset.match) {
              selectedTerm.classList.remove('selected');
              selectedTerm.classList.add('matched');
              item.classList.add('matched');
              matchCount++;
              if (matchCount === totalPairs) {
                feedbackEl.textContent = '¡Excelente! Has relacionado todas las características correctamente.';
              }
            } else {
              item.classList.add('wrong');
              setTimeout(() => item.classList.remove('wrong'), 500);
            }
            selectedTerm = null;
          } else if (isTerm) {
            activity.querySelectorAll('.match-terms .match-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            selectedTerm = item;
          }
        });
      });
    });
  }

  // ——— Caso breve ———
  function initCase() {
    document.querySelectorAll('.case-activity').forEach(activity => {
      const moduleKey = activity.id.replace('case-', '');
      const buttons = activity.querySelectorAll('.mc-btn');
      const feedback = activity.querySelector('.mc-feedback') || activity.querySelector('[id^="case-feedback"]');
      const correctAnswer = 'b';

      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.disabled) return;
          buttons.forEach(b => b.disabled = true);

          const answer = btn.dataset.option;
          const isCorrect = answer === correctAnswer;

          btn.classList.add(isCorrect ? 'correct' : 'incorrect');
          if (!isCorrect) {
            buttons.forEach(b => {
              if (b.dataset.option === correctAnswer) b.classList.add('correct');
            });
          }

          const fbKey = isCorrect ? `${moduleKey}-${correctAnswer}` : `${moduleKey}-wrong`;
          if (feedback) {
            feedback.textContent = feedbackMessages.case[fbKey] || (isCorrect ? '¡Correcto!' : 'Incorrecto.');
            feedback.className = `mc-feedback show ${isCorrect ? 'correct-fb' : 'incorrect-fb'}`;
          }
        });
      });
    });
  }

  // ——— Evaluación Final ———
  function initEval() {
    const container = document.getElementById('evalContainer');
    if (!container) return;

    const questions = container.querySelectorAll('.eval-question');
    const totalQ = questions.length;
    let answered = 0;
    let correctCount = 0;

    const evalFeedback = {
      0: { correct: 'Correcto. El SER se enfoca en detectar emociones a partir de las características acústicas de la voz.', wrong: 'Incorrecto. El SER no transcribe ni identifica idioma; detecta el estado emocional del hablante.' },
      1: { correct: 'Correcto. Los MFCCs modelan la percepción auditiva humana usando la escala Mel.', wrong: 'Incorrecto. Los MFCCs simulan cómo el oído humano percibe frecuencias, capturando información espectral clave.' },
      2: { correct: 'Correcto. Las capas convolucionales aplican filtros para detectar patrones locales en el espectrograma.', wrong: 'Incorrecto. La extracción de patrones locales es función de las capas convolucionales; el pooling reduce dimensionalidad y softmax genera probabilidades.' },
      3: { correct: 'Correcto. La CNN captura patrones espaciales del espectrograma mientras el BiLSTM modela relaciones temporales en ambas direcciones.', wrong: 'Incorrecto. La ventaja del híbrido es combinar la extracción espacial (CNN) con el modelado temporal bidireccional (BiLSTM).' },
      4: { correct: 'Correcto. En fusión tardía, cada modelo genera su predicción independientemente y luego se combinan (votación o promedio).', wrong: 'Incorrecto. La fusión tardía combina las predicciones finales de modelos independientes, no las características ni el entrenamiento.' },
      5: { correct: 'Correcto. SER en e-learning permite detectar frustración o confusión y adaptar el contenido en tiempo real.', wrong: 'Incorrecto. La aplicación directa del SER en e-learning es la detección emocional para adaptación del contenido, no traducción ni resúmenes.' },
      6: { correct: 'Correcto. IEMOCAP usa improvisaciones entre parejas de actores, haciéndolo más cercano a interacciones naturales.', wrong: 'Incorrecto. IEMOCAP es semi-natural por usar escenas improvisadas, no guionizadas como RAVDESS o TESS.' },
      7: { correct: 'Correcto. Wav2Vec 2.0 y modelos Transformer han alcanzado rendimiento estado del arte con aprendizaje auto-supervisado.', wrong: 'Incorrecto. Los Mel-espectrogramas superan a los MFCCs, y el deep learning aún enfrenta desafíos. Los Transformers sí muestran adaptabilidad superior.' },
    };

    questions.forEach((q, idx) => {
      const correct = q.dataset.correct;
      const buttons = q.querySelectorAll('.mc-btn');
      const feedback = q.querySelector('.mc-feedback');

      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.disabled) return;
          buttons.forEach(b => b.disabled = true);

          const answer = btn.dataset.option;
          const isCorrect = answer === correct;

          btn.classList.add(isCorrect ? 'correct' : 'incorrect');
          if (!isCorrect) {
            buttons.forEach(b => {
              if (b.dataset.option === correct) b.classList.add('correct');
            });
          }

          if (isCorrect) correctCount++;
          answered++;

          const fb = evalFeedback[idx];
          feedback.textContent = isCorrect ? fb.correct : fb.wrong;
          feedback.className = `mc-feedback show ${isCorrect ? 'correct-fb' : 'incorrect-fb'}`;

          // Update progress
          document.getElementById('evalScore').textContent = `${correctCount} / ${totalQ}`;
          document.getElementById('evalBarFill').style.width = ((answered / totalQ) * 100) + '%';

          // Show result when all answered
          if (answered === totalQ) {
            setTimeout(() => showEvalResult(correctCount, totalQ), 600);
          }
        });
      });
    });

    // Retry button
    const retryBtn = document.getElementById('evalRetry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        answered = 0;
        correctCount = 0;
        document.getElementById('evalScore').textContent = '0 / ' + totalQ;
        document.getElementById('evalBarFill').style.width = '0%';
        document.getElementById('evalResult').classList.remove('show');

        questions.forEach(q => {
          q.querySelectorAll('.mc-btn').forEach(b => {
            b.disabled = false;
            b.classList.remove('correct', 'incorrect');
          });
          const fb = q.querySelector('.mc-feedback');
          fb.className = 'mc-feedback';
          fb.textContent = '';
        });
      });
    }
  }

  function showEvalResult(correct, total) {
    const pct = Math.round((correct / total) * 100);
    const passed = pct >= 80;
    const result = document.getElementById('evalResult');
    const icon = document.getElementById('evalResultIcon');
    const title = document.getElementById('evalResultTitle');
    const text = document.getElementById('evalResultText');
    const retry = document.getElementById('evalRetry');

    icon.textContent = passed ? '🎉' : '📖';
    title.textContent = passed ? `¡Aprobado! ${correct}/${total} (${pct}%)` : `${correct}/${total} (${pct}%) — No alcanzaste el 80%`;
    title.style.color = passed ? 'var(--accent)' : 'var(--accent-warm)';
    text.textContent = passed
      ? 'Has demostrado comprensión de los fundamentos y aplicaciones del reconocimiento emocional por voz con CNNs en HCI. ¡Felicitaciones!'
      : 'Revisa los módulos donde tuviste dificultad y vuelve a intentarlo. Necesitas mínimo 6 respuestas correctas.';
    
    if (!passed) retry.style.display = 'inline-flex';
    else retry.style.display = 'none';

    result.classList.add('show');
    result.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return { init };
})();