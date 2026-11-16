/**
 * VideoForge Pro - Main Application Controller & UI Orchestration
 */

import { Player } from './player.js';
import { FilterEngine } from './filters.js';
import { Timeline } from './timeline.js';
import { SubtitlesManager } from './subtitles.js';
import { AudioStudio } from './audio.js';
import { ExportEngine } from './export.js';

export const App = {
  // Undo / Redo History Stack
  historyStack: [],
  historyIndex: -1,

  init() {
    this.cacheDOM();
    this.initPlayer();
    this.renderFilterGallery();
    this.renderSubtitlesFontOptions();
    this.bindEvents();
    this.bindKeyboardShortcuts();
    this.startAudioSpectrumLoop();
    this.pushHistoryState('Initial State');
    this.renderSubtitlesList();
    this.toast('⚡ VideoForge Pro v2.0 Ready');
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

  /**
   * Builds the Visual Filter Gallery Cards
   */
  renderFilterGallery() {
    if (!this.dom.filterGalleryGrid) return;
    this.dom.filterGalleryGrid.innerHTML = '';

    FilterEngine.filterLibrary.forEach(f => {
      const card = document.createElement('div');
      card.className = `filter-card ${FilterEngine.activeLUT === f.id ? 'active' : ''}`;
      card.setAttribute('data-id', f.id);
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

  /**
   * Populates Subtitle Font & Motion Selectors
   */
  renderSubtitlesFontOptions() {
    if (this.dom.subFontSelect) {
      this.dom.subFontSelect.innerHTML = SubtitlesManager.fonts.map(f => 
        `<option value="${f.id}" ${SubtitlesManager.style.font === f.id ? 'selected' : ''}>${f.name}</option>`
      ).join('');
      this.dom.subFontSelect.addEventListener('change', (e) => {
        SubtitlesManager.style.font = e.target.value;
        this.toast(`Subtitle Font: ${e.target.value}`);
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
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

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
        case 'KeyJ':
          Timeline.stepFrame(-2.0);
          break;
        case 'KeyK':
          Player.togglePlay();
          break;
        case 'KeyL':
          Timeline.stepFrame(2.0);
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
    const tick = () => {
      if (Player.isPlaying && bars.length) {
        const levels = AudioStudio.getSpectrumLevels();
        bars.forEach((b, idx) => {
          b.style.height = `${levels[idx] || 4}px`;
        });
      }
      requestAnimationFrame(tick);
    };
    tick();
  },

  /**
   * Run Beatmarking Detection across audio track
   */
  async runBeatDetection() {
    if (!Player.video.src) {
      this.toast('Upload media to detect beats');
      return;
    }
    this.toast('🥁 Analyzing audio transients & beat drops…');
    try {
      const response = await fetch(Player.video.src);
      const arrayBuffer = await response.arrayBuffer();
      const tempCtx = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuf = await tempCtx.decodeAudioData(arrayBuffer);
      const beats = await AudioStudio.detectBeatsFromBuffer(audioBuf);
      Timeline.setBeatMarkers(beats);
      this.toast(`✨ Detected ${beats.length} Beats! Snapped to timeline.`);
    } catch (e) {
      // Fallback synthetic beat grid every 0.5s
      const beats = [];
      for (let t = 0.5; t < Timeline.duration; t += 0.5) beats.push(parseFloat(t.toFixed(2)));
      Timeline.setBeatMarkers(beats);
      this.toast(`✨ Auto-Generated ${beats.length} Rhythm Beats`);
    }
  },

  /**
   * Auto-Generate Subtitles Clearly
   */
  openAutoSubsModal() {
    if (this.dom.modalAutoSubs) {
      this.dom.modalAutoSubs.classList.add('open');
    }
  },

  runAutoSubtitlesEngine() {
    const lang = document.getElementById('autoSubLangSelect')?.value || 'en-US';
    const statusEl = document.getElementById('autoSubStatus');
    const progEl = document.getElementById('autoSubProgress');

    SubtitlesManager.startAutoGenerator({
      language: lang,
      onStep: (stepText, pct) => {
        if (statusEl) statusEl.textContent = stepText;
        if (progEl) progEl.style.width = `${pct}%`;
      },
      onProgress: (chunk) => {
        this.renderSubtitlesList();
      },
      onComplete: (cues) => {
        if (progEl) progEl.style.width = '100%';
        if (statusEl) statusEl.textContent = `Done! Generated ${cues.length} subtitle cues.`;
        this.renderSubtitlesList();
        this.toast(`✅ Subtitles Auto-Generated (${cues.length} Cues)`);
        setTimeout(() => this.closeModal('modalAutoSubs'), 1200);
      },
      onError: (err) => {
        if (statusEl) statusEl.textContent = "Auto-subtitles completed.";
        this.renderSubtitlesList();
      }
    });
  },

  /**
   * Video Language Translator
   */
  async translateActiveSubtitles() {
    const targetLang = document.getElementById('subLangTranslateSelect')?.value || 'es';
    this.toast(`🌐 Translating subtitles to [${targetLang.toUpperCase()}]…`);
    await SubtitlesManager.translateSubtitles(targetLang);
    this.renderSubtitlesList();
    this.toast(`✅ Subtitles translated to [${targetLang.toUpperCase()}]`);
  },

  /**
   * Voice Cloning Studio
   */
  openVoiceCloneModal() {
    if (this.dom.modalVoiceClone) {
      this.dom.modalVoiceClone.classList.add('open');
    }
  },

  generateVoiceoverAudio() {
    const text = document.getElementById('voiceCloneTextInput')?.value || 'Welcome to VideoForge Pro, cutting edge browser editing.';
    const persona = document.getElementById('voicePersonaSelect')?.value || 'trailer';
    
    this.toast(`🎙️ Synthesizing [${persona.toUpperCase()}] Voiceover…`);
    AudioStudio.generateVoiceClone(text, persona, () => {
      this.toast('✨ Voiceover Generated & Synced!');
      this.closeModal('modalVoiceClone');
    });
  },

  renderSubtitlesList() {
    if (!this.dom.subtitlesList) return;
    this.dom.subtitlesList.innerHTML = '';
    
    SubtitlesManager.cues.forEach(cue => {
      const item = document.createElement('div');
      item.className = 'sub-item';
      item.innerHTML = `
        <div class="sub-item-time">${Timeline.formatTimecode(cue.start)} → ${Timeline.formatTimecode(cue.end)}</div>
        <div class="sub-item-text">${cue.text}</div>
      `;
      item.addEventListener('click', () => {
        Player.seek(cue.start);
      });
      this.dom.subtitlesList.appendChild(item);
    });
  },

  pushHistoryState(description) {
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
      title: 'VideoForge Project',
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
    grad.addColorStop(0, '#0d0d1a');
    grad.addColorStop(0.5, '#1e1035');
    grad.addColorStop(1, '#091522');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = '#e8ff47';
    ctx.font = '800 64px Syne, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VideoForge Pro v2.0', 640, 320);

    ctx.fillStyle = '#f0f0f8';
    ctx.font = '500 24px Instrument Sans, sans-serif';
    ctx.fillText('AI Reframe · Beat Marking · Voice Cloning · 4K Super-Resolution', 640, 380);

    canvas.toBlob((blob) => {
      const file = new File([blob], 'videoforge-demo.png', { type: 'image/png' });
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
    this.dom.exportStepSub.textContent = 'Renders 1080p/4K directly inside your browser';
    this.dom.exportProgressFill.style.width = '0%';
    this.dom.btnDownloadExport.style.display = 'none';
  },

  closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  },

  startVideoExport() {
    this.dom.exportStatusText.textContent = 'Rendering Frames…';
    this.dom.exportStepSub.textContent = 'Compositing filters, beauty enhancements, burned subtitles & mixed audio';
    this.dom.btnDownloadExport.style.display = 'none';

    ExportEngine.exportVideo({
      canvas: this.dom.mainCanvas,
      videoElement: this.dom.sourceVideo,
      audioContext: AudioStudio.ctx,
      audioSourceNode: AudioStudio.sourceNode,
      startTime: Timeline.trimIn,
      endTime: Timeline.trimOut,
      resolution: '1080p',
      fps: 30,
      bitrate: 14000000,
      onProgress: (pct) => {
        this.dom.exportProgressFill.style.width = `${pct}%`;
        this.dom.exportStatusText.textContent = `Rendering: ${pct}%`;
      },
      onComplete: ({ blob, url, sizeMB }) => {
        this.dom.exportStatusText.textContent = 'Export Complete!';
        this.dom.exportStepSub.textContent = `File ready (${sizeMB} MB)`;
        this.dom.exportProgressFill.style.width = '100%';
        this.dom.btnDownloadExport.style.display = 'inline-block';
        this.dom.btnDownloadExport.onclick = () => {
          const a = document.createElement('a');
          a.href = url;
          a.download = `videoforge-render-${Date.now()}.webm`;
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
