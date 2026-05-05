/**
 * Falling Notes Display — Guitar Hero-style note visualization
 */
const FallingNotes = (() => {
  let canvas, ctx;
  let notes = [];       // { midi, time, duration, hand, hit, missed }
  let startTime = 0;
  let bpm = 100;
  let tempoScale = 1.0;
  let running = false;
  let animFrame = null;
  let onNoteHit = null;
  let onNoteMiss = null;
  let onComplete = null;

  const FALL_SPEED = 200;    // pixels per second
  const HIT_WINDOW = 0.3;    // seconds tolerance for "perfect"
  const OK_WINDOW = 0.6;     // seconds tolerance for "ok"
  const MISS_WINDOW = 0.9;   // seconds past when note counts as missed

  const RH_COLOR = '#4fc3f7';
  const LH_COLOR = '#ef5350';
  const HIT_COLOR = '#2ecc71';
  const MISS_COLOR = '#e74c3c55';

  // Raw lesson data — never mutated, used to rebuild on every start/restart
  let rawNoteData = [];
  let rawBpm = 100;
  let leadIn = 0; // seconds from startTime until beat 0 of the music

  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
  }

  function loadNotes(noteData, lessonBpm) {
    rawNoteData = noteData;
    rawBpm = lessonBpm;
    bpm = lessonBpm;
    // Don't build yet — wait for start() so tempo/canvas size are final
  }

  /**
   * Build the working notes array from raw data.
   * Calculates lead-in dynamically from actual canvas height so notes
   * always start falling from above the visible area.
   */
  function _buildNotes() {
    const beatDuration = 60 / (bpm * tempoScale);

    // Calculate lead-in from canvas so first notes spawn off-screen at top
    const container = canvas.parentElement;
    const displayHeight = container ? container.clientHeight : 500;
    const hitLineY = displayHeight - 20;
    leadIn = (hitLineY / FALL_SPEED) + 0.5; // stored as module var for getMusicBeats()

    notes = rawNoteData.map(n => ({
      midi: n.midi,
      time: n.time * beatDuration + leadIn,
      duration: n.duration * beatDuration,
      hand: n.hand || 'right',
      finger: n.finger || null,
      hit: false,
      missed: false,
      hitQuality: null,
    }));
  }

  function setTempoScale(scale) {
    tempoScale = scale;
  }

  function start(hitCb, missCb, completeCb) {
    // Stop any previous run cleanly
    stop();

    onNoteHit = hitCb;
    onNoteMiss = missCb;
    onComplete = completeCb;

    // Fully rebuild notes from raw data (clean slate for every start/restart)
    _buildNotes();

    running = true;
    startTime = performance.now() / 1000;

    // Listen for note hits
    MIDIEngine.on('noteOn', handleNoteOn);
    animate();
  }

  function stop() {
    running = false;
    MIDIEngine.off('noteOn', handleNoteOn);
    if (animFrame) {
      cancelAnimationFrame(animFrame);
      animFrame = null;
    }
    PianoRenderer.clearExpected();
  }

  function handleNoteOn(data) {
    if (!running) return;
    const currentTime = performance.now() / 1000 - startTime;
    const playedNote = data.note;

    // Find the closest unplayed note matching this MIDI value
    let best = null;
    let bestDiff = Infinity;

    for (const note of notes) {
      if (note.hit || note.missed || note.midi !== playedNote) continue;
      const diff = Math.abs(note.time - currentTime);
      if (diff < bestDiff && diff < OK_WINDOW) {
        bestDiff = diff;
        best = note;
      }
    }

    if (best) {
      best.hit = true;
      if (bestDiff < HIT_WINDOW * 0.4) {
        best.hitQuality = 'perfect';
      } else if (bestDiff < HIT_WINDOW) {
        best.hitQuality = 'good';
      } else {
        best.hitQuality = 'ok';
      }
      if (onNoteHit) onNoteHit(best);
    }
  }

  function animate() {
    if (!running) return;

    const dpr = window.devicePixelRatio || 1;
    const container = canvas.parentElement;
    if (canvas.width !== container.clientWidth * dpr || canvas.height !== container.clientHeight * dpr) {
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      canvas.style.width = container.clientWidth + 'px';
      canvas.style.height = container.clientHeight + 'px';
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const displayWidth = container.clientWidth;
    const displayHeight = container.clientHeight;
    const currentTime = performance.now() / 1000 - startTime;

    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Draw hit line near bottom
    const hitLineY = displayHeight - 20;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(0, hitLineY);
    ctx.lineTo(displayWidth, hitLineY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Expected notes for piano highlighting
    const expectedMap = new Map();

    // Draw falling notes
    let allDone = true;
    for (const note of notes) {
      const noteY = hitLineY - (note.time - currentTime) * FALL_SPEED;
      const noteHeight = Math.max(note.duration * FALL_SPEED, 12);
      const noteTop = noteY - noteHeight;

      // Check if still pending
      if (!note.hit && !note.missed) {
        allDone = false;

        // Mark as missed if it's past the miss window
        if (currentTime > note.time + MISS_WINDOW) {
          note.missed = true;
          if (onNoteMiss) onNoteMiss(note);
          continue;
        }
      }

      // Skip notes that are way off screen
      if (noteY < -100 || noteTop > displayHeight + 100) continue;

      // Get x position from piano
      const x = PianoRenderer.getNoteX(note.midi);
      const w = PianoRenderer.getNoteWidth(note.midi) * 0.8;

      if (!x) continue;

      // Color based on state and hand
      let color;
      if (note.hit) {
        color = HIT_COLOR;
        ctx.globalAlpha = 0.4;
      } else if (note.missed) {
        color = MISS_COLOR;
        ctx.globalAlpha = 0.3;
      } else {
        color = note.hand === 'left' ? LH_COLOR : RH_COLOR;
        ctx.globalAlpha = 0.85;

        // If note is near the hit line, highlight on piano
        if (Math.abs(note.time - currentTime) < 1.0) {
          expectedMap.set(note.midi, {
            color: color,
            finger: note.finger || null,
          });
        }
      }

      // Draw rounded rectangle
      const radius = 4;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x - w / 2, noteTop, w, noteHeight, radius);
      ctx.fill();

      // Hit quality flash
      if (note.hit && note.hitQuality === 'perfect') {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      // Note name inside
      if (noteHeight > 18 && !note.hit) {
        ctx.fillStyle = '#fff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(MIDIEngine.noteName(note.midi), x, noteY - noteHeight / 2 + 4);
      }
    }

    PianoRenderer.setExpected(expectedMap);

    // Check completion
    if (allDone || (notes.length > 0 && notes.every(n => n.hit || n.missed))) {
      stop();
      if (onComplete) onComplete(notes);
      return;
    }

    animFrame = requestAnimationFrame(animate);
  }

  /**
   * Preview/listen mode — notes fall with guide audio, AND the user can
   * play along interactively (notes turn green on hit).
   */
  function preview(noteData, lessonBpm) {
    // Stop any previous run
    stop();

    loadNotes(noteData, lessonBpm);
    _buildNotes();

    running = true;
    startTime = performance.now() / 1000;
    onNoteHit = null;
    onNoteMiss = null;
    onComplete = () => { stop(); };

    // Schedule all guide audio on the WebAudio clock for sample-accurate timing.
    // Map performance.now timeline -> AudioContext timeline.
    AudioEngine.init();
    AudioEngine.resume();
    const audioNow = AudioEngine.now();
    notes.forEach(n => {
      AudioEngine.scheduleNote(n.midi, audioNow + n.time, 80);
    });

    // Register note-hit handler so user can play along
    MIDIEngine.on('noteOn', handleNoteOn);

    animate();
  }

  /** Current music position in beats (negative during lead-in). */
  function getMusicBeats() {
    if (!running) return null;
    const elapsed = performance.now() / 1000 - startTime;
    const beatDuration = 60 / (bpm * tempoScale);
    return (elapsed - leadIn) / beatDuration;
  }

  /** Seconds per beat at current tempo. */
  function getBeatDuration() { return 60 / (bpm * tempoScale); }

  function isRunning() { return running; }

  return { init, loadNotes, setTempoScale, start, stop, preview, getMusicBeats, getBeatDuration, isRunning };
})();
