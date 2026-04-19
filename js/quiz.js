/* ===================================================
   quiz.js — Lógica de actividades con animaciones
   =================================================== */

const ODCQuiz = (() => {

  /* ---- V / F ---- */
  function initVF() {
    document.querySelectorAll('.vf-item').forEach(item => {
      const correct = item.dataset.correct;
      const btns = item.querySelectorAll('.vf-btn');
      const fb = item.querySelector('.vf-feedback');

      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          if (item.classList.contains('answered')) return;
          item.classList.add('answered');
          btns.forEach(b => b.disabled = true);

          const answer = btn.dataset.answer;
          if (answer === correct) {
            btn.classList.add('correct');
            fb.textContent = '✓ ¡Correcto!';
            fb.style.color = '#065f46';
            pulseElement(btn);
          } else {
            btn.classList.add('incorrect');
            fb.textContent = '✗ Incorrecto. La respuesta es ' + (correct === 'true' ? 'Verdadero' : 'Falso') + '.';
            fb.style.color = '#991b1b';
            // Show correct
            btns.forEach(b => { if (b.dataset.answer === correct) b.classList.add('correct'); });
          }
        });
      });
    });
  }

  /* ---- MC (opción múltiple) ---- */
  function initMC() {
    document.querySelectorAll('.mc-item[data-correct]').forEach(item => {
      const correct = item.dataset.correct;
      const btns = item.querySelectorAll('.mc-btn');
      const fb = item.querySelector('.mc-feedback');

      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          if (item.classList.contains('answered')) return;
          item.classList.add('answered');
          btns.forEach(b => b.disabled = true);

          if (btn.dataset.option === correct) {
            btn.classList.add('correct');
            fb.textContent = '✓ ¡Correcto!';
            fb.style.color = '#065f46';
            pulseElement(btn);
          } else {
            btn.classList.add('incorrect');
            fb.textContent = '✗ Incorrecto.';
            fb.style.color = '#991b1b';
            btns.forEach(b => { if (b.dataset.option === correct) b.classList.add('correct'); });
          }
        });
      });
    });
  }

  /* ---- CASO BREVE M5 ---- */
  function initCaseM5() {
    const container = document.getElementById('case-m5-opts');
    const fb = document.getElementById('case-feedback-m5');
    if (!container || !fb) return;

    container.querySelectorAll('.mc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (container.classList.contains('answered')) return;
        container.classList.add('answered');
        container.querySelectorAll('.mc-btn').forEach(b => b.disabled = true);

        if (btn.dataset.option === 'b') {
          btn.classList.add('correct');
          fb.textContent = '✓ Correcto. El módulo SER de audio es el más directo, no invasivo y disponible en cualquier dispositivo.';
          fb.style.color = '#065f46';
          pulseElement(btn);
        } else {
          btn.classList.add('incorrect');
          fb.textContent = '✗ El módulo SER de audio/micrófono es la opción más accesible y directa para detectar emociones.';
          fb.style.color = '#991b1b';
          container.querySelector('[data-option="b"]')?.classList.add('correct');
        }
      });
    });
  }

  /* ---- MATCH ---- */
  function initMatch() {
    const containers = document.querySelectorAll('.match-pairs');
    containers.forEach(container => {
      let selectedTerm = null;
      let matchedCount = 0;
      const totalPairs = container.querySelectorAll('.match-col:first-child .match-item').length;
      const fb = container.parentElement.querySelector('.match-feedback');

      // Terms (left col)
      container.querySelectorAll('.match-col:first-child .match-item').forEach(term => {
        term.addEventListener('click', () => {
          if (term.classList.contains('matched')) return;
          container.querySelectorAll('.match-col:first-child .match-item').forEach(t => t.classList.remove('selected'));
          selectedTerm = term;
          term.classList.add('selected');
        });
      });

      // Defs (right col)
      container.querySelectorAll('.match-col:last-child .match-item').forEach(def => {
        def.addEventListener('click', () => {
          if (!selectedTerm || def.classList.contains('matched')) return;

          if (selectedTerm.dataset.match === def.dataset.match) {
            selectedTerm.classList.remove('selected');
            selectedTerm.classList.add('matched');
            def.classList.add('matched');
            matchedCount++;
            selectedTerm = null;

            if (matchedCount === totalPairs && fb) {
              fb.textContent = '✓ ¡Excelente! Todas las parejas son correctas.';
              fb.style.color = '#065f46';
            }
          } else {
            // Wrong match animation
            selectedTerm.classList.add('wrong');
            def.classList.add('wrong');
            setTimeout(() => {
              selectedTerm?.classList.remove('wrong', 'selected');
              def.classList.remove('wrong');
              selectedTerm = null;
            }, 500);
            if (fb) {
              fb.textContent = '✗ Esa combinación no es correcta. Intenta de nuevo.';
              fb.style.color = '#991b1b';
            }
          }
        });
      });
    });
  }

  /* ---- SORT (drag & drop) ---- */
  function initSort() {
    document.querySelectorAll('.sort-list').forEach(list => {
      let dragSrc = null;

      list.querySelectorAll('.sort-item').forEach(item => {
        item.addEventListener('dragstart', () => {
          dragSrc = item;
          setTimeout(() => item.classList.add('dragging'), 0);
        });
        item.addEventListener('dragend', () => {
          item.classList.remove('dragging');
          list.querySelectorAll('.sort-item').forEach(i => i.classList.remove('drag-over'));
        });
        item.addEventListener('dragover', e => {
          e.preventDefault();
          list.querySelectorAll('.sort-item').forEach(i => i.classList.remove('drag-over'));
          if (item !== dragSrc) item.classList.add('drag-over');
          const rect = item.getBoundingClientRect();
          const mid = rect.top + rect.height / 2;
          if (e.clientY < mid) list.insertBefore(dragSrc, item);
          else list.insertBefore(dragSrc, item.nextSibling);
        });
      });

      // Check button
      const listId = list.id;
      const checkBtn = document.getElementById('checkSort-' + listId.replace('sort-', ''));
      const feedback = document.getElementById('sort-feedback-' + listId.replace('sort-', ''));

      checkBtn?.addEventListener('click', () => {
        const items = [...list.querySelectorAll('.sort-item')];
        const isCorrect = items.every((item, i) => parseInt(item.dataset.order) === i + 1);

        if (isCorrect) {
          items.forEach((item, i) => {
            setTimeout(() => item.classList.add('correct'), i * 60);
          });
          if (feedback) { feedback.textContent = '✓ ¡Orden correcto!'; feedback.style.color = '#065f46'; }
        } else {
          if (feedback) { feedback.textContent = '✗ El orden no es correcto. Intenta de nuevo.'; feedback.style.color = '#991b1b'; }
          list.style.animation = 'shake 0.4s ease';
          setTimeout(() => list.style.animation = '', 500);
        }
      });
    });
  }

  /* ---- EVALUACIÓN FINAL ---- */
  function initEval() {
    let evalAnswered = 0;
    let evalCorrect  = 0;
    const questions = document.querySelectorAll('.eval-question');
    const result    = document.getElementById('evalResult');
    const scoreEl   = document.getElementById('evalScore');
    const barFill   = document.getElementById('evalBarFill');

    questions.forEach(q => {
      const correct = q.dataset.correct;
      q.querySelectorAll('.mc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (q.classList.contains('answered')) return;
          q.classList.add('answered');
          q.querySelectorAll('.mc-btn').forEach(b => b.disabled = true);

          const fb = q.querySelector('.mc-feedback');
          if (btn.dataset.option === correct) {
            btn.classList.add('correct');
            evalCorrect++;
            fb.textContent = '✓ Correcto';
            fb.style.color = '#065f46';
            pulseElement(btn);
          } else {
            btn.classList.add('incorrect');
            fb.textContent = '✗ Incorrecto';
            fb.style.color = '#991b1b';
            q.querySelector('[data-option="' + correct + '"]')?.classList.add('correct');
          }

          evalAnswered++;
          if (scoreEl) scoreEl.textContent = evalCorrect + ' / 8';
          if (barFill)  barFill.style.width = (evalCorrect / 8 * 100) + '%';

          if (evalAnswered === 8) {
            setTimeout(() => showEvalResult(evalCorrect, result), 500);
          }
        });
      });
    });

    // Retry
    document.getElementById('evalRetry')?.addEventListener('click', () => {
      evalAnswered = 0; evalCorrect = 0;
      questions.forEach(q => {
        q.classList.remove('answered');
        q.querySelectorAll('.mc-btn').forEach(b => { b.classList.remove('correct','incorrect'); b.disabled = false; });
        const fb = q.querySelector('.mc-feedback');
        if (fb) fb.textContent = '';
      });
      if (result) result.classList.remove('visible');
      if (scoreEl) scoreEl.textContent = '0 / 8';
      if (barFill)  barFill.style.width = '0%';
    });
  }

  function showEvalResult(score, resultEl) {
    if (!resultEl) return;
    resultEl.classList.add('visible');
    const icon  = document.getElementById('evalResultIcon');
    const title = document.getElementById('evalResultTitle');
    const text  = document.getElementById('evalResultText');
    const retry = document.getElementById('evalRetry');
    const pct   = Math.round(score / 8 * 100);

    if (score >= 6) {
      if (icon)  icon.textContent  = '🎉';
      if (title) title.textContent = `¡Aprobado! ${score}/8`;
      if (text)  text.textContent  = `Has alcanzado el REA con ${pct}% de acierto.`;
      if (retry) retry.style.display = 'none';
    } else {
      if (icon)  icon.textContent  = '📚';
      if (title) title.textContent = `Necesitas repasar · ${score}/8`;
      if (text)  text.textContent  = `Obtuviste ${pct}%. Necesitas al menos 80% (6/8) para aprobar.`;
      if (retry) retry.style.display = 'inline-flex';
    }
  }

  /* ---- UTIL ---- */
  function pulseElement(el) {
    el.style.transition = 'transform 0.15s';
    el.style.transform  = 'scale(1.05)';
    setTimeout(() => { el.style.transform = 'scale(1)'; }, 200);
  }

  /* ---- INIT ---- */
  function init() {
    initVF();
    initMC();
    initCaseM5();
    initMatch();
    initSort();
    initEval();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => ODCQuiz.init());