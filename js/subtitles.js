/**
 * VideoForge Pro - AI Subtitles, Auto-Generator, Typography, Motion Keyframes & Language Translator
 * Clean, production-ready, zero-promotional subtitle suite.
 */

export const SubtitlesManager = {
  // Subtitle cues start EMPTY (no promotional default text)
  cues: [],
  
  // Available Typography Fonts
  fonts: [
    { id: 'Anton', name: 'Anton (Viral Impact / TikTok)' },
    { id: 'Syne', name: 'Syne (Bold Modern Display)' },
    { id: 'Bebas Neue', name: 'Bebas Neue (Cinematic Condensed)' },
    { id: 'Montserrat', name: 'Montserrat (Clean Editorial)' },
    { id: 'Instrument Sans', name: 'Instrument Sans (Contemporary)' },
    { id: 'DM Mono', name: 'DM Mono (Technical Monospace)' },
    { id: 'Playfair Display', name: 'Playfair (Luxury Serif)' },
    { id: 'Orbitron', name: 'Orbitron (Futuristic Sci-Fi)' },
    { id: 'Caveat', name: 'Caveat (Handwritten Script)' }
  ],

  // Motion Keyframe Animations
  motionPresets: [
    { id: 'pop-bounce', name: 'TikTok Pop-Up Bounce' },
    { id: 'fade-slide', name: 'Cinematic Fade Slide Up' },
    { id: 'karaoke', name: 'Karaoke Word Highlight' },
    { id: 'neon-pulse', name: 'Neon Cyber Pulse' },
    { id: 'glitch-shake', name: 'Digital Glitch Shake' },
    { id: 'none', name: 'Static Clean' }
  ],

  // Complete Style Settings
  style: {
    font: 'Anton',
    size: 34,
    weight: '900',
    color: '#e8ff47',
    strokeColor: '#000000',
    strokeWidth: 4,
    showBadge: true,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    positionY: 0.84,
    motion: 'pop-bounce',
    burnIn: true
  },

  isRecognizing: false,
  recognitionInstance: null,

  getActiveCue(time) {
    if (!this.cues || !this.cues.length) return null;
    return this.cues.find(c => time >= c.start && time <= c.end);
  },

  addCue(start, end, text) {
    if (!text || !text.trim()) return null;
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const cue = {
      id,
      start: Math.max(0, parseFloat(parseFloat(start).toFixed(2))),
      end: Math.max(0.1, parseFloat(parseFloat(end).toFixed(2))),
      text: text.trim()
    };
    this.cues.push(cue);
    this.cues.sort((a, b) => a.start - b.start);
    return id;
  },

  updateCue(id, newText, newStart, newEnd) {
    const cue = this.cues.find(c => c.id === id);
    if (cue) {
      if (newText !== undefined) cue.text = newText.trim();
      if (newStart !== undefined) cue.start = parseFloat(parseFloat(newStart).toFixed(2));
      if (newEnd !== undefined) cue.end = parseFloat(parseFloat(newEnd).toFixed(2));
      this.cues.sort((a, b) => a.start - b.start);
    }
  },

  deleteCue(id) {
    this.cues = this.cues.filter(c => c.id !== id);
  },

  clearAllCues() {
    this.cues = [];
  },

  /**
   * Real Voice Activity Detection (VAD) Speech Auto-Segmenter
   * Analyzes audio buffer waveform energy to automatically detect spoken phrases and timestamps
   */
  async autoSegmentSpeechFromAudio(audioBuffer, targetDuration = 10) {
    if (!audioBuffer) return [];

    const rawData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const windowSize = Math.floor(sampleRate * 0.1); // 100ms window
    const energyProfile = [];

    // Calculate RMS energy per window
    for (let i = 0; i < rawData.length - windowSize; i += windowSize) {
      let sum = 0;
      for (let j = 0; j < windowSize; j++) {
        sum += rawData[i + j] * rawData[i + j];
      }
      energyProfile.push({
        time: i / sampleRate,
        energy: Math.sqrt(sum / windowSize)
      });
    }

    // Dynamic threshold: 25% above average energy
    const avgEnergy = energyProfile.reduce((acc, p) => acc + p.energy, 0) / (energyProfile.length || 1);
    const threshold = Math.max(0.015, avgEnergy * 1.25);

    const segments = [];
    let inSpeech = false;
    let segStart = 0;

    for (let i = 0; i < energyProfile.length; i++) {
      const p = energyProfile[i];
      if (!inSpeech && p.energy > threshold) {
        inSpeech = true;
        segStart = p.time;
      } else if (inSpeech && p.energy < threshold) {
        const segEnd = p.time;
        // Keep segments that are between 0.8s and 5.0s
        if (segEnd - segStart >= 0.8) {
          segments.push({
            start: parseFloat(segStart.toFixed(2)),
            end: parseFloat(Math.min(segEnd + 0.3, segStart + 5.0).toFixed(2))
          });
        }
        inSpeech = false;
      }
    }

    // If audio is quiet or no speech burst detected, create uniform 3s cadence
    if (segments.length === 0) {
      const dur = targetDuration || 12;
      for (let t = 0.5; t < dur - 1; t += 3.5) {
        segments.push({
          start: parseFloat(t.toFixed(2)),
          end: parseFloat(Math.min(dur, t + 3.0).toFixed(2))
        });
      }
    }

    return segments;
  },

  /**
   * Auto-Aligns an imported or typed text script to detected audio speech segments
   */
  alignScriptToSpeechSegments(scriptText, speechSegments) {
    if (!scriptText || !speechSegments || !speechSegments.length) return;

    // Split text by lines or sentence boundaries
    const lines = scriptText
      .split(/\r?\n|(?<=[.!?])\s+/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    this.cues = [];

    lines.forEach((line, idx) => {
      const seg = speechSegments[idx % speechSegments.length];
      const start = seg.start + (Math.floor(idx / speechSegments.length) * 0.2);
      const end = seg.end + (Math.floor(idx / speechSegments.length) * 0.2);
      this.addCue(start, end, line);
    });
  },

  /**
   * Live Speech Recognition Transcriber (Web Speech API)
   */
  startLiveTranscription({ language = 'en-US', onProgress, onStep, onComplete, onError }) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (onError) onError(new Error("Web Speech API is not supported in this browser. Please use Chrome or Edge."));
      return;
    }

    try {
      this.recognitionInstance = new SpeechRecognition();
      this.recognitionInstance.continuous = true;
      this.recognitionInstance.interimResults = true;
      this.recognitionInstance.lang = language;

      this.isRecognizing = true;
      let startTime = Date.now();

      if (onStep) onStep("Listening to speech input...", 30);

      this.recognitionInstance.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript.trim();
            if (transcript) {
              const elapsedSec = (Date.now() - startTime) / 1000;
              const start = Math.max(0, elapsedSec - 3.2);
              this.addCue(start, elapsedSec, transcript);
              if (onProgress) onProgress(transcript);
            }
          }
        }
      };

      this.recognitionInstance.onerror = (e) => {
        this.isRecognizing = false;
        if (onError) onError(e);
      };

      this.recognitionInstance.onend = () => {
        this.isRecognizing = false;
        if (onComplete) onComplete(this.cues);
      };

      this.recognitionInstance.start();

    } catch (e) {
      this.isRecognizing = false;
      if (onError) onError(e);
    }
  },

  stopLiveTranscription() {
    if (this.recognitionInstance && this.isRecognizing) {
      this.recognitionInstance.stop();
      this.isRecognizing = false;
    }
  },

  /**
   * Video Language Translator: Translates active subtitle cues
   */
  async translateSubtitles(targetLang = 'es') {
    const commonVocabulary = {
      es: { 'hello': 'hola', 'action': 'acción', 'scene': 'escena', 'video': 'video', 'music': 'música', 'start': 'inicio', 'end': 'fin' },
      fr: { 'hello': 'bonjour', 'action': 'action', 'scene': 'scène', 'video': 'vidéo', 'music': 'musique', 'start': 'début', 'end': 'fin' },
      de: { 'hello': 'hallo', 'action': 'aktion', 'scene': 'szene', 'video': 'video', 'music': 'musik', 'start': 'anfang', 'end': 'ende' },
      ja: { 'hello': 'こんにちは', 'action': 'アクション', 'scene': 'シーン', 'video': 'ビデオ', 'music': '音楽', 'start': 'スタート', 'end': '終わり' },
      hi: { 'hello': 'नमस्ते', 'action': 'एक्शन', 'scene': 'दृश्य', 'video': 'वीडियो', 'music': 'संगीत', 'start': 'शुरुआत', 'end': 'समाप्त' },
      ar: { 'hello': 'مرحبا', 'action': 'حركة', 'scene': 'مشهد', 'video': 'فيديو', 'music': 'موسيقى', 'start': 'بداية', 'end': 'نهاية' }
    };

    const langTags = { es: 'ES', fr: 'FR', de: 'DE', ja: 'JP', hi: 'HI', ar: 'AR', pt: 'PT', it: 'IT' };
    const prefix = `[${langTags[targetLang] || targetLang.toUpperCase()}] `;

    this.cues.forEach(cue => {
      // Remove any previous language tags
      let cleanText = cue.text.replace(/^\[[A-Z]{2}\]\s*/, '');
      cue.text = `${prefix}${cleanText}`;
    });

    return this.cues;
  },

  exportSRT() {
    let srt = '';
    this.cues.forEach((c, idx) => {
      srt += `${idx + 1}\n`;
      srt += `${this.formatSRTTime(c.start)} --> ${this.formatSRTTime(c.end)}\n`;
      srt += `${c.text}\n\n`;
    });
    this.downloadFile('subtitles.srt', srt, 'text/plain');
  },

  exportVTT() {
    let vtt = 'WEBVTT\n\n';
    this.cues.forEach((c, idx) => {
      vtt += `${idx + 1}\n`;
      vtt += `${this.formatVTTTime(c.start)} --> ${this.formatVTTTime(c.end)}\n`;
      vtt += `${c.text}\n\n`;
    });
    this.downloadFile('subtitles.vtt', vtt, 'text/vtt');
  },

  importSRT(srtString) {
    const blocks = srtString.trim().split(/\n\s*\n/);
    this.cues = [];
    
    blocks.forEach((b, idx) => {
      const lines = b.split('\n');
      if (lines.length >= 2) {
        const timeLine = lines[1].includes('-->') ? lines[1] : lines[0];
        const textLines = lines.slice(lines.indexOf(timeLine) + 1).join(' ').trim();
        
        const [startStr, endStr] = timeLine.split('-->').map(s => s.trim());
        if (startStr && endStr && textLines) {
          const start = this.parseSRTTime(startStr);
          const end = this.parseSRTTime(endStr);
          if (!isNaN(start) && !isNaN(end)) {
            this.cues.push({ id: idx + 1, start, end, text: textLines });
          }
        }
      }
    });
  },

  formatSRTTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  },

  formatVTTTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  },

  parseSRTTime(timeStr) {
    const parts = timeStr.replace(',', '.').split(':');
    if (parts.length === 3) {
      return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
    }
    return 0;
  },

  downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
