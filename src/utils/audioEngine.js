// Motor de Audio Híbrido: Samples Reales de Estudio + Síntesis Karplus-Strong de Respaldo
// Carga grabaciones reales de estudio de guitarras acústicas y clásicas (nylon / acero) con latencia cero

const SAMPLE_BASE_URLS = {
  steel: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_steel-mp3/',
  nylon: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_nylon-mp3/'
};

class GuitarAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.guitarType = 'steel'; // 'steel' | 'nylon' | 'synth'
    this.sampleCache = {}; // { 'steel_E2': AudioBuffer, ... }
    this.loadingPromises = {};
    this.isPreloaded = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.9, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setGuitarType(type) {
    if (['steel', 'nylon', 'synth'].includes(type)) {
      this.guitarType = type;
      if (type !== 'synth') {
        this.preloadCommonSamples();
      }
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.9, this.ctx.currentTime);
    }
  }

  // Pre-cargar notas de uso frecuente para reproducción instantánea (0ms de latencia)
  preloadCommonSamples() {
    this.init();
    if (!this.ctx) return;

    const commonNotes = [
      'E2', 'G2', 'A2', 'B2',
      'C3', 'D3', 'E3', 'F3', 'G3', 'Ab3', 'A3',
      'C4', 'Db4', 'D4', 'E4', 'F4', 'Gb4', 'G4'
    ];

    commonNotes.forEach((note) => {
      this.fetchAndDecodeSample(this.guitarType, note);
    });
    this.isPreloaded = true;
  }

  async fetchAndDecodeSample(type, note) {
    if (type === 'synth') return null;
    const cacheKey = `${type}_${note}`;
    if (this.sampleCache[cacheKey]) {
      return this.sampleCache[cacheKey];
    }
    if (this.loadingPromises[cacheKey]) {
      return this.loadingPromises[cacheKey];
    }

    const url = `${SAMPLE_BASE_URLS[type] || SAMPLE_BASE_URLS.steel}${note}.mp3`;

    this.loadingPromises[cacheKey] = (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        this.init();
        if (!this.ctx) return null;
        const decodedBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        this.sampleCache[cacheKey] = decodedBuffer;
        return decodedBuffer;
      } catch (err) {
        console.warn(`Could not load real sample for ${note} (${type}), will fallback to synth:`, err);
        return null;
      } finally {
        delete this.loadingPromises[cacheKey];
      }
    })();

    return this.loadingPromises[cacheKey];
  }

  // Tocar una nota con Sample Real o Síntesis
  async playNote(noteKey, frequency, duration = 3.5) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    // Si está en modo muestra real y tenemos noteKey
    if (this.guitarType !== 'synth' && noteKey) {
      const cacheKey = `${this.guitarType}_${noteKey}`;
      let buffer = this.sampleCache[cacheKey];

      if (!buffer) {
        // Intentar obtenerlo
        buffer = await this.fetchAndDecodeSample(this.guitarType, noteKey);
      }

      if (buffer) {
        // Reproducir muestra real grabada
        try {
          const source = this.ctx.createBufferSource();
          source.buffer = buffer;

          const gainNode = this.ctx.createGain();
          gainNode.gain.setValueAtTime(0.95, this.ctx.currentTime);
          // Fade out natural suave al final
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

          source.connect(gainNode);
          gainNode.connect(this.masterGain);

          source.start();
          return;
        } catch (e) {
          console.warn('Error playing buffer, using synth fallback:', e);
        }
      }
    }

    // Fallback: Síntesis Karplus-Strong
    if (frequency) {
      this.playSynthString(frequency, duration);
    }
  }

  // Reproducir cuerda (acepta frequency y opcionalmente noteKey)
  playString(frequency, noteKeyOrDuration = null) {
    let noteKey = null;
    if (typeof noteKeyOrDuration === 'string') {
      noteKey = noteKeyOrDuration;
    } else if (!noteKey && frequency) {
      // Deducir el noteKey más cercano para las 6 cuerdas abiertas
      if (Math.abs(frequency - 82.41) < 2) noteKey = 'E2';
      else if (Math.abs(frequency - 110.00) < 2) noteKey = 'A2';
      else if (Math.abs(frequency - 146.83) < 2) noteKey = 'D3';
      else if (Math.abs(frequency - 196.00) < 2) noteKey = 'G3';
      else if (Math.abs(frequency - 246.94) < 2) noteKey = 'B3';
      else if (Math.abs(frequency - 329.63) < 2) noteKey = 'E4';
    }

    this.playNote(noteKey, frequency);
  }

  // Rasguear un acorde con muestras reales
  strumChord(frequencies, speed = 40, noteKeys = null) {
    if (this.isMuted) return;
    let playedIndex = 0;

    frequencies.forEach((freq, idx) => {
      if (freq !== null && freq > 0) {
        const noteKey = noteKeys ? noteKeys[idx] : null;
        setTimeout(() => {
          this.playNote(noteKey, freq, 3.2);
        }, playedIndex * speed);
        playedIndex++;
      }
    });
  }

  // Arpegiar cuerda por cuerda
  arpeggiateChord(frequencies, onNoteCallback = null, speed = 320, noteKeys = null) {
    if (this.isMuted) return;
    let step = 0;

    frequencies.forEach((freq, stringIdx) => {
      if (freq !== null && freq > 0) {
        const currentStep = step;
        const noteKey = noteKeys ? noteKeys[stringIdx] : null;
        setTimeout(() => {
          this.playNote(noteKey, freq, 2.8);
          if (onNoteCallback) onNoteCallback(stringIdx, freq);
        }, currentStep * speed);
        step++;
      }
    });
  }

  // Tocar acorde completo arpegiado (ej. para celebrar acierto total)
  playCelebrationChord() {
    if (this.isMuted) return;
    const notes = [
      { key: 'E2', freq: 82.41 },
      { key: 'A2', freq: 110.0 },
      { key: 'D3', freq: 146.83 },
      { key: 'G3', freq: 196.0 },
      { key: 'B3', freq: 246.94 },
      { key: 'E4', freq: 329.63 }
    ];
    notes.forEach((item, idx) => {
      setTimeout(() => {
        this.playNote(item.key, item.freq, 3.0);
      }, idx * 75);
    });
  }

  // Síntesis Karplus-Strong de respaldo
  playSynthString(frequency, duration = 3.0, dampingFactor = 0.988) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const sampleRate = this.ctx.sampleRate;
      const period = Math.round(sampleRate / frequency);
      const bufferLength = Math.floor(sampleRate * duration);
      const audioBuffer = this.ctx.createBuffer(1, bufferLength, sampleRate);
      const channelData = audioBuffer.getChannelData(0);

      const noiseBuffer = new Float32Array(period);
      for (let i = 0; i < period; i++) {
        noiseBuffer[i] = (Math.random() * 2 - 1) * 0.9;
      }

      const damping = Math.min(0.995, Math.max(0.975, dampingFactor - (frequency / 3000)));

      let prevSample = 0;
      for (let i = 0; i < bufferLength; i++) {
        if (i < period) {
          channelData[i] = noiseBuffer[i];
        } else {
          const delayedIndex = i - period;
          const currentSample = channelData[delayedIndex];
          const newSample = 0.5 * (currentSample + prevSample) * damping;
          channelData[i] = newSample;
          prevSample = newSample;
        }
      }

      const source = this.ctx.createBufferSource();
      source.buffer = audioBuffer;

      const bodyFilter = this.ctx.createBiquadFilter();
      bodyFilter.type = 'peaking';
      bodyFilter.frequency.setValueAtTime(220, this.ctx.currentTime);
      bodyFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);
      bodyFilter.gain.setValueAtTime(4.0, this.ctx.currentTime);

      const highCut = this.ctx.createBiquadFilter();
      highCut.type = 'lowpass';
      highCut.frequency.setValueAtTime(Math.min(8000, frequency * 8), this.ctx.currentTime);

      const stringGain = this.ctx.createGain();
      stringGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      stringGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      source.connect(bodyFilter);
      bodyFilter.connect(highCut);
      highCut.connect(stringGain);
      stringGain.connect(this.masterGain);

      source.start();
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  // Sonido de éxito suave
  playSuccessChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.36);
  }

  // Sonido de error pedagógico sutil
  playErrorBuzz() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.26);
  }
}

export const soundEngine = new GuitarAudioEngine();

// Iniciar precarga de samples reales en el primer toque o carga
if (typeof window !== 'undefined') {
  window.addEventListener('click', () => {
    if (!soundEngine.isPreloaded) {
      soundEngine.preloadCommonSamples();
    }
  }, { once: true });
}
