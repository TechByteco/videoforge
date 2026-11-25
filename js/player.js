/**
 * VideoForge Pro - Media Stage & Composition Player
 */

import { FilterEngine } from './filters.js';
import { SubtitlesManager } from './subtitles.js';
import { AudioStudio } from './audio.js';
import { Timeline } from './timeline.js';

export const Player = {
  video: null,
  canvas: null,
  ctx: null,
  animationFrameId: null,
  
  // Media State
  isLoaded: false,
  isPlaying: false,
  mediaType: 'video', // 'video' | 'image'
  mediaFile: null,
  staticImage: null,

  // Image playback simulation
  imageCurrentTime: 0,
  imageLastTimestamp: 0,
  imageAnimId: null,

  // Overlays
  textOverlays: [],
  watermark: null,
  stickers: [],

  // Live Screen / Webcam streams
  activeStream: null,

  init(videoEl, canvasEl) {
    this.video = videoEl;
    this.canvas = canvasEl;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    
    this.setupMediaListeners();
    this.setupCanvasInteractions();
    this.startRenderLoop();
  },

  setupMediaListeners() {
    this.video.addEventListener('loadedmetadata', () => {
      this.isLoaded = true;
      const dims = FilterEngine.getTargetDimensions(this.video.videoWidth, this.video.videoHeight);
      this.canvas.width = dims.width;
      this.canvas.height = dims.height;

      Timeline.setDuration(this.video.duration);
      AudioStudio.init(this.video);
      if (typeof AudioStudio.renderWaveformFromSource === 'function') {
        AudioStudio.renderWaveformFromSource(this.mediaFile, this.video.src);
      }

      if (this.onMetadataLoaded) this.onMetadataLoaded(this.video.duration, this.video.videoWidth, this.video.videoHeight);
    });

    this.video.addEventListener('timeupdate', () => {
      if (this.mediaType === 'video') {
        if (this.isPlaying) {
          const skipTo = Timeline.getNextPlayableTime(this.video.currentTime);
          if (skipTo !== null && skipTo < this.video.duration) {
            this.video.currentTime = skipTo;
            return;
          }
          if (Timeline.trimOut > 0 && this.video.currentTime >= Timeline.trimOut) {
            if (Timeline.isLooping) {
              this.video.currentTime = Timeline.trimIn;
            } else {
              this.video.pause();
              this.isPlaying = false;
              if (this.onPlayStateChange) this.onPlayStateChange(false);
            }
          }
        }
        Timeline.setTime(this.video.currentTime);
        AudioStudio.applyFadeEnvelope(this.video.currentTime, Timeline.trimIn, Timeline.trimOut || this.video.duration);
        
        const activeCue = SubtitlesManager.getActiveCue(this.video.currentTime);
        if (this.onSubtitleUpdate) {
          this.onSubtitleUpdate(activeCue ? activeCue.text : null);
        }
      }
    });

    this.video.addEventListener('ended', () => {
      this.isPlaying = false;
      AudioStudio.syncMusicPlayback(false);
      if (this.onPlayStateChange) this.onPlayStateChange(false);
    });
  },

  setupCanvasInteractions() {
    let isDraggingSplit = false;
    let isDraggingSub = false;
    let draggingOverlay = null;
    let draggingSticker = null;

    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseXRel = (e.clientX - rect.left) / rect.width;
      const mouseYRel = (e.clientY - rect.top) / rect.height;

      if (FilterEngine.splitScreen) {
        isDraggingSplit = true;
        this.updateSplitPos(e);
        return;
      }

      // Check stickers first
      for (let i = this.stickers.length - 1; i >= 0; i--) {
        const st = this.stickers[i];
        if (Math.abs(mouseXRel - (st.x || 0.5)) < 0.08 && Math.abs(mouseYRel - (st.y || 0.3)) < 0.08) {
          draggingSticker = st;
          return;
        }
      }

      // Check text overlays
      for (let i = this.textOverlays.length - 1; i >= 0; i--) {
        const ov = this.textOverlays[i];
        if (Math.abs(mouseXRel - (ov.x || 0.5)) < 0.2 && Math.abs(mouseYRel - (ov.y || 0.15)) < 0.08) {
          draggingOverlay = ov;
          return;
        }
      }

      if (e.shiftKey || Math.abs(mouseYRel - (SubtitlesManager.style.positionY || 0.84)) < 0.12) {
        isDraggingSub = true;
        SubtitlesManager.style.positionY = Math.max(0.1, Math.min(0.92, mouseYRel));
      }
    });

    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseXRel = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
      const mouseYRel = Math.max(0.05, Math.min(0.95, (e.clientY - rect.top) / rect.height));

      if (isDraggingSplit && FilterEngine.splitScreen) {
        this.updateSplitPos(e);
      } else if (draggingSticker) {
        draggingSticker.x = mouseXRel;
        draggingSticker.y = mouseYRel;
      } else if (draggingOverlay) {
        draggingOverlay.x = mouseXRel;
        draggingOverlay.y = mouseYRel;
      } else if (isDraggingSub) {
        SubtitlesManager.style.positionY = Math.max(0.1, Math.min(0.92, mouseYRel));
      }
    });

    window.addEventListener('mouseup', () => {
      isDraggingSplit = false;
      isDraggingSub = false;
      draggingOverlay = null;
      draggingSticker = null;
    });
  },

  updateSplitPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const pos = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
    FilterEngine.splitPosition = pos;
  },

  loadFromFile(file) {
    this.mediaFile = file;
    const url = URL.createObjectURL(file);
    const type = file.type || '';

    if (type.startsWith('image/')) {
      this.mediaType = 'image';
      this.imageCurrentTime = 0;
      const img = new Image();
      img.onload = () => {
        this.video.pause();
        this.video.src = '';
        this.canvas.width = img.width || 1280;
        this.canvas.height = img.height || 720;
        Timeline.setDuration(12);
        this.isLoaded = true;
        this.staticImage = img;
        if (this.onMetadataLoaded) this.onMetadataLoaded(12, this.canvas.width, this.canvas.height);
      };
      img.src = url;
    } else {
      this.mediaType = 'video';
      this.staticImage = null;
      this.video.pause();
      this.video.src = url;
      this.video.load();
    }
  },

  async startScreenCapture() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: true
      });
      this.activeStream = stream;
      this.video.srcObject = stream;
      this.video.play();
      this.isPlaying = true;
      this.isLoaded = true;
      return true;
    } catch (e) {
      console.warn("Screen capture cancelled or unavailable", e);
      return false;
    }
  },

  async startWebcamCapture() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      this.activeStream = stream;
      this.video.srcObject = stream;
      this.video.play();
      this.isPlaying = true;
      this.isLoaded = true;
      return true;
    } catch (e) {
      console.warn("Webcam capture unavailable", e);
      return false;
    }
  },

  togglePlay() {
    if (!this.isLoaded) return;
    AudioStudio.resume();

    if (this.mediaType === 'image') {
      this.isPlaying = !this.isPlaying;
      if (this.isPlaying) {
        this.imageLastTimestamp = performance.now();
        const step = (now) => {
          if (!this.isPlaying || this.mediaType !== 'image') return;
          const dt = (now - this.imageLastTimestamp) / 1000;
          this.imageLastTimestamp = now;
          this.imageCurrentTime += dt;
          if (this.imageCurrentTime >= Timeline.duration) {
            this.imageCurrentTime = Timeline.isLooping ? 0 : Timeline.duration;
            if (!Timeline.isLooping) {
              this.isPlaying = false;
              if (this.onPlayStateChange) this.onPlayStateChange(false);
              return;
            }
          }
          Timeline.setTime(this.imageCurrentTime);
          this.imageAnimId = requestAnimationFrame(step);
        };
        this.imageAnimId = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(this.imageAnimId);
      }
      if (this.onPlayStateChange) this.onPlayStateChange(this.isPlaying);
      return;
    }

    // Video playback
    if (this.video.paused) {
      this.video.play();
      this.isPlaying = true;
    } else {
      this.video.pause();
      this.isPlaying = false;
    }
    AudioStudio.syncMusicPlayback(this.isPlaying, this.getCurrentTime());
    if (this.onPlayStateChange) this.onPlayStateChange(this.isPlaying);
  },

  seek(seconds) {
    if (!this.isLoaded) return;
    if (this.mediaType === 'image') {
      this.imageCurrentTime = Math.max(0, Math.min(seconds, Timeline.duration || 12));
      Timeline.setTime(this.imageCurrentTime);
      AudioStudio.syncMusicPlayback(this.isPlaying, this.imageCurrentTime);
      return;
    }
    this.video.currentTime = Math.max(0, Math.min(seconds, this.video.duration));
    AudioStudio.syncMusicPlayback(this.isPlaying, this.video.currentTime);
  },

  getCurrentTime() {
    return this.mediaType === 'image' ? this.imageCurrentTime : (this.video?.currentTime || 0);
  },

  setSpeed(rate) {
    if (this.video) {
      this.video.playbackRate = rate;
    }
  },

  setVolume(volPercent) {
    if (this.video) {
      this.video.volume = Math.min(1, volPercent / 100);
      AudioStudio.setVolume(volPercent);
    }
  },

  toggleMute() {
    if (this.video) {
      this.video.muted = !this.video.muted;
      const isMuted = this.video.muted;
      const btn = document.getElementById('btnMute');
      if (btn) {
        btn.textContent = isMuted ? 'Unmute' : 'Mute';
        btn.classList.toggle('active', isMuted);
      }
      return isMuted;
    }
    return false;
  },

  toggleFullscreen() {
    const stage = document.getElementById('stageContainer') || this.canvas;
    if (!document.fullscreenElement) {
      if (stage.requestFullscreen) stage.requestFullscreen();
      else if (stage.webkitRequestFullscreen) stage.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  },

  addTextOverlay(text, options = {}) {
    if (!text || !text.trim()) return;
    this.textOverlays.push({
      id: 'txt_' + Date.now() + '_' + Math.floor(Math.random() * 100),
      text: text.trim(),
      font: options.font || 'Syne',
      size: options.size || 34,
      weight: options.weight || '700',
      color: options.color || '#ffffff',
      showBadge: options.showBadge !== undefined ? options.showBadge : true,
      badgeColor: options.badgeColor || 'rgba(0,0,0,0.7)',
      x: options.x || 0.5,
      y: options.y || 0.8
    });
  },

  deleteTextOverlay(id) {
    this.textOverlays = this.textOverlays.filter(t => t.id !== id);
  },

  clearTextOverlays() {
    this.textOverlays = [];
  },

  setWatermark(img, position = 'bottom-right', opacity = 0.85, scale = 0.18) {
    this.watermark = { img, position, opacity, scale };
  },

  addSticker(emoji, x = 0.5, y = 0.3, size = 48) {
    this.stickers.push({ emoji, x, y, size });
  },

  startRenderLoop() {
    const loop = () => {
      if (this.isLoaded && this.canvas && this.ctx) {
        const source = this.staticImage || this.video;
        const curTime = this.getCurrentTime();
        FilterEngine.totalDuration = Timeline.duration || 12;
        FilterEngine.activeTransition = Timeline.getTransitionState(curTime);
        FilterEngine.renderFrame(
          this.ctx,
          source,
          this.canvas.width,
          this.canvas.height,
          this.textOverlays,
          this.watermark,
          this.stickers,
          SubtitlesManager,
          curTime
        );
      }
      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }
};
