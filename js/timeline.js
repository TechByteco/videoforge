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

  // Clips in sequence & cut/skip ranges (for real ripple delete / silence removal)
  clips: [],
  activeClipIndex: 0,
  skipRanges: [],

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
    this.skipRanges = [];
    this.silenceZones = [];
    this.clips = [{
      id: 'clip_0',
      start: 0,
      end: this.duration,
      in: 0,
      out: this.duration,
      speed: 1.0,
      transitionIn: 'none',
      transitionDur: 0.5,
      name: 'Main Video Track'
    }];
    this.activeClipIndex = 0;
    this.updateRulerTicks();
    this.renderVideoClips();
    this.updateUI();
    this.renderBeatMarkersUI();
  },

  updateRulerTicks() {
    if (!this.rulerEl || !this.duration) return;
    const ticks = this.rulerEl.querySelectorAll('.ruler-tick');
    if (!ticks.length) return;
    const count = ticks.length - 1 || 1;
    ticks.forEach((el, idx) => {
      const t = (idx / count) * this.duration;
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    });
  },

  renderVideoClips() {
    const lane = document.querySelector('.track-video');
    if (!lane || !this.duration) return;
    lane.querySelectorAll('.track-clip-block').forEach(el => el.remove());

    this.clips.forEach((clip, idx) => {
      const block = document.createElement('div');
      block.className = 'track-clip-block' + (idx === this.activeClipIndex ? ' active-clip' : '');
      const leftPct = Math.max(0, Math.min(100, (clip.start / this.duration) * 100));
      const widthPct = Math.max(1, Math.min(100 - leftPct, ((clip.end - clip.start) / this.duration) * 100));
      block.style.position = 'absolute';
      block.style.left = `${leftPct}%`;
      block.style.width = `${widthPct}%`;
      block.style.top = '4px';
      block.style.bottom = '4px';
      block.style.cursor = 'pointer';
      if (idx === this.activeClipIndex) {
        block.style.outline = '1.5px solid var(--acc)';
        block.style.background = 'rgba(232,255,71,0.16)';
      }

      const transBadge = clip.transitionIn && clip.transitionIn !== 'none'
        ? `<span style="font-size:9px;background:var(--acc);color:#000;padding:1px 4px;border-radius:3px;margin-right:4px;font-weight:700">${clip.transitionIn}</span>`
        : '';
      block.innerHTML = `<span class="clip-title">${transBadge}${clip.name} (${(clip.end - clip.start).toFixed(1)}s)</span>`;
      block.addEventListener('click', (e) => {
        e.stopPropagation();
        this.activeClipIndex = idx;
        this.renderVideoClips();
      });
      lane.appendChild(block);
    });
  },

  renderAudioWaveform(audioBuffer) {
    const lane = document.querySelector('.track-audio');
    if (!lane || !audioBuffer) return;
    let canvas = lane.querySelector('.waveform-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'waveform-canvas';
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0.55;';
      lane.appendChild(canvas);
    }
    const w = canvas.width = Math.max(400, lane.clientWidth || 600);
    const h = canvas.height = Math.max(32, lane.clientHeight || 40);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);

    const data = audioBuffer.getChannelData(0);
    const step = Math.max(1, Math.floor(data.length / w));
    const amp = h / 2;
    ctx.fillStyle = '#47ffb8';
    for (let i = 0; i < w; i++) {
      let min = 1.0, max = -1.0;
      const offset = i * step;
      for (let j = 0; j < step; j++) {
        const val = data[offset + j] || 0;
        if (val < min) min = val;
        if (val > max) max = val;
      }
      const barTop = (1 + min) * amp;
      const barH = Math.max(1, (max - min) * amp);
      ctx.fillRect(i, barTop, 1, barH);
    }
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

  /**
   * Render timed Memes, Stickers & Overlays on M1 MEMES track
   */
  renderMemeCues(stickers = [], textOverlays = []) {
    const lane = document.querySelector('.track-memes');
    if (!lane || !this.duration) return;
    lane.querySelectorAll('.timeline-meme-chip').forEach(c => c.remove());

    const items = [
      ...stickers.map(s => ({ id: s.id, type: 'meme', label: `${s.emoji || '🎭'} ${s.caption || 'Meme'}`, start: s.start ?? 0, end: s.end ?? this.duration })),
      ...textOverlays.map(t => ({ id: t.id, type: 'text', label: `🏷️ ${t.text}`, start: t.start ?? 0, end: t.end ?? this.duration }))
    ];

    items.forEach(item => {
      const chip = document.createElement('div');
      chip.className = 'timeline-meme-chip';
      const leftPct = Math.max(0, Math.min(100, (item.start / this.duration) * 100));
      const widthPct = Math.max(2.5, Math.min(100 - leftPct, ((item.end - item.start) / this.duration) * 100));
      chip.style.left = `${leftPct}%`;
      chip.style.width = `${widthPct}%`;
      chip.title = `${item.label} (${this.formatTimecode(item.start)} → ${this.formatTimecode(item.end)})`;
      chip.innerHTML = `<span>${item.label}</span>`;
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setTime(item.start);
        if (this.onSeek) this.onSeek(item.start);
      });
      lane.appendChild(chip);
    });
  },

  /**
   * Render Background Music loop & scheduled SFX pins on A2 MUSIC/SFX track
   */
  renderMusicAndSFXCues(musicLoaded, musicTitle, sfxEvents = []) {
    const lane = document.querySelector('.track-music');
    if (!lane || !this.duration) return;
    lane.querySelectorAll('.timeline-music-chip, .timeline-sfx-chip').forEach(c => c.remove());

    if (musicLoaded) {
      const bar = document.createElement('div');
      bar.className = 'timeline-music-chip';
      bar.style.left = '0%';
      bar.style.width = '100%';
      bar.innerHTML = `<span>🎵 ${musicTitle || 'Background Music'}</span>`;
      lane.appendChild(bar);
    }

    sfxEvents.forEach(s => {
      const chip = document.createElement('div');
      chip.className = 'timeline-sfx-chip';
      const leftPct = Math.max(0, Math.min(97, (s.time / this.duration) * 100));
      chip.style.left = `${leftPct}%`;
      chip.title = `SFX: ${s.label} @ ${this.formatTimecode(s.time)}`;
      chip.innerHTML = `<span>🔊 ${s.label}</span>`;
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setTime(s.time);
        if (this.onSeek) this.onSeek(s.time);
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
    const idx = this.clips.findIndex(c => this.currentTime > c.start + 0.1 && this.currentTime < c.end - 0.1);
    if (idx === -1) return false;

    const target = this.clips[idx];
    const origEnd = target.end;
    target.end = +this.currentTime.toFixed(2);
    target.out = target.end;

    const newClip = {
      id: `clip_${Date.now()}`,
      start: +this.currentTime.toFixed(2),
      end: origEnd,
      in: +this.currentTime.toFixed(2),
      out: origEnd,
      speed: target.speed || 1.0,
      transitionIn: target.transitionIn || 'none',
      transitionDur: target.transitionDur || 0.5,
      name: `Clip ${this.clips.length + 1}`
    };

    this.clips.splice(idx + 1, 0, newClip);
    this.activeClipIndex = idx + 1;
    this.renderVideoClips();
    return true;
  },

  deleteActiveClip() {
    if (this.clips.length <= 1) return false;
    const removed = this.clips.splice(this.activeClipIndex, 1)[0];
    if (removed) {
      this.skipRanges.push({ start: removed.start, end: removed.end, reason: 'Deleted Clip' });
      this.skipRanges.sort((a, b) => a.start - b.start);
    }
    this.activeClipIndex = Math.max(0, this.activeClipIndex - 1);
    this.renderVideoClips();
    this.renderSilenceZones(this.silenceZones);
    return true;
  },

  setActiveClipTransition(type = 'crossfade', dur = 0.6) {
    const clip = this.clips[this.activeClipIndex];
    if (!clip) return false;
    clip.transitionIn = type;
    clip.transitionDur = dur;
    this.renderVideoClips();
    return true;
  },

  getTransitionState(currentTime) {
    for (const clip of this.clips) {
      if (clip.transitionIn && clip.transitionIn !== 'none') {
        const dur = clip.transitionDur || 0.5;
        const start = Math.max(clip.start, this.trimIn);
        if (currentTime >= start && currentTime <= start + dur) {
          return {
            type: clip.transitionIn,
            progress: Math.min(1, Math.max(0, (currentTime - start) / dur))
          };
        }
      }
    }
    return null;
  },

  applySilenceCuts(silences) {
    if (!silences || !silences.length) return 0;
    this.skipRanges = silences.map(s => ({ start: s.start, end: s.end, reason: 'Silence Cut' }));
    this.renderSilenceZones(silences);
    return this.skipRanges.length;
  },

  clearSkipRanges() {
    this.skipRanges = [];
    this.silenceZones = [];
    const lane = document.querySelector('.track-audio');
    if (lane) lane.querySelectorAll('.silence-zone-block').forEach(b => b.remove());
  },

  getNextPlayableTime(t) {
    if (!this.skipRanges || !this.skipRanges.length) return null;
    for (const r of this.skipRanges) {
      if (t >= r.start && t < r.end - 0.05) {
        return r.end;
      }
    }
    return null;
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

    const getClientX = (e) => (e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX);

    const handleMove = (clientX) => {
      if (!this.trackContainer || !this.duration) return;
      const rect = this.trackContainer.getBoundingClientRect();
      const posRatio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
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
    };

    const endDrag = () => {
      isDraggingPlayhead = false;
      isDraggingTrimIn = false;
      isDraggingTrimOut = false;
    };

    if (this.trimInEl) {
      const startIn = (e) => { e.stopPropagation(); isDraggingTrimIn = true; };
      this.trimInEl.addEventListener('mousedown', startIn);
      this.trimInEl.addEventListener('touchstart', startIn, { passive: true });
    }

    if (this.trimOutEl) {
      const startOut = (e) => { e.stopPropagation(); isDraggingTrimOut = true; };
      this.trimOutEl.addEventListener('mousedown', startOut);
      this.trimOutEl.addEventListener('touchstart', startOut, { passive: true });
    }

    const startSeek = (e) => {
      if (e.target.closest('.trim-handle') || e.target.closest('.timeline-cue-chip') || e.target.closest('.timeline-meme-chip') || e.target.closest('.timeline-sfx-chip')) return;
      isDraggingPlayhead = true;
      const rect = this.trackContainer.getBoundingClientRect();
      const ratio = (getClientX(e) - rect.left) / rect.width;
      this.seekByRatio(ratio);
    };

    this.trackContainer.addEventListener('mousedown', startSeek);
    this.trackContainer.addEventListener('touchstart', startSeek, { passive: true });

    window.addEventListener('mousemove', (e) => handleMove(e.clientX));
    window.addEventListener('touchmove', (e) => {
      if (isDraggingPlayhead || isDraggingTrimIn || isDraggingTrimOut) {
        handleMove(getClientX(e));
      }
    }, { passive: true });

    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);
  }
};
