# Piano Mentor

An interactive browser-based piano teaching app that works with a MIDI keyboard (or your computer keyboard as a fallback).  
Notes fall Guitar-Hero style onto a piano keyboard; a grand-staff notation panel scrolls in sync so you can read the music while you play.

---

## Quick Start

1. Open `index.html` in **Chrome or Edge** (Web MIDI API required).
2. Plug in a MIDI keyboard — it is detected automatically.
3. No MIDI? Use the computer keyboard:  `Z X C V B N M` = C3 octave, `Q W E R T Y U I O P` = C4 octave.
4. Pick any lesson from the list and hit **Start**.

No build step, no server, no dependencies to install — VexFlow is loaded from a CDN.

---

## Project Structure

```
index.html          Main HTML shell
css/
  style.css         Dark-theme UI, notation strip, piano container
js/
  audio.js          WebAudio piano synthesis + metronome
  midi.js           Web MIDI API, computer-keyboard fallback, event bus
  piano.js          Canvas piano keyboard renderer
  falling-notes.js  Guitar-Hero falling-note engine + hit detection
  notation.js       VexFlow grand-staff panel (auto-scroll / static modes)
  lessons.js        ★ Curriculum data, CHORD_DB, helper functions
  scoring.js        Perfect / good / ok / miss scoring + star rating
  progress.js       localStorage persistence
  app.js            Main controller — wires everything together
```

---

## Lesson Data Format

Every lesson is an array of note objects:

```js
{
  midi:     60,       // MIDI note number (middle C = 60)
  time:     0,        // start position in BEATS (0-based)
  duration: 1,        // length in beats
  hand:     'right',  // 'right' | 'left'
  finger:   1,        // finger number 1-5 (optional)
}
```

Chords are encoded as multiple notes sharing the same `time` value.  
The falling-notes engine and notation panel both consume this format directly.

---

## Helper Functions

`lessons.js` provides helpers that produce note arrays so you never write raw objects by hand.

### `chord(name, time, duration, hand?, octaveShift?)`

Emit one chord hit from CHORD_DB.

```js
chord('C', 0, 2)          // C major, beat 0, 2-beat duration, right hand
chord('Am', 4, 1, 'left') // A minor, beat 4, LH
```

### `repeatChord(name, startTime, count, duration, gap?, hand?)`

Repeat a chord `count` times.

```js
repeatChord('G', 0, 4, 1)   // G major, 4 quarter-note hits starting at beat 0
```

### `progression(chordNames[], options?)`

Lay out a chord sequence.  Options: `{ duration, gap, hand, repeat, octaveShift }`.

```js
progression(['C','G','Am','F'], { duration: 2 })
// C for 2 beats, G for 2, Am for 2, F for 2 → 8 beats total
```

### `scale(rootMidi, type, startTime, options?)`

Generate a scale passage. `type`: `'major'` | `'minor'` | `'pentatonic'` | `'blues'`.  
Options: `{ duration, hand, finger, ascending }`.

```js
scale(60, 'major', 0, { duration: 0.5 })   // C major scale, eighth notes
```

### `arpeggio(name, startTime, duration, hand?, octaveShift?)`

Spread a chord into an ascending arpeggio.

```js
arpeggio('C', 0, 0.5)   // C major arpeggio, each note an eighth
```

### `repeatArpeggio(name, startTime, bars, noteDuration?, hand?)`

Repeat an arpeggio pattern for N bars.

```js
repeatArpeggio('Am', 0, 2)   // Am arpeggio repeated for 2 bars
```

### `melody(notes[], startTime?, hand?)`

Write a melody as `[midi, duration, finger?]` tuples. Use `0` as midi for a rest.

```js
melody([
  [64, 1, 3],   // E4, quarter, finger 3
  [62, 1, 2],   // D4, quarter, finger 2
  [60, 2, 1],   // C4, half,    finger 1
  [0,  1],      // rest, quarter
])
```

### `boomChuck(chordName, startTime, bars?, octaveShift?)`

Classic "boom-chuck" accompaniment pattern (bass note on 1, chord on 2 & 3 in 4/4).

```js
boomChuck('C', 0, 2)   // 2 bars of boom-chuck in C
```

### `waltz(chordName, startTime, bars?, octaveShift?)`

Waltz pattern (bass on 1, chord on 2 & 3 in 3/4 — written into 4/4 bars).

---

## CHORD_DB

`CHORD_DB` maps chord names to MIDI voicings and fingerings.  To add a new chord:

```js
'Db': {
  midi:     [61, 65, 68],          // Db4, F4, Ab4
  fingersR: [1, 2, 4],             // thumb, index, ring
  fingersL: [5, 3, 1],             // pinky, middle, thumb
},
```

Keys can be any string — they're passed directly to the helper functions.  
Add the entry inside the `CHORD_DB` object near the top of `lessons.js`.

---

## How to Add a Lesson

### 1. Open `lessons.js` and find the CURRICULUM array

Each level is an object:

```js
{
  level: 3,
  levelName: 'Major Triads',
  lessons: [ /* lesson objects */ ],
}
```

### 2. Write a lesson object

```js
{
  id:          'L3-08',
  name:        'C → F → G → C',
  skills:      'I–IV–V–I cadence',
  bpm:         90,
  instruction: 'Play the classic cadence. Listen for the feeling of resolution.',
  notes: [
    ...progression(['C','F','G','C'], { duration: 2 }),
  ],
}
```

**Rules:**
- `id` must be unique across the whole curriculum (format `L{level}-{nn}` by convention).
- `notes` is a flat array — spread (`...`) multiple helper calls together.
- `bpm` sets the default tempo; the player can adjust it with the tempo controls.
- All lessons are unlocked from the start — no gatekeeping.

### 3. Full example — hands-together lesson

```js
{
  id: 'L10-06',
  name: 'C Major Waltz',
  skills: 'LH waltz pattern, RH melody',
  bpm: 100,
  instruction: 'Keep the left hand light while the right hand sings.',
  notes: [
    // Left hand: waltz pattern
    ...waltz('C', 0, 2),
    ...waltz('G', 8, 2),

    // Right hand: simple melody
    ...melody([
      [64,1,3],[62,1,2],[60,2,1],
      [62,1,2],[64,1,3],[67,2,5],
    ], 0, 'right'),
  ],
}
```

---

## Curriculum Overview

| Levels | Topic |
|--------|-------|
| 1–2    | Foundations — single notes, posture, finger numbers |
| 3–4    | Major & minor triads |
| 5      | Chord progressions (I–IV–V, pop, blues) |
| 6      | Inversions & voice leading |
| 7      | 7th chords (maj7, dom7, min7) |
| 8      | Applied songs |
| 9      | Broken chords & arpeggios |
| 10     | Hands together |
| 11     | Rhythm patterns (boom-chuck, waltz, stride) |
| 12     | Improvisation basics |
| 13     | Rhythm & accompaniment styles |
| 14     | Key signatures |
| 15     | Scales in all keys |
| 16     | Sight-reading |
| 17     | Classical repertoire |
| 18     | Pop & contemporary |
| 19     | Blues & jazz |
| 20     | Advanced harmony |
| 21     | Advanced technique |
| 22     | Ear training |
| 23     | Composition basics |
| 24     | Performance |

---

## Tech Notes

| Concern | Approach |
|---------|----------|
| MIDI input | [Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API) with computer-keyboard fallback |
| Audio synthesis | WebAudio API — triangle + sine oscillators, sample-accurate scheduling |
| Falling notes | Canvas, `requestAnimationFrame`, hit windows: perfect 0.3 s / ok 0.6 s / miss 0.9 s |
| Notation | [VexFlow 4.x](https://www.vexflow.com/) grand staff (treble + bass), SVG output |
| Notation scroll | Beat → SVG-x from `getAbsoluteX()` after VexFlow render; scroll area shifts to keep now-line fixed |
| Persistence | `localStorage` under key `pianoMentor_progress` |

---

## Browser Support

Chrome or Edge required for Web MIDI. Safari and Firefox do not support the Web MIDI API without an extension.
