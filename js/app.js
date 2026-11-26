/**
 * VideoForge Pro - Main Application Controller & UI Orchestration
 */

import { Player } from './player.js';
import { FilterEngine } from './filters.js';
import { Timeline } from './timeline.js';
import { SubtitlesManager } from './subtitles.js';
import { AudioStudio } from './audio.js';
import { ExportEngine } from './export.js';
import { Hub } from './hub.js';
import { Storage } from './storage.js';

export const App = {
  historyStack: [],
  historyIndex: -1,
  activeInspectorTab: 'edit',

  init() {
    this.restoreTheme();
    this.cacheDOM();
    this.initPlayer();
    this.renderFilterGallery();
    this.renderSubtitlesFontOptions();
    this.bindEvents();
    this.bindKeyboardShortcuts();
    this.startAudioSpectrumLoop();
    this.pushHistoryState('Initial Clean State');
    this.renderSubtitlesList();
    this.switchTab('edit');
    this.startStatusBarLoop();
    this.renderMemesList();
    this.renderSFXList();
    // Defer color wheels until DOM is ready
    requestAnimationFrame(() => this.initColorWheels());
    this.toast('⚡ VideoForge Pro Ready');
    // Init Hub after app is ready
    Hub.init(this).catch(err => console.warn('Hub init error:', err));
  },

  cacheDOM() {
    this.dom = {
      upCard: document.getElementById('upCard'),
      stageContainer: document.getElementById('stageContainer'),
      mainCanvas: document.getElementById('mainCanvas'),
      sourceVideo: document.getElementById('sourceVideo'),
      fileInput: document.getElementById('fileInput'),
      watermarkInput: document.getElementById('watermarkInput'),
      subtitleFileInput: document.getElementById('subtitleFileInput'),
      projectFileInput: document.getElementById('projectFileInput'),

      btnPlay: document.getElementById('btnPlay'),
      btnMute: document.getElementById('btnMute'),
      timeCur: document.getElementById('timeCur'),
      timeDur: document.getElementById('timeDur'),

      timelineTracks: document.getElementById('timelineTracks'),
      playheadEl: document.getElementById('playheadEl'),
      trimInEl: document.getElementById('trimInEl'),
      trimOutEl: document.getElementById('trimOutEl'),

      subOvBadge: document.getElementById('subOvBadge'),
      subOvText: document.getElementById('subOvText'),
      subtitlesList: document.getElementById('subtitlesList'),
      filterGalleryGrid: document.getElementById('filterGalleryGrid'),
      subFontSelect: document.getElementById('subFontSelect'),
      subMotionSelect: document.getElementById('subMotionSelect'),
      inspectorTabTitle: document.getElementById('inspectorTabTitle'),

      // Modals
      modalExport: document.getElementById('modalExport'),
      modalShortcuts: document.getElementById('modalShortcuts'),
      modalAutoSubs: document.getElementById('modalAutoSubs'),
      modalVoiceClone: document.getElementById('modalVoiceClone'),
      exportProgressFill: document.getElementById('exportProgressFill'),
      exportStatusText: document.getElementById('exportStatusText'),
      exportStepSub: document.getElementById('exportStepSub'),
      btnDownloadExport: document.getElementById('btnDownloadExport'),

      toastEl: document.getElementById('toastEl'),
      toastMsg: document.getElementById('toastMsg')
    };
  },

  initPlayer() {
    Timeline.playheadEl = this.dom.playheadEl;
    Timeline.trimInEl = this.dom.trimInEl;
    Timeline.trimOutEl = this.dom.trimOutEl;

    Player.init(this.dom.sourceVideo, this.dom.mainCanvas);
    Timeline.init(this.dom.timelineTracks, (targetSec) => {
      Player.seek(targetSec);
    });

    Player.onMetadataLoaded = (dur, w, h) => {
      this.dom.timeDur.textContent = Timeline.formatTimecode(dur);
      this.dom.upCard.style.display = 'none';
      this.dom.stageContainer.classList.add('active');
      this.updateTimelineRuler();
      this.toast(`Loaded: ${w}x${h} (${Math.round(dur)}s)`);
    };

    Player.onPlayStateChange = (isPlaying) => {
      this.dom.btnPlay.innerHTML = isPlaying 
        ? `<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause`
        : `<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><polygon points="5,3 19,12 5,21"/></svg> Play`;
    };

    Player.onSubtitleUpdate = (text) => {
      if (text && !SubtitlesManager.style.burnIn) {
        this.dom.subOvBadge.style.display = 'block';
        this.dom.subOvText.textContent = text;
      } else {
        this.dom.subOvBadge.style.display = 'none';
      }
    };
  },

  switchTab(tabId) {
    this.activeInspectorTab = tabId;
    document.querySelectorAll('.nt').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) btn.classList.add('on');
      else btn.classList.remove('on');
    });

    // Hide all inspector sections, show only the active tab's sections
    document.querySelectorAll('.inspector-panel-view').forEach(view => {
      view.style.display = 'none';
    });

    const activeView = document.getElementById(`panel-view-${tabId}`);
    if (activeView) activeView.style.display = 'flex';

    const titles = {
      edit: 'Composition & Edit',
      filters: 'Visual Filter Gallery',
      'ai-enhance': 'AI Enhancement & Reframe',
      audio: 'Audio Studio & Voice',
      subs: 'Subtitles & Typography'
    };

    if (this.dom.inspectorTabTitle) {
      this.dom.inspectorTabTitle.textContent = titles[tabId] || 'Properties';
    }
  },

  renderFilterGallery() {
    if (!this.dom.filterGalleryGrid) return;
    this.dom.filterGalleryGrid.innerHTML = '';

    FilterEngine.filterLibrary.forEach(f => {
      const card = document.createElement('div');
      card.className = `filter-card ${FilterEngine.activeLUT === f.id ? 'active' : ''}`;
      card.setAttribute('data-id', f.id);
      card.setAttribute('data-cat', f.cat);
      card.innerHTML = `
        <div class="filter-card-preview" style="background:linear-gradient(135deg, ${f.color}33, #09090e);border-color:${f.color}55">
          <span style="color:${f.color}">✦</span>
        </div>
        <div class="filter-card-name">${f.name}</div>
      `;
      card.addEventListener('click', () => {
        document.querySelectorAll('.filter-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        FilterEngine.activeLUT = f.id;
        this.toast(`Filter: ${f.name}`);
      });
      this.dom.filterGalleryGrid.appendChild(card);
    });
  },

  filterGalleryByCategory(cat) {
    document.querySelectorAll('.btn-filter-cat').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-cat') === cat);
    });

    document.querySelectorAll('.filter-card').forEach(card => {
      const cardCat = card.getAttribute('data-cat');
      if (cat === 'all' || cardCat === cat) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  },

  renderSubtitlesFontOptions() {
    if (this.dom.subFontSelect) {
      this.dom.subFontSelect.innerHTML = SubtitlesManager.fonts.map(f => 
        `<option value="${f.id}" ${SubtitlesManager.style.font === f.id ? 'selected' : ''}>${f.name}</option>`
      ).join('');
      this.dom.subFontSelect.addEventListener('change', (e) => {
        SubtitlesManager.style.font = e.target.value;
        if (document.fonts && document.fonts.load) {
          document.fonts.load(`bold 32px '${e.target.value}'`).then(() => {
            this.toast(`Subtitle Font: ${e.target.value}`);
          });
        } else {
          this.toast(`Subtitle Font: ${e.target.value}`);
        }
      });
    }

    if (this.dom.subMotionSelect) {
      this.dom.subMotionSelect.innerHTML = SubtitlesManager.motionPresets.map(m => 
        `<option value="${m.id}" ${SubtitlesManager.style.motion === m.id ? 'selected' : ''}>${m.name}</option>`
      ).join('');
      this.dom.subMotionSelect.addEventListener('change', (e) => {
        SubtitlesManager.style.motion = e.target.value;
        this.toast(`Motion: ${e.target.value}`);
      });
    }
  },

  bindEvents() {
    // 1. File Uploads
    this.dom.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        Player.loadFromFile(e.target.files[0]);
      }
      e.target.value = '';
    });

    // 2. Drag & Drop
    const upCard = this.dom.upCard;
    upCard.addEventListener('dragover', (e) => {
      e.preventDefault();
      upCard.classList.add('dragover');
    });
    upCard.addEventListener('dragleave', () => upCard.classList.remove('dragover'));
    upCard.addEventListener('drop', (e) => {
      e.preventDefault();
      upCard.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files[0]) {
        Player.loadFromFile(e.dataTransfer.files[0]);
      }
    });

    // 3. Playback Controls
    this.dom.btnPlay.addEventListener('click', () => Player.togglePlay());
    this.dom.btnMute.addEventListener('click', () => {
      const isMuted = Player.toggleMute();
      this.dom.btnMute.textContent = isMuted ? 'Unmute' : 'Mute';
      this.toast(isMuted ? '🔇 Audio Muted' : '🔊 Audio Unmuted');
    });

    // 4. Color Grading Sliders
    ['rb', 'rc', 'rs', 're', 'rw', 'rh'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          const label = e.target.parentElement.previousElementSibling.querySelector('.val');
          if (label) label.textContent = val;

          if (id === 'rb') FilterEngine.brightness = val;
          if (id === 'rc') FilterEngine.contrast = val;
          if (id === 'rs') FilterEngine.saturation = val;
          if (id === 're') FilterEngine.exposure = val;
          if (id === 'rw') FilterEngine.warmth = val;
          if (id === 'rh') FilterEngine.hueRotate = val;
        });
      }
    });

    // 5. Watermark Logo Uploader
    if (this.dom.watermarkInput) {
      this.dom.watermarkInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const img = new Image();
          img.onload = () => {
            Player.setWatermark(img, 'bottom-right', 0.85, 0.18);
            this.toast('Logo Watermark Added');
          };
          img.src = URL.createObjectURL(e.target.files[0]);
        }
      });
    }

    // 6. Subtitle .SRT Import
    if (this.dom.subtitleFileInput) {
      this.dom.subtitleFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            SubtitlesManager.importSRT(evt.target.result);
            this.renderSubtitlesList();
            this.toast('Subtitles Imported (.SRT)');
          };
          reader.readAsText(e.target.files[0]);
        }
      });
    }

    // 7. Project File Import
    if (this.dom.projectFileInput) {
      this.dom.projectFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            this.loadProjectFromJSON(evt.target.result);
          };
          reader.readAsText(e.target.files[0]);
        }
      });
    }
  },

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          Player.togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          Timeline.stepFrame(e.shiftKey ? -0.05 : -1.0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          Timeline.stepFrame(e.shiftKey ? 0.05 : 1.0);
          break;
        case 'KeyC':
          this.splitClip();
          break;
        case 'KeyD':
          if (e.ctrlKey) {
            e.preventDefault();
            Timeline.duplicateActiveClip();
            this.toast('Clip Duplicated (Ctrl+D)');
          }
          break;
        case 'KeyF':
          Player.toggleFullscreen();
          break;
        case 'KeyJ':
          Timeline.shuttleRewind(Player);
          break;
        case 'KeyK':
          Player.togglePlay();
          break;
        case 'KeyL':
          const spd = Timeline.shuttleForward(Player);
          this.toast(`Shuttle Speed: ${spd}x`);
          break;
        case 'KeyM':
          Player.toggleMute();
          break;
        case 'KeyS':
          this.splitClip();
          break;
        case 'KeyI':
          Timeline.setTrimInCurrent();
          this.toast(`Trim In: ${Timeline.formatTimecode(Timeline.trimIn)}`);
          break;
        case 'KeyO':
          Timeline.setTrimOutCurrent();
          this.toast(`Trim Out: ${Timeline.formatTimecode(Timeline.trimOut)}`);
          break;
        case 'KeyF':
          this.toggleFullscreen();
          break;
        case 'KeyE':
          this.openExportModal();
          break;
        case 'KeyZ':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.shiftKey) this.redo();
            else this.undo();
          }
          break;
        case 'KeyY':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.redo();
          }
          break;
      }
    });
  },

  startAudioSpectrumLoop() {
    const bars = document.querySelectorAll('.spectrum-bar');
    const vuFill = document.getElementById('audioVuMeterFill');
    const vuDbText = document.getElementById('audioVuDbText');

    const tick = () => {
      if (Player.isPlaying) {
        if (bars.length) {
          const levels = AudioStudio.getSpectrumLevels();
          bars.forEach((b, idx) => {
            b.style.height = `${levels[idx] || 4}px`;
          });
        }
        if (vuFill || vuDbText) {
          const peak = AudioStudio.getPeakDbLevels();
          if (vuFill) {
            vuFill.style.width = `${peak.peakPct}%`;
            vuFill.style.background = peak.isClipping ? 'var(--danger)' : (peak.peakPct > 75 ? '#ffd600' : 'var(--ok)');
          }
          if (vuDbText) {
            vuDbText.textContent = `${peak.db} dB`;
          }
        }
      }
      requestAnimationFrame(tick);
    };
    tick();
  },

  /**
   * Beatmarking & Transient Peak Detector
   */
  async runBeatDetection() {
    if (!Player.video.src) {
      this.toast('Upload media to detect beats');
      return;
    }
    this.toast('🥁 Analyzing audio transients & kick drops…');
    try {
      const response = await fetch(Player.video.src);
      const arrayBuffer = await response.arrayBuffer();
      const tempCtx = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuf = await tempCtx.decodeAudioData(arrayBuffer);
      const beats = await AudioStudio.detectBeatsFromBuffer(audioBuf);
      Timeline.setBeatMarkers(beats);
      this.toast(`✨ Detected ${beats.length} Beats! Snapped to timeline.`);
    } catch (e) {
      const beats = [];
      for (let t = 0.5; t < Timeline.duration; t += 0.5) beats.push(parseFloat(t.toFixed(2)));
      Timeline.setBeatMarkers(beats);
      this.toast(`✨ Generated ${beats.length} Rhythm Beats`);
    }
  },

  /**
   * Clear Auto-Subtitle Generation
   */
  openAutoSubsModal() {
    if (this.dom.modalAutoSubs) {
      this.dom.modalAutoSubs.classList.add('open');
    }
  },

  loadSampleScript() {
    const input = document.getElementById('autoSubScriptInput');
    if (input) {
      input.value = [
        "Welcome to VideoForge Studio Pro!",
        "Create stunning cinematic video content.",
        "High definition visual storytelling at your fingertips.",
        "Powerful client-side video editing in real time.",
        "Fast rendering, custom typography, and audio tools.",
        "Export and share your vision with the world!"
      ].join('\n');
      this.toast('Loaded sample English script');
    }
  },

  async runAutoSubtitlesEngine(mode = 'audio-detect') {
    const statusEl = document.getElementById('autoSubStatus');
    const progFill = document.getElementById('autoSubProgressFill');
    const globalLang = document.getElementById('autoSubGlobalLangSelect')?.value || document.getElementById('autoSubLangSelect')?.value || 'en-US';
    
    const setStatus = (txt, pct) => {
      if (statusEl) statusEl.textContent = txt;
      if (progFill) progFill.style.width = (pct || 0) + '%';
    };

    if (mode === 'audio-detect') {
      const dur = Timeline.duration || 12;
      if (!Player.isLoaded || Player.mediaType === 'image' || !Player.video?.src) {
        setStatus('⚠️ No video/audio track loaded. Upload a video with speech or use Script Alignment / Live Mic.', 0);
        this.toast('Upload a video with spoken audio for Whisper AI transcription');
        return;
      }

      const startBtn = document.getElementById('btnStartWhisper');
      const cancelBtn = document.getElementById('btnCancelWhisper');
      if (startBtn) { startBtn.disabled = true; startBtn.textContent = '⏳ Transcribing in Background…'; }
      if (cancelBtn) cancelBtn.style.display = 'inline-block';

      setStatus('Preparing audio track for Whisper AI…', 8);
      try {
        await SubtitlesManager.transcribeWithWhisperAI({
          mediaFile: Player.mediaFile,
          mediaUrl: Player.video.src,
          language: globalLang,
          duration: dur,
          maxWordsPerCue: 6,
          onProgress: (msg, pct) => setStatus(msg, pct),
          onPartialCues: () => {
            this.renderSubtitlesList();
          }
        });

        if (!SubtitlesManager.cues.length) {
          setStatus('⚠️ No spoken dialogue detected in this audio track. Try Live Mic or Script Alignment.', 100);
          this.toast('No speech detected in audio track');
          return;
        }

        setStatus(`✅ Whisper AI transcribed ${SubtitlesManager.cues.length} subtitle cues!`, 100);
        this.renderSubtitlesList();
        Player.seek(SubtitlesManager.cues[0].start + 0.05);
        this.switchTab('subs');
        this.pushHistoryState('Whisper AI Subtitles');
        this.toast(`🎉 Transcribed ${SubtitlesManager.cues.length} real subtitles!`);
        setTimeout(() => this.closeModal('modalAutoSubs'), 1200);
      } catch (e) {
        console.error('Whisper AI transcription error:', e);
        setStatus(`⚠️ ${e.message || 'Check audio track or internet for initial model download.'}`, 0);
        this.toast('⚠️ ' + (e.message || 'Whisper AI error'));
      } finally {
        if (startBtn) { startBtn.disabled = false; startBtn.textContent = '✨ Transcribe Video Audio Now →'; }
        if (cancelBtn) cancelBtn.style.display = 'none';
      }

    } else if (mode === 'script-align') {
      let script = document.getElementById('autoSubScriptInput')?.value?.trim();
      if (!script) {
        this.loadSampleScript();
        script = document.getElementById('autoSubScriptInput')?.value?.trim();
      }
      setStatus('Aligning script lines to timeline…', 50);
      const dur = Timeline.duration || 12;
      const lines = script.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      const step = Math.max(1.8, dur / lines.length);
      SubtitlesManager.cues = [];
      lines.forEach((line, i) => {
        const start = +(i * step).toFixed(2);
        const end = +(Math.min(dur, start + step - 0.2)).toFixed(2);
        SubtitlesManager.addCue(start, end, line);
      });

      setStatus(`✅ Aligned ${lines.length} English subtitles across ${dur.toFixed(1)}s`, 100);
      this.renderSubtitlesList();
      if (SubtitlesManager.cues.length > 0) Player.seek(SubtitlesManager.cues[0].start + 0.05);
      this.switchTab('subs');
      this.toast(`✅ Aligned ${lines.length} English subtitles`);
      setTimeout(() => this.closeModal('modalAutoSubs'), 1200);

    } else if (mode === 'live-mic') {
      const lang = globalLang || 'en-US';
      setStatus(`Listening in English (${lang})… Speak into your microphone`, 40);
      SubtitlesManager.startLiveTranscription({
        language: lang,
        onResult: (cues) => {
          setStatus(`Transcribed ${cues.length} cue(s) in English…`, 75);
          this.renderSubtitlesList();
        },
        onStatus: (msg, pct) => setStatus(msg, pct),
        onComplete: (cues) => {
          setStatus(`✅ Captured ${cues.length} spoken English subtitles!`, 100);
          this.renderSubtitlesList();
          if (cues.length > 0) Player.seek(cues[0].start + 0.05);
          this.toast(`Captured ${cues.length} English subtitles`);
          setTimeout(() => this.closeModal('modalAutoSubs'), 1500);
        },
        onError: (err) => {
          setStatus(`Mic status: ${err}`, 0);
          this.toast('⚠️ ' + err);
        }
      });
    }
  },

  stopLiveMic() {
    SubtitlesManager.stopLiveTranscription();
    this.toast('Stopped live mic transcription');
  },

  cancelAutoSubtitles() {
    SubtitlesManager.cancelWhisperTranscription();
    this.toast('Cancelled Whisper AI transcription');
  },

  renderTextOverlaysList() {
    const container = document.getElementById('activeOverlaysList');
    if (!container) return;
    container.innerHTML = '';
    if (!Player.textOverlays.length) return;

    Player.textOverlays.forEach(ov => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:var(--sur2);border-radius:6px;font-size:11px;border:1px solid var(--bdr)';
      item.innerHTML = `
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px">🏷️ ${ov.text}</span>
        <button style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:12px" title="Delete overlay">✕</button>
      `;
      item.querySelector('button').addEventListener('click', () => {
        Player.deleteTextOverlay(ov.id);
        this.renderTextOverlaysList();
        this.toast('Overlay removed');
      });
      container.appendChild(item);
    });
  },

  deleteOverlay(id) {
    Player.deleteTextOverlay(id);
    this.renderTextOverlaysList();
  },

  addSubtitleAtPlayhead() {
    const input = document.getElementById('newSubtitleInput');
    const text = input ? input.value : '';
    if (!text || !text.trim()) {
      this.toast('Type subtitle text first');
      return;
    }

    const cur = Timeline.currentTime || 0;
    const dur = Timeline.duration || 10;
    const end = Math.min(dur, cur + 3.0);
    SubtitlesManager.addCue(cur, end, text);
    if (input) input.value = '';
    this.renderSubtitlesList();
    this.toast(`Added subtitle at ${Timeline.formatTimecode(cur)}`);
  },

  nudgeSubtitles(deltaSec) {
    SubtitlesManager.nudgeCues(deltaSec);
    this.renderSubtitlesList();
    this.toast(`Shifted subtitles by ${deltaSec > 0 ? '+' : ''}${deltaSec}s`);
  },

  clearAllSubtitles() {
    SubtitlesManager.clearAllCues();
    this.renderSubtitlesList();
    this.toast('All subtitles cleared');
  },

  applyCaptionPreset(presetId) {
    if (SubtitlesManager.applyCaptionPreset(presetId)) {
      if (this.dom.subFontSelect) this.dom.subFontSelect.value = SubtitlesManager.style.font;
      if (this.dom.subMotionSelect) this.dom.subMotionSelect.value = SubtitlesManager.style.motion;
      if (document.fonts && document.fonts.load) {
        document.fonts.load(`${SubtitlesManager.style.weight || '700'} ${SubtitlesManager.style.size || 36}px '${SubtitlesManager.style.font}'`).catch(() => {});
      }
      this.renderSubtitlesList();
      const p = SubtitlesManager.captionPresets.find(x => x.id === presetId);
      this.toast(`Applied Preset: ${p ? p.name : presetId}`);
    }
  },

  setFilmGrainPreset(val) {
    FilterEngine.filmGrain = val;
    const range = document.getElementById('filterFilmGrainRange');
    if (range) {
      range.value = val;
      const valLabel = range.parentElement.previousElementSibling?.querySelector('.val');
      if (valLabel) valLabel.textContent = val;
    }
    this.toast(`Film Grain set to ${val}%`);
  },

  setLetterboxPreset(val) {
    FilterEngine.letterbox = val;
    const range = document.getElementById('filterLetterboxRange');
    if (range) {
      range.value = val;
      const valLabel = range.parentElement.previousElementSibling?.querySelector('.val');
      if (valLabel) valLabel.textContent = val;
    }
    this.toast(`Cinematic Letterbox set to ${val}%`);
  },

  autoInjectEmojis() {
    const count = SubtitlesManager.injectAutoEmojis();
    this.renderSubtitlesList();
    this.toast(`🔥 Injected ${count} contextual emojis across subtitles`);
  },

  searchAndReplaceCaptions() {
    const search = prompt('Enter word or text to find:');
    if (!search) return;
    const replace = prompt(`Replace "${search}" with:`) || '';
    const count = SubtitlesManager.searchAndReplace(search, replace);
    this.renderSubtitlesList();
    this.toast(`Replaced ${count} occurrence(s) of "${search}"`);
  },

  async runAutoSilenceRemover() {
    if (!Player.video?.src && !AudioStudio.decodedAudioBuffer) {
      this.toast('Upload a video first to analyze speech silences');
      return;
    }
    this.toast('🔍 Analyzing speech energy & removing silent pauses…');
    try {
      let audioBuf = AudioStudio.decodedAudioBuffer;
      if (!audioBuf) {
        const ab = Player.mediaFile && typeof Player.mediaFile.arrayBuffer === 'function'
          ? await Player.mediaFile.arrayBuffer()
          : await (await fetch(Player.video.src)).arrayBuffer();
        const tempCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioBuf = await tempCtx.decodeAudioData(ab);
        AudioStudio.decodedAudioBuffer = audioBuf;
        if (tempCtx.close) tempCtx.close().catch(() => {});
      }

      const result = await AudioStudio.detectSilencesFromBuffer(audioBuf, -36, 0.35, 0.05);
      Timeline.applySilenceCuts(result.silences);
      this.pushHistoryState('Auto Silence Cut');
      if (result.silenceCount > 0) {
        this.toast(`✂️ Auto-Cut ${result.silenceCount} silences (${result.totalSilenceDuration}s removed). Pacing: ${result.speechRatioPct}%`);
      } else {
        this.toast(`✅ No long silences found. Speech pacing: ${result.speechRatioPct}%`);
      }
    } catch (e) {
      this.toast('Silence analysis unavailable on this track');
    }
  },

  deleteSelectedClip() {
    if (Timeline.deleteActiveClip()) {
      this.pushHistoryState('Delete Clip Segment');
      this.toast('🗑️ Deleted selected clip segment (skipped on playback & export)');
    } else {
      this.toast('Split a clip first before deleting a segment');
    }
  },

  restoreAllCuts() {
    Timeline.clearSkipRanges();
    Timeline.setDuration(Timeline.duration);
    this.toast('↺ Restored all cut segments and silences');
  },

  applyClipTransition(type) {
    if (Timeline.setActiveClipTransition(type, 0.6)) {
      this.pushHistoryState(`Transition: ${type}`);
      this.toast(`✨ Applied "${type}" transition to active clip`);
    }
  },

  handleMusicUpload(file) {
    if (!file) return;
    if (AudioStudio.loadBackgroundMusic(file)) {
      const label = document.getElementById('bgMusicLabel');
      if (label) label.textContent = `🎵 ${file.name}`;
      this.renderMemesAndSFXLists();
      this.toast(`🎵 Background music loaded: ${file.name}`);
    }
  },

  async selectBuiltInMusic(style) {
    this.toast(`🎵 Generating ${style} loop…`);
    const title = await AudioStudio.loadBuiltInMusicLoop(style);
    const label = document.getElementById('bgMusicLabel');
    if (label) label.textContent = `🎵 ${title}`;
    this.renderMemesAndSFXLists();
    this.toast(`🎵 Loaded "${title}" onto A2 Music Track`);
  },

  removeMusicTrack() {
    AudioStudio.removeMusicTrack();
    const label = document.getElementById('bgMusicLabel');
    if (label) label.textContent = '🎵 Background Music (A2)';
    this.renderMemesAndSFXLists();
    this.toast('Removed background music track');
  },

  insertSFXAtPlayhead(type, label) {
    const cur = Timeline.currentTime || 0;
    AudioStudio.playSynthesizedSFX(type);
    AudioStudio.addSFXEvent(type, cur, label || type);
    this.renderMemesAndSFXLists();
    this.toast(`🔊 Dropped "${label || type}" SFX at ${Timeline.formatTimecode(cur)}`);
  },

  removeSFXEvent(id) {
    AudioStudio.removeSFXEvent(id);
    this.renderMemesAndSFXLists();
    this.toast('SFX removed from timeline');
  },

  insertMemeAtPlayhead(emoji, caption, anim = 'pop', duration = 2.5, sfxType = null) {
    const start = Timeline.currentTime || 0;
    const end = Math.min(Timeline.duration || 12, start + duration);
    Player.addSticker(emoji, 0.5, 0.30, 56, start, end, caption, anim, null, '#e8ff47');
    if (sfxType) {
      AudioStudio.playSynthesizedSFX(sfxType);
      AudioStudio.addSFXEvent(sfxType, start, caption.split(' ')[0]);
    }
    this.renderMemesAndSFXLists();
    this.toast(`🎭 Dropped "${caption}" at ${Timeline.formatTimecode(start)}`);
  },

  uploadCustomMeme(file) {
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const start = Timeline.currentTime || 0;
      const end = Math.min(Timeline.duration || 12, start + 3.0);
      Player.addSticker('🖼️', 0.5, 0.32, 48, start, end, '', 'pop', img);
      this.renderMemesAndSFXLists();
      this.toast(`🖼️ Dropped custom meme "${file.name}" at ${Timeline.formatTimecode(start)}`);
    };
    img.src = URL.createObjectURL(file);
  },

  deleteMeme(id) {
    Player.deleteSticker(id);
    this.renderMemesAndSFXLists();
    this.toast('Meme removed');
  },

  renderMemesAndSFXLists() {
    Timeline.renderMemeCues(Player.stickers, Player.textOverlays);
    Timeline.renderMusicAndSFXCues(AudioStudio.musicLoaded, AudioStudio.musicTitle, AudioStudio.sfxEvents);

    const memesContainer = document.getElementById('activeMemesList');
    if (memesContainer) {
      memesContainer.innerHTML = '';
      Player.stickers.forEach(stk => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:var(--sur2);border-radius:6px;font-size:11px;border:1px solid rgba(192,132,252,0.4)';
        const timeStr = stk.start !== undefined ? ` (${Timeline.formatTimecode(stk.start)}–${Timeline.formatTimecode(stk.end)})` : '';
        row.innerHTML = `
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:190px;cursor:pointer">${stk.emoji || '🎭'} ${stk.caption || 'Custom Meme'}${timeStr}</span>
          <button style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:12px" title="Delete meme">✕</button>
        `;
        row.querySelector('span').addEventListener('click', () => {
          if (stk.start !== undefined) Player.seek(stk.start + 0.05);
        });
        row.querySelector('button').addEventListener('click', () => this.deleteMeme(stk.id));
        memesContainer.appendChild(row);
      });
    }

    const sfxContainer = document.getElementById('activeSFXList');
    if (sfxContainer) {
      sfxContainer.innerHTML = '';
      AudioStudio.sfxEvents.forEach(s => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:var(--sur2);border-radius:6px;font-size:11px;border:1px solid rgba(251,146,60,0.4)';
        row.innerHTML = `
          <span style="cursor:pointer">🔊 ${s.label} @ ${Timeline.formatTimecode(s.time)}</span>
          <button style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:12px" title="Delete SFX">✕</button>
        `;
        row.querySelector('span').addEventListener('click', () => Player.seek(s.time));
        row.querySelector('button').addEventListener('click', () => this.removeSFXEvent(s.id));
        sfxContainer.appendChild(row);
      });
    }
  },

  toggleSafeZoneOverlay() {
    FilterEngine.safeZoneOverlay = !FilterEngine.safeZoneOverlay;
    this.toast(FilterEngine.safeZoneOverlay ? 'TikTok/Reels Safe Zone ON' : 'Safe Zone OFF');
  },

  toggleGridOverlay() {
    FilterEngine.gridOverlay = !FilterEngine.gridOverlay;
    this.toast(FilterEngine.gridOverlay ? 'Composition Grid ON' : 'Grid OFF');
  },

  toggleProgressBarOverlay() {
    FilterEngine.progressBarOverlay = !FilterEngine.progressBarOverlay;
    this.toast(FilterEngine.progressBarOverlay ? 'Social Progress Bar ON' : 'Progress Bar OFF');
  },

  async translateActiveSubtitles() {
    const targetLang = document.getElementById('subLangTranslateSelect')?.value || 'es';
    this.toast(`🌐 Translating subtitles [${targetLang.toUpperCase()}]…`);
    await SubtitlesManager.translateSubtitles(targetLang);
    this.renderSubtitlesList();
    this.toast(`✅ Subtitles translated to [${targetLang.toUpperCase()}]`);
  },

  openVoiceCloneModal() {
    if (this.dom.modalVoiceClone) {
      this.dom.modalVoiceClone.classList.add('open');
    }
  },

  generateVoiceoverAudio() {
    const text = document.getElementById('voiceCloneTextInput')?.value || 'Record or type any narration script here.';
    const persona = document.getElementById('voicePersonaSelect')?.value || 'trailer';
    
    this.toast(`🎙️ Synthesizing Voiceover [${persona.toUpperCase()}]…`);
    
    if (text.trim()) {
      const cur = Timeline.currentTime || 0;
      const wordCount = text.trim().split(/\s+/).length;
      const durSec = Math.max(2.0, wordCount * 0.45);
      SubtitlesManager.addCue(cur, cur + durSec, text.trim());
      this.renderSubtitlesList();
    }

    AudioStudio.generateVoiceClone(text, persona, () => {
      this.toast('✨ Voiceover Synthesized & Synced into Timeline!');
      this.closeModal('modalVoiceClone');
    });
  },

  renderSubtitlesList() {
    Timeline.renderSubtitleCues(SubtitlesManager.cues);
    if (!this.dom.subtitlesList) return;
    this.dom.subtitlesList.innerHTML = '';

    if (!SubtitlesManager.cues.length) {
      this.dom.subtitlesList.innerHTML = `<div style="text-align:center;color:var(--txt-dim);padding:18px 0;font-size:11.5px">No subtitles yet. Type above and click "+ Add Subtitle" or use "Auto-Generate".</div>`;
      return;
    }
    
    SubtitlesManager.cues.forEach(cue => {
      const item = document.createElement('div');
      item.className = 'sub-item';
      item.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div class="sub-item-time">${Timeline.formatTimecode(cue.start)} → ${Timeline.formatTimecode(cue.end)}</div>
          <button style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:11px" title="Delete cue">✕</button>
        </div>
        <div class="sub-item-text" contenteditable="true">${cue.text}</div>
      `;

      // Seek on time click
      item.querySelector('.sub-item-time').addEventListener('click', () => {
        Player.seek(cue.start);
      });

      // Edit in place
      const textEl = item.querySelector('.sub-item-text');
      textEl.addEventListener('blur', () => {
        SubtitlesManager.updateCue(cue.id, textEl.textContent);
      });

      // Delete cue
      item.querySelector('button').addEventListener('click', (e) => {
        e.stopPropagation();
        SubtitlesManager.deleteCue(cue.id);
        this.renderSubtitlesList();
        this.toast('Subtitle deleted');
      });

      this.dom.subtitlesList.appendChild(item);
    });
  },

  _autoSaveTimer: null,
  triggerAutoSave() {
    clearTimeout(this._autoSaveTimer);
    this._autoSaveTimer = setTimeout(() => {
      if (Player.isLoaded) {
        Storage.saveProject({
          id: Hub.activeProjectId || 'proj_autosave_latest',
          title: 'Current Working Project',
          aspectRatio: FilterEngine.aspectRatio || '16:9',
          duration: Timeline.duration || 12,
          cuesCount: SubtitlesManager.cues.length,
          updatedAt: Date.now(),
          projectData: {
            filters: {
              activeLUT: FilterEngine.activeLUT,
              brightness: FilterEngine.brightness,
              contrast: FilterEngine.contrast,
              saturation: FilterEngine.saturation,
              aspectRatio: FilterEngine.aspectRatio
            },
            subtitles: {
              style: { ...SubtitlesManager.style },
              cues: JSON.parse(JSON.stringify(SubtitlesManager.cues))
            },
            timeline: { beatMarkers: [...Timeline.beatMarkers] }
          }
        }).catch(() => {});
      }
    }, 2500);
  },

  pushHistoryState(description) {
    this.triggerAutoSave();
    const state = {
      desc: description,
      filter: { ...FilterEngine },
      trimIn: Timeline.trimIn,
      trimOut: Timeline.trimOut,
      subtitles: JSON.parse(JSON.stringify(SubtitlesManager.cues)),
      textOverlays: JSON.parse(JSON.stringify(Player.textOverlays))
    };

    this.historyStack = this.historyStack.slice(0, this.historyIndex + 1);
    this.historyStack.push(state);
    this.historyIndex++;
  },

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.applyHistoryState(this.historyStack[this.historyIndex]);
      this.toast(`Undo: ${this.historyStack[this.historyIndex].desc}`);
    }
  },

  redo() {
    if (this.historyIndex < this.historyStack.length - 1) {
      this.historyIndex++;
      this.applyHistoryState(this.historyStack[this.historyIndex]);
      this.toast(`Redo: ${this.historyStack[this.historyIndex].desc}`);
    }
  },

  applyHistoryState(state) {
    Object.assign(FilterEngine, state.filter);
    Timeline.trimIn = state.trimIn;
    Timeline.trimOut = state.trimOut;
    Timeline.updateUI();
    SubtitlesManager.cues = JSON.parse(JSON.stringify(state.subtitles));
    Player.textOverlays = JSON.parse(JSON.stringify(state.textOverlays));
    this.renderSubtitlesList();
  },

  exportProjectJSON() {
    const projectData = {
      version: '2.0.0',
      title: 'Video Project',
      timestamp: Date.now(),
      filters: FilterEngine,
      timeline: {
        duration: Timeline.duration,
        trimIn: Timeline.trimIn,
        trimOut: Timeline.trimOut,
        beatMarkers: Timeline.beatMarkers,
        clips: Timeline.clips
      },
      subtitles: {
        cues: SubtitlesManager.cues,
        style: SubtitlesManager.style
      },
      textOverlays: Player.textOverlays,
      audio: {
        volume: AudioStudio.volume,
        bass: AudioStudio.bass,
        mid: AudioStudio.mid,
        treble: AudioStudio.treble,
        effect: AudioStudio.activeEffect,
        noiseReduction: AudioStudio.noiseReductionEnabled
      }
    };

    const json = JSON.stringify(projectData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-${Date.now()}.videoforge`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    this.toast('💾 Project Saved (.videoforge)');
  },

  loadProjectFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.filters) Object.assign(FilterEngine, data.filters);
      if (data.subtitles) {
        if (data.subtitles.cues) SubtitlesManager.cues = data.subtitles.cues;
        if (data.subtitles.style) Object.assign(SubtitlesManager.style, data.subtitles.style);
      }
      if (data.textOverlays) Player.textOverlays = data.textOverlays;
      if (data.timeline) {
        Timeline.trimIn = data.timeline.trimIn || 0;
        Timeline.trimOut = data.timeline.trimOut || Timeline.duration;
        if (data.timeline.beatMarkers) Timeline.setBeatMarkers(data.timeline.beatMarkers);
        Timeline.updateUI();
      }
      this.renderSubtitlesList();
      this.toast('✅ Project Loaded Successfully');
    } catch (e) {
      this.toast('❌ Failed to parse project file');
    }
  },

  loadSampleDemo() {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 1280, 720);
    grad.addColorStop(0, '#0a0d18');
    grad.addColorStop(0.5, '#19102c');
    grad.addColorStop(1, '#081724');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = '#e8ff47';
    ctx.font = '800 58px Syne, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Video Studio Demo', 640, 320);

    ctx.fillStyle = '#f0f0f8';
    ctx.font = '500 22px Instrument Sans, sans-serif';
    ctx.fillText('AI Reframe · Beat Marking · Subtitle Engine · 4K Super-Resolution', 640, 380);

    canvas.toBlob((blob) => {
      const file = new File([blob], 'studio-demo.png', { type: 'image/png' });
      Player.loadFromFile(file);
      this.toast('Loaded Demo Sample');
    });
  },

  splitClip() {
    const success = Timeline.splitAtPlayhead();
    if (success) {
      this.toast(`Split clip at ${Timeline.formatTimecode(Timeline.currentTime)}`);
      this.pushHistoryState('Split Clip');
    } else {
      this.toast('Seek playhead inside clip to split');
    }
  },

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.dom.stageContainer.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  },

  openExportModal() {
    this.dom.modalExport.classList.add('open');
    this.dom.exportStatusText.textContent = 'Ready to Export';
    this.dom.exportStepSub.textContent = 'Renders high-bitrate video directly inside your browser';
    this.dom.exportProgressFill.style.width = '0%';
    this.dom.btnDownloadExport.style.display = 'none';
  },

  closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  },

  startVideoExport() {
    const resolution = document.getElementById('exportResolutionSelect')?.value || '1080p';
    const fps = parseInt(document.getElementById('exportFpsSelect')?.value || '30', 10);
    const bitrate = parseInt(document.getElementById('exportBitrateSelect')?.value || '12000000', 10);

    this.dom.exportStatusText.textContent = `Rendering ${resolution.toUpperCase()} @ ${fps}fps…`;
    this.dom.exportStepSub.textContent = 'Compositing filters, transitions, burned subtitles & post-DSP audio';
    this.dom.btnDownloadExport.style.display = 'none';

    ExportEngine.exportVideo({
      canvas: this.dom.mainCanvas,
      videoElement: this.dom.sourceVideo,
      audioContext: AudioStudio.ctx,
      audioSourceNode: AudioStudio.sourceNode,
      startTime: Timeline.trimIn,
      endTime: Timeline.trimOut,
      resolution,
      fps,
      bitrate,
      onProgress: (pct) => {
        this.dom.exportProgressFill.style.width = `${pct}%`;
        this.dom.exportStatusText.textContent = `Rendering ${resolution.toUpperCase()}: ${pct}%`;
      },
      onComplete: ({ blob, url, sizeMB }) => {
        this.dom.exportStatusText.textContent = 'Export Complete!';
        this.dom.exportStepSub.textContent = `File ready (${sizeMB} MB · ${resolution.toUpperCase()} ${fps}fps)`;
        this.dom.exportProgressFill.style.width = '100%';
        this.dom.btnDownloadExport.style.display = 'inline-block';
        this.dom.btnDownloadExport.onclick = () => {
          const a = document.createElement('a');
          a.href = url;
          a.download = `studio-render-${resolution}-${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          this.closeModal('modalExport');
          this.toast('🎉 Video Downloaded!');
        };
      },
      onError: (err) => {
        this.dom.exportStatusText.textContent = 'Export Error';
        this.dom.exportStepSub.textContent = err.message || 'Browser encoding error';
        this.toast('❌ Export Failed');
      }
    });
  },

  toast(msg) {
    if (!this.dom.toastEl) return;
    this.dom.toastMsg.textContent = msg;
    this.dom.toastEl.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.dom.toastEl.classList.remove('show');
    }, 2800);
  },

  /* ===== THEME TOGGLE ===== */
  toggleTheme() {
    const html = document.documentElement;
    const isLight = html.dataset.theme === 'light';
    html.dataset.theme = isLight ? 'dark' : 'light';
    try { localStorage.setItem('vf_theme', html.dataset.theme); } catch(e) {}
    this.toast(isLight ? '🌙 Dark Mode' : '☀️ Light Mode');
  },

  restoreTheme() {
    try {
      const saved = localStorage.getItem('vf_theme');
      if (saved) document.documentElement.dataset.theme = saved;
    } catch(e) {}
  },

  /* ===== ACCORDION SECTION TOGGLE ===== */
  toggleSection(headEl) {
    const body = headEl.nextElementSibling;
    if (!body) return;
    const isCollapsed = body.classList.contains('collapsed');
    headEl.classList.toggle('collapsed', !isCollapsed);
    body.classList.toggle('collapsed', !isCollapsed);
  },

  /* ===== CLIP SPEED RAMP ===== */
  setClipSpeed(speed) {
    this._clipSpeed = speed;
    const vid = this.dom.sourceVideo;
    if (vid) vid.playbackRate = speed;
    // Update all speed preset active states
    document.querySelectorAll('.btn-speed-preset').forEach(btn => {
      const val = parseFloat(btn.textContent);
      btn.classList.toggle('active', Math.abs(val - speed) < 0.01);
    });
    const valEl = document.getElementById('valSpeed');
    if (valEl) valEl.textContent = speed.toFixed(2) + '×';
    this.toast(`⚡ Speed: ${speed.toFixed(2)}×`);
  },

  /* ===== STATUS BAR UPDATER ===== */
  _statusBarRAF: null,

  startStatusBarLoop() {
    const update = () => {
      const vid = this.dom.sourceVideo;
      const tcEl = document.getElementById('statusTimecode');
      const resEl = document.getElementById('statusResolution');
      const clipsEl = document.getElementById('statusClipCount');
      const zoomEl = document.getElementById('statusZoom');

      if (tcEl && vid) {
        const t = vid.currentTime || 0;
        const mins = Math.floor(t / 60);
        const secs = Math.floor(t % 60);
        const ms = Math.floor((t % 1) * 1000);
        tcEl.textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}.${String(ms).padStart(3,'0')}`;
      }
      if (resEl && vid && vid.videoWidth) {
        resEl.textContent = `${vid.videoWidth} × ${vid.videoHeight}`;
      }
      if (clipsEl && window.Timeline) {
        const count = (window.Timeline.clips || []).length;
        clipsEl.textContent = `${count} clip${count !== 1 ? 's' : ''}`;
      }
      if (zoomEl && window.Timeline) {
        zoomEl.textContent = `${(window.Timeline.zoomLevel || 1).toFixed(1)}×`;
      }
      this._statusBarRAF = requestAnimationFrame(update);
    };
    this._statusBarRAF = requestAnimationFrame(update);
  },

  markUnsaved() {
    const el = document.getElementById('statusUnsaved');
    if (el) el.style.display = 'block';
  },

  markSaved() {
    const el = document.getElementById('statusUnsaved');
    if (el) el.style.display = 'none';
  },

  setProjectName(name) {
    const el = document.getElementById('statusProjectName');
    if (el) el.textContent = name || 'Untitled Project';
  },

  /* ===== COLOR WHEELS (LIFT / GAMMA / GAIN) ===== */
  _colorWheels: {
    lift:  { r: 0, g: 0, b: 0 },
    gamma: { r: 0, g: 0, b: 0 },
    gain:  { r: 0, g: 0, b: 0 }
  },

  initColorWheels() {
    const wheels = [
      { id: 'cwLift',  key: 'lift'  },
      { id: 'cwGamma', key: 'gamma' },
      { id: 'cwGain',  key: 'gain'  }
    ];
    wheels.forEach(({ id, key }) => {
      const canvas = document.getElementById(id);
      if (!canvas) return;
      this._drawColorWheel(canvas);
      const handler = (e) => {
        const rect = canvas.getBoundingClientRect();
        const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const cy = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        const color = this._sampleColorWheel(canvas, cx, cy);
        this._colorWheels[key] = color;
        this._applyColorWheels();
        this._drawColorWheelCursor(canvas, cx, cy);
      };
      canvas.addEventListener('click', handler);
      canvas.addEventListener('touchend', (e) => { e.preventDefault(); handler(e); }, { passive: false });
    });
  },

  _drawColorWheel(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2, r = Math.min(cx, cy) - 2;
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 1) * Math.PI / 180;
      const endAngle = (angle + 1) * Math.PI / 180;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, '#fff');
      grad.addColorStop(1, `hsl(${angle}, 100%, 50%)`);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }
    // Dark outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
  },

  _drawColorWheelCursor(canvas, x, y) {
    this._drawColorWheel(canvas);
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
  },

  _sampleColorWheel(canvas, x, y) {
    const ctx = canvas.getContext('2d');
    const pixel = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
    return { r: pixel[0], g: pixel[1], b: pixel[2] };
  },

  _applyColorWheels() {
    // Apply lift/gamma/gain as CSS overlay matrices via FilterEngine
    const { lift, gamma, gain } = this._colorWheels;
    FilterEngine.liftColor = lift;
    FilterEngine.gammaColor = gamma;
    FilterEngine.gainColor = gain;
  },

  resetColorWheels() {
    this._colorWheels = {
      lift:  { r: 0, g: 0, b: 0 },
      gamma: { r: 0, g: 0, b: 0 },
      gain:  { r: 0, g: 0, b: 0 }
    };
    FilterEngine.liftColor = null;
    FilterEngine.gammaColor = null;
    FilterEngine.gainColor = null;
    // Redraw wheels without cursor
    ['cwLift','cwGamma','cwGain'].forEach(id => {
      const c = document.getElementById(id);
      if (c) this._drawColorWheel(c);
    });
    this.toast('Color Wheels Reset');
  },

  /* ===== RENDER MEMES / SFX LIST (called on init) ===== */
  renderMemesList() {
    const listEl = document.getElementById('activeMemesList');
    if (!listEl) return;
    const memes = Player.overlays ? Player.overlays.filter(o => o.type === 'meme' || o.emoji) : [];
    if (!memes.length) {
      listEl.innerHTML = '<div style="font-size:10px;color:var(--mut);text-align:center;padding:4px 0">No memes on timeline yet</div>';
      return;
    }
    listEl.innerHTML = memes.map((m, i) => `
      <div style="display:flex;align-items:center;gap:6px;padding:4px 6px;background:var(--sur3);border-radius:5px;border:1px solid var(--bdr)">
        <span style="font-size:14px">${m.emoji || '📌'}</span>
        <span style="flex:1;font-size:10px;color:var(--txt-dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${m.label || m.text || 'Overlay'} @ ${(m.startTime || 0).toFixed(1)}s</span>
        <button style="padding:2px 6px;background:rgba(255,71,87,0.1);color:var(--danger);border:1px solid rgba(255,71,87,0.2);border-radius:4px;font-size:9px;cursor:pointer" onclick="Player.overlays.splice(${i},1);App.renderMemesList()">✕</button>
      </div>
    `).join('');
  },

  renderSFXList() {
    const listEl = document.getElementById('activeSFXList');
    if (!listEl) return;
    const sfxList = window.AudioStudio ? (AudioStudio.sfxEvents || []) : [];
    if (!sfxList.length) {
      listEl.innerHTML = '<div style="font-size:10px;color:var(--mut);text-align:center;padding:4px 0">No SFX on A2 track yet</div>';
      return;
    }
    listEl.innerHTML = sfxList.map((s, i) => `
      <div style="display:flex;align-items:center;gap:6px;padding:4px 6px;background:var(--sur3);border-radius:5px;border:1px solid var(--bdr)">
        <span style="font-size:12px">🔊</span>
        <span style="flex:1;font-size:10px;color:var(--txt-dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.name || s.type} @ ${(s.time || 0).toFixed(1)}s</span>
        <button style="padding:2px 6px;background:rgba(255,71,87,0.1);color:var(--danger);border:1px solid rgba(255,71,87,0.2);border-radius:4px;font-size:9px;cursor:pointer" onclick="AudioStudio.sfxEvents.splice(${i},1);App.renderSFXList()">✕</button>
      </div>
    `).join('');
  },

  /* ===== DYNAMIC TIMELINE RULER ===== */
  updateTimelineRuler() {
    const ruler = document.querySelector('.timeline-ruler');
    if (!ruler) return;
    const dur = (this.dom.sourceVideo && this.dom.sourceVideo.duration) ? this.dom.sourceVideo.duration : 0;
    if (!dur || dur < 1) return;

    ruler.innerHTML = '';
    const zoom = window.Timeline ? (Timeline.zoomLevel || 1) : 1;
    const visibleDur = dur / zoom;
    // Choose tick interval
    let interval = 5;
    if (visibleDur <= 15) interval = 1;
    else if (visibleDur <= 60) interval = 5;
    else if (visibleDur <= 180) interval = 15;
    else if (visibleDur <= 600) interval = 30;
    else interval = 60;

    for (let t = 0; t <= dur; t += interval) {
      const pct = (t / dur) * 100;
      const tick = document.createElement('span');
      tick.className = 'ruler-tick major';
      tick.style.position = 'absolute';
      tick.style.left = `${pct}%`;
      const mins = Math.floor(t / 60);
      const secs = Math.floor(t % 60);
      tick.textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
      ruler.appendChild(tick);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;
window.Player = Player;
window.FilterEngine = FilterEngine;
window.Timeline = Timeline;
window.SubtitlesManager = SubtitlesManager;
window.AudioStudio = AudioStudio;
window.ExportEngine = ExportEngine;
window.Hub = Hub;
window.Storage = Storage;
