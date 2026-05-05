/**
 * Audio Engine — WebAudio piano synthesis and metronome
 */
const AudioEngine = (() => {
  let ctx = null;
  let masterGain = null;
  let metronomeInterval = null;
  let metronomePlaying = false;

  // Piano note frequencies (A4 = 440Hz)
  function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(ctx.destination);
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  /**
   * Play a piano-like tone for a given MIDI note
   * Returns a stop function to end the note
   */
  function playNote(midiNote, velocity = 80) {
    init();
    resume();
    const freq = midiToFreq(midiNote);
    const vel = velocity / 127;
    const now = ctx.currentTime;

    // Simple piano: fundamental + harmonics with quick attack, natural decay
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.value = freq;
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2; // First harmonic

    const harmGain = ctx.createGain();
    harmGain.gain.value = 0.15;

    osc1.connect(gainNode);
    osc2.connect(harmGain);
    harmGain.connect(gainNode);
    gainNode.connect(masterGain);

    // ADSR-like envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(vel * 0.6, now + 0.01);  // Attack
    gainNode.gain.exponentialRampToValueAtTime(vel * 0.3, now + 0.1); // Decay
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.5);     // Release

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 3);
    osc2.stop(now + 3);

    // Return a stop function for note-off
    return () => {
      const t = ctx.currentTime;
      gainNode.gain.cancelScheduledValues(t);
      gainNode.gain.setValueAtTime(gainNode.gain.value, t);
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    };
  }

  /**
   * Schedule a note to play at a precise WebAudio clock time.
   * Much more accurate than setTimeout for music playback.
   */
  function scheduleNote(midiNote, atTime, velocity = 80) {
    init();
    resume();
    const freq = midiToFreq(midiNote);
    const vel = velocity / 127;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.value = freq;
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2;

    const harmGain = ctx.createGain();
    harmGain.gain.value = 0.15;

    osc1.connect(gainNode);
    osc2.connect(harmGain);
    harmGain.connect(gainNode);
    gainNode.connect(masterGain);

    gainNode.gain.setValueAtTime(0, atTime);
    gainNode.gain.linearRampToValueAtTime(vel * 0.6, atTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(vel * 0.3, atTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, atTime + 2.5);

    osc1.start(atTime);
    osc2.start(atTime);
    osc1.stop(atTime + 3);
    osc2.stop(atTime + 3);
  }

  /**
   * Get the AudioContext's current time (for syncing scheduled notes with animation).
   */
  function now() {
    init();
    return ctx.currentTime;
  }

  /**
   * Metronome
   */
  function startMetronome(bpm) {
    init();
    resume();
    stopMetronome();
    metronomePlaying = true;
    const interval = 60000 / bpm;
    let beat = 0;

    function tick() {
      if (!metronomePlaying) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(masterGain);

      // High tick on beat 1, lower on others
      osc.frequency.value = beat % 4 === 0 ? 1000 : 700;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
      beat++;
    }

    tick();
    metronomeInterval = setInterval(tick, interval);
  }

  function stopMetronome() {
    metronomePlaying = false;
    if (metronomeInterval) {
      clearInterval(metronomeInterval);
      metronomeInterval = null;
    }
  }

  function isMetronomePlaying() {
    return metronomePlaying;
  }

  return { init, resume, playNote, scheduleNote, now, startMetronome, stopMetronome, isMetronomePlaying };
})();
