/**
 * Piano Keyboard Renderer — draws interactive piano on canvas
 */
const PianoRenderer = (() => {
  let canvas, ctx;
  let startNote = 36;  // C2
  let endNote = 96;    // C7
  let whiteKeyWidth, whiteKeyHeight, blackKeyWidth, blackKeyHeight;
  let whiteKeys = [];  // { midi, x, width }
  let blackKeys = [];
  let highlightedNotes = new Map(); // midi -> { color, label }
  let expectedNotes = new Map();    // midi -> { color, finger }

  // Which white key positions have a black key to their right
  const BLACK_KEY_OFFSETS = {
    0: true,   // C -> C#
    1: true,   // D -> D#
    2: false,  // E
    3: true,   // F -> F#
    4: true,   // G -> G#
    5: true,   // A -> A#
    6: false,  // B
  };

  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    computeLayout();
    window.addEventListener('resize', () => { computeLayout(); draw(); });

    // Mouse interaction
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);

    // Listen for MIDI events to redraw
    MIDIEngine.on('noteOn', () => draw());
    MIDIEngine.on('noteOff', () => draw());

    draw();
  }

  function computeLayout() {
    const container = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = container.clientWidth * dpr;
    canvas.height = container.clientHeight * dpr;
    canvas.style.width = container.clientWidth + 'px';
    canvas.style.height = container.clientHeight + 'px';
    ctx.scale(dpr, dpr);

    const displayWidth = container.clientWidth;
    const displayHeight = container.clientHeight;

    // Count white keys in range
    whiteKeys = [];
    blackKeys = [];
    for (let midi = startNote; midi <= endNote; midi++) {
      if (!MIDIEngine.isBlackKey(midi)) {
        whiteKeys.push({ midi, x: 0, width: 0 });
      }
    }

    whiteKeyWidth = displayWidth / whiteKeys.length;
    whiteKeyHeight = displayHeight;
    blackKeyWidth = whiteKeyWidth * 0.6;
    blackKeyHeight = displayHeight * 0.6;

    // Assign x positions to white keys
    whiteKeys.forEach((key, i) => {
      key.x = i * whiteKeyWidth;
      key.width = whiteKeyWidth;
    });

    // Assign x positions to black keys
    for (let midi = startNote; midi <= endNote; midi++) {
      if (MIDIEngine.isBlackKey(midi)) {
        // Black key sits between the two white keys surrounding it
        const prevWhite = whiteKeys.find(k => k.midi === midi - 1);
        if (prevWhite) {
          blackKeys.push({
            midi,
            x: prevWhite.x + prevWhite.width - blackKeyWidth / 2,
            width: blackKeyWidth,
          });
        }
      }
    }
  }

  function draw() {
    const displayWidth = canvas.width / (window.devicePixelRatio || 1);
    const displayHeight = canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Draw white keys
    whiteKeys.forEach(key => {
      const active = MIDIEngine.isNoteActive(key.midi);
      const highlight = highlightedNotes.get(key.midi);
      const expected = expectedNotes.get(key.midi);

      if (active) {
        ctx.fillStyle = highlight ? highlight.color : '#4fc3f7';
      } else if (expected) {
        ctx.fillStyle = expected.color + '40'; // Semi-transparent
      } else {
        ctx.fillStyle = '#f5f5f0';
      }
      ctx.fillRect(key.x, 0, key.width, whiteKeyHeight);

      // Border
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 1;
      ctx.strokeRect(key.x, 0, key.width, whiteKeyHeight);

      // Note name on bottom white keys (for C notes only)
      if (key.midi % 12 === 0) {
        ctx.fillStyle = '#888';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(MIDIEngine.noteName(key.midi), key.x + key.width / 2, whiteKeyHeight - 6);
      }

      // Finger number
      if (expected && expected.finger) {
        ctx.fillStyle = expected.color;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(expected.finger, key.x + key.width / 2, whiteKeyHeight - 24);
      }
    });

    // Draw black keys
    blackKeys.forEach(key => {
      const active = MIDIEngine.isNoteActive(key.midi);
      const highlight = highlightedNotes.get(key.midi);
      const expected = expectedNotes.get(key.midi);

      if (active) {
        ctx.fillStyle = highlight ? highlight.color : '#4fc3f7';
      } else if (expected) {
        ctx.fillStyle = expected.color + '80';
      } else {
        ctx.fillStyle = '#333';
      }
      ctx.fillRect(key.x, 0, key.width, blackKeyHeight);

      // Subtle border
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1;
      ctx.strokeRect(key.x, 0, key.width, blackKeyHeight);

      // Finger number
      if (expected && expected.finger) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(expected.finger, key.x + key.width / 2, blackKeyHeight - 8);
      }
    });
  }

  function setHighlights(noteMap) {
    highlightedNotes = new Map(noteMap);
    draw();
  }

  function setExpected(noteMap) {
    expectedNotes = new Map(noteMap);
    draw();
  }

  function clearExpected() {
    expectedNotes.clear();
    draw();
  }

  // Get the x-center position of a MIDI note on the piano
  function getNoteX(midi) {
    if (MIDIEngine.isBlackKey(midi)) {
      const bk = blackKeys.find(k => k.midi === midi);
      return bk ? bk.x + bk.width / 2 : 0;
    }
    const wk = whiteKeys.find(k => k.midi === midi);
    return wk ? wk.x + wk.width / 2 : 0;
  }

  function getNoteWidth(midi) {
    return MIDIEngine.isBlackKey(midi) ? blackKeyWidth : whiteKeyWidth;
  }

  // Mouse-based playing
  let mouseNote = null;
  function onMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Check black keys first (they're on top)
    for (const key of blackKeys) {
      if (x >= key.x && x <= key.x + key.width && y <= blackKeyHeight) {
        mouseNote = key.midi;
        MIDIEngine.noteOn(key.midi, 80);
        return;
      }
    }
    for (const key of whiteKeys) {
      if (x >= key.x && x <= key.x + key.width) {
        mouseNote = key.midi;
        MIDIEngine.noteOn(key.midi, 80);
        return;
      }
    }
  }

  function onMouseUp() {
    if (mouseNote !== null) {
      MIDIEngine.noteOff(mouseNote);
      mouseNote = null;
    }
  }

  return { init, draw, setHighlights, setExpected, clearExpected, getNoteX, getNoteWidth, computeLayout };
})();
