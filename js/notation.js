/**
 * Notation Panel — grand staff display for the active lesson (VexFlow 4.x).
 *
 * Scroll model:
 *   All bars are shifted right by X_OFFSET px so that at beat 0 the first
 *   note arrives exactly at the now-line (viewport x = NOW_X).
 *   A right buffer equal to the scroll-area viewport width guarantees the
 *   last note can always be scrolled to the now-line on any screen size.
 *
 *   Beat → x mapping is taken directly from VexFlow's getAbsoluteX() after
 *   each voice is drawn, so zoom never breaks the timing.
 */
const NotationPanel = (() => {
  let vf = null;
  let svgDiv = null;
  let scrollArea = null;
  let nowLine = null;

  let showLetters  = false;
  let zoomLevel    = 1.0;
  let scrollMode   = 'scroll';   // 'scroll' | 'static'
  let currentLesson = null;
  let playheadRAF   = null;
  let staticPage    = 0;

  // Beat → SVG-x mapping built during render, used by xForBeat()
  let beatPositions = [];  // [{beat, x}] sorted by beat, actual note heads only

  const VF_NAMES   = ['c','c#','d','d#','e','f','f#','g','g#','a','a#','b'];
  const LETTER_MAP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

  const BEATS_PER_BAR = 4;
  const BAR_W_BASE    = 200;   // logical px per bar at zoom 1
  const NOW_X         = 120;   // fixed viewport x of the now-line
  const X_OFFSET      = NOW_X; // SVG left margin — shifts bar 0 so first note can reach NOW_X

  // ── Init ──────────────────────────────────────────────────────

  function init() {
    if (typeof Vex === 'undefined') { console.warn('NotationPanel: VexFlow missing'); return; }
    vf = Vex.Flow;

    svgDiv     = document.getElementById('notation-svg');
    scrollArea = document.querySelector('.notation-scroll-area');
    nowLine    = document.getElementById('notation-now-line');

    document.getElementById('notation-mode')?.addEventListener('click', () => {
      scrollMode = scrollMode === 'scroll' ? 'static' : 'scroll';
      const btn = document.getElementById('notation-mode');
      btn.textContent = scrollMode === 'scroll' ? 'Auto-scroll' : 'Static';
      btn.classList.toggle('active', scrollMode === 'scroll');
      if (nowLine) nowLine.classList.toggle('hidden', scrollMode !== 'scroll');
    });

    document.getElementById('notation-letters')?.addEventListener('click', () => {
      showLetters = !showLetters;
      document.getElementById('notation-letters').classList.toggle('active', showLetters);
      redraw();
    });

    document.getElementById('notation-zoom-in')
      ?.addEventListener('click', () => { zoomLevel = Math.min(2.5, zoomLevel + 0.2); redraw(); });
    document.getElementById('notation-zoom-out')
      ?.addEventListener('click', () => { zoomLevel = Math.max(0.55, zoomLevel - 0.2); redraw(); });
    document.getElementById('notation-fit')?.addEventListener('click', fitAll);

    // Mouse-drag to scroll manually
    if (scrollArea) {
      let dragging = false, startX = 0, scrollStart = 0;
      scrollArea.addEventListener('mousedown', e => { dragging = true; startX = e.clientX; scrollStart = scrollArea.scrollLeft; });
      window.addEventListener('mousemove', e => { if (dragging) scrollArea.scrollLeft = scrollStart - (e.clientX - startX); });
      window.addEventListener('mouseup', () => { dragging = false; });
    }
  }

  // ── MIDI ↔ VexFlow ────────────────────────────────────────────

  function midiToVF(midi) {
    const oct = Math.floor(midi / 12) - 1;
    const idx = midi % 12;
    const name = VF_NAMES[idx];
    return { key: `${name}/${oct}`, isSharp: name.includes('#'), letter: LETTER_MAP[idx] };
  }

  function beatsToDur(beats) {
    if (beats >= 3.5)    return 'w';
    if (beats >= 1.75)   return 'h';
    if (beats >= 0.875)  return 'q';
    if (beats >= 0.4375) return '8';
    return '16';
  }

  // ── Note / rest builders ──────────────────────────────────────

  function makeNote(midis, beats, clef) {
    const sorted = [...midis].sort((a, b) => a - b);
    const note = new vf.StaveNote({ keys: sorted.map(m => midiToVF(m).key), duration: beatsToDur(beats), clef });
    sorted.forEach((m, i) => {
      const info = midiToVF(m);
      if (info.isSharp) note.addModifier(new vf.Accidental('#'), i);
      if (showLetters) {
        try { const ann = new vf.Annotation(info.letter); ann.setFont('Arial', 7, 'normal'); note.addModifier(ann, i); }
        catch (_) {}
      }
    });
    return note;
  }

  function makeRest(beats, clef) {
    return new vf.StaveNote({ keys: [clef === 'treble' ? 'b/4' : 'd/3'], duration: beatsToDur(beats) + 'r', clef });
  }

  // ── Bar builder ───────────────────────────────────────────────
  // Returns [{rh:{tickables,times}, lh:{tickables,times}}]
  // where times[i] is the absolute beat time of tickables[i].

  function buildBars(notes) {
    if (!notes?.length) return [];

    const snap = t => Math.round(t * 16) / 16;

    const groups = new Map();
    for (const n of notes) {
      const t = snap(n.time);
      if (!groups.has(t)) groups.set(t, { t: n.time, rh: [], lh: [], dur: 0 });
      const g = groups.get(t);
      (n.hand === 'left' ? g.lh : g.rh).push(n.midi);
      g.dur = Math.max(g.dur, n.duration);
    }

    const events  = [...groups.values()].sort((a, b) => a.t - b.t);
    const maxTime = events.reduce((m, e) => Math.max(m, e.t + e.dur), 0);
    const numBars = Math.max(1, Math.ceil(maxTime / BEATS_PER_BAR));

    return Array.from({ length: numBars }, (_, b) => {
      const barStart = b * BEATS_PER_BAR;
      const barEnd   = barStart + BEATS_PER_BAR;
      const barEvts  = events.filter(e => snap(e.t) >= snap(barStart) && snap(e.t) < snap(barEnd - 0.01));

      const buildHand = (hand) => {
        const clef = hand === 'rh' ? 'treble' : 'bass';
        const tickables = [], times = [];
        let cursor = barStart;

        for (const ev of barEvts) {
          const midis = hand === 'rh' ? ev.rh : ev.lh;
          if (!midis.length) continue;
          const gap = snap(ev.t) - snap(cursor);
          if (gap >= 0.24) { tickables.push(makeRest(gap, clef)); times.push(cursor); }
          const noteDur = Math.min(ev.dur, barEnd - ev.t);
          tickables.push(makeNote(midis, noteDur, clef));
          times.push(ev.t);
          cursor = ev.t + noteDur;
        }

        const tail = snap(barEnd) - snap(cursor);
        if (tail >= 0.24) { tickables.push(makeRest(tail, clef)); times.push(cursor); }
        if (!tickables.length) { tickables.push(makeRest(BEATS_PER_BAR, clef)); times.push(barStart); }

        return { tickables, times };
      };

      return { rh: buildHand('rh'), lh: buildHand('lh') };
    });
  }

  // ── Renderer ──────────────────────────────────────────────────

  function render(lesson) {
    if (!vf || !svgDiv || !lesson) return;
    currentLesson = lesson;
    svgDiv.innerHTML = '';
    beatPositions = [];

    let bars;
    try { bars = buildBars(lesson.notes); }
    catch (e) { console.warn('NotationPanel buildBars:', e); return; }
    if (!bars.length) return;

    const BAR_W    = BAR_W_BASE * zoomLevel;
    const TREBLE_Y = 18;
    const BASS_Y   = TREBLE_Y + 90;
    const SVG_H    = BASS_Y + 95;
    // Right buffer must be at least as wide as the viewport so that the last
    // note can always be scrolled to NOW_X regardless of screen width.
    const rightBuffer = (scrollArea ? scrollArea.clientWidth : 900) + 200;
    const SVG_W    = X_OFFSET + bars.length * BAR_W + rightBuffer;

    let renderer;
    try { renderer = new vf.Renderer(svgDiv, vf.Renderer.Backends.SVG); }
    catch (e) { console.warn('NotationPanel Renderer:', e); return; }
    renderer.resize(SVG_W, SVG_H);
    const ctx = renderer.getContext();

    const rawBeatPos = []; // collected from RH voice only

    bars.forEach((bar, i) => {
      const staveX  = X_OFFSET + i * BAR_W;
      const isFirst = i === 0;

      const treble = new vf.Stave(staveX, TREBLE_Y, BAR_W);
      const bass   = new vf.Stave(staveX, BASS_Y,   BAR_W);
      if (isFirst) { treble.addClef('treble').addTimeSignature('4/4'); bass.addClef('bass').addTimeSignature('4/4'); }
      treble.setContext(ctx).draw();
      bass.setContext(ctx).draw();

      try {
        if (isFirst) {
          new vf.StaveConnector(treble, bass).setType('brace').setContext(ctx).draw();
          new vf.StaveConnector(treble, bass).setType('singleLeft').setContext(ctx).draw();
        }
        new vf.StaveConnector(treble, bass).setType('singleRight').setContext(ctx).draw();
      } catch (_) {}

      const drawVoice = ({ tickables, times }, stave, record) => {
        if (!tickables.length) return;
        try {
          const voice = new vf.Voice();
          voice.setMode(vf.Voice.Mode.SOFT);
          voice.addTickables(tickables);
          new vf.Formatter().joinVoices([voice]).format([voice], BAR_W - 25);
          voice.draw(ctx, stave);
          if (record) {
            tickables.forEach((note, idx) => {
              try {
                const ax = note.getAbsoluteX();
                if (ax > 0) rawBeatPos.push({ beat: times[idx], x: ax });
              } catch (_) {}
            });
          }
        } catch (e) { console.warn('voice draw error bar', i, e); }
      };

      // Record positions only from the RH (treble) voice.
      // Recording both voices produces near-duplicate x values that can be
      // non-monotone, causing the scroll to snap backwards (whiplash).
      drawVoice(bar.rh, treble, true);
      drawVoice(bar.lh, bass,   false);
    });

    // Sort by beat, deduplicate, then enforce strictly increasing x so
    // the interpolation in xForBeat() is always monotone (no whiplash).
    rawBeatPos.sort((a, b) => a.beat - b.beat);
    const seen = new Set();
    let prevX = -Infinity;
    beatPositions = rawBeatPos.filter(bp => {
      const k = bp.beat.toFixed(3);
      if (seen.has(k)) return false;
      seen.add(k);
      if (bp.x <= prevX) return false;  // drop non-monotone entries
      prevX = bp.x;
      return true;
    });

    colorHands();
  }

  function colorHands() {
    const svg = svgDiv.querySelector('svg');
    if (!svg) return;
    const svgH = parseFloat(svg.getAttribute('height') || 200);
    svg.querySelectorAll('.vf-stavenote').forEach(g => {
      let bbox;
      try { bbox = g.getBBox(); } catch (_) { return; }
      if (!bbox) return;
      const isRH = (bbox.y + bbox.height / 2) < svgH / 2;
      const color = isRH ? '#4fc3f7' : '#ef5350';
      g.querySelectorAll('path, rect').forEach(el => {
        const fill = el.getAttribute('fill');
        if (fill && fill !== 'none' && fill !== 'white' && fill !== '#fff') el.setAttribute('fill', color);
      });
    });
  }

  // ── Beat → SVG-x ─────────────────────────────────────────────

  /**
   * Maps a beat to its SVG x coordinate.
   *
   * Interpolates between the actual VexFlow note positions recorded during
   * render (RH voice only, monotone-enforced).  Using real VexFlow x values
   * means the now-line crosses each note at the exact right beat.
   *
   * Beyond the recorded range, extrapolate at the same px-per-beat rate as
   * a single bar width so the scroll continues smoothly to the end.
   */
  function xForBeat(beat) {
    const beatWidth = (BAR_W_BASE * zoomLevel) / BEATS_PER_BAR;

    if (!beatPositions.length) {
      return X_OFFSET + 85 + beat * beatWidth;
    }

    const first = beatPositions[0];
    const last  = beatPositions[beatPositions.length - 1];

    if (beat <= first.beat) {
      return first.x - (first.beat - beat) * beatWidth;
    }
    if (beat >= last.beat) {
      return last.x + (beat - last.beat) * beatWidth;
    }

    // Linear interpolation between the two surrounding recorded positions
    let lo = first;
    for (const bp of beatPositions) {
      if (bp.beat <= beat) { lo = bp; }
      else {
        return lo.x + (beat - lo.beat) / (bp.beat - lo.beat) * (bp.x - lo.x);
      }
    }
    return lo.x;
  }

  // ── Playhead ──────────────────────────────────────────────────

  function startPlayhead() {
    stopPlayhead();
    staticPage = 0;
    if (nowLine) nowLine.classList.toggle('hidden', scrollMode !== 'scroll');

    // Coasting state — used to keep scrolling after FallingNotes stops
    let coastBeat = null;      // beat value at the moment isRunning() went false
    let coastT    = null;      // performance.now() at that moment (ms)
    let beatDur   = 0.5;       // seconds per beat — updated while running

    function tick() {
      let beat;

      if (FallingNotes.isRunning()) {
        beat    = FallingNotes.getMusicBeats();
        beatDur = FallingNotes.getBeatDuration();
        // Keep coasting state fresh in case the lesson ends next frame
        coastBeat = beat;
        coastT    = performance.now();
      } else if (coastBeat !== null) {
        // Lesson ended — continue advancing on local clock
        const elapsed = (performance.now() - coastT) / 1000;
        beat = coastBeat + elapsed / beatDur;
        // Coast for 4 extra beats then stop
        if (beat > coastBeat + 4) { stopPlayhead(); return; }
      } else {
        stopPlayhead(); return;
      }

      if (scrollMode === 'scroll' && scrollArea) {
        scrollArea.scrollLeft = Math.max(0, xForBeat(beat) - NOW_X);
      } else if (scrollMode === 'static' && scrollArea && beat >= 0) {
        const BAR_W       = BAR_W_BASE * zoomLevel;
        const visibleBars = Math.max(1, Math.floor(scrollArea.clientWidth / BAR_W));
        const currentBar  = Math.floor(beat / BEATS_PER_BAR);
        if (currentBar >= (staticPage + 1) * visibleBars) {
          staticPage = Math.floor(currentBar / visibleBars);
          scrollArea.scrollLeft = X_OFFSET + staticPage * visibleBars * BAR_W - (scrollArea.clientWidth / 4);
        }
      }

      playheadRAF = requestAnimationFrame(tick);
    }

    playheadRAF = requestAnimationFrame(tick);
  }

  function stopPlayhead() {
    if (playheadRAF) { cancelAnimationFrame(playheadRAF); playheadRAF = null; }
    if (nowLine) nowLine.classList.add('hidden');
  }

  // ── Helpers ───────────────────────────────────────────────────

  function redraw() { if (currentLesson) render(currentLesson); }

  function fitAll() {
    if (!currentLesson || !scrollArea) return;
    try {
      const bars = buildBars(currentLesson.notes);
      const w = scrollArea.clientWidth;
      // Fit bars to viewport, leaving X_OFFSET in account
      zoomLevel = Math.max(0.55, Math.min(1.5, (w - X_OFFSET) / (bars.length * BAR_W_BASE + 30)));
    } catch (_) { zoomLevel = 0.8; }
    redraw();
  }

  function show() { document.getElementById('notation-strip')?.classList.remove('hidden'); }
  function hide() { document.getElementById('notation-strip')?.classList.add('hidden'); stopPlayhead(); }

  return { init, render, show, hide, startPlayhead, stopPlayhead };
})();
