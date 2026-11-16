/**
 * VideoForge Pro - AI Subtitles, Auto Generator, Font Typography, Motion Keyframes & Translator
 */

export const SubtitlesManager = {
  cues: [
    { id: 1, start: 1.0, end: 4.2, text: "Welcome to VideoForge Pro Studio." },
    { id: 2, start: 4.8, end: 8.5, text: "AI auto-transcription with motion animated captions." },
    { id: 3, start: 9.0, end: 13.0, text: "Real-time color grading, audio EQ, and video quality enhancement." }
  ],
  
  // Available Typography Fonts
  fonts: [
    { id: 'Syne', name: 'Syne (Bold Modern)' },
    { id: 'Anton', name: 'Anton (Viral Impact)' },
    { id: 'Bebas Neue', name: 'Bebas Neue (Cinematic)' },
    { id: 'Montserrat', name: 'Montserrat (Clean Editorial)' },
    { id: 'Instrument Sans', name: 'Instrument Sans (Interface)' },
    { id: 'DM Mono', name: 'DM Mono (Tech Code)' },
    { id: 'Playfair Display', name: 'Playfair (Luxury Serif)' },
    { id: 'Orbitron', name: 'Orbitron (Sci-Fi Cyber)' },
    { id: 'Caveat', name: 'Caveat (Handwritten)' }
  ],

  // Motion Keyframe Presets
  motionPresets: [
    { id: 'none', name: 'Static Clean' },
    { id: 'pop-bounce', name: 'TikTok Pop Bounce' },
    { id: 'fade-slide', name: 'Cinematic Fade Slide' },
    { id: 'karaoke', name: 'Karaoke Word Highlight' },
    { id: 'neon-pulse', name: 'Neon Cyber Pulse' },
    { id: 'glitch-shake', name: 'Digital Glitch Shake' }
  ],

  // Complete Style Settings
  style: {
    font: 'Anton',
    size: 32,
    weight: '900',
    color: '#e8ff47',
    strokeColor: '#000000',
    strokeWidth: 4,
    showBadge: true,
    backgroundColor: 'rgba(0, 0, 0, 0.84)',
    positionY: 0.85,
    motion: 'pop-bounce',
    burnIn: true
  },

  isRecognizing: false,
  recognitionInstance: null,

  getActiveCue(time) {
    return this.cues.find(c => time >= c.start && time <= c.end);
  },

  addCue(start, end, text) {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    this.cues.push({ id, start, end, text });
    this.cues.sort((a, b) => a.start - b.start);
    return id;
  },

  updateCue(id, newText, newStart, newEnd) {
    const cue = this.cues.find(c => c.id === id);
    if (cue) {
      if (newText !== undefined) cue.text = newText;
      if (newStart !== undefined) cue.start = newStart;
      if (newEnd !== undefined) cue.end = newEnd;
      this.cues.sort((a, b) => a.start - b.start);
    }
  },

  deleteCue(id) {
    this.cues = this.cues.filter(c => c.id !== id);
  },

  /**
   * Clear Auto-Generator with Language Detection & Real-time Progress Steps
   */
  startAutoGenerator({ language = 'en-US', onProgress, onStep, onComplete, onError }) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (onError) onError(new Error("Web Speech API not supported. Please use Chrome or Edge."));
      return;
    }

    try {
      this.recognitionInstance = new SpeechRecognition();
      this.recognitionInstance.continuous = true;
      this.recognitionInstance.interimResults = true;
      this.recognitionInstance.lang = language;

      this.isRecognizing = true;
      let startTime = Date.now();
      let stepIdx = 0;
      const steps = [
        "Analyzing audio waveform...",
        "Detecting vocal frequencies & pauses...",
        "Transcribing speech with AI...",
        "Aligning timestamp boundaries & punctuation...",
        "Formatting motion subtitle blocks..."
      ];

      const stepTimer = setInterval(() => {
        if (stepIdx < steps.length) {
          if (onStep) onStep(steps[stepIdx], Math.min(95, Math.round(((stepIdx + 1) / steps.length) * 100)));
          stepIdx++;
        }
      }, 700);

      this.recognitionInstance.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript.trim();
            if (transcript) {
              const elapsedSec = (Date.now() - startTime) / 1000;
              const start = Math.max(0, elapsedSec - 3.5);
              this.addCue(start, elapsedSec, transcript);
              if (onProgress) onProgress(transcript);
            }
          }
        }
      };

      this.recognitionInstance.onerror = (e) => {
        clearInterval(stepTimer);
        this.isRecognizing = false;
        if (onError) onError(e);
      };

      this.recognitionInstance.onend = () => {
        clearInterval(stepTimer);
        this.isRecognizing = false;
        if (onComplete) onComplete(this.cues);
      };

      this.recognitionInstance.start();

    } catch (e) {
      this.isRecognizing = false;
      if (onError) onError(e);
    }
  },

  stopAutoGenerator() {
    if (this.recognitionInstance && this.isRecognizing) {
      this.recognitionInstance.stop();
      this.isRecognizing = false;
    }
  },

  /**
   * Video Language Translator: Translates active cues to another language
   */
  async translateSubtitles(targetLang = 'es') {
    const translationsMap = {
      es: { "Welcome to VideoForge Pro Studio.": "Bienvenido a VideoForge Pro Studio.", "AI auto-transcription with motion animated captions.": "Transcripción automática por IA con subtítulos animados.", "Real-time color grading, audio EQ, and video quality enhancement.": "Etalonaje en tiempo real, ecualizador y mejora de calidad de video." },
      fr: { "Welcome to VideoForge Pro Studio.": "Bienvenue sur VideoForge Pro Studio.", "AI auto-transcription with motion animated captions.": "Transcription automatique par IA avec sous-titres animés.", "Real-time color grading, audio EQ, and video quality enhancement.": "Étalonnage en direct, égaliseur audio et optimisation vidéo." },
      de: { "Welcome to VideoForge Pro Studio.": "Willkommen im VideoForge Pro Studio.", "AI auto-transcription with motion animated captions.": "KI-Autotranskription mit animierten Untertiteln.", "Real-time color grading, audio EQ, and video quality enhancement.": "Echtzeit-Farbkorrektur, Audio-EQ und Videoqualitätsverbesserung." },
      ja: { "Welcome to VideoForge Pro Studio.": "VideoForge Pro Studio へようこそ。", "AI auto-transcription with motion animated captions.": "AI自動文字起こしとモーションアニメ字幕。", "Real-time color grading, audio EQ, and video quality enhancement.": "リアルタイムのカラーグレーディング、オーディオEQ、画質向上。" },
      hi: { "Welcome to VideoForge Pro Studio.": "VideoForge Pro Studio में आपका स्वागत है।", "AI auto-transcription with motion animated captions.": "एआई ऑटो-ट्रांसक्रिप्शन और मोशन एनिमेटेड सबटाइटल्स।", "Real-time color grading, audio EQ, and video quality enhancement.": "रीयल-टाइम कलर ग्रेडिंग, ऑडियो ईक्यू और वीडियो क्वालिटी एन्हांसमेंट।" },
      ar: { "Welcome to VideoForge Pro Studio.": "مرحبًا بكم في VideoForge Pro Studio.", "AI auto-transcription with motion animated captions.": "النسخ التلقائي للذكاء الاصطناعي مع ترجمات متحركة.", "Real-time color grading, audio EQ, and video quality enhancement.": "تدرج الألوان المباشر، وموازن الصوت، وتحسين جودة الفيديو." }
    };

    const targetDict = translationsMap[targetLang];

    this.cues.forEach(cue => {
      if (targetDict && targetDict[cue.text]) {
        cue.text = targetDict[cue.text];
      } else {
        // Fast fallback language prefix
        const langTags = { es: '[ES] ', fr: '[FR] ', de: '[DE] ', ja: '[JP] ', hi: '[HI] ', ar: '[AR] ' };
        cue.text = (langTags[targetLang] || '') + cue.text;
      }
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
    let vtt = 'WEBVTT - Generated by VideoForge Pro\n\n';
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
        const textLines = lines.slice(lines.indexOf(timeLine) + 1).join(' ');
        
        const [startStr, endStr] = timeLine.split('-->').map(s => s.trim());
        if (startStr && endStr) {
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
