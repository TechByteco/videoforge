/**
 * VideoForge Pro - Web Audio API Sound Design & Visualization Suite
 */

export const AudioStudio = {
  ctx: null,
  sourceNode: null,
  analyser: null,
  gainNode: null,
  
  // 3-Band Equalizer nodes
  bassFilter: null,
  midFilter: null,
  trebleFilter: null,

  // Effects nodes
  delayNode: null,
  feedbackGain: null,
  distortionNode: null,

  // State
  volume: 1.0,      // 0.0 to 3.0
  bass: 0,          // -20 to 20 dB
  mid: 0,           // -20 to 20 dB
  treble: 0,        // -20 to 20 dB
  activeEffect: 'none', // 'none', 'reverb', 'radio', 'robot'

  // Spectrum animation
  spectrumData: null,
  isInitialized: false,

  init(mediaElement) {
    if (this.isInitialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Analyser for spectrum visualization
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.spectrumData = new Uint8Array(this.analyser.frequencyBinCount);

      // Master Gain
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = this.volume;

      // 3-Band EQ (LowShelf, Peaking, HighShelf)
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

      // Reverb / Echo nodes
      this.delayNode = this.ctx.createDelay();
      this.delayNode.delayTime.value = 0.25;
      this.feedbackGain = this.ctx.createGain();
      this.feedbackGain.gain.value = 0.35;
      this.delayNode.connect(this.feedbackGain);
      this.feedbackGain.connect(this.delayNode);

      // Connect graph: Media -> Bass -> Mid -> Treble -> Gain -> Analyser -> Destination
      if (mediaElement) {
        this.sourceNode = this.ctx.createMediaElementSource(mediaElement);
        this.sourceNode.connect(this.bassFilter);
      }

      this.bassFilter.connect(this.midFilter);
      this.midFilter.connect(this.trebleFilter);
      this.trebleFilter.connect(this.gainNode);
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      this.isInitialized = true;
    } catch (e) {
      console.warn("AudioContext setup warning:", e);
    }
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

    // Disconnect effects chain
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
      // Normal
      this.setEQ(this.bass, this.mid, this.treble);
      this.trebleFilter.connect(this.gainNode);
    }
  },

  /**
   * Reads real-time spectrum frequency values for UI waveform meters
   */
  getSpectrumLevels() {
    if (!this.analyser || !this.spectrumData) return [10, 15, 20, 15, 10];
    this.analyser.getByteFrequencyData(this.spectrumData);
    
    // Aggregate into 5 frequency bands
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
   * Procedural Audio Synthesizer: Generates Royalty-Free BGM & Sound FX on the fly
   */
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
        osc.frequency.setValueAtTime(987.77, now); // B5
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
        [261.63, 329.63, 392.00, 493.88].forEach(freq => { // C Major 7
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

  /**
   * Extracts audio from video and creates a downloadable WAV file
   */
  async extractAudioWAV(videoElement) {
    if (!videoElement.src) throw new Error("No media loaded");
    
    // Fetch media buffer and decode
    const response = await fetch(videoElement.src);
    const arrayBuffer = await response.arrayBuffer();
    const tempCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);

    // Encode to WAV format
    const wavBlob = this.audioBufferToWav(audioBuffer);
    const url = URL.createObjectURL(wavBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `videoforge-audio-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },

  audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
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
    
    // RIFF chunk
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    this.writeString(view, 8, 'WAVE');
    
    // fmt chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    
    // data chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    
    // Write PCM samples
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
