// All sound is synthesized with WebAudio, no audio files needed.
// - letter scene: dreamy music-box arpeggio
// - map scene: Animal Crossing-style plucky loop (melody + bass + chords)
// - SFX: footsteps, boat, train, car, arrival chime, eating, firework booms

const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12); // midi → Hz

// map melody: 4 bars of swung 8ths (midi numbers, null = rest)
const MAP_MELODY = [
  76, 79, 81, 79, 76, 74, 72, 74,
  76, 79, 81, 84, 81, 79, 76, 79,
  81, 79, 76, 74, 72, 74, 76, 79,
  74, 76, 74, 72, 69, 72, 74, null,
];
const MAP_BASS = [48, 53, 57, 55]; // C F A G per bar
const MAP_CHORDS = [
  [60, 64, 67],
  [60, 65, 69],
  [60, 64, 69],
  [59, 62, 67],
];

const LETTER_ARP = [72, 76, 79, 84, 83, 79, 81, 76];

export function createAudio() {
  let ctx = null;
  let master, musicGain, sfxGain;
  let muted = false;
  let seqTimer = null;
  let currentSong = null;
  const loops = {};

  function ensure() {
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      return;
    }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.33;
    musicGain.connect(master);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.5;
    sfxGain.connect(master);
  }

  // ---------- tiny synth helpers ----------
  function pluck(freq, when, { dur = 0.5, type = 'triangle', vol = 1, dest = musicGain } = {}) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(0.22 * vol, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, when + dur);
    osc.connect(g).connect(dest);
    osc.start(when);
    osc.stop(when + dur + 0.05);
  }

  function noiseBurst(when, { dur = 0.06, freq = 3000, q = 1, vol = 0.2, type = 'bandpass' } = {}) {
    const len = Math.max(1, (dur + 0.02) * ctx.sampleRate);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + dur);
    src.connect(f).connect(g).connect(sfxGain);
    src.start(when);
    src.stop(when + dur + 0.02);
  }

  // ---------- music sequencers ----------
  function stopMusic() {
    if (seqTimer) clearInterval(seqTimer);
    seqTimer = null;
    currentSong = null;
  }

  function playMapMusic() {
    ensure();
    if (currentSong === 'map') return;
    stopMusic();
    currentSong = 'map';
    const eighth = 0.326;
    let slot = 0;
    let nextTime = ctx.currentTime + 0.1;
    seqTimer = setInterval(() => {
      while (nextTime < ctx.currentTime + 0.4) {
        const i = slot % 32;
        const swing = i % 2 === 0 ? 0 : eighth * 0.16;
        const t = nextTime + swing;
        const note = MAP_MELODY[i];
        if (note !== null) {
          pluck(NOTE(note), t, { dur: 0.42, type: 'triangle', vol: 1 });
        }
        const bar = Math.floor(i / 8);
        if (i % 8 === 0 || i % 8 === 4) {
          pluck(NOTE(MAP_BASS[bar] - 12), t, { dur: 0.5, type: 'sine', vol: 1.5 });
        }
        if (i % 8 === 2 || i % 8 === 6) {
          for (const c of MAP_CHORDS[bar]) {
            pluck(NOTE(c), t, { dur: 0.22, type: 'triangle', vol: 0.35 });
          }
        }
        slot++;
        nextTime += eighth;
      }
    }, 100);
  }

  function playLetterMusic() {
    ensure();
    if (currentSong === 'letter') return;
    stopMusic();
    currentSong = 'letter';
    const step = 0.44;
    let slot = 0;
    let nextTime = ctx.currentTime + 0.1;
    seqTimer = setInterval(() => {
      while (nextTime < ctx.currentTime + 0.4) {
        const i = slot % LETTER_ARP.length;
        pluck(NOTE(LETTER_ARP[i] + 12), nextTime, {
          dur: 1.3,
          type: 'triangle',
          vol: 0.55 + Math.random() * 0.2,
        });
        if (slot % 16 === 0) {
          pluck(NOTE(48), nextTime, { dur: 2.2, type: 'sine', vol: 0.9 });
        }
        slot++;
        nextTime += step;
      }
    }, 100);
  }

  // ---------- sfx loops (travel modes) ----------
  function startLoop(name) {
    ensure();
    stopLoops();
    if (name === 'steps') {
      let left = true;
      loops.steps = setInterval(() => {
        noiseBurst(ctx.currentTime, {
          dur: 0.045,
          freq: left ? 2600 : 3300,
          vol: 0.07,
        });
        left = !left;
      }, 390);
    } else if (name === 'boat') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 68;
      const g = ctx.createGain();
      g.gain.value = 0.06;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 3.2;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.03;
      lfo.connect(lfoGain).connect(g.gain);
      osc.connect(g).connect(sfxGain);
      osc.start();
      lfo.start();
      loops.nodes = [osc, lfo];
      loops.boat = setInterval(() => {
        noiseBurst(ctx.currentTime, { dur: 0.1, freq: 900, vol: 0.03, type: 'lowpass' });
      }, 700);
    } else if (name === 'train') {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 46;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 180;
      const g = ctx.createGain();
      g.gain.value = 0.05;
      osc.connect(f).connect(g).connect(sfxGain);
      osc.start();
      loops.nodes = [osc];
      loops.train = setInterval(() => {
        noiseBurst(ctx.currentTime, { dur: 0.05, freq: 700, vol: 0.09, type: 'lowpass' });
        noiseBurst(ctx.currentTime + 0.09, { dur: 0.05, freq: 700, vol: 0.07, type: 'lowpass' });
      }, 480);
    } else if (name === 'car') {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 85;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 260;
      const g = ctx.createGain();
      g.gain.value = 0.05;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.7;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 6;
      lfo.connect(lfoGain).connect(osc.frequency);
      osc.connect(f).connect(g).connect(sfxGain);
      osc.start();
      lfo.start();
      loops.nodes = [osc, lfo];
    }
  }

  function stopLoops() {
    for (const key of ['steps', 'boat', 'train', 'car']) {
      if (loops[key]) {
        clearInterval(loops[key]);
        loops[key] = null;
      }
    }
    if (loops.nodes) {
      for (const n of loops.nodes) {
        try {
          n.stop();
        } catch {}
      }
      loops.nodes = null;
    }
  }

  // ---------- one-shot sfx ----------
  function sfx(name) {
    if (!ctx) return;
    const t = ctx.currentTime;
    if (name === 'chime') {
      pluck(NOTE(88), t, { dur: 0.5, vol: 0.8, dest: sfxGain });
      pluck(NOTE(91), t + 0.12, { dur: 0.7, vol: 0.8, dest: sfxGain });
    } else if (name === 'nom') {
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = [390, 300, 350][i];
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.value = 900;
        const g = ctx.createGain();
        const start = t + i * 0.16;
        g.gain.setValueAtTime(0.12, start);
        g.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
        osc.connect(f).connect(g).connect(sfxGain);
        osc.start(start);
        osc.stop(start + 0.1);
      }
    } else if (name === 'boom') {
      noiseBurst(t, { dur: 0.5, freq: 380, vol: 0.28, type: 'lowpass' });
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(190, t);
      osc.frequency.exponentialRampToValueAtTime(55, t + 0.4);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.25, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(g).connect(sfxGain);
      osc.start(t);
      osc.stop(t + 0.55);
    } else if (name === 'whoosh') {
      noiseBurst(t, { dur: 0.35, freq: 1200, q: 0.6, vol: 0.1 });
    }
  }

  // ---------- mute toggle ----------
  const btn = document.getElementById('music-btn');
  btn.addEventListener('click', () => {
    muted = !muted;
    if (master) master.gain.value = muted ? 0 : 0.55;
    btn.textContent = muted ? '🔇' : '🔊';
  });

  return {
    ensure,
    playLetterMusic,
    playMapMusic,
    startLoop,
    stopLoops,
    sfx,
    showButton() {
      btn.hidden = false;
    },
  };
}
