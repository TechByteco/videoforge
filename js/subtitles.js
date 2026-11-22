/**
 * VideoForge Pro - Subtitle Engine
 * Real speech recognition (Web Speech API), script-align, VAD segments, SRT/VTT export, translation via MyMemory API.
 */

export const SubtitlesManager = {
  cues: [],

  fonts: [
    { id: 'Anton', name: 'Anton — Viral Impact' },
    { id: 'Syne', name: 'Syne — Bold Modern' },
    { id: 'Bebas Neue', name: 'Bebas Neue — Cinematic' },
    { id: 'Montserrat', name: 'Montserrat — Editorial' },
    { id: 'Instrument Sans', name: 'Instrument Sans — Clean' },
    { id: 'DM Mono', name: 'DM Mono — Technical' },
    { id: 'Playfair Display', name: 'Playfair — Luxury Serif' },
    { id: 'Orbitron', name: 'Orbitron — Futuristic' },
    { id: 'Caveat', name: 'Caveat — Handwritten' }
  ],

  motionPresets: [
    { id: 'pop-bounce', name: 'TikTok Pop-Up Bounce' },
    { id: 'fade-slide', name: 'Cinematic Fade Slide' },
    { id: 'karaoke', name: 'Karaoke Word Highlight' },
    { id: 'neon-pulse', name: 'Neon Pulse' },
    { id: 'glitch-shake', name: 'Glitch Shake' },
    { id: 'none', name: 'Static Clean' }
  ],

  style: {
    font: 'Anton',
    size: 36,
    weight: '900',
    color: '#e8ff47',
    strokeColor: '#000000',
    strokeWidth: 4,
    showBadge: true,
    backgroundColor: 'rgba(0,0,0,0.85)',
    positionY: 0.84,
    motion: 'pop-bounce',
    burnIn: true
  },

  _recognitionInst: null,
  _recognizing: false,
  _cueIdCounter: 1,

  // ── Helpers ──────────────────────────────────────────────────────────────

  _id() { return this._cueIdCounter++; },

  getActiveCue(t) {
    if (!this.cues.length) return null;
    return this.cues.find(c => t >= c.start && t <= c.end) || null;
  },

  addCue(start, end, text) {
    const cue = { id: this._id(), start: +start.toFixed(2), end: +end.toFixed(2), text: (text || '').trim() };
    this.cues.push(cue);
    this.cues.sort((a, b) => a.start - b.start);
    return cue.id;
  },

  updateCue(id, text, start, end) {
    const c = this.cues.find(c => c.id === id);
    if (!c) return;
    if (text !== undefined) c.text = text.trim();
    if (start !== undefined) c.start = +parseFloat(start).toFixed(2);
    if (end !== undefined) c.end = +parseFloat(end).toFixed(2);
    this.cues.sort((a, b) => a.start - b.start);
  },

  deleteCue(id) { this.cues = this.cues.filter(c => c.id !== id); },
  clearAllCues() { this.cues = []; },

  nudgeCues(deltaSec) {
    if (!this.cues || !this.cues.length) return;
    this.cues.forEach(c => {
      c.start = Math.max(0, parseFloat((c.start + deltaSec).toFixed(2)));
      c.end = Math.max(0.1, parseFloat((c.end + deltaSec).toFixed(2)));
    });
    this.cues.sort((a, b) => a.start - b.start);
  },

  // ── VAD: audio energy segmenter (purely for timestamp detection) ─────────

  async autoSegmentSpeechFromAudio(audioBuffer, videoDuration = 30) {
    const ch = audioBuffer.getChannelData(0);
    const sr = audioBuffer.sampleRate;
    const WIN = Math.floor(sr * 0.08); // 80ms window
    const energies = [];
    for (let i = 0; i < ch.length - WIN; i += WIN) {
      let s = 0;
      for (let j = 0; j < WIN; j++) s += ch[i + j] * ch[i + j];
      energies.push({ t: i / sr, e: Math.sqrt(s / WIN) });
    }
    const avg = energies.reduce((a, p) => a + p.e, 0) / (energies.length || 1);
    const threshold = Math.max(0.012, avg * 1.3);

    const segs = [];
    let inSpeech = false, segStart = 0;
    for (const p of energies) {
      if (!inSpeech && p.e > threshold) { inSpeech = true; segStart = p.t; }
      else if (inSpeech && p.e < threshold) {
        const segEnd = p.t;
        if (segEnd - segStart >= 0.5) {
          segs.push({ start: +segStart.toFixed(2), end: +Math.min(segEnd + 0.25, segStart + 6).toFixed(2) });
        }
        inSpeech = false;
      }
    }
    if (inSpeech) segs.push({ start: +segStart.toFixed(2), end: +Math.min(videoDuration, segStart + 4).toFixed(2) });

    // If no speech detected, make uniform cadence
    if (!segs.length) {
      const dur = videoDuration || 20;
      for (let t = 0.5; t < dur - 1; t += 4) {
        segs.push({ start: +t.toFixed(2), end: +(Math.min(dur, t + 3.5)).toFixed(2) });
      }
    }
    return segs;
  },

  // ── Script Align Mode ───────────────────────────────────────────────────

  alignScriptToSegments(scriptText, segments) {
    const lines = scriptText.split(/\r?\n|((?<=[.!?])\s+)/)
      .map(l => (l || '').trim()).filter(l => l.length > 2);
    this.cues = [];
    lines.forEach((line, i) => {
      const seg = segments[i % segments.length];
      const offset = Math.floor(i / segments.length) * 0.1;
      this.addCue(seg.start + offset, seg.end + offset, line);
    });
  },

  // ── Live Speech Recognition ─────────────────────────────────────────────

  startLiveTranscription({ language = 'en-US', onResult, onStatus, onComplete, onError }) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      onError?.('Web Speech API not supported. Use Chrome or Edge.');
      return;
    }
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = language;
    this._recognitionInst = r;
    this._recognizing = true;

    let startEpoch = Date.now();
    let interimMap = {}; // resultIndex → interim text

    onStatus?.('Listening… Speak clearly into the microphone', 30);

    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript.trim();
        if (e.results[i].isFinal) {
          const elapsed = (Date.now() - startEpoch) / 1000;
          const start = Math.max(0, elapsed - 3.5);
          this.addCue(start, elapsed, t);
          onResult?.(this.cues);
          delete interimMap[i];
        } else {
          interimMap[i] = t;
          onStatus?.('Hearing: ' + Object.values(interimMap).join(' '), 60);
        }
      }
    };

    r.onerror = (e) => {
      this._recognizing = false;
      onError?.(e.error === 'no-speech' ? 'No speech detected. Check microphone.' : e.error);
    };

    r.onend = () => {
      this._recognizing = false;
      onComplete?.(this.cues);
    };

    r.start();
  },

  stopLiveTranscription() {
    if (this._recognitionInst && this._recognizing) {
      this._recognitionInst.stop();
      this._recognizing = false;
    }
  },

  // ── Translation via MyMemory free API ───────────────────────────────────

  async translateSubtitles(targetLang = 'es') {
    if (!this.cues.length) return;
    const langPair = `en|${targetLang}`;
    for (const cue of this.cues) {
      const cleanText = cue.text.replace(/^\[[A-Z]{2,3}\]\s*/, '');
      try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=${encodeURIComponent(langPair)}`;
        const r = await fetch(url);
        const data = await r.json();
        if (data.responseStatus === 200 && data.responseData?.translatedText) {
          cue.text = data.responseData.translatedText;
        }
      } catch (e) {
        console.warn('Translation failed for cue', cue.id, e);
      }
      // Rate limit: 1 request per 300ms to stay within free tier
      await new Promise(res => setTimeout(res, 300));
    }
    return this.cues;
  },

  // ── SRT / VTT Export & Import ─────────────────────────────────────────

  _srtTime(s) {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60),
      sec = Math.floor(s % 60), ms = Math.floor((s % 1) * 1000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')},${String(ms).padStart(3,'0')}`;
  },

  _vttTime(s) { return this._srtTime(s).replace(',', '.'); },

  exportSRT() {
    const srt = this.cues.map((c, i) =>
      `${i + 1}\n${this._srtTime(c.start)} --> ${this._srtTime(c.end)}\n${c.text}\n`
    ).join('\n');
    this._dl('subtitles.srt', srt, 'text/plain');
  },

  exportVTT() {
    const vtt = 'WEBVTT\n\n' + this.cues.map((c, i) =>
      `${i + 1}\n${this._vttTime(c.start)} --> ${this._vttTime(c.end)}\n${c.text}\n`
    ).join('\n');
    this._dl('subtitles.vtt', vtt, 'text/vtt');
  },

  importSRT(text) {
    this.cues = [];
    text.trim().split(/\n\s*\n/).forEach(block => {
      const lines = block.split('\n');
      const tl = lines.find(l => l.includes('-->'));
      if (!tl) return;
      const [a, b] = tl.split('-->').map(s => s.trim());
      const parse = (str) => {
        const [h, m, sm] = str.split(':');
        const [s, ms] = (sm || '0,0').replace('.', ',').split(',');
        return +h * 3600 + +m * 60 + +s + +(ms || 0) / 1000;
      };
      const textLines = lines.slice(lines.indexOf(tl) + 1).join(' ').trim();
      if (a && b && textLines) this.addCue(parse(a), parse(b), textLines);
    });
  },

  _dl(name, text, mime) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: mime }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};
