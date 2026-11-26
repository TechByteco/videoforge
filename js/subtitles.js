/**
 * VideoForge Pro - Subtitle Engine
 * Hormozi/MrBeast viral presets, karaoke word bounce, auto-emoji injection,
 * real speech recognition, script-align, VAD segments, SRT/VTT export, and translation.
 */

export const SubtitlesManager = {
  cues: [],

  fonts: [
    { id: 'Anton', name: 'Anton — Hormozi Viral Impact' },
    { id: 'Archivo Black', name: 'Archivo Black — Heavy Shorts' },
    { id: 'Bangers', name: 'Bangers — YouTube Comic Pop' },
    { id: 'Luckiest Guy', name: 'Luckiest Guy — MrBeast Chunky' },
    { id: 'Bebas Neue', name: 'Bebas Neue — Condensed Pro' },
    { id: 'Montserrat', name: 'Montserrat — Bold Creator' },
    { id: 'Poppins', name: 'Poppins — Modern YouTube' },
    { id: 'Rubik', name: 'Rubik — Rounded Explainer' },
    { id: 'Oswald', name: 'Oswald — Vox Documentary' },
    { id: 'Plus Jakarta Sans', name: 'Plus Jakarta — Ali Abdaal Clean' },
    { id: 'Inter', name: 'Inter — MKBHD Minimalist' },
    { id: 'Space Grotesk', name: 'Space Grotesk — Tech SaaS' },
    { id: 'Syne', name: 'Syne — Editorial Display' },
    { id: 'Russo One', name: 'Russo One — Gaming & Sports' },
    { id: 'Bungee', name: 'Bungee — Urban Block' },
    { id: 'Righteous', name: 'Righteous — Podcast & Retro' },
    { id: 'Permanent Marker', name: 'Permanent Marker — Vlog Callout' },
    { id: 'Orbitron', name: 'Orbitron — Futuristic Sci-Fi' },
    { id: 'Cinzel', name: 'Cinzel — Epic Movie Trailer' },
    { id: 'Playfair Display', name: 'Playfair Display — Luxury Serif' },
    { id: 'Instrument Sans', name: 'Instrument Sans — Studio Clean' },
    { id: 'DM Mono', name: 'DM Mono — Code & Technical' },
    { id: 'Caveat', name: 'Caveat — Handwritten Story' }
  ],

  motionPresets: [
    { id: 'pop-bounce', name: 'TikTok Pop-Up Bounce' },
    { id: 'karaoke', name: 'Karaoke Word Highlight' },
    { id: 'hormozi-bounce', name: 'Alex Hormozi Viral Bounce' },
    { id: 'mrbeast-glow', name: 'MrBeast Neon Pop' },
    { id: 'fade-slide', name: 'Cinematic Fade Slide' },
    { id: 'neon-pulse', name: 'Neon Cyber Pulse' },
    { id: 'glitch-shake', name: 'Digital Glitch Shake' },
    { id: 'none', name: 'Static Clean' }
  ],

  captionPresets: [
    {
      id: 'hormozi',
      name: '⚡ Alex Hormozi Viral',
      style: {
        font: 'Anton',
        size: 38,
        weight: '900',
        color: '#e8ff47',
        highlightColor: '#47ffb8',
        strokeColor: '#000000',
        strokeWidth: 5,
        showBadge: true,
        backgroundColor: 'rgba(0,0,0,0.85)',
        positionY: 0.82,
        motion: 'hormozi-bounce',
        uppercase: true,
        burnIn: true
      }
    },
    {
      id: 'mrbeast',
      name: '🔥 MrBeast Pop & Glow',
      style: {
        font: 'Bebas Neue',
        size: 42,
        weight: '900',
        color: '#ffd600',
        highlightColor: '#00e5ff',
        strokeColor: '#000000',
        strokeWidth: 6,
        showBadge: false,
        backgroundColor: 'transparent',
        positionY: 0.80,
        motion: 'mrbeast-glow',
        uppercase: true,
        burnIn: true
      }
    },
    {
      id: 'neon-cyber',
      name: '🤖 Cyber Neon Assist',
      style: {
        font: 'Orbitron',
        size: 32,
        weight: '700',
        color: '#00f7ff',
        highlightColor: '#ff007f',
        strokeColor: '#090918',
        strokeWidth: 4,
        showBadge: true,
        backgroundColor: 'rgba(10, 10, 24, 0.90)',
        positionY: 0.84,
        motion: 'neon-pulse',
        uppercase: false,
        burnIn: true
      }
    },
    {
      id: 'minimal-editorial',
      name: '✨ Minimal Clean Editorial',
      style: {
        font: 'Instrument Sans',
        size: 30,
        weight: '600',
        color: '#f4f4fb',
        highlightColor: '#e8ff47',
        strokeColor: '#000000',
        strokeWidth: 2,
        showBadge: true,
        backgroundColor: 'rgba(20,20,30,0.75)',
        positionY: 0.86,
        motion: 'fade-slide',
        uppercase: false,
        burnIn: true
      }
    },
    {
      id: 'youtube-bangers',
      name: '💥 YouTube Bangers Pop',
      style: {
        font: 'Bangers',
        size: 46,
        weight: '700',
        color: '#ffffff',
        highlightColor: '#ff3b30',
        strokeColor: '#000000',
        strokeWidth: 7,
        showBadge: false,
        backgroundColor: 'transparent',
        positionY: 0.80,
        motion: 'hormozi-bounce',
        uppercase: true,
        burnIn: true
      }
    },
    {
      id: 'vox-doc',
      name: '📰 Vox Documentary',
      style: {
        font: 'Oswald',
        size: 34,
        weight: '700',
        color: '#fef08a',
        highlightColor: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 3,
        showBadge: true,
        backgroundColor: 'rgba(15, 15, 18, 0.90)',
        positionY: 0.85,
        motion: 'fade-slide',
        uppercase: true,
        burnIn: true
      }
    },
    {
      id: 'ali-clean',
      name: '🎥 Ali Abdaal Clean',
      style: {
        font: 'Plus Jakarta Sans',
        size: 30,
        weight: '800',
        color: '#ffffff',
        highlightColor: '#38bdf8',
        strokeColor: '#000000',
        strokeWidth: 3,
        showBadge: true,
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        positionY: 0.84,
        motion: 'karaoke',
        uppercase: false,
        burnIn: true
      }
    },
    {
      id: 'cinema-trailer',
      name: '🎬 Cinema Trailer Serif',
      style: {
        font: 'Cinzel',
        size: 34,
        weight: '900',
        color: '#f8fafc',
        highlightColor: '#fbbf24',
        strokeColor: '#000000',
        strokeWidth: 3,
        showBadge: false,
        backgroundColor: 'transparent',
        positionY: 0.86,
        motion: 'fade-slide',
        uppercase: true,
        burnIn: true
      }
    }
  ],

  style: {
    font: 'Anton',
    size: 36,
    weight: '900',
    color: '#e8ff47',
    highlightColor: '#47ffb8',
    strokeColor: '#000000',
    strokeWidth: 4,
    showBadge: true,
    backgroundColor: 'rgba(0,0,0,0.85)',
    positionY: 0.84,
    motion: 'hormozi-bounce',
    uppercase: true,
    burnIn: true
  },

  _recognitionInst: null,
  _recognizing: false,
  _cueIdCounter: 1,

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

  applyCaptionPreset(presetId) {
    const p = this.captionPresets.find(x => x.id === presetId);
    if (p) {
      this.style = { ...this.style, ...p.style };
      return true;
    }
    return false;
  },

  /**
   * Auto-Emoji keyword injection based on sentence semantics
   */
  injectAutoEmojis() {
    const emojiDict = [
      { rx: /\b(money|rich|dollar|cash|profit|revenue|crypto|invest)\b/gi, emoji: '💰' },
      { rx: /\b(fire|hot|lit|viral|crazy|insane)\b/gi, emoji: '🔥' },
      { rx: /\b(rocket|moon|growth|grow|launch|fast|scale)\b/gi, emoji: '🚀' },
      { rx: /\b(shock|omg|unbelievable|impossible|no way)\b/gi, emoji: '😱' },
      { rx: /\b(idea|think|smart|secret|strategy)\b/gi, emoji: '💡' },
      { rx: /\b(win|winner|first|champion|victory|success)\b/gi, emoji: '🏆' },
      { rx: /\b(energy|power|strong|action|ready)\b/gi, emoji: '⚡' },
      { rx: /\b(warning|danger|stop|alert|mistake)\b/gi, emoji: '⚠️' },
      { rx: /\b(love|heart|best|favorite)\b/gi, emoji: '❤️' },
      { rx: /\b(time|clock|wait|late|early)\b/gi, emoji: '⏱️' }
    ];

    let modifiedCount = 0;
    this.cues.forEach(cue => {
      let text = cue.text;
      emojiDict.forEach(({ rx, emoji }) => {
        if (rx.test(text) && !text.includes(emoji)) {
          text = `${text} ${emoji}`;
          modifiedCount++;
        }
      });
      cue.text = text.trim();
    });
    return modifiedCount;
  },

  /**
   * Search and replace across all subtitle cues
   */
  searchAndReplace(searchStr, replaceStr, caseSensitive = false) {
    if (!searchStr) return 0;
    let count = 0;
    const flags = caseSensitive ? 'g' : 'gi';
    const rx = new RegExp(searchStr, flags);

    this.cues.forEach(c => {
      if (rx.test(c.text)) {
        c.text = c.text.replace(rx, replaceStr);
        count++;
      }
    });
    return count;
  },

  /**
   * VAD: audio energy segmenter
   */
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

    if (!segs.length) {
      const dur = videoDuration || 20;
      for (let t = 0.5; t < dur - 1; t += 4) {
        segs.push({ start: +t.toFixed(2), end: +(Math.min(dur, t + 3.5)).toFixed(2) });
      }
    }
    return segs;
  },

  _whisperPipelines: {},
  _whisperWorker: null,
  _whisperJobId: 0,
  _whisperReject: null,

  cancelWhisperTranscription() {
    if (this._whisperWorker) {
      this._whisperWorker.terminate();
      this._whisperWorker = null;
    }
    if (this._whisperReject) {
      this._whisperReject(new Error('Transcription cancelled by user.'));
      this._whisperReject = null;
    }
  },

  /**
   * Extract and resample audio from a File or URL into 16kHz Mono Float32Array PCM for Whisper AI
   */
  async extract16kMonoPCM(mediaFile, fallbackUrl) {
    let arrayBuffer;
    if (mediaFile && typeof mediaFile.arrayBuffer === 'function') {
      arrayBuffer = await mediaFile.arrayBuffer();
    } else if (fallbackUrl) {
      const resp = await fetch(fallbackUrl);
      arrayBuffer = await resp.arrayBuffer();
    } else {
      throw new Error('No audio or video source loaded.');
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const decodeCtx = new AudioCtx();
    let decoded;
    try {
      decoded = await decodeCtx.decodeAudioData(arrayBuffer);
    } finally {
      if (decodeCtx.close) decodeCtx.close().catch(() => {});
    }

    const targetSr = 16000;
    const frameCount = Math.max(1, Math.ceil(decoded.duration * targetSr));
    const offlineCtx = new OfflineAudioContext(1, frameCount, targetSr);
    const src = offlineCtx.createBufferSource();
    src.buffer = decoded;
    src.connect(offlineCtx.destination);
    src.start(0);
    const rendered = await offlineCtx.startRendering();
    const rawPcm = rendered.getChannelData(0);
    return {
      pcm: this._normalizePCM(rawPcm),
      duration: decoded.duration
    };
  },

  /**
   * Remove DC offset and peak-normalize PCM to 0.95 so quiet microphone recordings are heard clearly by Whisper
   */
  _normalizePCM(pcm) {
    if (!pcm || !pcm.length) return pcm;
    let sum = 0;
    for (let i = 0; i < pcm.length; i++) sum += pcm[i];
    const mean = sum / pcm.length;

    let maxAbs = 0;
    const out = new Float32Array(pcm.length);
    for (let i = 0; i < pcm.length; i++) {
      const v = pcm[i] - mean;
      out[i] = v;
      const a = Math.abs(v);
      if (a > maxAbs) maxAbs = a;
    }

    if (maxAbs > 0.001 && maxAbs < 0.9) {
      const gain = Math.min(25, 0.95 / maxAbs);
      for (let i = 0; i < out.length; i++) {
        out[i] = Math.max(-1, Math.min(1, out[i] * gain));
      }
    }
    return out;
  },

  /**
   * Segment 16kHz PCM into active speech windows for fallback chunked Whisper decoding
   */
  _segmentPCMByEnergy(pcm, sr = 16000, totalDur = 30) {
    const win = Math.floor(sr * 0.1); // 100ms
    const energies = [];
    for (let i = 0; i < pcm.length - win; i += win) {
      let s = 0;
      for (let j = 0; j < win; j++) s += pcm[i + j] * pcm[i + j];
      energies.push({ t: i / sr, e: Math.sqrt(s / win) });
    }
    const avg = energies.reduce((a, b) => a + b.e, 0) / (energies.length || 1);
    const thr = Math.max(0.015, avg * 0.65);

    const segs = [];
    let inSp = false, st = 0;
    for (const p of energies) {
      if (!inSp && p.e > thr) { inSp = true; st = Math.max(0, p.t - 0.15); }
      else if (inSp && (p.e < thr || (p.t - st) >= 14)) {
        const en = Math.min(totalDur, p.t + 0.25);
        if (en - st >= 0.6) segs.push({ start: +st.toFixed(2), end: +en.toFixed(2) });
        inSp = false;
      }
    }
    if (inSp) segs.push({ start: +st.toFixed(2), end: +totalDur.toFixed(2) });

    if (!segs.length) {
      for (let t = 0; t < totalDur; t += 10) {
        const en = Math.min(totalDur, t + 10);
        if (en - t >= 0.8) segs.push({ start: +t.toFixed(2), end: +en.toFixed(2) });
      }
    }
    return segs;
  },

  /**
   * Split long Whisper chunks into punchy, readable 4-7 word caption cues with interpolated timestamps
   */
  _splitChunkIntoReadableCues(start, end, text, maxWords = 6) {
    const clean = (text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return;
    // Filter out pure Whisper non-speech tokens like [BLANK_AUDIO] or (silence)
    if (/^[\[(]\s*(blank_audio|silence|no\s*speech)\s*[\])]$/i.test(clean)) return;

    const words = clean.split(' ');
    const safeEnd = Math.max(start + 0.4, end);
    if (words.length <= maxWords) {
      this.addCue(start, safeEnd, clean);
      return;
    }

    const totalWords = words.length;
    const totalDur = safeEnd - start;
    let idx = 0;
    while (idx < totalWords) {
      const slice = words.slice(idx, idx + maxWords);
      const fracStart = idx / totalWords;
      const fracEnd = Math.min(1, (idx + slice.length) / totalWords);
      const cStart = start + fracStart * totalDur;
      const cEnd = Math.max(cStart + 0.35, start + fracEnd * totalDur);
      this.addCue(cStart, cEnd, slice.join(' '));
      idx += maxWords;
    }
  },

  /**
   * Real On-Device Whisper AI Speech-to-Text Transcription (Runs in background Web Worker)
   */
  async transcribeWithWhisperAI({ mediaFile, mediaUrl, language = 'en-US', duration = 30, maxWordsPerCue = 6, onProgress, onPartialCues }) {
    // Cancel any previous running job
    if (this._whisperReject) {
      this._whisperReject(new Error('Superseded by new transcription job.'));
      this._whisperReject = null;
    }

    onProgress?.('Extracting & resampling 16kHz audio track…', 10);
    const { pcm, duration: audioDur } = await this.extract16kMonoPCM(mediaFile, mediaUrl);
    const effectiveDur = audioDur || duration || 30;

    this.cues = [];
    const jobId = ++this._whisperJobId;

    if (!this._whisperWorker) {
      this._whisperWorker = new Worker('./js/whisper-worker.js', { type: 'module' });
    }
    const worker = this._whisperWorker;

    return new Promise((resolve, reject) => {
      this._whisperReject = reject;

      const cleanup = () => {
        worker.removeEventListener('message', onMsg);
        worker.removeEventListener('error', onErr);
        if (this._whisperReject === reject) this._whisperReject = null;
      };

      const onMsg = (ev) => {
        const msg = ev.data;
        if (!msg || msg.jobId !== jobId) return;

        if (msg.type === 'progress') {
          onProgress?.(msg.message, msg.pct);
        } else if (msg.type === 'partial') {
          for (const c of (msg.cues || [])) {
            this.addCue(c.start, c.end, c.text);
          }
          onPartialCues?.(this.cues);
        } else if (msg.type === 'done') {
          cleanup();
          onProgress?.('Formatting & syncing subtitle cues…', 98);
          resolve(this.cues);
        } else if (msg.type === 'error') {
          cleanup();
          reject(new Error(msg.error || 'Whisper AI worker failed.'));
        }
      };

      const onErr = (err) => {
        cleanup();
        this._whisperWorker = null;
        reject(new Error(err?.message || 'Whisper Web Worker crashed.'));
      };

      worker.addEventListener('message', onMsg);
      worker.addEventListener('error', onErr);

      // Transfer PCM buffer zero-copy to the background worker
      worker.postMessage(
        {
          type: 'transcribe',
          jobId,
          pcmBuffer: pcm.buffer,
          duration: effectiveDur,
          language,
          maxWordsPerCue
        },
        [pcm.buffer]
      );
    });
  },

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

  startLiveTranscription({ language = 'en-US', onResult, onStatus, onComplete, onError }) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      onError?.('Web Speech API not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = language || 'en-US';
    this._recognitionInst = r;
    this._recognizing = true;

    let startEpoch = Date.now();
    let interimMap = {};
    this._pendingInterim = '';
    this._onLiveComplete = onComplete;

    onStatus?.(`Listening in English (${r.lang})… Speak clearly into your microphone`, 30);

    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript.trim();
        if (!t) continue;
        if (e.results[i].isFinal) {
          const curTime = window.Player && Player.isPlaying ? Player.getCurrentTime() : ((Date.now() - startEpoch) / 1000);
          const start = Math.max(0, parseFloat((curTime - 2.8).toFixed(2)));
          const end = Math.max(start + 0.6, parseFloat(curTime.toFixed(2)));
          this.addCue(start, end, t);
          onResult?.(this.cues);
          delete interimMap[i];
          this._pendingInterim = '';
        } else {
          interimMap[i] = t;
          this._pendingInterim = Object.values(interimMap).join(' ').trim();
          onStatus?.('Hearing: ' + this._pendingInterim, 60);
        }
      }
    };

    r.onerror = (e) => {
      if (e.error === 'no-speech' && this._recognizing) {
        return; // Keep listening across pauses
      }
      this._recognizing = false;
      const errMap = {
        'no-speech': 'No speech detected. Please check your microphone volume.',
        'not-allowed': 'Microphone permission denied. Allow microphone access in your browser.',
        'audio-capture': 'No microphone was detected on this system.',
        'network': 'Network error connecting to speech recognition service.'
      };
      onError?.(errMap[e.error] || e.error);
    };

    r.onend = () => {
      if (this._recognizing) {
        // Auto-restart continuous listening if user hasn't clicked Stop
        try {
          r.start();
          return;
        } catch (err) {}
      }
      onComplete?.(this.cues);
    };

    try {
      r.start();
    } catch (err) {
      this._recognizing = false;
      onError?.(err.message || 'Could not start speech recognition');
    }
  },

  stopLiveTranscription() {
    this._recognizing = false;
    if (this._pendingInterim) {
      const curTime = window.Player && Player.isPlaying ? Player.getCurrentTime() : (this.cues.length ? this.cues[this.cues.length - 1].end + 2.5 : 2.5);
      const start = Math.max(0, parseFloat((curTime - 2.5).toFixed(2)));
      this.addCue(start, Math.max(start + 0.6, parseFloat(curTime.toFixed(2))), this._pendingInterim);
      this._pendingInterim = '';
    }
    if (this._recognitionInst) {
      try { this._recognitionInst.stop(); } catch (e) {}
    }
  },

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
      await new Promise(res => setTimeout(res, 300));
    }
    return this.cues;
  },

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
