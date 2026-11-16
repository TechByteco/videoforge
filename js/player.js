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
  mediaType: 'video', // 'video', 'image', 'audio'
  mediaFile: null,

  // Overlays
  textOverlays: [
    { text: "VideoForge Pro", font: "Syne", size: 38, weight: "800", color: "#e8ff47", showBadge: true, badgeColor: "rgba(0,0,0,0.8)", y: 0.15 }
  ],
  watermark: null, // { img, position, opacity, scale }
  stickers: [],

  // Live Screen / Webcam streams
  activeStream: null,

  init(videoEl, canvasEl) {
    this.video = videoEl;
    this.canvas = canvasEl;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    
    this.setupMediaListeners();
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

      // Trigger UI update
      if (this.onMetadataLoaded) this.onMetadataLoaded(this.video.duration, this.video.videoWidth, this.video.videoHeight);
    });

    this.video.addEventListener('timeupdate', () => {
      Timeline.setTime(this.video.currentTime);
      
      // Update subtitle overlay
      const activeCue = SubtitlesManager.getActiveCue(this.video.currentTime);
      if (this.onSubtitleUpdate) {
        this.onSubtitleUpdate(activeCue ? activeCue.text : null);
      }
    });

    this.video.addEventListener('ended', () => {
      this.isPlaying = false;
      if (this.onPlayStateChange) this.onPlayStateChange(false);
    });
  },

  loadFromFile(file) {
    this.mediaFile = file;
    const url = URL.createObjectURL(file);
    const type = file.type || '';

    if (type.startsWith('image/')) {
      this.mediaType = 'image';
      const img = new Image();
      img.onload = () => {
        this.video.src = '';
        this.canvas.width = img.width || 1280;
        this.canvas.height = img.height || 720;
        Timeline.setDuration(10); // Default 10s duration for static image
        this.isLoaded = true;
        this.staticImage = img;
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

  /**
   * Screen Recording direct capture
   */
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

  /**
   * Webcam Recording direct capture
   */
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

    if (this.video.paused) {
      this.video.play();
      this.isPlaying = true;
    } else {
      this.video.pause();
      this.isPlaying = false;
    }
    if (this.onPlayStateChange) this.onPlayStateChange(this.isPlaying);
  },

  seek(seconds) {
    if (!this.isLoaded) return;
    this.video.currentTime = Math.max(0, Math.min(seconds, this.video.duration));
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
      return this.video.muted;
    }
    return false;
  },

  addTextOverlay(text, options = {}) {
    this.textOverlays.push({
      text,
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

  setWatermark(img, position = 'bottom-right', opacity = 0.85, scale = 0.18) {
    this.watermark = { img, position, opacity, scale };
  },

  addSticker(emoji, x = 0.5, y = 0.3, size = 48) {
    this.stickers.push({ emoji, x, y, size });
  },

  /**
   * Continuous high-FPS canvas render loop
   */
  startRenderLoop() {
    const loop = () => {
      if (this.isLoaded && this.canvas && this.ctx) {
        const source = this.staticImage || this.video;
        FilterEngine.renderFrame(
          this.ctx,
          source,
          this.canvas.width,
          this.canvas.height,
          this.textOverlays,
          this.watermark,
          this.stickers
        );
      }
      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }
};
