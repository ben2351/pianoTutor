/**
 * MIDI Integration — Web MIDI API + keyboard/mouse fallback
 */
const MIDIEngine = (() => {
  let midiAccess = null;
  let activeInput = null;
  const listeners = { noteOn: [], noteOff: [], connect: [], disconnect: [] };
  const activeNotes = new Map(); // midiNote -> { velocity, stopFn }

  // Computer keyboard mapping (Z row = C3 whites, Q row = C4 whites)
  const KEY_MAP = {
    // Lower octave (C3 = MIDI 48)
    'z': 48, 's': 49, 'x': 50, 'd': 51, 'c': 52, 'v': 53,
    'g': 54, 'b': 55, 'h': 56, 'n': 57, 'j': 58, 'm': 59,
    ',': 60,
    // Upper octave (C4 = MIDI 60)
    'q': 60, '2': 61, 'w': 62, '3': 63, 'e': 64, 'r': 65,
    '5': 66, 't': 67, '6': 68, 'y': 69, '7': 70, 'u': 71,
    'i': 72, '9': 73, 'o': 74, '0': 75, 'p': 76,
  };

  function on(event, fn) { listeners[event].push(fn); }
  function off(event, fn) { listeners[event] = listeners[event].filter(f => f !== fn); }
  function emit(event, data) { listeners[event].forEach(fn => fn(data)); }

  async function init() {
    // Try Web MIDI
    if (navigator.requestMIDIAccess) {
      try {
        midiAccess = await navigator.requestMIDIAccess({ sysex: false });
        midiAccess.onstatechange = handleStateChange;
        connectFirstDevice();
      } catch (e) {
        console.warn('MIDI access denied:', e);
      }
    }

    // Keyboard fallback
    setupKeyboardFallback();
  }

  function connectFirstDevice() {
    if (!midiAccess) return;
    for (const input of midiAccess.inputs.values()) {
      connectDevice(input);
      return;
    }
    emit('disconnect', {});
  }

  function connectDevice(input) {
    if (activeInput) activeInput.onmidimessage = null;
    activeInput = input;
    activeInput.onmidimessage = handleMIDIMessage;
    emit('connect', { name: input.name });
  }

  function handleStateChange(e) {
    if (e.port.type === 'input') {
      if (e.port.state === 'connected') {
        connectDevice(e.port);
      } else if (e.port === activeInput) {
        activeInput = null;
        emit('disconnect', {});
        connectFirstDevice();
      }
    }
  }

  function handleMIDIMessage(msg) {
    const [status, note, velocity] = msg.data;
    const command = status & 0xf0;

    if (command === 0x90 && velocity > 0) {
      noteOn(note, velocity);
    } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
      noteOff(note);
    }
  }

  function noteOn(midiNote, velocity = 80) {
    // Stop existing note if re-triggered
    if (activeNotes.has(midiNote)) {
      const existing = activeNotes.get(midiNote);
      if (existing.stopFn) existing.stopFn();
    }
    const stopFn = AudioEngine.playNote(midiNote, velocity);
    activeNotes.set(midiNote, { velocity, stopFn });
    emit('noteOn', { note: midiNote, velocity });
  }

  function noteOff(midiNote) {
    const active = activeNotes.get(midiNote);
    if (active) {
      if (active.stopFn) active.stopFn();
      activeNotes.delete(midiNote);
    }
    emit('noteOff', { note: midiNote });
  }

  function setupKeyboardFallback() {
    const pressed = new Set();
    document.addEventListener('keydown', (e) => {
      if (e.repeat || e.target.tagName === 'INPUT') return;
      const midi = KEY_MAP[e.key.toLowerCase()];
      if (midi !== undefined && !pressed.has(e.key.toLowerCase())) {
        pressed.add(e.key.toLowerCase());
        noteOn(midi, 80);
      }
    });
    document.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      const midi = KEY_MAP[key];
      if (midi !== undefined) {
        pressed.delete(key);
        noteOff(midi);
      }
    });
  }

  function isNoteActive(midiNote) {
    return activeNotes.has(midiNote);
  }

  function getActiveNotes() {
    return [...activeNotes.keys()];
  }

  // Note name utilities
  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  function noteName(midi) {
    return NOTE_NAMES[midi % 12] + Math.floor(midi / 12 - 1);
  }
  function isBlackKey(midi) {
    return [1, 3, 6, 8, 10].includes(midi % 12);
  }

  return { init, on, off, noteOn, noteOff, isNoteActive, getActiveNotes, noteName, isBlackKey };
})();
