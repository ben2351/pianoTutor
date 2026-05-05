/**
 * App Controller — wires everything together
 */
const App = (() => {
  let currentView = 'lessons';
  let currentLesson = null;
  let tempoScale = 1.0;
  let lessonStartTime = 0;
  let countdownTimer = null; // track active countdown so we can cancel it

  function init() {
    // Init audio on first interaction
    document.addEventListener('click', () => AudioEngine.init(), { once: true });
    document.addEventListener('keydown', () => AudioEngine.init(), { once: true });

    // Init MIDI
    MIDIEngine.init();
    MIDIEngine.on('connect', (data) => {
      document.getElementById('midi-indicator').className = 'indicator connected';
      document.getElementById('midi-label').textContent = data.name;
    });
    MIDIEngine.on('disconnect', () => {
      document.getElementById('midi-indicator').className = 'indicator disconnected';
      document.getElementById('midi-label').textContent = 'No MIDI — use keyboard (Z-M / Q-P)';
    });

    // Init piano
    PianoRenderer.init(document.getElementById('piano-canvas'));

    // Init falling notes
    FallingNotes.init(document.getElementById('falling-notes-canvas'));

    // Init notation panel
    NotationPanel.init();

    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // Lesson controls
    document.getElementById('back-to-lessons').addEventListener('click', () => {
      cancelCurrent();
      switchView('lessons');
    });
    document.getElementById('lesson-listen').addEventListener('click', listenToLesson);
    document.getElementById('lesson-start').addEventListener('click', startLesson);
    document.getElementById('lesson-restart').addEventListener('click', restartLesson);
    document.getElementById('tempo-down').addEventListener('click', () => adjustTempo(-0.1));
    document.getElementById('tempo-up').addEventListener('click', () => adjustTempo(0.1));

    // Score overlay
    document.getElementById('score-retry').addEventListener('click', restartLesson);
    document.getElementById('score-next').addEventListener('click', () => {
      document.getElementById('score-overlay').classList.add('hidden');
      const next = Lessons.getNextLesson(currentLesson.id);
      if (next && Progress.isLessonUnlocked(next.id)) {
        openLesson(next.id);
      } else {
        switchView('lessons');
      }
    });

    // Metronome controls (free play)
    document.getElementById('metronome-toggle').addEventListener('click', toggleMetronome);
    document.getElementById('tempo-slider').addEventListener('input', (e) => {
      document.getElementById('tempo-display').textContent = e.target.value + ' BPM';
      if (AudioEngine.isMetronomePlaying()) {
        AudioEngine.startMetronome(parseInt(e.target.value));
      }
    });

    // Render initial view
    renderLessonList();
    showKeyboardHint();
  }

  // ── Navigation ─────────────────────────────────────────────

  function switchView(view) {
    currentView = view;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    const viewEl = document.getElementById(view + '-view');
    if (viewEl) viewEl.classList.add('active');

    const navBtn = document.querySelector(`.nav-btn[data-view="${view}"]`);
    if (navBtn) navBtn.classList.add('active');

    if (view === 'lessons') renderLessonList();
    if (view === 'progress') renderProgress();
    if (view === 'lesson-active') {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    } else {
      NotationPanel.hide();
    }
  }

  // ── Lesson List ────────────────────────────────────────────

  function renderLessonList() {
    const container = document.getElementById('lesson-list');
    container.innerHTML = '';

    const curriculum = Lessons.getCurriculum();
    curriculum.forEach(level => {
      // Level header
      const header = document.createElement('div');
      header.className = 'level-header';
      header.textContent = `Level ${level.level}: ${level.levelName}`;
      container.appendChild(header);

      // Lesson cards
      level.lessons.forEach(lesson => {
        const progress = Progress.getLessonProgress(lesson.id);
        const unlocked = Progress.isLessonUnlocked(lesson.id);
        const stars = progress?.stars || 0;

        const card = document.createElement('div');
        card.className = 'lesson-card' + (unlocked ? '' : ' locked');
        card.innerHTML = `
          <div class="lesson-number">Lesson ${lesson.id}</div>
          <div class="lesson-name">${lesson.name}</div>
          <div class="lesson-skills">${lesson.skills}</div>
          <div class="lesson-stars">
            ${[1,2,3].map(i => `<span class="star ${i <= stars ? 'earned' : ''}">${i <= stars ? '\u2605' : '\u2606'}</span>`).join('')}
          </div>
        `;

        if (unlocked) {
          card.addEventListener('click', () => openLesson(lesson.id));
        }

        container.appendChild(card);
      });
    });
  }

  // ── Active Lesson ──────────────────────────────────────────

  function openLesson(lessonId) {
    currentLesson = Lessons.getLesson(lessonId);
    if (!currentLesson) return;

    document.getElementById('lesson-title').textContent =
      `${currentLesson.id}: ${currentLesson.name}`;
    document.getElementById('lesson-instruction').textContent =
      currentLesson.instruction;
    document.getElementById('lesson-tempo').textContent =
      Math.round(tempoScale * 100) + '%';

    // Load notes into falling notes engine
    FallingNotes.loadNotes(currentLesson.notes, currentLesson.bpm);
    FallingNotes.setTempoScale(tempoScale);

    // Render notation strip
    NotationPanel.show();
    NotationPanel.render(currentLesson);

    // Show expected notes on piano
    const expectedMap = new Map();
    const uniqueNotes = [...new Set(currentLesson.notes.map(n => n.midi))];
    uniqueNotes.forEach(midi => {
      const noteData = currentLesson.notes.find(n => n.midi === midi);
      expectedMap.set(midi, {
        color: noteData.hand === 'left' ? '#ef5350' : '#4fc3f7',
        finger: noteData.finger ? String(noteData.finger) : null,
      });
    });
    PianoRenderer.setExpected(expectedMap);

    switchView('lesson-active');
  }

  function listenToLesson() {
    if (!currentLesson) return;
    FallingNotes.preview(currentLesson.notes, currentLesson.bpm);
    NotationPanel.startPlayhead();
  }

  /**
   * Cancel any in-progress countdown or running lesson cleanly.
   */
  function cancelCurrent() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    FallingNotes.stop();
    NotationPanel.stopPlayhead();
    const startBtn = document.getElementById('lesson-start');
    startBtn.disabled = false;
    startBtn.textContent = 'Start';
  }

  function startLesson() {
    if (!currentLesson) return;

    // Cancel anything already running
    cancelCurrent();

    // Set tempo first, then load raw note data
    FallingNotes.setTempoScale(tempoScale);
    FallingNotes.loadNotes(currentLesson.notes, currentLesson.bpm);
    lessonStartTime = Date.now();

    const startBtn = document.getElementById('lesson-start');
    const restartBtn = document.getElementById('lesson-restart');
    let count = 3;

    startBtn.disabled = true;
    startBtn.textContent = count;
    restartBtn.classList.add('hidden');

    countdownTimer = setInterval(() => {
      count--;
      if (count > 0) {
        startBtn.textContent = count;
        AudioEngine.init();
        AudioEngine.playNote(80, 30); // countdown tick
      } else {
        clearInterval(countdownTimer);
        countdownTimer = null;
        startBtn.textContent = 'Playing...';
        restartBtn.classList.remove('hidden');

        FallingNotes.start(
          (note) => {},
          (note) => {},
          (notes) => {
            startBtn.disabled = false;
            startBtn.textContent = 'Start';
            // Don't stopPlayhead here — let it coast for 4 beats so the
            // last bars scroll through before the results overlay appears.
            showResults(notes);
          }
        );
        NotationPanel.startPlayhead();
      }
    }, 800);
  }

  function restartLesson() {
    if (!currentLesson) return;
    document.getElementById('score-overlay').classList.add('hidden');
    startLesson();
  }

  function showResults(notes) {
    const results = Scoring.calculate(notes);

    // Save progress
    Progress.saveLesson(currentLesson.id, results);

    // Star display
    const starsHtml = [1, 2, 3].map(i =>
      `<span style="color: ${i <= results.stars ? '#f39c12' : '#555'}; margin: 0 4px;">${i <= results.stars ? '\u2605' : '\u2606'}</span>`
    ).join('');

    document.getElementById('score-stars').innerHTML = starsHtml;
    document.getElementById('score-details').innerHTML = `
      <div>Score: <strong>${results.score}%</strong></div>
      <div>Accuracy: ${results.accuracy}%</div>
      <div>Perfect: ${results.perfect} | Good: ${results.good} | OK: ${results.ok} | Missed: ${results.missed}</div>
      <div style="margin-top: 8px; font-size: 0.8rem;">
        ${results.stars === 3 ? 'Flawless! You\'re a natural!' :
          results.stars === 2 ? 'Great job! A little more practice for 3 stars.' :
          results.stars === 1 ? 'Nice work! Keep practicing to improve.' :
          'Keep trying! Slow down the tempo if needed.'}
      </div>
    `;

    // Show/hide next button based on whether next lesson exists & is unlocked
    const next = Lessons.getNextLesson(currentLesson.id);
    document.getElementById('score-next').style.display =
      (next && results.stars >= 1) ? 'inline-block' : 'none';

    document.getElementById('score-overlay').classList.remove('hidden');
  }

  function adjustTempo(delta) {
    tempoScale = Math.max(0.25, Math.min(2.0, tempoScale + delta));
    document.getElementById('lesson-tempo').textContent =
      Math.round(tempoScale * 100) + '%';
    FallingNotes.setTempoScale(tempoScale);
  }

  // ── Free Play ──────────────────────────────────────────────

  function toggleMetronome() {
    const btn = document.getElementById('metronome-toggle');
    if (AudioEngine.isMetronomePlaying()) {
      AudioEngine.stopMetronome();
      btn.textContent = 'Off';
      btn.classList.remove('active');
    } else {
      const bpm = parseInt(document.getElementById('tempo-slider').value);
      AudioEngine.startMetronome(bpm);
      btn.textContent = 'On';
      btn.classList.add('active');
    }
  }

  // ── Progress View ──────────────────────────────────────────

  function renderProgress() {
    const stats = document.getElementById('progress-stats');
    const lessonsContainer = document.getElementById('progress-lessons');

    const totalStars = Progress.getTotalStars();
    const maxStars = Progress.getMaxStars();
    const completed = Progress.getCompletedCount();
    const total = Lessons.getAllLessons().length;

    stats.innerHTML = `
      <div class="stat-card">
        <div class="stat-value">${totalStars} / ${maxStars}</div>
        <div class="stat-label">Stars Earned</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${completed} / ${total}</div>
        <div class="stat-label">Lessons Completed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${Math.round((completed / total) * 100)}%</div>
        <div class="stat-label">Course Progress</div>
      </div>
    `;

    lessonsContainer.innerHTML = '<h3>Lesson Scores</h3>';
    const allLessons = Lessons.getAllLessons();
    allLessons.forEach(lesson => {
      const prog = Progress.getLessonProgress(lesson.id);
      if (!prog) return;

      const row = document.createElement('div');
      row.className = 'progress-lesson-row';
      row.innerHTML = `
        <span>${lesson.name}</span>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${prog.bestScore}%"></div>
        </div>
        <span>${prog.bestScore}%</span>
        <span class="stars">${'\u2605'.repeat(prog.stars)}${'\u2606'.repeat(3 - prog.stars)}</span>
        <span style="color: var(--text-dim); font-size: 0.75rem;">${prog.attempts} attempt${prog.attempts !== 1 ? 's' : ''}</span>
      `;
      lessonsContainer.appendChild(row);
    });
  }

  // ── Keyboard hint ──────────────────────────────────────────

  function showKeyboardHint() {
    const hint = document.createElement('div');
    hint.className = 'keyboard-hint';
    hint.textContent = 'No MIDI? Use computer keyboard: Z-M = low octave, Q-P = high octave';
    hint.id = 'keyboard-hint';
    document.body.appendChild(hint);

    // Hide after MIDI connects or after 10 seconds
    MIDIEngine.on('connect', () => hint.remove());
    setTimeout(() => { if (hint.parentElement) hint.style.opacity = '0'; }, 10000);
    setTimeout(() => { if (hint.parentElement) hint.remove(); }, 11000);
  }

  // Boot
  document.addEventListener('DOMContentLoaded', init);

  return { switchView, openLesson };
})();
