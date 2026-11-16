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
    this.bindEvents();
    this.bindKeyboardShortcuts();
    this.startAudioSpectrumLoop();
    this.pushHistoryState('Initial State');
    this.renderSubtitlesList();
    this.toast('⚡ VideoForge Pro Ready');
  },

  cacheDOM() {
    this.dom = {
      // Main containers
      upCard: document.getElementById('upCard'),
      stageContainer: document.getElementById('stageContainer'),
      mainCanvas: document.getElementById('mainCanvas'),
      sourceVideo: document.getElementById('sourceVideo'),
      fileInput: document.getElementById('fileInput'),
      watermarkInput: document.getElementById('watermarkInput'),
      subtitleFileInput: document.getElementById('subtitleFileInput'),
      projectFileInput: document.getElementById('projectFileInput'),

      // Playback toolbar
      btnPlay: document.getElementById('btnPlay'),
      btnMute: document.getElementById('btnMute'),
      timeCur: document.getElementById('timeCur'),
      timeDur: document.getElementById('timeDur'),

      // Timeline
      timelineTracks: document.getElementById('timelineTracks'),
      playheadEl: document.getElementById('playheadEl'),
      trimInEl: document.getElementById('trimInEl'),
      trimOutEl: document.getElementById('trimOutEl'),

      // Subtitles UI
      subOvBadge: document.getElementById('subOvBadge'),
      subOvText: document.getElementById('subOvText'),
      subtitlesList: document.getElementById('subtitlesList'),

      // Modals
      modalExport: document.getElementById('modalExport'),
      modalShortcuts: document.getElementById('modalShortcuts'),
      exportProgressFill: document.getElementById('exportProgressFill'),
      exportStatusText: document.getElementById('exportStatusText'),
      exportStepSub: document.getElementById('exportStepSub'),
      btnDownloadExport: document.getElementById('btnDownloadExport'),

      // Toast
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
      if (text) {
        this.dom.subOvBadge.style.display = 'block';
        this.dom.subOvText.textContent = text;
      } else {
        this.dom.subOvBadge.style.display = 'none';
      }
    };
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

    // 5. Transform Sliders & Buttons
    const zoomEl = document.getElementById('sliderZoom');
    if (zoomEl) {
      zoomEl.addEventListener('input', (e) => {
        FilterEngine.zoomScale = parseFloat(e.target.value);
      });
    }

    // 6. Watermark Logo Uploader
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

    // 7. Subtitle .SRT Import
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

    // 8. Project File Import (.videoforge JSON)
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

  /**
   * Keyboard Shortcuts Suite
   */
  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

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

  /**
   * Audio Spectrum Mini Waveform Loop
   */
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
   * Undo / Redo History System
   */
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

  /**
   * Project Save / Load (.videoforge JSON format)
   */
  exportProjectJSON() {
    const projectData = {
      version: '1.0.0',
      title: 'VideoForge Project',
      timestamp: Date.now(),
      filters: FilterEngine,
      timeline: {
        duration: Timeline.duration,
        trimIn: Timeline.trimIn,
        trimOut: Timeline.trimOut,
        clips: Timeline.clips
      },
      subtitles: SubtitlesManager.cues,
      textOverlays: Player.textOverlays,
      audio: {
        volume: AudioStudio.volume,
        bass: AudioStudio.bass,
        mid: AudioStudio.mid,
        treble: AudioStudio.treble,
        effect: AudioStudio.activeEffect
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
      if (data.subtitles) SubtitlesManager.cues = data.subtitles;
      if (data.textOverlays) Player.textOverlays = data.textOverlays;
      if (data.timeline) {
        Timeline.trimIn = data.timeline.trimIn || 0;
        Timeline.trimOut = data.timeline.trimOut || Timeline.duration;
        Timeline.updateUI();
      }
      this.renderSubtitlesList();
      this.toast('✅ Project Loaded Successfully');
    } catch (e) {
      this.toast('❌ Failed to parse project file');
    }
  },

  /**
   * Loads procedural sample media for immediate testing without external files
   */
  loadSampleDemo() {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');

    // Draw dynamic background gradient and text
    const grad = ctx.createLinearGradient(0, 0, 1280, 720);
    grad.addColorStop(0, '#111122');
    grad.addColorStop(0.5, '#1e1035');
    grad.addColorStop(1, '#0c1b2a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = '#e8ff47';
    ctx.font = '800 60px Syne, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VideoForge Pro', 640, 320);

    ctx.fillStyle = '#f0f0f8';
    ctx.font = '500 24px Instrument Sans, sans-serif';
    ctx.fillText('Interactive Studio Demo Track', 640, 380);

    canvas.toBlob((blob) => {
      const file = new File([blob], 'videoforge-demo.png', { type: 'image/png' });
      Player.loadFromFile(file);
      this.toast('Loaded Demo Sample');
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
    this.dom.exportStepSub.textContent = 'Click "Start Real Export" to render in-browser';
    this.dom.exportProgressFill.style.width = '0%';
    this.dom.btnDownloadExport.style.display = 'none';
  },

  closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  },

  startVideoExport() {
    this.dom.exportStatusText.textContent = 'Rendering Frames…';
    this.dom.exportStepSub.textContent = 'Compositing filters, burned subtitles & audio stream';
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

// Auto-boot on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;
window.Player = Player;
window.FilterEngine = FilterEngine;
window.Timeline = Timeline;
window.SubtitlesManager = SubtitlesManager;
window.AudioStudio = AudioStudio;
window.ExportEngine = ExportEngine;
