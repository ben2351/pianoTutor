/**
 * Lesson Engine — curriculum data, helpers, and lesson management
 *
 * Note encoding:
 *   midi: MIDI note number (60 = Middle C = C4)
 *   time: beat position (0-based)
 *   duration: length in beats
 *   hand: 'right' or 'left'
 *   finger: finger number (1=thumb, 5=pinky)
 */
const Lessons = (() => {

  // ═════��════════════════════════════════════════════════════════════
  // CHORD DATABASE
  // ══════════════════��═══════════════════════════════════════════════

  const CHORD_DB = {
    // ── Major Triads ──
    'C':    { midi: [60, 64, 67], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'G':    { midi: [55, 59, 62], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'F':    { midi: [53, 57, 60], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'D':    { midi: [62, 66, 69], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'A':    { midi: [57, 61, 64], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'E':    { midi: [52, 56, 59], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'Bb':   { midi: [58, 62, 65], fingersR: [2, 4, 5], fingersL: [3, 2, 1] },

    // ── Minor Triads ──
    'Am':   { midi: [57, 60, 64], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'Em':   { midi: [52, 55, 59], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'Dm':   { midi: [62, 65, 69], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'Bm':   { midi: [59, 62, 66], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'Fm':   { midi: [53, 56, 60], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'Cm':   { midi: [60, 63, 67], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },

    // ── Inversions (major) ──
    'C/E':  { midi: [64, 67, 72], fingersR: [1, 2, 5], fingersL: [5, 3, 1] },
    'C/G':  { midi: [55, 60, 64], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'F/A':  { midi: [57, 60, 65], fingersR: [1, 2, 5], fingersL: [5, 3, 1] },
    'F/C':  { midi: [60, 65, 69], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'G/B':  { midi: [59, 62, 67], fingersR: [1, 2, 5], fingersL: [5, 3, 1] },
    'G/D':  { midi: [62, 67, 71], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },

    // ── Inversions (minor) ──
    'Am/C': { midi: [60, 64, 69], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'Am/E': { midi: [52, 57, 60], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'Dm/F': { midi: [65, 69, 74], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'Em/G': { midi: [55, 59, 64], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },

    // ── 7th Chords ──
    'Cmaj7': { midi: [60, 64, 67, 71], fingersR: [1, 2, 3, 5], fingersL: [5, 3, 2, 1] },
    'Dm7':   { midi: [62, 65, 69, 72], fingersR: [1, 2, 3, 5], fingersL: [5, 3, 2, 1] },
    'Em7':   { midi: [52, 55, 59, 62], fingersR: [1, 2, 3, 5], fingersL: [5, 3, 2, 1] },
    'Fmaj7': { midi: [53, 57, 60, 64], fingersR: [1, 2, 3, 5], fingersL: [5, 3, 2, 1] },
    'G7':    { midi: [55, 59, 62, 65], fingersR: [1, 2, 3, 5], fingersL: [5, 3, 2, 1] },
    'Am7':   { midi: [57, 60, 64, 67], fingersR: [1, 2, 3, 5], fingersL: [5, 3, 2, 1] },
    'Bdim7': { midi: [59, 62, 65, 68], fingersR: [1, 2, 3, 5], fingersL: [5, 3, 2, 1] },
    'D7':    { midi: [62, 66, 69, 72], fingersR: [1, 2, 3, 5], fingersL: [5, 3, 2, 1] },
    'E7':    { midi: [52, 56, 59, 62], fingersR: [1, 2, 3, 5], fingersL: [5, 3, 2, 1] },
    'A7':    { midi: [57, 61, 64, 67], fingersR: [1, 2, 3, 5], fingersL: [5, 3, 2, 1] },

    // ── Suspended Chords ──
    'Csus2': { midi: [60, 62, 67], fingersR: [1, 2, 5], fingersL: [5, 4, 1] },
    'Csus4': { midi: [60, 65, 67], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'Dsus2': { midi: [62, 64, 69], fingersR: [1, 2, 5], fingersL: [5, 4, 1] },
    'Dsus4': { midi: [62, 67, 69], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'Gsus4': { midi: [55, 60, 62], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'Fsus2': { midi: [53, 55, 60], fingersR: [1, 2, 5], fingersL: [5, 4, 1] },
    'Asus2': { midi: [57, 59, 64], fingersR: [1, 2, 5], fingersL: [5, 4, 1] },
    'Asus4': { midi: [57, 62, 64], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },

    // ── Diminished & Augmented ──
    'Bdim':  { midi: [59, 62, 65], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'Cdim':  { midi: [60, 63, 66], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'Caug':  { midi: [60, 64, 68], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'Eaug':  { midi: [52, 56, 60], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },

    // ── Extended / 9th Chords ──
    'C9':    { midi: [60, 64, 67, 74], fingersR: [1, 2, 3, 5], fingersL: [5, 3, 2, 1] },
    'G9':    { midi: [55, 59, 62, 69], fingersR: [1, 2, 3, 5], fingersL: [5, 3, 2, 1] },
    'Dm9':   { midi: [62, 65, 69, 76], fingersR: [1, 2, 3, 5], fingersL: [5, 3, 2, 1] },
    'Fmaj9': { midi: [53, 57, 60, 67], fingersR: [1, 2, 3, 5], fingersL: [5, 3, 2, 1] },

    // ── Chords in other keys ──
    'Gb':    { midi: [54, 58, 61], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'Eb':    { midi: [63, 67, 70], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'Ab':    { midi: [56, 60, 63], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'Db':    { midi: [61, 65, 68], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'Bbm':   { midi: [58, 61, 65], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'Ebm':   { midi: [63, 66, 70], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'Gm':    { midi: [55, 58, 62], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'Abm':   { midi: [56, 59, 63], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'F#m':   { midi: [54, 57, 61], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'C#m':   { midi: [61, 64, 68], fingersR: [1, 3, 5], fingersL: [5, 3, 1] },
    'Eb7':   { midi: [63, 67, 70, 73], fingersR: [1, 2, 3, 5], fingersL: [5, 3, 2, 1] },
    'Bb7':   { midi: [58, 62, 65, 68], fingersR: [1, 2, 3, 5], fingersL: [5, 3, 2, 1] },
    'Abmaj7':{ midi: [56, 60, 63, 67], fingersR: [1, 2, 3, 5], fingersL: [5, 3, 2, 1] },
  };

  // ══════════��═══════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═════════���════════════════════════════════════════════════════════

  /** Generate note objects for a single chord hit. */
  function chord(name, time, duration, hand = 'right', octaveShift = 0) {
    const entry = CHORD_DB[name];
    if (!entry) { console.error('Unknown chord:', name); return []; }
    const fingers = hand === 'right' ? entry.fingersR : entry.fingersL;
    const shift = octaveShift * 12;
    return entry.midi.map((midi, i) => ({
      midi: midi + shift,
      time,
      duration,
      hand,
      finger: fingers[i],
    }));
  }

  /** Repeat a chord multiple times with even spacing. */
  function repeatChord(name, startTime, count, duration, gap = 0, hand = 'right', octaveShift = 0) {
    const notes = [];
    const step = duration + gap;
    for (let i = 0; i < count; i++) {
      notes.push(...chord(name, startTime + i * step, duration, hand, octaveShift));
    }
    return notes;
  }

  /** Generate a chord progression. */
  function progression(chordNames, options = {}) {
    const {
      startTime = 0,
      duration = 4,
      gap = 0,
      hand = 'right',
      octaveShift = 0,
      repeat = 1,
    } = options;
    const notes = [];
    const blockLength = chordNames.length * (duration + gap);
    for (let r = 0; r < repeat; r++) {
      chordNames.forEach((name, i) => {
        const t = startTime + r * blockLength + i * (duration + gap);
        notes.push(...chord(name, t, duration, hand, octaveShift));
      });
    }
    return notes;
  }

  /** Generate a scale passage. */
  const SCALE_PATTERNS = {
    major:   [0, 2, 4, 5, 7, 9, 11, 12],
    minor:   [0, 2, 3, 5, 7, 8, 10, 12],
    blues:   [0, 3, 5, 6, 7, 10, 12],
    pentatonic: [0, 2, 4, 7, 9, 12],
  };
  const SCALE_FINGERS = [1, 2, 3, 1, 2, 3, 4, 5];

  function scale(rootMidi, type, startTime, options = {}) {
    const { duration = 1, hand = 'right', upAndDown = false } = options;
    const pattern = SCALE_PATTERNS[type] || SCALE_PATTERNS.major;
    let intervals = [...pattern];
    if (upAndDown) {
      intervals = [...pattern, ...[...pattern].reverse().slice(1)];
    }
    return intervals.map((interval, i) => ({
      midi: rootMidi + interval,
      time: startTime + i * duration,
      duration,
      hand,
      finger: SCALE_FINGERS[i % SCALE_FINGERS.length],
    }));
  }

  /** Break a chord into individual notes (arpeggio). */
  function arpeggio(name, startTime, noteDuration = 0.5, hand = 'right', octaveShift = 0) {
    const entry = CHORD_DB[name];
    if (!entry) { console.error('Unknown chord:', name); return []; }
    const fingers = hand === 'right' ? entry.fingersR : entry.fingersL;
    const shift = octaveShift * 12;
    return entry.midi.map((midi, i) => ({
      midi: midi + shift,
      time: startTime + i * noteDuration,
      duration: noteDuration,
      hand,
      finger: fingers[i],
    }));
  }

  /** Repeat an arpeggio pattern multiple times. */
  function repeatArpeggio(name, startTime, count, noteDuration = 0.5, gap = 0, hand = 'right', octaveShift = 0) {
    const notes = [];
    const entry = CHORD_DB[name];
    if (!entry) return notes;
    const chordLen = entry.midi.length * noteDuration + gap;
    for (let i = 0; i < count; i++) {
      notes.push(...arpeggio(name, startTime + i * chordLen, noteDuration, hand, octaveShift));
    }
    return notes;
  }

  /** Generate a melody from an array of [midi, duration] pairs. */
  function melody(noteData, startTime = 0, hand = 'right') {
    const notes = [];
    let t = startTime;
    noteData.forEach(([midi, dur, finger]) => {
      if (midi > 0) { // 0 = rest
        notes.push({ midi, time: t, duration: dur, hand, finger: finger || 1 });
      }
      t += dur;
    });
    return notes;
  }

  /** Generate a boom-chuck pattern (bass note then chord). */
  function boomChuck(name, startTime, count, hand = 'left', octaveShift = 0) {
    const entry = CHORD_DB[name];
    if (!entry) return [];
    const shift = octaveShift * 12;
    const bass = entry.midi[0] + shift;
    const notes = [];
    for (let i = 0; i < count; i++) {
      const t = startTime + i * 4;
      // Bass note on beat 1
      notes.push({ midi: bass, time: t, duration: 1, hand, finger: 5 });
      // Chord on beat 3
      const fingers = hand === 'right' ? entry.fingersR : entry.fingersL;
      entry.midi.slice(1).forEach((m, j) => {
        notes.push({ midi: m + shift, time: t + 2, duration: 1, hand, finger: fingers[j + 1] });
      });
    }
    return notes;
  }

  /** Waltz pattern (bass-chord-chord in 3/4). */
  function waltz(name, startTime, count, hand = 'left', octaveShift = 0) {
    const entry = CHORD_DB[name];
    if (!entry) return [];
    const shift = octaveShift * 12;
    const bass = entry.midi[0] + shift;
    const notes = [];
    for (let i = 0; i < count; i++) {
      const t = startTime + i * 3;
      notes.push({ midi: bass, time: t, duration: 1, hand, finger: 5 });
      entry.midi.slice(1).forEach((m, j) => {
        notes.push({ midi: m + shift, time: t + 1, duration: 0.5, hand, finger: entry.fingersL[j + 1] || 3 });
        notes.push({ midi: m + shift, time: t + 2, duration: 0.5, hand, finger: entry.fingersL[j + 1] || 3 });
      });
    }
    return notes;
  }

  // ══════════════════════════════════════════════════════════════════
  // CURRICULUM
  // ══════════════════════════════════════════════════════════════════

  const CURRICULUM = [
    // ═══ LEVEL 1: Foundations ═══
    {
      level: 1,
      levelName: 'Foundations',
      lessons: [
        {
          id: 'L1-01',
          name: 'Meet Your Keyboard',
          skills: 'Key names, octaves, Middle C',
          bpm: 80,
          instruction: 'Welcome! Let\'s find Middle C (C4). It\'s the C nearest to the center of the keyboard. Press Middle C when the note reaches the line.',
          notes: [
            { midi: 60, time: 0, duration: 2, hand: 'right', finger: 1 },
            { midi: 60, time: 3, duration: 2, hand: 'right', finger: 1 },
            { midi: 60, time: 6, duration: 2, hand: 'right', finger: 1 },
            { midi: 60, time: 9, duration: 2, hand: 'right', finger: 1 },
          ]
        },
        {
          id: 'L1-02',
          name: 'C, D, and E',
          skills: 'Right hand thumb position, first 3 notes',
          bpm: 80,
          instruction: 'Place your right thumb on Middle C. Your index finger goes on D, middle finger on E. Play each note as it falls.',
          notes: [
            { midi: 60, time: 0, duration: 1, hand: 'right', finger: 1 },
            { midi: 62, time: 1.5, duration: 1, hand: 'right', finger: 2 },
            { midi: 64, time: 3, duration: 1, hand: 'right', finger: 3 },
            { midi: 62, time: 4.5, duration: 1, hand: 'right', finger: 2 },
            { midi: 60, time: 6, duration: 2, hand: 'right', finger: 1 },
            { midi: 64, time: 9, duration: 1, hand: 'right', finger: 3 },
            { midi: 64, time: 10.5, duration: 1, hand: 'right', finger: 3 },
            { midi: 64, time: 12, duration: 2, hand: 'right', finger: 3 },
          ]
        },
        {
          id: 'L1-03',
          name: 'Five-Finger Position',
          skills: 'C through G, all five fingers',
          bpm: 80,
          instruction: 'Now use all 5 fingers: Thumb(1) on C, Index(2) on D, Middle(3) on E, Ring(4) on F, Pinky(5) on G.',
          notes: [
            { midi: 60, time: 0, duration: 1, hand: 'right', finger: 1 },
            { midi: 62, time: 1, duration: 1, hand: 'right', finger: 2 },
            { midi: 64, time: 2, duration: 1, hand: 'right', finger: 3 },
            { midi: 65, time: 3, duration: 1, hand: 'right', finger: 4 },
            { midi: 67, time: 4, duration: 2, hand: 'right', finger: 5 },
            { midi: 67, time: 7, duration: 1, hand: 'right', finger: 5 },
            { midi: 65, time: 8, duration: 1, hand: 'right', finger: 4 },
            { midi: 64, time: 9, duration: 1, hand: 'right', finger: 3 },
            { midi: 62, time: 10, duration: 1, hand: 'right', finger: 2 },
            { midi: 60, time: 11, duration: 2, hand: 'right', finger: 1 },
          ]
        },
        {
          id: 'L1-04',
          name: 'Mary Had a Little Lamb',
          skills: 'First melody, E-D-C pattern',
          bpm: 100,
          instruction: 'Your first song! "Mary Had a Little Lamb" uses just C, D, and E. Follow the falling notes.',
          notes: [
            { midi: 64, time: 0, duration: 1, hand: 'right', finger: 3 },
            { midi: 62, time: 1, duration: 1, hand: 'right', finger: 2 },
            { midi: 60, time: 2, duration: 1, hand: 'right', finger: 1 },
            { midi: 62, time: 3, duration: 1, hand: 'right', finger: 2 },
            { midi: 64, time: 4, duration: 1, hand: 'right', finger: 3 },
            { midi: 64, time: 5, duration: 1, hand: 'right', finger: 3 },
            { midi: 64, time: 6, duration: 2, hand: 'right', finger: 3 },
            { midi: 62, time: 8, duration: 1, hand: 'right', finger: 2 },
            { midi: 62, time: 9, duration: 1, hand: 'right', finger: 2 },
            { midi: 62, time: 10, duration: 2, hand: 'right', finger: 2 },
            { midi: 64, time: 12, duration: 1, hand: 'right', finger: 3 },
            { midi: 67, time: 13, duration: 1, hand: 'right', finger: 5 },
            { midi: 67, time: 14, duration: 2, hand: 'right', finger: 5 },
            { midi: 64, time: 16, duration: 1, hand: 'right', finger: 3 },
            { midi: 62, time: 17, duration: 1, hand: 'right', finger: 2 },
            { midi: 60, time: 18, duration: 1, hand: 'right', finger: 1 },
            { midi: 62, time: 19, duration: 1, hand: 'right', finger: 2 },
            { midi: 64, time: 20, duration: 1, hand: 'right', finger: 3 },
            { midi: 64, time: 21, duration: 1, hand: 'right', finger: 3 },
            { midi: 64, time: 22, duration: 1, hand: 'right', finger: 3 },
            { midi: 64, time: 23, duration: 1, hand: 'right', finger: 3 },
            { midi: 62, time: 24, duration: 1, hand: 'right', finger: 2 },
            { midi: 62, time: 25, duration: 1, hand: 'right', finger: 2 },
            { midi: 64, time: 26, duration: 1, hand: 'right', finger: 3 },
            { midi: 62, time: 27, duration: 1, hand: 'right', finger: 2 },
            { midi: 60, time: 28, duration: 2, hand: 'right', finger: 1 },
          ]
        },
        {
          id: 'L1-05',
          name: 'Hot Cross Buns',
          skills: 'E-D-C pattern, rests',
          bpm: 100,
          instruction: 'Another classic! "Hot Cross Buns" — notice the rests (gaps) between phrases.',
          notes: [
            { midi: 64, time: 0, duration: 1, hand: 'right', finger: 3 },
            { midi: 62, time: 1, duration: 1, hand: 'right', finger: 2 },
            { midi: 60, time: 2, duration: 2, hand: 'right', finger: 1 },
            { midi: 64, time: 4, duration: 1, hand: 'right', finger: 3 },
            { midi: 62, time: 5, duration: 1, hand: 'right', finger: 2 },
            { midi: 60, time: 6, duration: 2, hand: 'right', finger: 1 },
            { midi: 60, time: 8, duration: 0.5, hand: 'right', finger: 1 },
            { midi: 60, time: 8.5, duration: 0.5, hand: 'right', finger: 1 },
            { midi: 60, time: 9, duration: 0.5, hand: 'right', finger: 1 },
            { midi: 60, time: 9.5, duration: 0.5, hand: 'right', finger: 1 },
            { midi: 62, time: 10, duration: 0.5, hand: 'right', finger: 2 },
            { midi: 62, time: 10.5, duration: 0.5, hand: 'right', finger: 2 },
            { midi: 62, time: 11, duration: 0.5, hand: 'right', finger: 2 },
            { midi: 62, time: 11.5, duration: 0.5, hand: 'right', finger: 2 },
            { midi: 64, time: 12, duration: 1, hand: 'right', finger: 3 },
            { midi: 62, time: 13, duration: 1, hand: 'right', finger: 2 },
            { midi: 60, time: 14, duration: 2, hand: 'right', finger: 1 },
          ]
        },
        {
          id: 'L1-06',
          name: 'Left Hand Intro',
          skills: 'Left hand C position, finger numbers',
          bpm: 72,
          instruction: 'Time for the left hand! Place your left pinky(5) on the C below Middle C (C3). Ring(4) on D, Middle(3) on E, Index(2) on F, Thumb(1) on G.',
          notes: [
            { midi: 48, time: 0, duration: 1, hand: 'left', finger: 5 },
            { midi: 50, time: 1, duration: 1, hand: 'left', finger: 4 },
            { midi: 52, time: 2, duration: 1, hand: 'left', finger: 3 },
            { midi: 53, time: 3, duration: 1, hand: 'left', finger: 2 },
            { midi: 55, time: 4, duration: 2, hand: 'left', finger: 1 },
            { midi: 55, time: 7, duration: 1, hand: 'left', finger: 1 },
            { midi: 53, time: 8, duration: 1, hand: 'left', finger: 2 },
            { midi: 52, time: 9, duration: 1, hand: 'left', finger: 3 },
            { midi: 50, time: 10, duration: 1, hand: 'left', finger: 4 },
            { midi: 48, time: 11, duration: 2, hand: 'left', finger: 5 },
          ]
        },
        {
          id: 'L1-07',
          name: 'Ode to Joy (RH)',
          skills: 'Longer melody, C major five-finger',
          bpm: 100,
          instruction: 'Beethoven\'s "Ode to Joy" simplified for five fingers! Take it slow — use the tempo controls if needed.',
          notes: [
            { midi: 64, time: 0, duration: 1, hand: 'right', finger: 3 },
            { midi: 64, time: 1, duration: 1, hand: 'right', finger: 3 },
            { midi: 65, time: 2, duration: 1, hand: 'right', finger: 4 },
            { midi: 67, time: 3, duration: 1, hand: 'right', finger: 5 },
            { midi: 67, time: 4, duration: 1, hand: 'right', finger: 5 },
            { midi: 65, time: 5, duration: 1, hand: 'right', finger: 4 },
            { midi: 64, time: 6, duration: 1, hand: 'right', finger: 3 },
            { midi: 62, time: 7, duration: 1, hand: 'right', finger: 2 },
            { midi: 60, time: 8, duration: 1, hand: 'right', finger: 1 },
            { midi: 60, time: 9, duration: 1, hand: 'right', finger: 1 },
            { midi: 62, time: 10, duration: 1, hand: 'right', finger: 2 },
            { midi: 64, time: 11, duration: 1, hand: 'right', finger: 3 },
            { midi: 64, time: 12, duration: 1.5, hand: 'right', finger: 3 },
            { midi: 62, time: 13.5, duration: 0.5, hand: 'right', finger: 2 },
            { midi: 62, time: 14, duration: 2, hand: 'right', finger: 2 },
            { midi: 64, time: 16, duration: 1, hand: 'right', finger: 3 },
            { midi: 64, time: 17, duration: 1, hand: 'right', finger: 3 },
            { midi: 65, time: 18, duration: 1, hand: 'right', finger: 4 },
            { midi: 67, time: 19, duration: 1, hand: 'right', finger: 5 },
            { midi: 67, time: 20, duration: 1, hand: 'right', finger: 5 },
            { midi: 65, time: 21, duration: 1, hand: 'right', finger: 4 },
            { midi: 64, time: 22, duration: 1, hand: 'right', finger: 3 },
            { midi: 62, time: 23, duration: 1, hand: 'right', finger: 2 },
            { midi: 60, time: 24, duration: 1, hand: 'right', finger: 1 },
            { midi: 60, time: 25, duration: 1, hand: 'right', finger: 1 },
            { midi: 62, time: 26, duration: 1, hand: 'right', finger: 2 },
            { midi: 64, time: 27, duration: 1, hand: 'right', finger: 3 },
            { midi: 62, time: 28, duration: 1.5, hand: 'right', finger: 2 },
            { midi: 60, time: 29.5, duration: 0.5, hand: 'right', finger: 1 },
            { midi: 60, time: 30, duration: 2, hand: 'right', finger: 1 },
          ]
        },
        {
          id: 'L1-08',
          name: 'Quarter Notes & Rests',
          skills: 'Steady beat, rhythmic precision',
          bpm: 90,
          instruction: 'Focus on timing! Play each note right on the beat. Rests (gaps) are just as important as notes.',
          notes: [
            { midi: 60, time: 0, duration: 1, hand: 'right', finger: 1 },
            { midi: 62, time: 2, duration: 1, hand: 'right', finger: 2 },
            { midi: 64, time: 4, duration: 1, hand: 'right', finger: 3 },
            { midi: 64, time: 5, duration: 1, hand: 'right', finger: 3 },
            { midi: 65, time: 8, duration: 1, hand: 'right', finger: 4 },
            { midi: 64, time: 9, duration: 1, hand: 'right', finger: 3 },
            { midi: 62, time: 10, duration: 1, hand: 'right', finger: 2 },
            { midi: 60, time: 11, duration: 1, hand: 'right', finger: 1 },
            { midi: 67, time: 12, duration: 1, hand: 'right', finger: 5 },
            { midi: 67, time: 14, duration: 1, hand: 'right', finger: 5 },
            { midi: 65, time: 16, duration: 2, hand: 'right', finger: 4 },
            { midi: 64, time: 18, duration: 2, hand: 'right', finger: 3 },
            { midi: 62, time: 20, duration: 2, hand: 'right', finger: 2 },
            { midi: 60, time: 22, duration: 2, hand: 'right', finger: 1 },
          ]
        },
      ]
    },

    // ═══ LEVEL 2: Building Blocks ═══
    {
      level: 2,
      levelName: 'Building Blocks',
      lessons: [
        {
          id: 'L2-01',
          name: 'Reading Treble Clef',
          skills: 'Lines and spaces, EGBDF / FACE',
          bpm: 72,
          instruction: 'The treble clef notes on lines: E-G-B-D-F. On spaces: F-A-C-E. Play these notes in the right hand C position.',
          notes: [
            { midi: 64, time: 0, duration: 1.5, hand: 'right', finger: 3 },
            { midi: 67, time: 2, duration: 1.5, hand: 'right', finger: 5 },
            { midi: 60, time: 4, duration: 1.5, hand: 'right', finger: 1 },
            { midi: 62, time: 6, duration: 1.5, hand: 'right', finger: 2 },
            { midi: 65, time: 8, duration: 1.5, hand: 'right', finger: 4 },
            { midi: 65, time: 10, duration: 1.5, hand: 'right', finger: 4 },
            { midi: 60, time: 12, duration: 1.5, hand: 'right', finger: 1 },
            { midi: 64, time: 14, duration: 1.5, hand: 'right', finger: 3 },
            { midi: 67, time: 16, duration: 2, hand: 'right', finger: 5 },
          ]
        },
        {
          id: 'L2-02',
          name: 'Legato Playing',
          skills: 'Smooth, connected notes',
          bpm: 72,
          instruction: 'Legato means smooth and connected. Try to hold each note until the very moment you play the next one — no gaps!',
          notes: [
            { midi: 60, time: 0, duration: 1.8, hand: 'right', finger: 1 },
            { midi: 62, time: 2, duration: 1.8, hand: 'right', finger: 2 },
            { midi: 64, time: 4, duration: 1.8, hand: 'right', finger: 3 },
            { midi: 65, time: 6, duration: 1.8, hand: 'right', finger: 4 },
            { midi: 67, time: 8, duration: 3.8, hand: 'right', finger: 5 },
            { midi: 65, time: 12, duration: 1.8, hand: 'right', finger: 4 },
            { midi: 64, time: 14, duration: 1.8, hand: 'right', finger: 3 },
            { midi: 62, time: 16, duration: 1.8, hand: 'right', finger: 2 },
            { midi: 60, time: 18, duration: 4, hand: 'right', finger: 1 },
          ]
        },
        {
          id: 'L2-03',
          name: 'C Major Scale (RH)',
          skills: 'Thumb tuck, full octave scale',
          bpm: 80,
          instruction: 'The C major scale covers 8 notes: C-D-E-F-G-A-B-C. After finger 3 plays E, tuck your thumb under to play F.',
          notes: [
            { midi: 60, time: 0, duration: 1, hand: 'right', finger: 1 },
            { midi: 62, time: 1, duration: 1, hand: 'right', finger: 2 },
            { midi: 64, time: 2, duration: 1, hand: 'right', finger: 3 },
            { midi: 65, time: 3, duration: 1, hand: 'right', finger: 1 },
            { midi: 67, time: 4, duration: 1, hand: 'right', finger: 2 },
            { midi: 69, time: 5, duration: 1, hand: 'right', finger: 3 },
            { midi: 71, time: 6, duration: 1, hand: 'right', finger: 4 },
            { midi: 72, time: 7, duration: 2, hand: 'right', finger: 5 },
            { midi: 71, time: 9.5, duration: 1, hand: 'right', finger: 4 },
            { midi: 69, time: 10.5, duration: 1, hand: 'right', finger: 3 },
            { midi: 67, time: 11.5, duration: 1, hand: 'right', finger: 2 },
            { midi: 65, time: 12.5, duration: 1, hand: 'right', finger: 1 },
            { midi: 64, time: 13.5, duration: 1, hand: 'right', finger: 3 },
            { midi: 62, time: 14.5, duration: 1, hand: 'right', finger: 2 },
            { midi: 60, time: 15.5, duration: 2, hand: 'right', finger: 1 },
          ]
        },
        {
          id: 'L2-04',
          name: 'First Chords: C Major',
          skills: 'Playing multiple notes together',
          bpm: 72,
          instruction: 'A chord is multiple notes played at the same time. The C major chord is C-E-G. Press all three together!',
          notes: [
            ...repeatChord('C', 0, 4, 2, 1),
            ...repeatChord('C', 13, 2, 4, 0),
          ]
        },
      ]
    },

    // ═══ LEVEL 3: Major Triads ═══
    {
      level: 3,
      levelName: 'Major Triads',
      lessons: [
        {
          id: 'L3-01',
          name: 'C Major Chord',
          skills: 'Root position C major, solid chord technique',
          bpm: 72,
          instruction: 'Play the C major chord (C-E-G) with fingers 1-3-5. Press all three keys at the same time. Focus on pressing them together, not one after another.',
          notes: [
            ...repeatChord('C', 0, 4, 2, 1),
            ...repeatChord('C', 12, 4, 3, 1),
            ...repeatChord('C', 28, 2, 4, 0),
          ]
        },
        {
          id: 'L3-02',
          name: 'G Major Chord',
          skills: 'G major triad, hand position shift',
          bpm: 72,
          instruction: 'The G major chord is G-B-D (fingers 1-3-5). Your hand moves down from the C position. Practice G alone, then switch between C and G.',
          notes: [
            ...repeatChord('G', 0, 4, 2, 1),
            ...repeatChord('G', 12, 2, 3, 1),
            // C-G switching
            ...chord('C', 20, 3),
            ...chord('G', 24, 3),
            ...chord('C', 28, 3),
            ...chord('G', 32, 3),
            ...chord('C', 36, 4),
          ]
        },
        {
          id: 'L3-03',
          name: 'F Major Chord',
          skills: 'F major triad, C-F switching',
          bpm: 72,
          instruction: 'F major is F-A-C (fingers 1-3-5). Notice how the top note (C) is the same as the bottom note of C major — this shared tone helps you switch smoothly.',
          notes: [
            ...repeatChord('F', 0, 4, 2, 1),
            ...repeatChord('F', 12, 2, 3, 1),
            // C-F switching
            ...chord('C', 20, 3),
            ...chord('F', 24, 3),
            ...chord('C', 28, 3),
            ...chord('F', 32, 3),
            ...chord('C', 36, 4),
          ]
        },
        {
          id: 'L3-04',
          name: 'C-F-G Switching',
          skills: 'Three-chord transitions, I-IV-V',
          bpm: 80,
          instruction: 'The three most important chords in the key of C! C (I), F (IV), and G (V) form the backbone of thousands of songs. Practice switching smoothly.',
          notes: [
            ...progression(['C', 'F', 'G', 'C'], { duration: 4, repeat: 2 }),
            ...progression(['C', 'G', 'F', 'C'], { startTime: 32, duration: 4 }),
          ]
        },
        {
          id: 'L3-05',
          name: 'D Major Chord',
          skills: 'D major triad, first sharp (F#)',
          bpm: 72,
          instruction: 'D major is D-F#-A. The F# is a black key — your first chord with a sharp! Fingers 1-3-5 as usual.',
          notes: [
            ...repeatChord('D', 0, 4, 2, 1),
            ...repeatChord('D', 12, 2, 3, 1),
            // D-G switching
            ...chord('D', 20, 3),
            ...chord('G', 24, 3),
            ...chord('D', 28, 3),
            ...chord('G', 32, 3),
            ...chord('D', 36, 4),
          ]
        },
        {
          id: 'L3-06',
          name: 'A and E Major',
          skills: 'A major (C#), E major (G#)',
          bpm: 72,
          instruction: 'A major is A-C#-E. E major is E-G#-B. Both have one black key. Practice each, then alternate between them.',
          notes: [
            ...repeatChord('A', 0, 3, 2, 1),
            ...repeatChord('E', 9, 3, 2, 1),
            // A-E switching
            ...chord('A', 18, 3),
            ...chord('E', 22, 3),
            ...chord('A', 26, 3),
            ...chord('E', 30, 3),
            ...chord('A', 34, 4),
          ]
        },
        {
          id: 'L3-07',
          name: 'Bb Major & Review',
          skills: 'Bb major (flat chord), all 7 major triads',
          bpm: 80,
          instruction: 'Bb major is Bb-D-F — note the different fingering (2-4-5). Then we\'ll review all 7 major chords. This is a workout!',
          notes: [
            ...repeatChord('Bb', 0, 4, 2, 1),
            // All 7 majors in sequence
            ...chord('C', 12, 3),
            ...chord('D', 16, 3),
            ...chord('E', 20, 3),
            ...chord('F', 24, 3),
            ...chord('G', 28, 3),
            ...chord('A', 32, 3),
            ...chord('Bb', 36, 3),
            ...chord('C', 40, 4),
          ]
        },
      ]
    },

    // ═══ LEVEL 4: Minor Triads ═══
    {
      level: 4,
      levelName: 'Minor Triads',
      lessons: [
        {
          id: 'L4-01',
          name: 'A Minor Chord',
          skills: 'Am triad, major vs minor comparison',
          bpm: 72,
          instruction: 'A minor is A-C-E (fingers 1-3-5). Compare it to A major (A-C#-E) — only one note changes! Minor chords sound darker and more melancholic.',
          notes: [
            ...repeatChord('Am', 0, 4, 2, 1),
            // Am vs A comparison
            ...chord('A', 12, 3),
            ...chord('Am', 16, 3),
            ...chord('A', 20, 3),
            ...chord('Am', 24, 3),
            // C-Am switching (relative major/minor)
            ...chord('C', 28, 3),
            ...chord('Am', 32, 3),
            ...chord('C', 36, 3),
            ...chord('Am', 40, 4),
          ]
        },
        {
          id: 'L4-02',
          name: 'E Minor Chord',
          skills: 'Em triad, Am-Em alternation',
          bpm: 72,
          instruction: 'E minor is E-G-B (fingers 1-3-5). All white keys! One of the easiest minor chords. Practice switching between Am and Em.',
          notes: [
            ...repeatChord('Em', 0, 4, 2, 1),
            // Am-Em switching
            ...chord('Am', 12, 3),
            ...chord('Em', 16, 3),
            ...chord('Am', 20, 3),
            ...chord('Em', 24, 3),
            ...chord('Am', 28, 3),
            ...chord('Em', 32, 4),
          ]
        },
        {
          id: 'L4-03',
          name: 'D Minor Chord',
          skills: 'Dm triad, Dm-Am alternation',
          bpm: 72,
          instruction: 'D minor is D-F-A (fingers 1-3-5). All white keys again! Dm and Am are a natural pair — they share the note A.',
          notes: [
            ...repeatChord('Dm', 0, 4, 2, 1),
            // Dm-Am switching
            ...chord('Dm', 12, 3),
            ...chord('Am', 16, 3),
            ...chord('Dm', 20, 3),
            ...chord('Am', 24, 3),
            ...chord('Dm', 28, 4),
          ]
        },
        {
          id: 'L4-04',
          name: 'Minor Switching',
          skills: 'Am-Em-Dm transitions',
          bpm: 80,
          instruction: 'Switch between the three most common minor chords. These appear together constantly in songs. Aim for smooth, even transitions.',
          notes: [
            ...progression(['Am', 'Em', 'Dm', 'Am'], { duration: 4, repeat: 2 }),
            ...progression(['Dm', 'Am', 'Em', 'Am'], { startTime: 32, duration: 4 }),
          ]
        },
        {
          id: 'L4-05',
          name: 'B Minor & F Minor',
          skills: 'Bm and Fm, chords with black keys',
          bpm: 68,
          instruction: 'B minor (B-D-F#) and F minor (F-Ab-C) both have a black key. These are trickier but essential. Take your time.',
          notes: [
            ...repeatChord('Bm', 0, 3, 2, 1),
            ...repeatChord('Fm', 9, 3, 2, 1),
            // Alternation
            ...chord('Bm', 18, 3),
            ...chord('Fm', 22, 3),
            ...chord('Bm', 26, 3),
            ...chord('Fm', 30, 3),
            ...chord('Bm', 34, 4),
          ]
        },
        {
          id: 'L4-06',
          name: 'C Minor & Full Review',
          skills: 'Cm triad, all 6 minor chords',
          bpm: 76,
          instruction: 'C minor is C-Eb-G. Then we\'ll play through all 6 minor chords in sequence. You now know 13 chords total!',
          notes: [
            ...repeatChord('Cm', 0, 4, 2, 1),
            // All 6 minors
            ...chord('Am', 12, 3),
            ...chord('Bm', 16, 3),
            ...chord('Cm', 20, 3),
            ...chord('Dm', 24, 3),
            ...chord('Em', 28, 3),
            ...chord('Fm', 32, 3),
            ...chord('Am', 36, 4),
          ]
        },
      ]
    },

    // ═══ LEVEL 5: Chord Progressions ═══
    {
      level: 5,
      levelName: 'Chord Progressions',
      lessons: [
        {
          id: 'L5-01',
          name: 'I-IV-V-I in C',
          skills: 'Classical cadence, chord functions',
          bpm: 80,
          instruction: 'The I-IV-V-I progression (C-F-G-C) is the foundation of Western harmony. The V chord (G) creates tension that resolves back to I (C). Feel that pull!',
          notes: [
            ...progression(['C', 'F', 'G', 'C'], { duration: 4, repeat: 3 }),
          ]
        },
        {
          id: 'L5-02',
          name: 'The Pop Progression',
          skills: 'I-V-vi-IV (C-G-Am-F)',
          bpm: 88,
          instruction: 'C-G-Am-F: the most popular chord progression in modern music. "No Woman No Cry", "Let It Be", "Someone Like You" — all use this pattern.',
          notes: [
            ...progression(['C', 'G', 'Am', 'F'], { duration: 4, repeat: 3 }),
          ]
        },
        {
          id: 'L5-03',
          name: 'Sad Pop Variation',
          skills: 'vi-IV-I-V (Am-F-C-G)',
          bpm: 84,
          instruction: 'Same four chords, but starting on the minor chord gives a more melancholy feel. Used in "Numb" (Linkin Park) and many others.',
          notes: [
            ...progression(['Am', 'F', 'C', 'G'], { duration: 4, repeat: 3 }),
          ]
        },
        {
          id: 'L5-04',
          name: 'Jazz Intro: ii-V-I',
          skills: 'Dm-G-C, most important jazz progression',
          bpm: 76,
          instruction: 'The ii-V-I (Dm-G-C) is the backbone of jazz harmony. The movement from Dm to G to C creates a strong sense of resolution.',
          notes: [
            ...progression(['Dm', 'G', 'C'], { duration: 4, repeat: 4 }),
          ]
        },
        {
          id: 'L5-05',
          name: '12-Bar Blues',
          skills: 'Blues form in C',
          bpm: 92,
          instruction: 'The 12-bar blues: 4 bars of C, 2 of F, 2 of C, then G-F-C-G. This is the structure behind almost all blues and early rock & roll.',
          notes: [
            ...progression(
              ['C', 'C', 'C', 'C', 'F', 'F', 'C', 'C', 'G', 'F', 'C', 'G'],
              { duration: 4 }
            ),
          ]
        },
        {
          id: 'L5-06',
          name: 'Progression Medley',
          skills: 'Multiple progressions back to back',
          bpm: 84,
          instruction: 'A medley of everything you\'ve learned! We\'ll move through different progressions without stopping. Stay focused on the chord changes.',
          notes: [
            // I-IV-V-I
            ...progression(['C', 'F', 'G', 'C'], { duration: 4 }),
            // Pop
            ...progression(['C', 'G', 'Am', 'F'], { startTime: 16, duration: 4 }),
            // ii-V-I
            ...progression(['Dm', 'G', 'C'], { startTime: 32, duration: 4 }),
            // Minor
            ...progression(['Am', 'Em', 'Dm', 'Am'], { startTime: 44, duration: 4 }),
          ]
        },
      ]
    },

    // ═══ LEVEL 6: Inversions & Voicings ═══
    {
      level: 6,
      levelName: 'Inversions & Voicings',
      lessons: [
        {
          id: 'L6-01',
          name: 'C Major Inversions',
          skills: 'Root, 1st, and 2nd inversion of C',
          bpm: 72,
          instruction: 'An inversion rearranges the notes of a chord. Root position: C-E-G. 1st inversion: E-G-C. 2nd inversion: G-C-E. Same notes, different order, different sound!',
          notes: [
            // Root position
            ...repeatChord('C', 0, 2, 3, 1),
            // 1st inversion
            ...repeatChord('C/E', 8, 2, 3, 1),
            // 2nd inversion
            ...repeatChord('C/G', 16, 2, 3, 1),
            // Cycle through all three
            ...chord('C', 24, 3),
            ...chord('C/E', 28, 3),
            ...chord('C/G', 32, 3),
            ...chord('C', 36, 4),
          ]
        },
        {
          id: 'L6-02',
          name: 'F Major Inversions',
          skills: 'Root, 1st, and 2nd inversion of F',
          bpm: 72,
          instruction: 'F major inversions: Root (F-A-C), 1st (A-C-F), 2nd (C-F-A). Notice how the 2nd inversion of F starts on C — same note as C major root!',
          notes: [
            ...repeatChord('F', 0, 2, 3, 1),
            ...repeatChord('F/A', 8, 2, 3, 1),
            ...repeatChord('F/C', 16, 2, 3, 1),
            ...chord('F', 24, 3),
            ...chord('F/A', 28, 3),
            ...chord('F/C', 32, 3),
            ...chord('F', 36, 4),
          ]
        },
        {
          id: 'L6-03',
          name: 'G Major Inversions',
          skills: 'Root, 1st, and 2nd inversion of G',
          bpm: 72,
          instruction: 'G major inversions: Root (G-B-D), 1st (B-D-G), 2nd (D-G-B). The 1st inversion puts B in the bass — a nice leading tone to C.',
          notes: [
            ...repeatChord('G', 0, 2, 3, 1),
            ...repeatChord('G/B', 8, 2, 3, 1),
            ...repeatChord('G/D', 16, 2, 3, 1),
            ...chord('G', 24, 3),
            ...chord('G/B', 28, 3),
            ...chord('G/D', 32, 3),
            ...chord('G', 36, 4),
          ]
        },
        {
          id: 'L6-04',
          name: 'Voice Leading: C to F',
          skills: 'Smooth C-F transition using inversions',
          bpm: 76,
          instruction: 'Instead of jumping between root positions, use F/C (2nd inversion) after C major. They share the note C, so your hand barely moves!',
          notes: [
            // Root position jumps (hard)
            ...chord('C', 0, 3),
            ...chord('F', 4, 3),
            ...chord('C', 8, 3),
            ...chord('F', 12, 3),
            // Voice-led (smooth)
            ...chord('C', 16, 3),
            ...chord('F/C', 20, 3),
            ...chord('C', 24, 3),
            ...chord('F/C', 28, 3),
            ...chord('C', 32, 4),
          ]
        },
        {
          id: 'L6-05',
          name: 'Voice Leading: C to G',
          skills: 'Smooth C-G transition using inversions',
          bpm: 76,
          instruction: 'Use G/B (1st inversion) when moving from C. The B is just one step below C, making the transition smooth and musical.',
          notes: [
            // Root position jumps
            ...chord('C', 0, 3),
            ...chord('G', 4, 3),
            ...chord('C', 8, 3),
            ...chord('G', 12, 3),
            // Voice-led
            ...chord('C', 16, 3),
            ...chord('G/B', 20, 3),
            ...chord('C', 24, 3),
            ...chord('G/B', 28, 3),
            ...chord('C', 32, 4),
          ]
        },
        {
          id: 'L6-06',
          name: 'Smooth I-IV-V-I',
          skills: 'Full voice-led cadence with inversions',
          bpm: 76,
          instruction: 'Put it all together: C (root) → F/C (2nd inv) ��� G/B (1st inv) → C (root). Minimal hand movement, maximum musicality!',
          notes: [
            ...progression(['C', 'F/C', 'G/B', 'C'], { duration: 4, repeat: 3 }),
          ]
        },
      ]
    },

    // ═══ LEVEL 7: 7th Chords ═══
    {
      level: 7,
      levelName: '7th Chords',
      lessons: [
        {
          id: 'L7-01',
          name: 'C Major 7th',
          skills: 'Cmaj7 four-note voicing',
          bpm: 68,
          instruction: 'The major 7th chord adds a dreamy quality. Cmaj7 is C-E-G-B (fingers 1-2-3-5). Four notes at once — take it slow!',
          notes: [
            ...repeatChord('Cmaj7', 0, 4, 3, 1),
            ...repeatChord('Cmaj7', 16, 3, 4, 0),
          ]
        },
        {
          id: 'L7-02',
          name: 'G Dominant 7th',
          skills: 'G7, dominant function',
          bpm: 68,
          instruction: 'G7 is G-B-D-F (fingers 1-2-3-5). The added F creates extra tension that wants to resolve to C. This is the "dominant 7th" — the most important 7th chord in tonal music.',
          notes: [
            ...repeatChord('G7', 0, 3, 3, 1),
            // Cmaj7-G7 alternation
            ...chord('Cmaj7', 12, 3),
            ...chord('G7', 16, 3),
            ...chord('Cmaj7', 20, 3),
            ...chord('G7', 24, 3),
            ...chord('Cmaj7', 28, 4),
          ]
        },
        {
          id: 'L7-03',
          name: 'D Minor 7th',
          skills: 'Dm7 four-note voicing',
          bpm: 68,
          instruction: 'Dm7 is D-F-A-C (fingers 1-2-3-5). A warm, mellow sound. This is the "ii" chord in the key of C when using 7ths.',
          notes: [
            ...repeatChord('Dm7', 0, 4, 3, 1),
            // Dm7-G7 transition
            ...chord('Dm7', 16, 3),
            ...chord('G7', 20, 3),
            ...chord('Dm7', 24, 3),
            ...chord('G7', 28, 3),
            ...chord('Cmaj7', 32, 4),
          ]
        },
        {
          id: 'L7-04',
          name: 'ii-V-I with 7ths',
          skills: 'Dm7-G7-Cmaj7 jazz cadence',
          bpm: 76,
          instruction: 'The ii-V-I with 7th chords: Dm7-G7-Cmaj7. This is THE jazz progression. You\'ll hear it in virtually every jazz standard.',
          notes: [
            ...progression(['Dm7', 'G7', 'Cmaj7'], { duration: 4, repeat: 4 }),
          ]
        },
        {
          id: 'L7-05',
          name: 'Am7 & E7',
          skills: 'Minor 7th and dominant 7th pair',
          bpm: 68,
          instruction: 'Am7 (A-C-E-G) and E7 (E-G#-B-D) form a minor ii-V pair. E7 resolves naturally to Am7. Feel the tension and release.',
          notes: [
            ...repeatChord('Am7', 0, 3, 3, 1),
            ...repeatChord('E7', 12, 3, 3, 1),
            // Am7-E7 resolution
            ...chord('Am7', 24, 3),
            ...chord('E7', 28, 3),
            ...chord('Am7', 32, 3),
            ...chord('E7', 36, 3),
            ...chord('Am7', 40, 4),
          ]
        },
        {
          id: 'L7-06',
          name: '7th Chord Roundup',
          skills: 'All 7th chords in various progressions',
          bpm: 76,
          instruction: 'A tour through all the 7th chords you\'ve learned, in musical context. Major 7ths, minor 7ths, and dominant 7ths — you can now voice chords like a jazz musician!',
          notes: [
            // Cmaj7 - Fmaj7
            ...chord('Cmaj7', 0, 3),
            ...chord('Fmaj7', 4, 3),
            // Dm7 - G7 - Cmaj7
            ...chord('Dm7', 8, 3),
            ...chord('G7', 12, 3),
            ...chord('Cmaj7', 16, 3),
            // Am7 - D7
            ...chord('Am7', 20, 3),
            ...chord('D7', 24, 3),
            // Em7 - A7 - Dm7 - G7 - Cmaj7
            ...chord('Em7', 28, 3),
            ...chord('A7', 32, 3),
            ...chord('Dm7', 36, 3),
            ...chord('G7', 40, 3),
            ...chord('Cmaj7', 44, 4),
          ]
        },
      ]
    },

    // ═══ LEVEL 8: Applied Songs ═══
    {
      level: 8,
      levelName: 'Applied Songs',
      lessons: [
        {
          id: 'L8-01',
          name: 'Let It Be (simplified)',
          skills: 'C-G-Am-F song form, verse and chorus',
          bpm: 72,
          instruction: '"Let It Be" by The Beatles uses the pop progression. Verse: C-G-Am-F. Chorus: Am-G-F-C. Play each chord for 4 beats, feel the song structure.',
          notes: [
            // Verse x2
            ...progression(['C', 'G', 'Am', 'F'], { duration: 4, repeat: 2 }),
            // Chorus x2
            ...progression(['Am', 'G', 'F', 'C'], { startTime: 32, duration: 4, repeat: 2 }),
          ]
        },
        {
          id: 'L8-02',
          name: 'Hallelujah (simplified)',
          skills: 'C-Am-F-G pattern, 6/8 feel',
          bpm: 68,
          instruction: '"Hallelujah" by Leonard Cohen. The verse follows C-Am-C-Am, then F-G-C-G. A beautiful, flowing chord pattern.',
          notes: [
            ...progression(['C', 'Am', 'C', 'Am'], { duration: 4 }),
            ...progression(['F', 'G', 'C', 'G'], { startTime: 16, duration: 4 }),
            // Chorus: F-Am-F-G
            ...progression(['F', 'Am', 'F', 'G'], { startTime: 32, duration: 4 }),
            ...progression(['C', 'G', 'C'], { startTime: 48, duration: 4 }),
          ]
        },
        {
          id: 'L8-03',
          name: 'Blues Workout (7ths)',
          skills: '12-bar blues with 7th chords',
          bpm: 96,
          instruction: 'The 12-bar blues upgraded with 7th chords! Dominant 7ths give the blues its characteristic gritty sound.',
          notes: [
            ...progression(
              ['G7', 'G7', 'G7', 'G7', 'G7', 'G7', 'G7', 'G7', 'D7', 'G7', 'G7', 'D7'],
              { duration: 4 }
            ),
          ]
        },
        {
          id: 'L8-04',
          name: 'Chord Song Medley',
          skills: 'Multiple song-style progressions',
          bpm: 84,
          instruction: 'A medley of song progressions! Each 8-bar section is a different style. Stay with it — this is a real-world chord workout.',
          notes: [
            // Pop (C-G-Am-F)
            ...progression(['C', 'G', 'Am', 'F'], { duration: 4, repeat: 2 }),
            // Rock (A-D-E-A)
            ...progression(['A', 'D', 'E', 'A'], { startTime: 32, duration: 4, repeat: 2 }),
            // Jazz (Dm7-G7-Cmaj7)
            ...progression(['Dm7', 'G7', 'Cmaj7', 'Cmaj7'], { startTime: 64, duration: 4, repeat: 2 }),
            // Minor ballad (Am-Em-F-G)
            ...progression(['Am', 'Em', 'F', 'G'], { startTime: 96, duration: 4, repeat: 2 }),
          ]
        },
      ]
    },

    // ═══ LEVEL 9: Broken Chords & Arpeggios ═══
    {
      level: 9,
      levelName: 'Broken Chords & Arpeggios',
      lessons: [
        {
          id: 'L9-01',
          name: 'C Major Arpeggio',
          skills: 'Breaking chords into individual notes',
          bpm: 80,
          instruction: 'Instead of playing C-E-G together, play them one at a time: C, then E, then G. This is an arpeggio — a "broken chord."',
          notes: [
            ...repeatArpeggio('C', 0, 4, 1, 1),
            ...repeatArpeggio('C', 16, 4, 0.5, 0.5),
          ]
        },
        {
          id: 'L9-02',
          name: 'G and F Arpeggios',
          skills: 'Arpeggios across multiple chords',
          bpm: 80,
          instruction: 'Arpeggiate G major and F major. Keep an even, flowing rhythm — each note should ring clearly.',
          notes: [
            ...repeatArpeggio('G', 0, 3, 1, 1),
            ...repeatArpeggio('F', 12, 3, 1, 1),
            // Alternating
            ...arpeggio('C', 24, 1),
            ...arpeggio('F', 28, 1),
            ...arpeggio('G', 32, 1),
            ...arpeggio('C', 36, 1),
          ]
        },
        {
          id: 'L9-03',
          name: 'Minor Arpeggios',
          skills: 'Am, Em, Dm broken chords',
          bpm: 76,
          instruction: 'Minor arpeggios have a beautiful, flowing quality. Play Am, Em, and Dm arpeggios smoothly.',
          notes: [
            ...repeatArpeggio('Am', 0, 3, 1, 1),
            ...repeatArpeggio('Em', 12, 3, 1, 1),
            ...repeatArpeggio('Dm', 24, 3, 1, 1),
          ]
        },
        {
          id: 'L9-04',
          name: 'Alberti Bass Pattern',
          skills: 'Classical accompaniment pattern',
          bpm: 80,
          instruction: 'The Alberti bass plays chord tones in the pattern: low-high-middle-high (C-G-E-G). This is THE classical piano accompaniment pattern.',
          notes: [
            // C Alberti: C-G-E-G
            ...melody([[60,0.5,1],[67,0.5,5],[64,0.5,3],[67,0.5,5]], 0, 'left'),
            ...melody([[60,0.5,1],[67,0.5,5],[64,0.5,3],[67,0.5,5]], 2, 'left'),
            ...melody([[60,0.5,1],[67,0.5,5],[64,0.5,3],[67,0.5,5]], 4, 'left'),
            ...melody([[60,0.5,1],[67,0.5,5],[64,0.5,3],[67,0.5,5]], 6, 'left'),
            // F Alberti: F-C-A-C
            ...melody([[53,0.5,1],[60,0.5,5],[57,0.5,3],[60,0.5,5]], 8, 'left'),
            ...melody([[53,0.5,1],[60,0.5,5],[57,0.5,3],[60,0.5,5]], 10, 'left'),
            // G Alberti: G-D-B-D
            ...melody([[55,0.5,1],[62,0.5,5],[59,0.5,3],[62,0.5,5]], 12, 'left'),
            ...melody([[55,0.5,1],[62,0.5,5],[59,0.5,3],[62,0.5,5]], 14, 'left'),
            // Back to C
            ...melody([[60,0.5,1],[67,0.5,5],[64,0.5,3],[67,0.5,5]], 16, 'left'),
            ...melody([[60,0.5,1],[67,0.5,5],[64,0.5,3],[67,0.5,5]], 18, 'left'),
          ]
        },
        {
          id: 'L9-05',
          name: 'Arpeggio Progression',
          skills: 'Flowing arpeggios through chord changes',
          bpm: 84,
          instruction: 'Play arpeggios through a I-V-vi-IV progression (C-G-Am-F). Make it flow like a river — no pauses between chords.',
          notes: [
            ...repeatArpeggio('C', 0, 2, 1, 0),
            ...repeatArpeggio('G', 6, 2, 1, 0),
            ...repeatArpeggio('Am', 12, 2, 1, 0),
            ...repeatArpeggio('F', 18, 2, 1, 0),
            // Faster
            ...repeatArpeggio('C', 24, 2, 0.5, 0),
            ...repeatArpeggio('G', 27, 2, 0.5, 0),
            ...repeatArpeggio('Am', 30, 2, 0.5, 0),
            ...repeatArpeggio('F', 33, 2, 0.5, 0),
          ]
        },
      ]
    },

    // ═══ LEVEL 10: Hands Together ═══
    {
      level: 10,
      levelName: 'Hands Together',
      lessons: [
        {
          id: 'L10-01',
          name: 'LH Bass + RH Chord',
          skills: 'Simple two-hand coordination',
          bpm: 68,
          instruction: 'Left hand plays a single bass note, right hand plays the chord. Play the bass note first, then the chord. Start slow!',
          notes: [
            // LH bass C, RH C chord
            { midi: 48, time: 0, duration: 1, hand: 'left', finger: 5 },
            ...chord('C', 1, 2, 'right'),
            { midi: 48, time: 4, duration: 1, hand: 'left', finger: 5 },
            ...chord('C', 5, 2, 'right'),
            // LH bass G, RH G chord
            { midi: 43, time: 8, duration: 1, hand: 'left', finger: 5 },
            ...chord('G', 9, 2, 'right'),
            { midi: 43, time: 12, duration: 1, hand: 'left', finger: 5 },
            ...chord('G', 13, 2, 'right'),
            // Back to C
            { midi: 48, time: 16, duration: 1, hand: 'left', finger: 5 },
            ...chord('C', 17, 3, 'right'),
          ]
        },
        {
          id: 'L10-02',
          name: 'LH Chord + RH Melody',
          skills: 'Melody over sustained chords',
          bpm: 68,
          instruction: 'Left hand holds a chord while right hand plays a simple melody. This is how real piano playing works! Your brain now has to do two things at once.',
          notes: [
            // LH C chord sustained, RH melody
            ...chord('C', 0, 4, 'left', -1),
            ...melody([[67,1,5],[65,1,4],[64,1,3],[62,1,2]], 0, 'right'),
            // LH F chord, RH melody
            ...chord('F', 4, 4, 'left', -1),
            ...melody([[65,1,4],[64,1,3],[62,1,2],[60,1,1]], 4, 'right'),
            // LH G chord, RH melody
            ...chord('G', 8, 4, 'left', -1),
            ...melody([[62,1,2],[64,1,3],[65,1,4],[67,1,5]], 8, 'right'),
            // LH C resolve
            ...chord('C', 12, 4, 'left', -1),
            ...melody([[64,1,3],[62,1,2],[60,2,1]], 12, 'right'),
          ]
        },
        {
          id: 'L10-03',
          name: 'Parallel Motion',
          skills: 'Both hands moving in same direction',
          bpm: 72,
          instruction: 'Both hands play the same scale in the same direction. This is "parallel motion." Left hand mirrors right hand one octave lower.',
          notes: [
            // C major scale, both hands
            ...scale(60, 'major', 0, { hand: 'right' }),
            ...scale(48, 'major', 0, { hand: 'left' }),
          ]
        },
        {
          id: 'L10-04',
          name: 'Contrary Motion',
          skills: 'Hands moving in opposite directions',
          bpm: 68,
          instruction: 'Now the hands move apart from Middle C — right hand goes up, left hand goes down. This is "contrary motion." Concentrate!',
          notes: [
            // RH up from C4, LH down from C4
            ...melody([[60,1,1],[62,1,2],[64,1,3],[65,1,4],[67,2,5]], 0, 'right'),
            ...melody([[60,1,1],[59,1,2],[57,1,3],[55,1,4],[53,2,5]], 0, 'left'),
            // Come back
            ...melody([[67,1,5],[65,1,4],[64,1,3],[62,1,2],[60,2,1]], 6, 'right'),
            ...melody([[53,1,5],[55,1,4],[57,1,3],[59,1,2],[60,2,1]], 6, 'left'),
          ]
        },
        {
          id: 'L10-05',
          name: 'Hands Together: Pop Song',
          skills: 'LH chords + RH melody combined',
          bpm: 72,
          instruction: 'Putting it all together! Left hand plays block chords while right hand plays a melody over the top. This is real piano playing.',
          notes: [
            // C chord + melody
            ...chord('C', 0, 4, 'left', -1),
            ...melody([[64,1,3],[64,1,3],[65,1,4],[67,1,5]], 0, 'right'),
            // G chord + melody
            ...chord('G', 4, 4, 'left', -1),
            ...melody([[67,1,5],[65,1,4],[64,1,3],[62,1,2]], 4, 'right'),
            // Am chord + melody
            ...chord('Am', 8, 4, 'left', -1),
            ...melody([[60,1,1],[60,1,1],[62,1,2],[64,1,3]], 8, 'right'),
            // F chord + melody
            ...chord('F', 12, 4, 'left', -1),
            ...melody([[64,1.5,3],[62,0.5,2],[62,2,2]], 12, 'right'),
            // Repeat with variation
            ...chord('C', 16, 4, 'left', -1),
            ...melody([[64,1,3],[64,1,3],[65,1,4],[67,1,5]], 16, 'right'),
            ...chord('G', 20, 4, 'left', -1),
            ...melody([[67,1,5],[65,1,4],[64,1,3],[62,1,2]], 20, 'right'),
            ...chord('Am', 24, 4, 'left', -1),
            ...melody([[60,1,1],[62,1,2],[64,1,3],[62,1,2]], 24, 'right'),
            ...chord('C', 28, 4, 'left', -1),
            ...melody([[60,2,1],[60,2,1]], 28, 'right'),
          ]
        },
      ]
    },

    // ═══ LEVEL 11: Rhythm Patterns ═══
    {
      level: 11,
      levelName: 'Rhythm Patterns',
      lessons: [
        {
          id: 'L11-01',
          name: 'Boom-Chuck',
          skills: 'Bass note + chord accompaniment',
          bpm: 88,
          instruction: 'The boom-chuck pattern: play a bass note on beat 1, then the upper chord tones on beat 3. Used in country, folk, and early pop.',
          notes: [
            ...boomChuck('C', 0, 2, 'left', -1),
            ...boomChuck('F', 8, 2, 'left', -1),
            ...boomChuck('G', 16, 2, 'left', -1),
            ...boomChuck('C', 24, 2, 'left', -1),
          ]
        },
        {
          id: 'L11-02',
          name: 'Waltz Pattern',
          skills: 'Bass-chord-chord in 3/4 time',
          bpm: 80,
          instruction: 'The waltz: bass on beat 1, chord on beats 2 and 3 (ONE-two-three, ONE-two-three). Think Strauss!',
          notes: [
            ...waltz('C', 0, 2, 'left', -1),
            ...waltz('Am', 6, 2, 'left', -1),
            ...waltz('F', 12, 2, 'left', -1),
            ...waltz('G', 18, 2, 'left', -1),
            ...waltz('C', 24, 2, 'left', -1),
          ]
        },
        {
          id: 'L11-03',
          name: 'Syncopation',
          skills: 'Off-beat accents, pushing the rhythm',
          bpm: 84,
          instruction: 'Syncopation places accents on the "and" (off-beats) instead of the main beats. Play on the "and" of each beat — it should feel like the rhythm is pushing forward.',
          notes: [
            // On-beat reference
            ...chord('C', 0, 1),
            ...chord('C', 1, 1),
            ...chord('C', 2, 1),
            ...chord('C', 3, 1),
            // Syncopated: play on the "and"
            ...chord('C', 4.5, 0.5),
            ...chord('C', 5.5, 0.5),
            ...chord('C', 6.5, 0.5),
            ...chord('C', 7.5, 0.5),
            // Mix: syncopated progression
            ...chord('Am', 8.5, 1),
            ...chord('Am', 10, 0.5),
            ...chord('F', 10.5, 1),
            ...chord('F', 12, 0.5),
            ...chord('G', 12.5, 1),
            ...chord('G', 14, 0.5),
            ...chord('C', 14.5, 1.5),
          ]
        },
        {
          id: 'L11-04',
          name: 'Swing Feel',
          skills: 'Triplet-based "swing" rhythm',
          bpm: 76,
          instruction: 'Swing rhythm divides each beat into a long-short pattern instead of even eighth notes. Think "doo-BAH, doo-BAH." Jazz, blues, and shuffle all use this feel.',
          notes: [
            // Straight (for comparison)
            ...melody([[60,0.5,1],[62,0.5,2],[64,0.5,3],[65,0.5,4]], 0, 'right'),
            // Swing (long-short approximation: 0.67 + 0.33)
            ...melody([[60,0.67,1],[62,0.33,2],[64,0.67,3],[65,0.33,4]], 2, 'right'),
            ...melody([[67,0.67,5],[65,0.33,4],[64,0.67,3],[62,0.33,2]], 4, 'right'),
            // Swing melody
            ...melody([[60,0.67,1],[62,0.33,2],[64,0.67,3],[62,0.33,2]], 6, 'right'),
            ...melody([[64,0.67,3],[65,0.33,4],[67,0.67,5],[65,0.33,4]], 8, 'right'),
            ...melody([[64,0.67,3],[62,0.33,2],[60,1,1]], 10, 'right'),
          ]
        },
        {
          id: 'L11-05',
          name: 'Rhythm Pattern Medley',
          skills: 'Multiple patterns back to back',
          bpm: 84,
          instruction: 'A medley of all the rhythm patterns you\'ve learned. Each section uses a different pattern. Adapt quickly!',
          notes: [
            // Boom-chuck section
            ...boomChuck('C', 0, 2, 'left', -1),
            // Straight chords
            ...repeatChord('Am', 8, 4, 1, 0),
            // Syncopated
            ...chord('F', 12.5, 1),
            ...chord('F', 14, 0.5),
            ...chord('G', 14.5, 1),
            ...chord('G', 16, 0.5),
            // Arpeggiated ending
            ...repeatArpeggio('C', 17, 2, 0.5, 0.5),
          ]
        },
      ]
    },

    // ═══ LEVEL 12: Improvisation Basics ═══
    {
      level: 12,
      levelName: 'Improvisation Basics',
      lessons: [
        {
          id: 'L12-01',
          name: 'C Pentatonic Scale',
          skills: 'The 5-note "can\'t go wrong" scale',
          bpm: 80,
          instruction: 'The C major pentatonic scale: C-D-E-G-A. Only 5 notes, and they all sound good together. This is the easiest scale to improvise with.',
          notes: [
            ...scale(60, 'pentatonic', 0, { upAndDown: true }),
            // Free pattern using pentatonic notes
            ...melody([[60,1,1],[64,1,3],[67,1,5],[69,1,3],[67,1,5],[64,1,3],[62,1,2],[60,2,1]], 12, 'right'),
          ]
        },
        {
          id: 'L12-02',
          name: 'Blues Scale',
          skills: 'The scale that makes everything sound bluesy',
          bpm: 76,
          instruction: 'The C blues scale: C-Eb-F-F#-G-Bb-C. That "blue note" (F#/Gb) gives it the characteristic blues sound. Play it with attitude!',
          notes: [
            ...scale(60, 'blues', 0, { upAndDown: true }),
            // Blues lick
            ...melody([[60,0.5,1],[63,0.5,2],[65,0.5,3],[66,0.5,3],[67,1,4],[63,0.5,2],[60,1.5,1]], 14, 'right'),
            // Another lick
            ...melody([[72,0.5,5],[70,0.5,4],[67,0.5,3],[66,0.5,3],[65,0.5,2],[63,0.5,2],[60,2,1]], 18, 'right'),
          ]
        },
        {
          id: 'L12-03',
          name: 'Call and Response',
          skills: 'Musical conversation, phrasing',
          bpm: 80,
          instruction: 'In call and response, you play a phrase (call) then an answering phrase (response). The response should feel like a musical reply.',
          notes: [
            // Call 1
            ...melody([[60,1,1],[62,1,2],[64,1,3],[67,1,5]], 0, 'right'),
            // Response 1
            ...melody([[67,1,5],[65,1,4],[64,1,3],[60,1,1]], 5, 'right'),
            // Call 2
            ...melody([[64,0.5,3],[65,0.5,4],[67,1,5],[69,1,3]], 10, 'right'),
            // Response 2
            ...melody([[69,0.5,3],[67,0.5,5],[65,1,4],[64,1,3],[60,1,1]], 13, 'right'),
            // Call 3 (blues)
            ...melody([[60,0.5,1],[63,0.5,2],[65,1,3],[67,1,4]], 18, 'right'),
            // Response 3
            ...melody([[67,0.5,4],[65,0.5,3],[63,0.5,2],[60,1.5,1]], 22, 'right'),
          ]
        },
        {
          id: 'L12-04',
          name: 'Pentatonic over Chords',
          skills: 'Improvising melody over a progression',
          bpm: 76,
          instruction: 'Left hand plays C-Am-F-G chords while right hand plays pentatonic patterns. This is real improvisation — melody over harmony!',
          notes: [
            // LH chords
            ...chord('C', 0, 4, 'left', -1),
            ...chord('Am', 4, 4, 'left', -1),
            ...chord('F', 8, 4, 'left', -1),
            ...chord('G', 12, 4, 'left', -1),
            // RH pentatonic melody
            ...melody([[60,1,1],[62,1,2],[64,0.5,3],[67,0.5,5],[69,1,3]], 0, 'right'),
            ...melody([[69,0.5,3],[67,0.5,5],[64,1,3],[62,0.5,2],[60,1.5,1]], 4, 'right'),
            ...melody([[60,0.5,1],[64,0.5,3],[67,1,5],[69,0.5,3],[72,1.5,5]], 8, 'right'),
            ...melody([[72,0.5,5],[69,0.5,3],[67,1,5],[64,0.5,3],[62,0.5,2],[60,2,1]], 12, 'right'),
          ]
        },
        {
          id: 'L12-05',
          name: 'Blues Improv',
          skills: '12-bar blues with improvised RH',
          bpm: 80,
          instruction: 'Left hand plays a 12-bar blues in C, right hand plays blues scale patterns. Feel the groove and let the blues speak through you!',
          notes: [
            // LH blues chords (simplified: just roots for 12 bars)
            ...progression(['C', 'C', 'C', 'C', 'F', 'F', 'C', 'C', 'G', 'F', 'C', 'G'],
              { duration: 2, hand: 'left', octaveShift: -1 }),
            // RH blues licks over the changes
            ...melody([[60,0.5,1],[63,0.5,2],[65,0.5,3],[67,1,4],[65,0.5,3]], 0, 'right'),
            ...melody([[63,0.5,2],[60,1,1],[0,0.5],[60,0.5,1],[63,1,2]], 3, 'right'),
            ...melody([[65,0.5,3],[66,0.5,3],[67,1,4],[70,1,5],[67,1,4]], 6, 'right'),
            ...melody([[65,0.5,3],[63,0.5,2],[60,1,1]], 10, 'right'),
            ...melody([[60,0.5,1],[63,0.5,2],[65,0.5,3],[66,0.5,3],[67,1,4]], 12, 'right'),
            ...melody([[70,1,5],[67,1,4],[65,0.5,3],[63,0.5,2],[60,2,1]], 15, 'right'),
            ...melody([[62,0.5,2],[63,0.5,3],[65,1,3],[63,0.5,2],[60,1.5,1]], 18, 'right'),
            ...melody([[55,0.5,1],[58,0.5,2],[60,0.5,3],[63,0.5,4],[67,2,5]], 21, 'right'),
          ]
        },
      ]
    },

    // ═══ LEVEL 13: Rhythm & Accompaniment ═══
    {
      level: 13,
      levelName: 'Rhythm & Accompaniment',
      lessons: [
        {
          id: 'L13-01',
          name: 'Stride Left Hand',
          skills: 'Bass-chord stride pattern',
          bpm: 80,
          instruction: 'Stride piano: left hand alternates between a low bass note and a chord higher up. The "oom-pah" of ragtime and jazz!',
          notes: [
            // C stride: low C, then chord in middle
            { midi: 48, time: 0, duration: 1, hand: 'left', finger: 5 },
            ...chord('C', 1, 1, 'left'),
            { midi: 48, time: 2, duration: 1, hand: 'left', finger: 5 },
            ...chord('C', 3, 1, 'left'),
            // F stride
            { midi: 41, time: 4, duration: 1, hand: 'left', finger: 5 },
            ...chord('F', 5, 1, 'left'),
            { midi: 41, time: 6, duration: 1, hand: 'left', finger: 5 },
            ...chord('F', 7, 1, 'left'),
            // G stride
            { midi: 43, time: 8, duration: 1, hand: 'left', finger: 5 },
            ...chord('G', 9, 1, 'left'),
            { midi: 43, time: 10, duration: 1, hand: 'left', finger: 5 },
            ...chord('G', 11, 1, 'left'),
            // C resolve
            { midi: 48, time: 12, duration: 1, hand: 'left', finger: 5 },
            ...chord('C', 13, 3, 'left'),
          ]
        },
        {
          id: 'L13-02',
          name: 'Ballad Arpeggios',
          skills: 'Flowing LH arpeggio accompaniment',
          bpm: 68,
          instruction: 'Ballad-style accompaniment uses flowing arpeggios in the left hand. Play each note smoothly and evenly — this is the backdrop for a singer.',
          notes: [
            ...repeatArpeggio('C', 0, 2, 1, 0, 'left', -1),
            ...repeatArpeggio('Am', 6, 2, 1, 0, 'left', -1),
            ...repeatArpeggio('F', 12, 2, 1, 0, 'left', -1),
            ...repeatArpeggio('G', 18, 2, 1, 0, 'left', -1),
            ...repeatArpeggio('C', 24, 2, 1, 0, 'left', -1),
          ]
        },
        {
          id: 'L13-03',
          name: 'Rock Rhythm',
          skills: 'Driving eighth-note chord rhythm',
          bpm: 100,
          instruction: 'Rock piano drives with steady eighth-note chords. Keep it tight and rhythmic — you\'re the engine of the band!',
          notes: [
            ...repeatChord('C', 0, 8, 0.5, 0),
            ...repeatChord('F', 4, 8, 0.5, 0),
            ...repeatChord('G', 8, 8, 0.5, 0),
            ...repeatChord('C', 12, 8, 0.5, 0),
          ]
        },
        {
          id: 'L13-04',
          name: 'Reggae Offbeat',
          skills: 'Offbeat "skank" rhythm',
          bpm: 80,
          instruction: 'Reggae piano plays chords on the offbeats (the "ands"). Leave beat 1 empty — the bass guitar lives there. Feel the island groove!',
          notes: [
            // Offbeat chords
            ...chord('C', 0.5, 0.5),
            ...chord('C', 1.5, 0.5),
            ...chord('C', 2.5, 0.5),
            ...chord('C', 3.5, 0.5),
            ...chord('Am', 4.5, 0.5),
            ...chord('Am', 5.5, 0.5),
            ...chord('Am', 6.5, 0.5),
            ...chord('Am', 7.5, 0.5),
            ...chord('F', 8.5, 0.5),
            ...chord('F', 9.5, 0.5),
            ...chord('F', 10.5, 0.5),
            ...chord('F', 11.5, 0.5),
            ...chord('G', 12.5, 0.5),
            ...chord('G', 13.5, 0.5),
            ...chord('G', 14.5, 0.5),
            ...chord('G', 15.5, 0.5),
          ]
        },
        {
          id: 'L13-05',
          name: 'Accompaniment Styles Medley',
          skills: 'Switching between accompaniment patterns',
          bpm: 80,
          instruction: 'Cycle through different accompaniment styles on the same chord progression. A versatile pianist can switch styles on the fly!',
          notes: [
            // Boom-chuck C
            ...boomChuck('C', 0, 1, 'left', -1),
            // Arpeggio Am
            ...repeatArpeggio('Am', 4, 2, 0.5, 0, 'left', -1),
            // Block chords F
            ...repeatChord('F', 7, 4, 1, 0, 'left', -1),
            // Waltz G
            ...waltz('G', 11, 1, 'left', -1),
            // Resolve
            ...chord('C', 14, 4, 'left', -1),
          ]
        },
      ]
    },

    // ═══ LEVEL 14: Key Signatures ═══
    {
      level: 14,
      levelName: 'Key Signatures',
      lessons: [
        {
          id: 'L14-01',
          name: 'Key of G Major',
          skills: 'One sharp (F#), G major chords',
          bpm: 80,
          instruction: 'G major has one sharp: F#. The main chords are G (I), C (IV), and D (V). Everything you learned in C, now shifted to G!',
          notes: [
            ...scale(55, 'major', 0, { upAndDown: true }),
            ...progression(['G', 'C', 'D', 'G'], { startTime: 16, duration: 4 }),
          ]
        },
        {
          id: 'L14-02',
          name: 'Key of F Major',
          skills: 'One flat (Bb), F major chords',
          bpm: 80,
          instruction: 'F major has one flat: Bb. Chords: F (I), Bb (IV), C (V). The flat key signature opens up a warmer sound world.',
          notes: [
            ...scale(53, 'major', 0, { upAndDown: true }),
            ...progression(['F', 'Bb', 'C', 'F'], { startTime: 16, duration: 4 }),
          ]
        },
        {
          id: 'L14-03',
          name: 'Key of D Major',
          skills: 'Two sharps (F#, C#)',
          bpm: 80,
          instruction: 'D major has F# and C#. Chords: D (I), G (IV), A (V). A bright, happy key — popular in folk and country.',
          notes: [
            ...scale(62, 'major', 0, { upAndDown: true }),
            ...progression(['D', 'G', 'A', 'D'], { startTime: 16, duration: 4 }),
          ]
        },
        {
          id: 'L14-04',
          name: 'Key of Bb Major',
          skills: 'Two flats (Bb, Eb)',
          bpm: 80,
          instruction: 'Bb major has Bb and Eb. Chords: Bb (I), Eb (IV), F (V). A warm key common in jazz and classical.',
          notes: [
            // Bb major scale (Bb3 = 58)
            ...melody([[58,1,1],[60,1,2],[62,1,3],[63,1,1],[65,1,2],[67,1,3],[69,1,4],[70,2,5]], 0, 'right'),
            ...progression(['Bb', 'Eb', 'F', 'Bb'], { startTime: 10, duration: 4 }),
          ]
        },
        {
          id: 'L14-05',
          name: 'Transposition Challenge',
          skills: 'Same progression in multiple keys',
          bpm: 84,
          instruction: 'Play the pop progression (I-V-vi-IV) in four different keys: C, G, F, and D. Same musical idea, different starting points!',
          notes: [
            // In C
            ...progression(['C', 'G', 'Am', 'F'], { duration: 3 }),
            // In G
            ...progression(['G', 'D', 'Em', 'C'], { startTime: 12, duration: 3 }),
            // In F
            ...progression(['F', 'C', 'Dm', 'Bb'], { startTime: 24, duration: 3 }),
            // In D
            ...progression(['D', 'A', 'Bm', 'G'], { startTime: 36, duration: 3 }),
          ]
        },
      ]
    },

    // ═══ LEVEL 15: Scales in All Keys ═══
    {
      level: 15,
      levelName: 'Scales in All Keys',
      lessons: [
        {
          id: 'L15-01',
          name: 'Sharp Key Scales',
          skills: 'G, D, A, E major scales',
          bpm: 84,
          instruction: 'Scales through the sharp keys. Each adds one more sharp: G(1), D(2), A(3), E(4). Master the thumb tuck in each key.',
          notes: [
            ...scale(55, 'major', 0),              // G
            ...scale(62, 'major', 9),              // D
            ...scale(57, 'major', 18),             // A
            ...scale(52, 'major', 27),             // E
          ]
        },
        {
          id: 'L15-02',
          name: 'Flat Key Scales',
          skills: 'F, Bb, Eb, Ab major scales',
          bpm: 84,
          instruction: 'Scales through the flat keys. Each adds one more flat: F(1), Bb(2), Eb(3), Ab(4).',
          notes: [
            ...scale(53, 'major', 0),              // F
            ...melody([[58,1,1],[60,1,2],[62,1,3],[63,1,1],[65,1,2],[67,1,3],[69,1,4],[70,2,5]], 9, 'right'), // Bb
            ...melody([[63,1,1],[65,1,2],[67,1,3],[68,1,1],[70,1,2],[72,1,3],[74,1,4],[75,2,5]], 19, 'right'), // Eb
            ...melody([[56,1,1],[58,1,2],[60,1,3],[61,1,1],[63,1,2],[65,1,3],[67,1,4],[68,2,5]], 29, 'right'), // Ab
          ]
        },
        {
          id: 'L15-03',
          name: 'Natural Minor Scales',
          skills: 'A, E, D, B natural minor',
          bpm: 80,
          instruction: 'The natural minor scale has a different interval pattern than major. A minor is the "relative minor" of C major — same notes, different starting point.',
          notes: [
            ...scale(57, 'minor', 0, { upAndDown: true }),   // A minor
            ...scale(52, 'minor', 16, { upAndDown: true }),  // E minor
          ]
        },
        {
          id: 'L15-04',
          name: 'Harmonic Minor Scale',
          skills: 'Raised 7th, exotic sound',
          bpm: 76,
          instruction: 'The harmonic minor raises the 7th note, creating an exotic interval. A harmonic minor: A-B-C-D-E-F-G#-A. That G# gives it a Middle Eastern flavor.',
          notes: [
            // A harmonic minor: 0,2,3,5,7,8,11,12
            ...melody([[57,1,1],[59,1,2],[60,1,3],[62,1,1],[64,1,2],[65,1,3],[68,1,4],[69,2,5]], 0, 'right'),
            ...melody([[69,1,5],[68,1,4],[65,1,3],[64,1,2],[62,1,1],[60,1,3],[59,1,2],[57,2,1]], 10, 'right'),
          ]
        },
        {
          id: 'L15-05',
          name: 'Scale Speed Builder',
          skills: 'Increasing tempo through scales',
          bpm: 100,
          instruction: 'Play C major scale at increasing speeds. Start with quarter notes, then eighth notes, then sixteenth notes. Build your finger speed!',
          notes: [
            // Quarter notes
            ...scale(60, 'major', 0),
            // Eighth notes
            ...scale(60, 'major', 9, { duration: 0.5 }),
            // Even faster
            ...scale(60, 'major', 14, { duration: 0.33 }),
          ]
        },
      ]
    },

    // ═══ LEVEL 16: Sight-Reading ═══
    {
      level: 16,
      levelName: 'Sight-Reading',
      lessons: [
        {
          id: 'L16-01',
          name: 'Landmark Notes',
          skills: 'Quick note identification: C, F, G',
          bpm: 60,
          instruction: 'Sight-reading starts with "landmark notes" — C, F, and G in different octaves. Find them quickly! Speed matters less than accuracy here.',
          notes: [
            ...melody([[60,2,1],[65,2,4],[67,2,5],[72,2,1],[53,2,1],[55,2,5],[60,2,1],[48,2,5]], 0, 'right'),
          ]
        },
        {
          id: 'L16-02',
          name: 'Step Reading',
          skills: 'Reading notes that move by step',
          bpm: 68,
          instruction: 'When notes move up or down by step on the staff, they move to the adjacent key. Read the direction and trust your fingers!',
          notes: [
            ...melody([[60,1,1],[62,1,2],[64,1,3],[65,1,4],[67,1,5],[65,1,4],[64,1,3],[62,1,2]], 0, 'right'),
            ...melody([[60,1,1],[62,1,2],[64,1,3],[62,1,2],[64,1,3],[65,1,4],[67,1,5],[65,2,4]], 8, 'right'),
          ]
        },
        {
          id: 'L16-03',
          name: 'Skip Reading',
          skills: 'Reading notes that skip (3rds)',
          bpm: 64,
          instruction: 'Skips (intervals of a 3rd) move from a line to the next line, or a space to the next space. They skip one key.',
          notes: [
            ...melody([[60,1,1],[64,1,3],[67,1,5],[64,1,3],[60,1,1],[64,1,3],[67,1,5],[72,2,5]], 0, 'right'),
            ...melody([[72,1,5],[67,1,5],[64,1,3],[60,1,1],[64,1,3],[60,1,1],[67,1,5],[60,2,1]], 8, 'right'),
          ]
        },
        {
          id: 'L16-04',
          name: 'Mixed Intervals',
          skills: 'Steps, skips, and leaps',
          bpm: 64,
          instruction: 'Real music mixes steps, skips, and larger leaps. Read ahead — your eyes should be 1-2 notes ahead of your fingers.',
          notes: [
            ...melody([[60,1,1],[62,1,2],[67,1,5],[65,1,4],[60,1,1],[64,1,3],[62,1,2],[67,2,5]], 0, 'right'),
            ...melody([[65,1,4],[60,1,1],[64,1,3],[67,1,5],[62,1,2],[64,1,3],[60,2,1]], 8, 'right'),
          ]
        },
        {
          id: 'L16-05',
          name: 'Sight-Reading Challenge',
          skills: 'Cold reading a new melody',
          bpm: 72,
          instruction: 'You\'ve never seen this melody before. Use Listen mode once to hear it, then try to play it. Real sight-reading means playing new music on the first try!',
          notes: [
            ...melody([[64,1,3],[62,0.5,2],[64,0.5,3],[67,1,5],[65,1,4],[64,0.5,3],[62,0.5,2],[60,2,1]], 0, 'right'),
            ...melody([[62,1,2],[64,1,3],[67,0.5,5],[69,0.5,5],[67,1,5],[65,1,4],[64,0.5,3],[62,0.5,2],[60,2,1]], 6, 'right'),
            ...melody([[60,0.5,1],[62,0.5,2],[64,1,3],[67,1,5],[72,1,5],[67,1,5],[64,1,3],[60,2,1]], 14, 'right'),
          ]
        },
      ]
    },

    // ═══ LEVEL 17: Classical Repertoire ═══
    {
      level: 17,
      levelName: 'Classical Repertoire',
      lessons: [
        {
          id: 'L17-01',
          name: 'Minuet in G (Bach)',
          skills: 'Baroque melody, 3/4 time',
          bpm: 100,
          instruction: 'Bach\'s Minuet in G — one of the most famous beginner classical pieces. Play the right hand melody. 3/4 time: count ONE-two-three.',
          notes: [
            ...melody([
              [62,1,2],[67,1,5],[69,1,3],[71,1,4],[67,1,5],  // D G A B G
              [72,1,5],[71,1,4],[69,1,3],[67,1,5],[66,1,4],  // C B A G F#
              [64,1,3],[66,1,4],[67,1,5],[69,1,3],[62,2,2],  // E F# G A D
              [62,1,2],[67,1,5],[69,1,3],[71,1,4],[67,1,5],  // repeat
              [72,1,5],[71,1,4],[69,1,3],[67,1,5],[66,1,4],
              [64,1,3],[66,1,4],[67,1,5],[69,1,3],[67,3,5],
            ], 0, 'right'),
          ]
        },
        {
          id: 'L17-02',
          name: 'Fur Elise (Theme)',
          skills: 'Iconic classical melody, Am key',
          bpm: 80,
          instruction: 'The famous opening theme of Beethoven\'s "Fur Elise." The haunting E-D#-E-D#-E-B-D-C-A pattern. Take it at your own tempo.',
          notes: [
            ...melody([
              [76,0.5,5],[75,0.5,4],[76,0.5,5],[75,0.5,4],[76,0.5,5],[71,0.5,3],[74,0.5,4],[72,0.5,3],[69,1,1],  // E D# E D# E B D C A
              [0,0.5],[60,0.5,1],[64,0.5,3],[69,1,1],     // rest C E A
              [0,0.5],[64,0.5,3],[68,0.5,4],[69,1,1],      // rest E G# A
              [0,0.5],[64,0.5,3],[76,0.5,5],[75,0.5,4],[76,0.5,5],[75,0.5,4],[76,0.5,5],[71,0.5,3],[74,0.5,4],[72,0.5,3],[69,1,1],
            ], 0, 'right'),
          ]
        },
        {
          id: 'L17-03',
          name: 'Canon in D (Chords)',
          skills: 'Pachelbel\'s famous progression',
          bpm: 68,
          instruction: 'Pachelbel\'s Canon in D uses one of history\'s most beautiful progressions: D-A-Bm-F#m-G-D-G-A. You already know most of these chords!',
          notes: [
            ...progression(['D', 'A', 'Bm', 'F#m', 'G', 'D', 'G', 'A'], { duration: 4 }),
          ]
        },
        {
          id: 'L17-04',
          name: 'Clair de Lune (Intro)',
          skills: 'Debussy, arpeggiated chords, dynamics',
          bpm: 52,
          instruction: 'The opening of Debussy\'s "Clair de Lune" — gentle arpeggiated chords. Play as softly and smoothly as you can. This piece is about beauty and space.',
          notes: [
            // Simplified Db major arpeggios
            ...repeatArpeggio('Db', 0, 2, 1.5, 0, 'right'),
            ...repeatArpeggio('Ab', 6, 2, 1.5, 0, 'right'),
            ...repeatArpeggio('Bbm', 12, 2, 1.5, 0, 'right'),
            ...repeatArpeggio('Gb', 18, 2, 1.5, 0, 'right'),
            ...repeatArpeggio('Db', 24, 1, 2, 0, 'right'),
          ]
        },
      ]
    },

    // ═══ LEVEL 18: Pop & Contemporary ═══
    {
      level: 18,
      levelName: 'Pop & Contemporary',
      lessons: [
        {
          id: 'L18-01',
          name: 'Lead Sheet Reading',
          skills: 'Melody + chord symbols',
          bpm: 84,
          instruction: 'A lead sheet shows just the melody and chord symbols. Left hand plays the chords, right hand plays the melody. This is how professional musicians read pop music.',
          notes: [
            // LH chords
            ...chord('C', 0, 4, 'left', -1),
            ...chord('G', 4, 4, 'left', -1),
            ...chord('Am', 8, 4, 'left', -1),
            ...chord('F', 12, 4, 'left', -1),
            // RH simple melody
            ...melody([[67,1,5],[64,1,3],[64,1,3],[62,1,2]], 0, 'right'),
            ...melody([[62,1,2],[64,1,3],[67,1,5],[72,1,5]], 4, 'right'),
            ...melody([[69,1,3],[67,1,5],[64,1,3],[62,1,2]], 8, 'right'),
            ...melody([[60,1,1],[62,1,2],[64,1,3],[60,1,1]], 12, 'right'),
          ]
        },
        {
          id: 'L18-02',
          name: 'Piano Fills',
          skills: 'Short melodic fills between chords',
          bpm: 84,
          instruction: 'Fills are short melodic runs between chords that add interest. Play the chord, then a quick fill leading to the next chord.',
          notes: [
            ...chord('C', 0, 2),
            ...melody([[64,0.25,3],[65,0.25,4],[67,0.5,5]], 2, 'right'),
            ...chord('Am', 3, 2),
            ...melody([[64,0.25,3],[62,0.25,2],[60,0.5,1]], 5, 'right'),
            ...chord('F', 6, 2),
            ...melody([[60,0.25,1],[62,0.25,2],[64,0.5,3]], 8, 'right'),
            ...chord('G', 9, 2),
            ...melody([[67,0.25,5],[65,0.25,4],[64,0.5,3]], 11, 'right'),
            ...chord('C', 12, 3),
          ]
        },
        {
          id: 'L18-03',
          name: 'Intro & Outro Patterns',
          skills: 'Starting and ending songs',
          bpm: 76,
          instruction: 'Every song needs a beginning and end. Learn classic intro patterns (arpeggiated buildup) and outro patterns (ritardando chord descent).',
          notes: [
            // Intro: arpeggiated buildup
            ...arpeggio('C', 0, 1),
            ...arpeggio('Am', 3, 0.75),
            ...arpeggio('F', 6, 0.5),
            ...chord('G', 8, 2),
            // Main section
            ...progression(['C', 'G', 'Am', 'F'], { startTime: 10, duration: 3 }),
            // Outro: slowing chord descent
            ...chord('Am', 22, 3),
            ...chord('G', 26, 3),
            ...chord('F', 30, 4),
            ...chord('C', 35, 5),
          ]
        },
        {
          id: 'L18-04',
          name: 'Full Pop Arrangement',
          skills: 'Complete song arrangement with both hands',
          bpm: 80,
          instruction: 'A complete pop piano arrangement: LH plays bass + chord pattern, RH plays melody. This is what it sounds like when you perform a song solo!',
          notes: [
            // Intro (RH arpeggios)
            ...repeatArpeggio('C', 0, 2, 0.5, 0, 'right'),
            // Verse: LH chords + RH melody
            ...chord('C', 3, 4, 'left', -1),
            ...melody([[64,1,3],[64,0.5,3],[65,0.5,4],[67,2,5]], 3, 'right'),
            ...chord('G', 7, 4, 'left', -1),
            ...melody([[67,1,5],[65,1,4],[64,1,3],[62,1,2]], 7, 'right'),
            ...chord('Am', 11, 4, 'left', -1),
            ...melody([[60,1,1],[62,1,2],[64,1,3],[67,1,5]], 11, 'right'),
            ...chord('F', 15, 4, 'left', -1),
            ...melody([[65,1.5,4],[64,0.5,3],[62,1,2],[60,1,1]], 15, 'right'),
            // Chorus: bigger chords
            ...chord('C', 19, 3, 'left', -1),
            ...chord('C', 19, 3, 'right'),
            ...chord('G', 22, 3, 'left', -1),
            ...chord('G', 22, 3, 'right'),
            ...chord('Am', 25, 3, 'left', -1),
            ...chord('Am', 25, 3, 'right'),
            ...chord('F', 28, 4, 'left', -1),
            ...chord('F', 28, 4, 'right'),
          ]
        },
      ]
    },

    // ═══ LEVEL 19: Blues & Jazz ═══
    {
      level: 19,
      levelName: 'Blues & Jazz',
      lessons: [
        {
          id: 'L19-01',
          name: 'Shell Voicings',
          skills: 'Root + 3rd + 7th (no 5th)',
          bpm: 72,
          instruction: 'Jazz pianists use "shell voicings" — just the root, 3rd, and 7th (skip the 5th). Less is more! These cut through a band mix.',
          notes: [
            // Cmaj7 shell: C-E-B
            ...melody([[60,2,1],[64,2,3],[71,2,5]], 0, 'left'),
            // Dm7 shell: D-F-C
            ...melody([[62,2,1],[65,2,3],[72,2,5]], 4, 'left'),
            // G7 shell: G-B-F
            ...melody([[55,2,1],[59,2,3],[65,2,5]], 8, 'left'),
            // Back to Cmaj7
            ...melody([[60,2,1],[64,2,3],[71,2,5]], 12, 'left'),
          ]
        },
        {
          id: 'L19-02',
          name: 'Swing Comping',
          skills: 'Jazz rhythm accompaniment',
          bpm: 76,
          instruction: 'Jazz comping uses syncopated chord stabs with a swing feel. Don\'t play on every beat — leave space! Play on beats 2 and 4 for the classic "Charleston" rhythm.',
          notes: [
            // Cmaj7 on 2 and 4
            ...chord('Cmaj7', 1, 0.5),
            ...chord('Cmaj7', 3, 0.5),
            // Dm7 on 2 and 4
            ...chord('Dm7', 5, 0.5),
            ...chord('Dm7', 7, 0.5),
            // G7
            ...chord('G7', 9, 0.5),
            ...chord('G7', 11, 0.5),
            // Cmaj7 resolve
            ...chord('Cmaj7', 13, 0.5),
            ...chord('Cmaj7', 15, 0.5),
          ]
        },
        {
          id: 'L19-03',
          name: 'Jazz Blues in C',
          skills: 'Jazz version of 12-bar blues',
          bpm: 80,
          instruction: 'The jazz blues adds ii-V turnarounds and 7th chords to the basic 12-bar form. This is the #1 jam session form in jazz.',
          notes: [
            ...progression(
              ['Cmaj7', 'Cmaj7', 'Cmaj7', 'Cmaj7', 'Fmaj7', 'Fmaj7', 'Cmaj7', 'Cmaj7', 'Dm7', 'G7', 'Cmaj7', 'G7'],
              { duration: 2 }
            ),
          ]
        },
        {
          id: 'L19-04',
          name: 'Autumn Leaves (Chords)',
          skills: 'Classic jazz standard progression',
          bpm: 72,
          instruction: '"Autumn Leaves" — the first jazz standard every musician learns. The A section uses ii-V-I in Bb and ii-V-i in Gm.',
          notes: [
            // Am7 - D7 - Gmaj7 - Cmaj7 (simplified to available chords)
            ...progression(['Am7', 'D7', 'G7', 'Cmaj7'], { duration: 4 }),
            ...progression(['Dm7', 'G7', 'Cmaj7', 'Fmaj7'], { startTime: 16, duration: 4 }),
            ...progression(['Dm7', 'G7', 'Cmaj7'], { startTime: 32, duration: 4 }),
          ]
        },
        {
          id: 'L19-05',
          name: 'Blues Piano Solo',
          skills: 'Full blues with both hands',
          bpm: 84,
          instruction: 'Left hand plays jazz blues chords, right hand improvises with the blues scale. This is the real deal — you\'re playing jazz piano!',
          notes: [
            // LH chord hits
            ...chord('Cmaj7', 0, 2, 'left', -1),
            ...chord('Cmaj7', 4, 2, 'left', -1),
            ...chord('Fmaj7', 8, 2, 'left', -1),
            ...chord('Cmaj7', 12, 2, 'left', -1),
            ...chord('Dm7', 16, 2, 'left', -1),
            ...chord('G7', 20, 2, 'left', -1),
            // RH blues licks
            ...melody([[60,0.5,1],[63,0.5,2],[65,1,3],[67,0.5,4],[65,0.5,3]], 0, 'right'),
            ...melody([[63,0.5,2],[60,0.5,1],[0,0.5],[67,0.5,4],[65,1,3]], 3, 'right'),
            ...melody([[65,0.5,3],[67,0.5,4],[70,1,5],[67,0.5,4],[65,0.5,3]], 6, 'right'),
            ...melody([[63,0.5,2],[60,1,1],[0,0.5],[63,0.5,2],[65,1,3]], 9, 'right'),
            ...melody([[67,1,4],[70,0.5,5],[67,0.5,4],[65,0.5,3],[63,0.5,2]], 12, 'right'),
            ...melody([[60,0.5,1],[63,0.5,2],[65,0.5,3],[67,0.5,4],[72,2,5]], 15, 'right'),
            ...melody([[70,0.5,4],[67,0.5,3],[65,0.5,2],[63,0.5,2],[60,2,1]], 19, 'right'),
          ]
        },
      ]
    },

    // ═══ LEVEL 20: Advanced Harmony ═══
    {
      level: 20,
      levelName: 'Advanced Harmony',
      lessons: [
        {
          id: 'L20-01',
          name: 'Suspended Chords',
          skills: 'Sus2 and sus4, tension without minor/major',
          bpm: 72,
          instruction: 'Suspended chords replace the 3rd with the 2nd (sus2) or 4th (sus4). They sound "unresolved" — neither major nor minor. Great for creating tension!',
          notes: [
            ...repeatChord('Csus2', 0, 2, 2, 1),
            ...repeatChord('Csus4', 6, 2, 2, 1),
            // Sus4 resolving to major
            ...chord('Csus4', 12, 2),
            ...chord('C', 15, 2),
            ...chord('Dsus4', 18, 2),
            ...chord('D', 21, 2),
            ...chord('Gsus4', 24, 2),
            ...chord('G', 27, 3),
          ]
        },
        {
          id: 'L20-02',
          name: 'Diminished & Augmented',
          skills: 'Symmetrical chords, passing tones',
          bpm: 68,
          instruction: 'Diminished chords (all minor 3rds) sound tense and spooky. Augmented chords (all major 3rds) sound dreamy and unresolved. Both are powerful color chords.',
          notes: [
            ...repeatChord('Bdim', 0, 3, 2, 1),
            ...repeatChord('Cdim', 9, 3, 2, 1),
            ...repeatChord('Caug', 18, 3, 2, 1),
            // Diminished passing: C - Cdim - Dm
            ...chord('C', 27, 2),
            ...chord('Cdim', 30, 2),
            ...chord('Dm', 33, 3),
          ]
        },
        {
          id: 'L20-03',
          name: '9th Chords',
          skills: 'Extended harmony, rich voicings',
          bpm: 68,
          instruction: '9th chords add the 9th (the 2nd, an octave up) to a 7th chord. C9 = C-E-G-Bb-D. Rich, complex, and sophisticated!',
          notes: [
            ...repeatChord('C9', 0, 3, 3, 1),
            ...repeatChord('G9', 12, 3, 3, 1),
            // Dm9-G9-C9 progression
            ...chord('Dm9', 24, 3),
            ...chord('G9', 28, 3),
            ...chord('C9', 32, 4),
          ]
        },
        {
          id: 'L20-04',
          name: 'Modal Interchange',
          skills: 'Borrowing chords from parallel minor',
          bpm: 76,
          instruction: 'Modal interchange borrows chords from the parallel key. In C major, we can borrow Fm, Ab, Bb, or Eb from C minor. This adds beautiful color!',
          notes: [
            // Normal C major progression
            ...progression(['C', 'Am', 'F', 'G'], { duration: 3 }),
            // With borrowed chords
            ...chord('C', 12, 3),
            ...chord('Ab', 16, 3),  // borrowed from Cm
            ...chord('Bb', 20, 3),  // borrowed from Cm
            ...chord('C', 24, 3),
            // More complex
            ...chord('C', 28, 3),
            ...chord('Fm', 32, 3),  // borrowed iv
            ...chord('C', 36, 4),
          ]
        },
        {
          id: 'L20-05',
          name: 'Advanced Progression Workout',
          skills: 'Complex chord sequences',
          bpm: 76,
          instruction: 'A workout using everything: sus chords, diminished passing chords, borrowed chords, and 7ths. This is harmony at its most colorful.',
          notes: [
            ...chord('Cmaj7', 0, 3),
            ...chord('Csus4', 4, 1),
            ...chord('C', 5, 2),
            ...chord('Am7', 8, 3),
            ...chord('Ab', 12, 3),    // borrowed
            ...chord('Fm', 16, 3),    // borrowed iv
            ...chord('Gsus4', 20, 1),
            ...chord('G7', 21, 2),
            ...chord('Cmaj7', 24, 4),
          ]
        },
      ]
    },

    // ═══ LEVEL 21: Advanced Technique ═══
    {
      level: 21,
      levelName: 'Advanced Technique',
      lessons: [
        {
          id: 'L21-01',
          name: 'Hanon Exercise #1',
          skills: 'Finger independence and evenness',
          bpm: 80,
          instruction: 'The Hanon exercises build finger strength and independence. Play each note with equal volume and perfect evenness. Speed comes later — accuracy first!',
          notes: [
            // Classic Hanon #1 pattern: C E F G A G F E
            ...melody([
              [60,0.5,1],[64,0.5,3],[65,0.5,4],[67,0.5,5],[69,0.5,5],[67,0.5,4],[65,0.5,3],[64,0.5,2],
              [62,0.5,1],[65,0.5,3],[67,0.5,4],[69,0.5,5],[71,0.5,5],[69,0.5,4],[67,0.5,3],[65,0.5,2],
              [64,0.5,1],[67,0.5,3],[69,0.5,4],[71,0.5,5],[72,0.5,5],[71,0.5,4],[69,0.5,3],[67,0.5,2],
            ], 0, 'right'),
          ]
        },
        {
          id: 'L21-02',
          name: 'Octave Playing',
          skills: 'Playing octaves cleanly',
          bpm: 68,
          instruction: 'Octaves use your thumb and pinky to play the same note in two registers simultaneously. Keep your hand firm but wrist relaxed.',
          notes: [
            // C octaves: thumb + pinky
            { midi: 60, time: 0, duration: 1, hand: 'right', finger: 1 },
            { midi: 72, time: 0, duration: 1, hand: 'right', finger: 5 },
            { midi: 62, time: 1.5, duration: 1, hand: 'right', finger: 1 },
            { midi: 74, time: 1.5, duration: 1, hand: 'right', finger: 5 },
            { midi: 64, time: 3, duration: 1, hand: 'right', finger: 1 },
            { midi: 76, time: 3, duration: 1, hand: 'right', finger: 5 },
            { midi: 65, time: 4.5, duration: 1, hand: 'right', finger: 1 },
            { midi: 77, time: 4.5, duration: 1, hand: 'right', finger: 5 },
            { midi: 67, time: 6, duration: 1, hand: 'right', finger: 1 },
            { midi: 79, time: 6, duration: 1, hand: 'right', finger: 5 },
            // Back down
            { midi: 65, time: 8, duration: 1, hand: 'right', finger: 1 },
            { midi: 77, time: 8, duration: 1, hand: 'right', finger: 5 },
            { midi: 64, time: 9.5, duration: 1, hand: 'right', finger: 1 },
            { midi: 76, time: 9.5, duration: 1, hand: 'right', finger: 5 },
            { midi: 62, time: 11, duration: 1, hand: 'right', finger: 1 },
            { midi: 74, time: 11, duration: 1, hand: 'right', finger: 5 },
            { midi: 60, time: 12.5, duration: 2, hand: 'right', finger: 1 },
            { midi: 72, time: 12.5, duration: 2, hand: 'right', finger: 5 },
          ]
        },
        {
          id: 'L21-03',
          name: 'Trills & Ornaments',
          skills: 'Rapid alternation between adjacent notes',
          bpm: 72,
          instruction: 'A trill rapidly alternates between two adjacent notes. Start slowly and speed up. Use fingers 2-3 or 1-2 for the best control.',
          notes: [
            // Slow trill C-D
            ...melody([[60,0.25,1],[62,0.25,2],[60,0.25,1],[62,0.25,2],[60,0.25,1],[62,0.25,2],[60,0.25,1],[62,0.25,2]], 0, 'right'),
            // Hold
            ...melody([[60,2,1]], 2, 'right'),
            // Trill E-F
            ...melody([[64,0.25,3],[65,0.25,4],[64,0.25,3],[65,0.25,4],[64,0.25,3],[65,0.25,4],[64,0.25,3],[65,0.25,4]], 4, 'right'),
            ...melody([[64,2,3]], 6, 'right'),
            // In context: melody with trill
            ...melody([[60,1,1],[62,1,2],[64,0.25,3],[65,0.25,4],[64,0.25,3],[65,0.25,4],[67,2,5]], 8, 'right'),
          ]
        },
        {
          id: 'L21-04',
          name: 'Speed & Endurance',
          skills: 'Fast passages, building stamina',
          bpm: 120,
          instruction: 'Speed comes from relaxation, not tension. Play this C major pattern at tempo — if you feel tension in your hand or forearm, slow down immediately.',
          notes: [
            ...scale(60, 'major', 0, { duration: 0.5, upAndDown: true }),
            // Fast arpeggio patterns
            ...melody([
              [60,0.25,1],[64,0.25,3],[67,0.25,5],[72,0.25,5],
              [67,0.25,5],[64,0.25,3],[60,0.25,1],[55,0.25,1],
            ], 8, 'right'),
            ...melody([
              [60,0.25,1],[64,0.25,3],[67,0.25,5],[72,0.25,5],
              [67,0.25,5],[64,0.25,3],[60,0.25,1],[55,0.25,1],
            ], 10, 'right'),
            ...melody([[60,2,1]], 12, 'right'),
          ]
        },
      ]
    },

    // ═══ LEVEL 22: Ear Training ═══
    {
      level: 22,
      levelName: 'Ear Training',
      lessons: [
        {
          id: 'L22-01',
          name: 'Interval Recognition',
          skills: 'Identify and play intervals by ear',
          bpm: 52,
          instruction: 'Listen to each interval, then play it back. Use the Listen button first! Major 2nd (C-D), Major 3rd (C-E), Perfect 4th (C-F), Perfect 5th (C-G), Octave (C-C).',
          notes: [
            // Major 2nd
            ...melody([[60,2,1],[62,2,2]], 0, 'right'),
            // Major 3rd
            ...melody([[60,2,1],[64,2,3]], 5, 'right'),
            // Perfect 4th
            ...melody([[60,2,1],[65,2,4]], 10, 'right'),
            // Perfect 5th
            ...melody([[60,2,1],[67,2,5]], 15, 'right'),
            // Octave
            { midi: 60, time: 20, duration: 2, hand: 'right', finger: 1 },
            { midi: 72, time: 22, duration: 2, hand: 'right', finger: 5 },
          ]
        },
        {
          id: 'L22-02',
          name: 'Major vs Minor',
          skills: 'Distinguish major and minor chords by ear',
          bpm: 52,
          instruction: 'Listen first, then play. Can you hear the difference? Major sounds bright, minor sounds dark. Play C major, then C minor, then the sequence.',
          notes: [
            ...chord('C', 0, 3),
            ...chord('Cm', 4, 3),
            ...chord('C', 8, 3),
            ...chord('Cm', 12, 3),
            ...chord('A', 16, 3),
            ...chord('Am', 20, 3),
            ...chord('D', 24, 3),
            ...chord('Dm', 28, 3),
          ]
        },
        {
          id: 'L22-03',
          name: 'Melody Playback',
          skills: 'Hear a short melody, play it back',
          bpm: 60,
          instruction: 'Listen to each 4-note phrase, then play it back from memory. Start with Listen mode to hear the phrases, then try without!',
          notes: [
            // Phrase 1
            ...melody([[60,1,1],[62,1,2],[64,1,3],[60,1,1]], 0, 'right'),
            // Phrase 2
            ...melody([[67,1,5],[65,1,4],[64,1,3],[62,1,2]], 6, 'right'),
            // Phrase 3
            ...melody([[60,1,1],[64,1,3],[67,1,5],[72,1,5]], 12, 'right'),
            // Phrase 4
            ...melody([[72,1,5],[67,1,5],[64,1,3],[60,1,1]], 18, 'right'),
          ]
        },
        {
          id: 'L22-04',
          name: 'Chord Progression by Ear',
          skills: 'Identify chord changes aurally',
          bpm: 60,
          instruction: 'Listen to the chord progression, then play it. Can you hear when the chord changes? Focus on the bass note movement.',
          notes: [
            ...progression(['C', 'Am', 'F', 'G'], { duration: 4 }),
            ...progression(['C', 'F', 'Dm', 'G'], { startTime: 18, duration: 4 }),
          ]
        },
      ]
    },

    // ═══ LEVEL 23: Composition Basics ═══
    {
      level: 23,
      levelName: 'Composition Basics',
      lessons: [
        {
          id: 'L23-01',
          name: 'Question & Answer Phrases',
          skills: 'Creating musical sentences',
          bpm: 76,
          instruction: 'Music speaks in sentences: a "question" phrase ends on an unstable note (feels incomplete), an "answer" resolves back home. Play the question, then the answer.',
          notes: [
            // Question (ends on D - unresolved)
            ...melody([[60,1,1],[62,1,2],[64,1,3],[67,1,5],[65,1,4],[64,1,3],[62,2,2]], 0, 'right'),
            // Answer (ends on C - home)
            ...melody([[60,1,1],[62,1,2],[64,1,3],[67,1,5],[65,1,4],[64,1,3],[60,2,1]], 8, 'right'),
          ]
        },
        {
          id: 'L23-02',
          name: 'Verse-Chorus Structure',
          skills: 'Song form: verse (quiet) and chorus (big)',
          bpm: 80,
          instruction: 'Songs alternate between verse (lower energy, tells the story) and chorus (higher energy, the hook). Play the verse gently, then bring the chorus to life!',
          notes: [
            // Verse: sparse, single notes
            ...chord('C', 0, 4, 'left', -1),
            ...melody([[64,1,3],[62,1,2],[60,1,1],[62,1,2]], 0, 'right'),
            ...chord('Am', 4, 4, 'left', -1),
            ...melody([[60,1,1],[64,1,3],[62,2,2]], 4, 'right'),
            // Chorus: full chords, both hands
            ...chord('F', 8, 3, 'left', -1),
            ...chord('F', 8, 3, 'right'),
            ...chord('G', 12, 3, 'left', -1),
            ...chord('G', 12, 3, 'right'),
            ...chord('C', 16, 4, 'left', -1),
            ...chord('C', 16, 4, 'right'),
          ]
        },
        {
          id: 'L23-03',
          name: 'Melodic Motifs',
          skills: 'Short ideas that develop into melodies',
          bpm: 80,
          instruction: 'A motif is a short musical idea (3-5 notes) that gets repeated and varied. Play the original motif, then each variation. This is how composers build entire pieces from tiny seeds!',
          notes: [
            // Original motif: C-E-G
            ...melody([[60,1,1],[64,1,3],[67,2,5]], 0, 'right'),
            // Variation 1: transposed up (D-F#-A)
            ...melody([[62,1,2],[66,1,3],[69,2,5]], 4, 'right'),
            // Variation 2: inverted (C-Ab-F -> approximated)
            ...melody([[67,1,5],[64,1,3],[60,2,1]], 8, 'right'),
            // Variation 3: rhythmic change
            ...melody([[60,0.5,1],[64,0.5,3],[67,0.5,5],[67,0.5,5],[64,0.5,3],[60,1.5,1]], 12, 'right'),
            // Variation 4: extended
            ...melody([[60,1,1],[64,1,3],[67,1,5],[72,1,5],[67,1,5],[64,1,3],[60,2,1]], 16, 'right'),
          ]
        },
        {
          id: 'L23-04',
          name: 'Write Your Own Song',
          skills: 'Complete 8-bar composition',
          bpm: 76,
          instruction: 'A complete mini-composition! LH plays a simple chord pattern while RH plays a melody with a motif, development, and resolution. This is YOUR first song — learn it and make it yours!',
          notes: [
            // 8-bar piece with structure
            // Bar 1-2: introduce motif
            ...chord('C', 0, 4, 'left', -1),
            ...melody([[64,1,3],[67,1,5],[65,1,4],[64,1,3]], 0, 'right'),
            ...chord('Am', 4, 4, 'left', -1),
            ...melody([[64,1,3],[67,1,5],[69,1,3],[67,1,5]], 4, 'right'),
            // Bar 3-4: develop
            ...chord('F', 8, 4, 'left', -1),
            ...melody([[65,1,4],[69,1,3],[67,1,5],[65,1,4]], 8, 'right'),
            ...chord('G', 12, 4, 'left', -1),
            ...melody([[67,1,5],[72,1,5],[69,1,3],[67,1,5]], 12, 'right'),
            // Bar 5-6: climax
            ...chord('Am', 16, 4, 'left', -1),
            ...melody([[69,1,3],[72,1,5],[72,0.5,5],[69,0.5,3],[67,1,5]], 16, 'right'),
            ...chord('F', 20, 4, 'left', -1),
            ...melody([[65,1,4],[67,1,5],[65,1,4],[64,1,3]], 20, 'right'),
            // Bar 7-8: resolve
            ...chord('G', 24, 4, 'left', -1),
            ...melody([[62,1,2],[64,1,3],[67,1,5],[65,1,4]], 24, 'right'),
            ...chord('C', 28, 4, 'left', -1),
            ...melody([[64,1.5,3],[62,0.5,2],[60,2,1]], 28, 'right'),
          ]
        },
      ]
    },

    // ═══ LEVEL 24: Performance ═══
    {
      level: 24,
      levelName: 'Performance',
      lessons: [
        {
          id: 'L24-01',
          name: 'Dynamics: Piano to Forte',
          skills: 'Volume control, expression',
          bpm: 72,
          instruction: 'Play the same melody at different dynamics. Start soft (piano), gradually get louder (crescendo), then loud (forte). Your touch controls the volume — press gently for soft, firmly for loud.',
          notes: [
            // Piano (soft) — same melody three times, player controls dynamics
            ...melody([[60,1,1],[62,1,2],[64,1,3],[67,2,5]], 0, 'right'),
            ...melody([[60,1,1],[62,1,2],[64,1,3],[67,2,5]], 6, 'right'),
            ...melody([[60,1,1],[62,1,2],[64,1,3],[67,2,5]], 12, 'right'),
            // Full chord ending
            ...chord('C', 18, 4, 'left', -1),
            ...chord('C', 18, 4, 'right'),
          ]
        },
        {
          id: 'L24-02',
          name: 'Rubato & Expression',
          skills: 'Flexible tempo for emotion',
          bpm: 64,
          instruction: 'Rubato means "stolen time" — slight speeding up and slowing down for expression. This piece should breathe. Don\'t worry about perfect timing — feel the music.',
          notes: [
            ...chord('C', 0, 4, 'left', -1),
            ...melody([[64,1.5,3],[67,1,5],[72,1.5,5]], 0, 'right'),
            ...chord('Am', 4, 4, 'left', -1),
            ...melody([[69,1.5,3],[67,1,5],[64,1.5,3]], 4, 'right'),
            ...chord('F', 8, 4, 'left', -1),
            ...melody([[65,1.5,4],[67,1,5],[69,1.5,3]], 8, 'right'),
            ...chord('G', 12, 2, 'left', -1),
            ...chord('C', 14, 4, 'left', -1),
            ...melody([[67,1.5,5],[65,1,4],[64,1,3],[60,2.5,1]], 12, 'right'),
          ]
        },
        {
          id: 'L24-03',
          name: 'Full Piece: Moonlight Sonata (Simplified)',
          skills: 'Complete performance piece',
          bpm: 56,
          instruction: 'A simplified arrangement of Beethoven\'s "Moonlight Sonata." Triplet arpeggios in the right hand over sustained bass notes. Play with deep feeling and even, flowing triplets.',
          notes: [
            // C#m simplified to Am feel
            // LH sustained bass
            { midi: 45, time: 0, duration: 4, hand: 'left', finger: 5 },
            // RH triplet arpeggios (simplified)
            ...melody([[52,0.67,1],[57,0.67,3],[60,0.67,5],[52,0.67,1],[57,0.67,3],[60,0.67,5]], 0, 'right'),
            { midi: 45, time: 4, duration: 4, hand: 'left', finger: 5 },
            ...melody([[52,0.67,1],[57,0.67,3],[60,0.67,5],[52,0.67,1],[57,0.67,3],[60,0.67,5]], 4, 'right'),
            // Move to "F" area
            { midi: 41, time: 8, duration: 4, hand: 'left', finger: 5 },
            ...melody([[53,0.67,1],[57,0.67,3],[60,0.67,5],[53,0.67,1],[57,0.67,3],[60,0.67,5]], 8, 'right'),
            // Resolve
            { midi: 40, time: 12, duration: 4, hand: 'left', finger: 5 },
            ...melody([[52,0.67,1],[55,0.67,3],[59,0.67,5],[52,0.67,1],[55,0.67,3],[59,0.67,5]], 12, 'right'),
            { midi: 45, time: 16, duration: 4, hand: 'left', finger: 5 },
            ...melody([[52,0.67,1],[57,0.67,3],[60,0.67,5]], 16, 'right'),
          ]
        },
        {
          id: 'L24-04',
          name: 'Graduation Recital',
          skills: 'Everything you\'ve learned, one final piece',
          bpm: 76,
          instruction: 'Your final performance! This piece uses chords, arpeggios, melody, dynamics, both hands, and musical expression. You\'ve come an incredibly long way. Play this with pride!',
          notes: [
            // Intro: gentle arpeggios
            ...arpeggio('C', 0, 1, 'right'),
            ...arpeggio('Am', 3, 1, 'right'),

            // Verse: LH chords + RH melody
            ...chord('F', 6, 4, 'left', -1),
            ...melody([[65,1,4],[67,1,5],[69,1,3],[67,1,5]], 6, 'right'),
            ...chord('G', 10, 4, 'left', -1),
            ...melody([[67,1,5],[72,1,5],[69,1,3],[67,1,5]], 10, 'right'),

            // Build: chords get fuller
            ...chord('Am', 14, 3, 'left', -1),
            ...chord('Am', 14, 3, 'right'),
            ...chord('F', 18, 3, 'left', -1),
            ...chord('F', 18, 3, 'right'),

            // Climax: full chords + melody
            ...chord('C', 22, 4, 'left', -1),
            ...melody([[72,1,5],[72,0.5,5],[69,0.5,3],[67,2,5]], 22, 'right'),
            ...chord('G', 26, 4, 'left', -1),
            ...melody([[67,1,5],[69,1,3],[72,1,5],[74,1,5]], 26, 'right'),

            // Wind down
            ...chord('Am', 30, 4, 'left', -1),
            ...melody([[72,1,5],[69,1,3],[67,1,5],[65,1,4]], 30, 'right'),
            ...chord('F', 34, 4, 'left', -1),
            ...melody([[65,1.5,4],[64,0.5,3],[62,2,2]], 34, 'right'),

            // Final resolution
            ...chord('G', 38, 3, 'left', -1),
            ...melody([[62,1,2],[64,1,3],[67,1,5]], 38, 'right'),
            ...chord('C', 42, 6, 'left', -1),
            ...melody([[64,1.5,3],[62,0.5,2],[60,4,1]], 42, 'right'),
          ]
        },
      ]
    },
  ];

  // ══════════════════════════════════════════════════════════════════
  // API
  // ══════════════════════���═══════════════════════════════════════════

  function getAllLessons() {
    const flat = [];
    CURRICULUM.forEach(level => {
      level.lessons.forEach(lesson => {
        flat.push({ ...lesson, level: level.level, levelName: level.levelName });
      });
    });
    return flat;
  }

  function getCurriculum() {
    return CURRICULUM;
  }

  function getLesson(id) {
    for (const level of CURRICULUM) {
      const lesson = level.lessons.find(l => l.id === id);
      if (lesson) return { ...lesson, level: level.level, levelName: level.levelName };
    }
    return null;
  }

  function getLessonIndex(id) {
    const all = getAllLessons();
    return all.findIndex(l => l.id === id);
  }

  function getNextLesson(id) {
    const all = getAllLessons();
    const idx = all.findIndex(l => l.id === id);
    return idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
  }

  return { getAllLessons, getCurriculum, getLesson, getLessonIndex, getNextLesson };
})();
