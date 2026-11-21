/**
 * VideoForge Pro - Web Audio API Sound Design, Noise Reduction, Beatmarking & Voice Cloning
 */

export const AudioStudio = {
  ctx: null,
  sourceNode: null,
  analyser: null,
  gainNode: null,
  connectedElement: null,
  
  // 3-Band Equalizer nodes
  bassFilter: null,
  midFilter: null,
  trebleFilter: null,

  // Noise Reduction DSP Nodes
  highpassFilter: null, // Cuts low-end HVAC/wind rumble (<80Hz)
  humNotchFilter: null, // Cuts 60Hz electrical hum
  deEsserFilter: null,  // Cuts harsh sibilance (7kHz)
  noiseReductionEnabled: false,

  // Reverb & Effects nodes
  delayNode: null,
  feedbackGain: null,

  // Beatmarking & Rhythm state
  beatMarkers: [],
  isDetectingBeats: false,

  // Voice Cloning Personas
  voicePersonas: [
    { id: 'trailer', name: '🎬 Deep Movie Trailer Narrator', pitch: 0.70, rate: 0.90, bassBoost: 12 },
    { id: 'podcast', name: '🎙️ Studio Podcast Host', pitch: 1.0, rate: 1.0, bassBoost: 3 },
    { id: 'cyber', name: '🤖 Cyberpunk AI Assistant', pitch: 1.25, rate: 1.1, bassBoost: -2 },
    { id: 'upbeat', name: '✨ Dynamic Storyteller', pitch: 1.15, rate: 1.05, bassBoost: 0 },
    { id: 'whisper', name: '🌙 Soft ASMR Whisper', pitch: 0.85, rate: 0.85, bassBoost: -4 }
  ],
  activePersona: 'trailer',

  volume: 1.0,
  bass: 0,
  mid: 0,
  treble: 0,
  activeEffect: 'none',

  spectrumData: null,
  isInitialized: false,

  init(mediaElement) {
    try {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 128;
        this.spectrumData = new Uint8Array(this.analyser.frequencyBinCount);

        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.value = this.volume;

        // Noise Reduction Filters
        this.highpassFilter = this.ctx.createBiquadFilter();
        this.highpassFilter.type = 'highpass';
        this.highpassFilter.frequency.value = 80;

        this.humNotchFilter = this.ctx.createBiquadFilter();
        this.humNotchFilter.type = 'notch';
        this.humNotchFilter.frequency.value = 60;
        this.humNotchFilter.Q.value = 10;

        this.deEsserFilter = this.ctx.createBiquadFilter();
        this.deEsserFilter.type = 'peaking';
        this.deEsserFilter.frequency.value = 7000;
        this.deEsserFilter.gain.value = -6;

        // 3-Band EQ
        this.bassFilter = this.ctx.createBiquadFilter();
        this.bassFilter.type = 'lowshelf';
        this.bassFilter.frequency.value = 150;
        this.bassFilter.gain.value = this.bass;

        this.midFilter = this.ctx.createBiquadFilter();
        this.midFilter.type = 'peaking';
        this.midFilter.frequency.value = 1000;
        this.midFilter.Q.value = 1.0;
        this.midFilter.gain.value = this.mid;

        this.trebleFilter = this.ctx.createBiquadFilter();
        this.trebleFilter.type = 'highshelf';
        this.trebleFilter.frequency.value = 4000;
        this.trebleFilter.gain.value = this.treble;

        // Reverb / Echo
        this.delayNode = this.ctx.createDelay();
        this.delayNode.delayTime.value = 0.25;
        this.feedbackGain = this.ctx.createGain();
        this.feedbackGain.gain.value = 0.35;
        this.delayNode.connect(this.feedbackGain);
        this.feedbackGain.connect(this.delayNode);
      }

      // Connect source node only once per media element
      if (mediaElement && this.connectedElement !== mediaElement) {
        this.sourceNode = this.ctx.createMediaElementSource(mediaElement);
        this.connectedElement = mediaElement;
        this.rebuildAudioChain();
      }

      this.isInitialized = true;
    } catch (e) {
      console.warn("AudioContext init note:", e);
    }
  },

  rebuildAudioChain() {
    if (!this.sourceNode || !this.ctx) return;
    try {
      this.sourceNode.disconnect();
      this.highpassFilter.disconnect();
      this.humNotchFilter.disconnect();
      this.bassFilter.disconnect();
      this.midFilter.disconnect();
      this.trebleFilter.disconnect();
      this.gainNode.disconnect();
      this.analyser.disconnect();
    } catch (e) {}

    let lastNode = this.sourceNode;

    if (this.noiseReductionEnabled) {
      lastNode.connect(this.highpassFilter);
      this.highpassFilter.connect(this.humNotchFilter);
      this.humNotchFilter.connect(this.deEsserFilter);
      lastNode = this.deEsserFilter;
    }

    lastNode.connect(this.bassFilter);
    this.bassFilter.connect(this.midFilter);
    this.midFilter.connect(this.trebleFilter);
    this.trebleFilter.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  },

  toggleNoiseReduction(enabled) {
    this.noiseReductionEnabled = enabled;
    this.rebuildAudioChain();
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  setVolume(volPercent) {
    this.volume = volPercent / 100;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  },

  setEQ(bassVal, midVal, trebleVal) {
    this.bass = bassVal;
    this.mid = midVal;
    this.treble = trebleVal;

    if (this.ctx && this.bassFilter) {
      this.bassFilter.gain.setValueAtTime(this.bass, this.ctx.currentTime);
      this.midFilter.gain.setValueAtTime(this.mid, this.ctx.currentTime);
      this.trebleFilter.gain.setValueAtTime(this.treble, this.ctx.currentTime);
    }
  },

  setAudioEffect(type) {
    this.activeEffect = type;
    if (!this.ctx || !this.trebleFilter) return;

    try {
      this.trebleFilter.disconnect();
      this.delayNode.disconnect();
    } catch (e) {}

    if (type === 'reverb') {
      this.trebleFilter.connect(this.gainNode);
      this.trebleFilter.connect(this.delayNode);
      this.delayNode.connect(this.gainNode);
    } else if (type === 'radio') {
      this.bassFilter.gain.setValueAtTime(-20, this.ctx.currentTime);
      this.trebleFilter.gain.setValueAtTime(-15, this.ctx.currentTime);
      this.midFilter.gain.setValueAtTime(14, this.ctx.currentTime);
      this.trebleFilter.connect(this.gainNode);
    } else {
      this.setEQ(this.bass, this.mid, this.treble);
      this.trebleFilter.connect(this.gainNode);
    }
  },

  getSpectrumLevels() {
    if (!this.analyser || !this.spectrumData) return [10, 15, 20, 15, 10];
    this.analyser.getByteFrequencyData(this.spectrumData);
    
    const bands = [0, 0, 0, 0, 0];
    const step = Math.floor(this.spectrumData.length / 5);
    for (let i = 0; i < 5; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += this.spectrumData[i * step + j] || 0;
      }
      bands[i] = Math.max(3, Math.round((sum / step / 255) * 20));
    }
    return bands;
  },

  /**
   * Automatic Beat & Rhythm Transient Detector
   */
  async detectBeatsFromBuffer(audioBuffer) {
    const rawData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const step = Math.floor(sampleRate * 0.04);
    const peaks = [];
    let prevEnergy = 0;

    for (let i = 0; i < rawData.length - step; i += step) {
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += rawData[i + j] * rawData[i + j];
      }
      const energy = Math.sqrt(sum / step);

      if (energy > 0.10 && energy > prevEnergy * 1.45) {
        const timeSec = i / sampleRate;
        if (peaks.length === 0 || timeSec - peaks[peaks.length - 1] > 0.25) {
          peaks.push(parseFloat(timeSec.toFixed(2)));
        }
      }
      prevEnergy = energy;
    }

    this.beatMarkers = peaks;
    return peaks;
  },

  /**
   * Clean Voice Cloning / TTS Generator (No Promotional Text)
   */
  generateVoiceClone(text, personaId = 'trailer', onComplete) {
    if (!window.speechSynthesis) {
      alert("Speech Synthesis is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const persona = this.voicePersonas.find(p => p.id === personaId) || this.voicePersonas[0];
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.pitch = persona.pitch;
    utterance.rate = persona.rate;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural'))) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => {
      this.playSynthesizedSFX('whoosh');
    };

    utterance.onend = () => {
      if (onComplete) onComplete();
    };

    window.speechSynthesis.speak(utterance);
  },

  playSynthesizedSFX(type) {
    this.resume();
    const ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.connect(env);
    env.connect(ctx.destination);

    switch (type) {
      case 'whoosh':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);
        env.gain.setValueAtTime(0.01, now);
        env.gain.linearRampToValueAtTime(0.4, now + 0.15);
        env.gain.linearRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.36);
        break;

      case 'ding':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(987.77, now);
        env.gain.setValueAtTime(0.3, now);
        env.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.82);
        break;

      case 'cyber-pulse':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);
        env.gain.setValueAtTime(0.25, now);
        env.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.52);
        break;

      case 'lofi-chord':
        [261.63, 329.63, 392.00, 493.88].forEach(freq => {
          const chordOsc = ctx.createOscillator();
          const chordGain = ctx.createGain();
          chordOsc.type = 'sine';
          chordOsc.frequency.value = freq;
          chordGain.gain.setValueAtTime(0.1, now);
          chordGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          chordOsc.connect(chordGain);
          chordGain.connect(ctx.destination);
          chordOsc.start(now);
          chordOsc.stop(now + 1.25);
        });
        break;
    }
  },

  async extractAudioWAV(videoElement) {
    if (!videoElement.src) throw new Error("No media loaded");
    
    const response = await fetch(videoElement.src);
    const arrayBuffer = await response.arrayBuffer();
    const tempCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);

    const wavBlob = this.audioBufferToWav(audioBuffer);
    const url = URL.createObjectURL(wavBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `audio-track-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },

  audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;
    
    let interleaved;
    if (numChannels === 2) {
      interleaved = this.interleave(buffer.getChannelData(0), buffer.getChannelData(1));
    } else {
      interleaved = buffer.getChannelData(0);
    }
    
    const byteRate = (sampleRate * numChannels * bitDepth) / 8;
    const blockAlign = (numChannels * bitDepth) / 8;
    const dataSize = (interleaved.length * bitDepth) / 8;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;
    
    const arrayBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(arrayBuffer);
    
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    
    let offset = 44;
    for (let i = 0; i < interleaved.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, interleaved[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    
    return new Blob([view], { type: 'audio/wav' });
  },

  interleave(inputL, inputR) {
    const length = inputL.length + inputR.length;
    const result = new Float32Array(length);
    let index = 0, inputIndex = 0;
    while (index < length) {
      result[index++] = inputL[inputIndex];
      result[index++] = inputR[inputIndex];
      inputIndex++;
    }
    return result;
  },

  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
};
