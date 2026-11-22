/**
 * VideoForge Pro - Multi-Track Interactive Timeline, Trimming & Beatmarking Engine
 */

export const Timeline = {
  duration: 0,
  currentTime: 0,
  trimIn: 0,
  trimOut: 0,
  isLooping: false,
  zoomScale: 1.0,
  snapToBeat: true,

  // Beat markers from AudioStudio
  beatMarkers: [],

  // Clips in sequence
  clips: [],
  activeClipIndex: 0,

  // UI Elements cache
  trackContainer: null,
  playheadEl: null,
  trimInEl: null,
  trimOutEl: null,
  rulerEl: null,

  init(container, onSeekCallback) {
    this.trackContainer = container;
    this.rulerEl = document.querySelector('.timeline-ruler');
    this.onSeek = onSeekCallback;
    this.setupEventListeners();
  },

  setDuration(dur) {
    this.duration = dur || 0;
    this.trimIn = 0;
    this.trimOut = this.duration;
    this.clips = [{
      id: 'clip_0',
      start: 0,
      end: this.duration,
      in: 0,
      out: this.duration,
      name: 'Main Video Track'
    }];
    this.updateUI();
    this.renderBeatMarkersUI();
  },

  setTime(t) {
    this.currentTime = Math.max(0, Math.min(t, this.duration));
    
    // Check A-B loop boundary
    if (this.isLooping && this.currentTime >= this.trimOut) {
      this.currentTime = this.trimIn;
      if (this.onSeek) this.onSeek(this.trimIn);
    }

    this.updatePlayheadPosition();
  },

  updatePlayheadPosition() {
    if (!this.playheadEl || !this.duration) return;
    const pct = (this.currentTime / this.duration) * 100;
    this.playheadEl.style.left = `${Math.min(100, Math.max(0, pct))}%`;
  },

  updateUI() {
    if (!this.trimInEl || !this.trimOutEl || !this.duration) return;
    const inPct = (this.trimIn / this.duration) * 100;
    const outPct = ((this.duration - this.trimOut) / this.duration) * 100;

    this.trimInEl.style.left = `${inPct}%`;
    this.trimOutEl.style.right = `${outPct}%`;
    this.updatePlayheadPosition();
  },

  setBeatMarkers(markers) {
    this.beatMarkers = markers || [];
    this.renderBeatMarkersUI();
  },

  renderBeatMarkersUI() {
    if (!this.rulerEl || !this.duration) return;
    
    // Remove existing beat pins
    this.rulerEl.querySelectorAll('.beat-pin').forEach(p => p.remove());

    this.beatMarkers.forEach(sec => {
      const pin = document.createElement('div');
      pin.className = 'beat-pin';
      pin.style.left = `${(sec / this.duration) * 100}%`;
      pin.title = `Beat: ${sec.toFixed(2)}s`;
      pin.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setTime(sec);
        if (this.onSeek) this.onSeek(sec);
      });
      this.rulerEl.appendChild(pin);
    });
  },

  /**
   * Render real subtitle cues visually onto the T1 Subs track lane
   */
  renderSubtitleCues(cues) {
    const lane = document.querySelector('.track-subtitles');
    if (!lane || !this.duration) return;

    lane.querySelectorAll('.timeline-cue-chip').forEach(c => c.remove());
    if (!cues || !cues.length) return;

    cues.forEach(cue => {
      const chip = document.createElement('div');
      chip.className = 'timeline-cue-chip';
      const leftPct = Math.max(0, Math.min(100, (cue.start / this.duration) * 100));
      const widthPct = Math.max(1.5, Math.min(100 - leftPct, ((cue.end - cue.start) / this.duration) * 100));

      chip.style.left = `${leftPct}%`;
      chip.style.width = `${widthPct}%`;
      chip.title = `${cue.text || 'Subtitle'} (${this.formatTimecode(cue.start)} → ${this.formatTimecode(cue.end)})`;
      chip.innerHTML = `<span>💬 ${cue.text || '...'}</span>`;

      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setTime(cue.start);
        if (this.onSeek) this.onSeek(cue.start);
      });

      lane.appendChild(chip);
    });
  },

  seekByRatio(ratio) {
    if (!this.duration) return;
    let targetTime = Math.max(0, Math.min(ratio * this.duration, this.duration));
    
    // Snap to nearest beat marker if close (< 0.12s)
    if (this.snapToBeat && this.beatMarkers.length) {
      const nearest = this.beatMarkers.find(b => Math.abs(b - targetTime) < 0.15);
      if (nearest !== undefined) targetTime = nearest;
    }

    this.setTime(targetTime);
    if (this.onSeek) this.onSeek(targetTime);
  },

  stepFrame(deltaSeconds = 0.05) {
    const target = Math.max(0, Math.min(this.currentTime + deltaSeconds, this.duration));
    this.setTime(target);
    if (this.onSeek) this.onSeek(target);
  },

  splitAtPlayhead() {
    if (!this.duration || this.currentTime <= 0.1 || this.currentTime >= this.duration - 0.1) return false;
    
    this.clips.push({
      id: `clip_${Date.now()}`,
      start: this.currentTime,
      end: this.trimOut,
      in: this.currentTime,
      out: this.trimOut,
      name: `Clip Segment ${this.clips.length + 1}`
    });
    return true;
  },

  silenceZones: [],

  renderSilenceZones(silences) {
    this.silenceZones = silences || [];
    const lane = document.querySelector('.track-audio');
    if (!lane || !this.duration) return;

    lane.querySelectorAll('.silence-zone-block').forEach(b => b.remove());

    this.silenceZones.forEach(s => {
      const block = document.createElement('div');
      block.className = 'silence-zone-block';
      const leftPct = (s.start / this.duration) * 100;
      const widthPct = ((s.end - s.start) / this.duration) * 100;
      block.style.left = `${leftPct}%`;
      block.style.width = `${widthPct}%`;
      block.title = `Silence: ${s.duration.toFixed(2)}s (${s.start.toFixed(2)}s → ${s.end.toFixed(2)}s)`;
      lane.appendChild(block);
    });
  },

  duplicateActiveClip() {
    if (!this.clips.length) return false;
    const active = this.clips[this.activeClipIndex] || this.clips[0];
    const newClip = {
      ...active,
      id: `clip_${Date.now()}`,
      name: `${active.name} (Copy)`
    };
    this.clips.push(newClip);
    return true;
  },

  shuttleSpeed: 1.0,

  shuttleForward(player) {
    if (this.shuttleSpeed < 1.0) this.shuttleSpeed = 1.0;
    else if (this.shuttleSpeed === 1.0) this.shuttleSpeed = 2.0;
    else if (this.shuttleSpeed === 2.0) this.shuttleSpeed = 4.0;
    else this.shuttleSpeed = 1.0;
    if (player) player.setSpeed(this.shuttleSpeed);
    return this.shuttleSpeed;
  },

  shuttleRewind(player) {
    this.stepFrame(-1.0);
    this.shuttleSpeed = 1.0;
    if (player) player.setSpeed(1.0);
  },

  setTrimInCurrent() {
    this.trimIn = Math.min(this.currentTime, this.trimOut - 0.2);
    this.updateUI();
  },

  setTrimOutCurrent() {
    this.trimOut = Math.max(this.currentTime, this.trimIn + 0.2);
    this.updateUI();
  },

  resetTrim() {
    this.trimIn = 0;
    this.trimOut = this.duration;
    this.updateUI();
  },

  toggleLoop() {
    this.isLooping = !this.isLooping;
    return this.isLooping;
  },

  zoom(factor) {
    this.zoomScale = Math.max(1.0, Math.min(4.0, this.zoomScale * factor));
    const widthPct = `${this.zoomScale * 100}%`;
    if (this.trackContainer) {
      this.trackContainer.style.width = widthPct;
    }
    if (this.rulerEl) {
      this.rulerEl.style.width = widthPct;
    }
    this.renderBeatMarkersUI();
  },

  formatTimecode(seconds) {
    if (isNaN(seconds) || seconds < 0) seconds = 0;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  },

  setupEventListeners() {
    if (!this.trackContainer) return;

    let isDraggingPlayhead = false;
    let isDraggingTrimIn = false;
    let isDraggingTrimOut = false;

    // Direct Trim In drag
    if (this.trimInEl) {
      this.trimInEl.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        isDraggingTrimIn = true;
      });
    }

    // Direct Trim Out drag
    if (this.trimOutEl) {
      this.trimOutEl.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        isDraggingTrimOut = true;
      });
    }

    // Playhead seek on track click/drag
    this.trackContainer.addEventListener('mousedown', (e) => {
      if (e.target.closest('.trim-handle') || e.target.closest('.timeline-cue-chip')) return;
      isDraggingPlayhead = true;
      const rect = this.trackContainer.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      this.seekByRatio(ratio);
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.trackContainer || !this.duration) return;
      const rect = this.trackContainer.getBoundingClientRect();
      const posRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const targetSec = posRatio * this.duration;

      if (isDraggingTrimIn) {
        this.trimIn = Math.min(targetSec, this.trimOut - 0.2);
        this.updateUI();
      } else if (isDraggingTrimOut) {
        this.trimOut = Math.max(targetSec, this.trimIn + 0.2);
        this.updateUI();
      } else if (isDraggingPlayhead) {
        this.seekByRatio(posRatio);
      }
    });

    window.addEventListener('mouseup', () => {
      isDraggingPlayhead = false;
      isDraggingTrimIn = false;
      isDraggingTrimOut = false;
    });
  }
};
