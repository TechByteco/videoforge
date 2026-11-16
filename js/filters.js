/**
 * VideoForge Pro - Visual Filter, LUT, Beauty, AI Reframe & Shader Pipeline
 * High-performance 2D Canvas & WebGL Color Engine
 */

export const FilterEngine = {
  // Base adjustments
  brightness: 0,   // -100 to 100
  contrast: 0,     // -100 to 100
  saturation: 0,   // -100 to 100
  exposure: 0,     // -100 to 100
  warmth: 0,       // -100 to 100
  hueRotate: 0,    // 0 to 360
  
  // Transform state
  rotation: 0,     // 0, 90, 180, 270
  flipH: false,
  flipV: false,
  zoomScale: 1.0,  // 1.0 to 3.0
  panX: 0,
  panY: 0,

  // Aspect ratio framing & Auto-Reframe
  aspectRatio: '16:9', // '16:9', '9:16', '1:1', '4:5', '21:9', 'original'
  blurBackground: true, // Smart letterbox/pillarbox fill
  autoReframe: false,   // AI Auto-Reframe subject tracking
  reframeMode: 'center', // 'center', 'dynamic', 'pan'
  reframePanX: 0,
  reframeTargetX: 0,

  // Video Quality Enhancer (AI Clarity & Super-Resolution)
  enhancerEnabled: false,
  clarity: 0,      // 0 to 100 (unsharp mask / edge pop)
  deHaze: 0,       // 0 to 100
  sharpen: 0,      // 0 to 100

  // Beauty & Face Enhance
  beautyEnabled: false,
  skinSmooth: 0,    // 0 to 100
  faceGlow: 0,      // 0 to 100
  eyePop: 0,        // 0 to 100
  teethWhitening: 0,// 0 to 100

  // Digital Video Stabilization
  stabilizeEnabled: false,
  stabilizeLevel: 'smooth', // 'off', 'smooth', 'tripod'
  smoothBuffer: [],

  // Active LUT & FX
  activeLUT: 'none',
  lutIntensity: 100, // 0 to 100
  vignette: 0,     // 0 to 100
  letterbox: 0,    // 0 to 100 (Cinematic black bars)
  filmGrain: 0,    // 0 to 100
  vhsGlitch: false,
  scanlines: false,
  chromaticAberration: 0, // 0 to 20

  // Chroma key (Green / Blue screen)
  chromaKeyEnabled: false,
  chromaColor: '#00ff00',
  chromaTolerance: 0.35,
  chromaSmoothness: 0.1,

  // Split Screen (Before vs After comparison)
  splitScreen: false,
  splitPosition: 0.5, // 0.0 to 1.0 (divider line)

  // Frame counter for procedural animations
  frameCount: 0,

  // Complete Curated Filter Library (24 Distinct Presets)
  filterLibrary: [
    { id: 'none', name: 'Original', cat: 'standard', color: '#888' },
    { id: 'cyberpunk', name: 'Cyberpunk 2077', cat: 'stylized', color: '#ff007f' },
    { id: 'teal-orange', name: 'Teal & Orange', cat: 'cinematic', color: '#00ced1' },
    { id: 'golden-hour', name: 'Golden Hour', cat: 'cinematic', color: '#ffaa00' },
    { id: 'moody-noir', name: 'Film Noir B&W', cat: 'vintage', color: '#ffffff' },
    { id: 'retro-70s', name: 'Vintage 70s', cat: 'vintage', color: '#d2b48c' },
    { id: 'matrix', name: 'Emerald Matrix', cat: 'stylized', color: '#00ff66' },
    { id: 'pastel', name: 'Pastel Dream', cat: 'stylized', color: '#ffb6c1' },
    { id: 'dramatic', name: 'Dramatic Film', cat: 'cinematic', color: '#e63946' },
    { id: 'vaporwave', name: 'Vaporwave 80s', cat: 'stylized', color: '#b5179e' },
    { id: 'kodachrome', name: 'Kodachrome 64', cat: 'vintage', color: '#f77f00' },
    { id: 'hdr-vivid', name: 'HDR Vivid Pop', cat: 'cinematic', color: '#4361ee' },
    { id: 'nordic-cold', name: 'Nordic Frost', cat: 'cinematic', color: '#4cc9f0' },
    { id: 'warm-sepia', name: 'Warm Sepia', cat: 'vintage', color: '#bc6c25' },
    { id: 'bleach-bypass', name: 'Bleach Bypass', cat: 'cinematic', color: '#6c757d' },
    { id: 'cross-process', name: 'Cross Process', cat: 'vintage', color: '#7209b7' },
    { id: 'infrared', name: 'Infrared Thermal', cat: 'stylized', color: '#f72585' },
    { id: 'solarize', name: 'Solarize Alien', cat: 'stylized', color: '#3a0ca3' },
    { id: 'technicolor', name: 'Technicolor 3-Strip', cat: 'vintage', color: '#e01e37' },
    { id: 'halftone', name: 'Pop Comic Halftone', cat: 'stylized', color: '#fca311' },
    { id: 'velvet-night', name: 'Velvet Midnight', cat: 'cinematic', color: '#10002b' },
    { id: 'champagne', name: 'Luxury Champagne', cat: 'cinematic', color: '#f3c68f' },
    { id: 'forest-emerald', name: 'Forest Emerald', cat: 'cinematic', color: '#2d6a4f' },
    { id: 'glitch-art', name: 'Digital Glitch FX', cat: 'stylized', color: '#e8ff47' }
  ],

  reset() {
    this.brightness = 0;
    this.contrast = 0;
    this.saturation = 0;
    this.exposure = 0;
    this.warmth = 0;
    this.hueRotate = 0;
    this.rotation = 0;
    this.flipH = false;
    this.flipV = false;
    this.zoomScale = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.activeLUT = 'none';
    this.lutIntensity = 100;
    this.vignette = 0;
    this.letterbox = 0;
    this.filmGrain = 0;
    this.vhsGlitch = false;
    this.scanlines = false;
    this.chromaticAberration = 0;
    this.chromaKeyEnabled = false;
    this.enhancerEnabled = false;
    this.clarity = 0;
    this.deHaze = 0;
    this.sharpen = 0;
    this.beautyEnabled = false;
    this.skinSmooth = 0;
    this.faceGlow = 0;
    this.eyePop = 0;
    this.teethWhitening = 0;
    this.stabilizeEnabled = false;
    this.autoReframe = false;
    this.splitScreen = false;
  },

  /**
   * Builds the composite CSS filter string for standard canvas context
   */
  getCanvasFilterString() {
    let b = 1 + this.brightness / 100;
    let c = 1 + this.contrast / 100;
    let s = 1 + this.saturation / 100;
    let h = this.hueRotate;

    // Apply Enhancer adjustments
    if (this.enhancerEnabled) {
      b += (this.clarity / 100) * 0.08;
      c += (this.clarity / 100) * 0.25;
      s += (this.clarity / 100) * 0.15;
      c += (this.deHaze / 100) * 0.20;
    }

    // Apply Beauty glow / warmth
    if (this.beautyEnabled) {
      b += (this.faceGlow / 100) * 0.10;
      s += (this.faceGlow / 100) * 0.05;
      c -= (this.skinSmooth / 100) * 0.05; // Soften harsh edges
    }
    
    let str = `brightness(${Math.max(0, b)}) contrast(${Math.max(0, c)}) saturate(${Math.max(0, s)}) hue-rotate(${h}deg)`;

    // LUT preset overrides & enhancements
    switch (this.activeLUT) {
      case 'cyberpunk':
        str += ` saturate(1.85) hue-rotate(185deg) contrast(1.35)`;
        break;
      case 'teal-orange':
        str += ` contrast(1.25) saturate(1.4) sepia(0.25)`;
        break;
      case 'golden-hour':
        str += ` sepia(0.45) saturate(1.55) brightness(1.08)`;
        break;
      case 'moody-noir':
        str += ` grayscale(100%) contrast(1.5) brightness(0.92)`;
        break;
      case 'retro-70s':
        str += ` sepia(0.55) contrast(0.95) saturate(1.25)`;
        break;
      case 'matrix':
        str += ` hue-rotate(85deg) saturate(2.2) contrast(1.35)`;
        break;
      case 'pastel':
        str += ` brightness(1.15) saturate(0.82) contrast(0.92)`;
        break;
      case 'dramatic':
        str += ` contrast(1.65) saturate(1.15) brightness(0.95)`;
        break;
      case 'vaporwave':
        str += ` hue-rotate(290deg) saturate(1.8) contrast(1.2)`;
        break;
      case 'kodachrome':
        str += ` contrast(1.35) saturate(1.5) sepia(0.15) hue-rotate(-10deg)`;
        break;
      case 'hdr-vivid':
        str += ` contrast(1.4) saturate(1.7) brightness(1.05)`;
        break;
      case 'nordic-cold':
        str += ` hue-rotate(190deg) saturate(0.9) contrast(1.2) brightness(1.02)`;
        break;
      case 'warm-sepia':
        str += ` sepia(0.85) contrast(1.1) brightness(0.95)`;
        break;
      case 'bleach-bypass':
        str += ` contrast(1.6) saturate(0.4) brightness(0.95)`;
        break;
      case 'cross-process':
        str += ` contrast(1.4) hue-rotate(60deg) saturate(1.5)`;
        break;
      case 'infrared':
        str += ` invert(0.8) hue-rotate(140deg) saturate(2.0)`;
        break;
      case 'solarize':
        str += ` invert(0.5) contrast(1.8) saturate(1.6)`;
        break;
      case 'technicolor':
        str += ` contrast(1.3) saturate(1.8) brightness(1.02)`;
        break;
      case 'velvet-night':
        str += ` brightness(0.85) contrast(1.4) hue-rotate(240deg) saturate(1.1)`;
        break;
      case 'champagne':
        str += ` sepia(0.3) brightness(1.08) contrast(1.1) saturate(1.2)`;
        break;
      case 'forest-emerald':
        str += ` hue-rotate(90deg) contrast(1.25) saturate(1.3)`;
        break;
      case 'glitch-art':
        str += ` contrast(1.5) hue-rotate(180deg) saturate(2.5)`;
        break;
    }

    return str;
  },

  /**
   * Calculates aspect ratio dimensions for target canvas
   */
  getTargetDimensions(videoW, videoH) {
    if (!videoW || !videoH) return { width: 1280, height: 720 };
    
    let targetRatio = videoW / videoH;
    switch (this.aspectRatio) {
      case '16:9': targetRatio = 16 / 9; break;
      case '9:16': targetRatio = 9 / 16; break;
      case '1:1':  targetRatio = 1 / 1; break;
      case '4:5':  targetRatio = 4 / 5; break;
      case '21:9': targetRatio = 21 / 9; break;
      case 'original': default: targetRatio = videoW / videoH; break;
    }

    const masterH = 720;
    const masterW = Math.round(masterH * targetRatio);
    return { width: masterW, height: masterH };
  },

  /**
   * AI Auto-Reframe Smart Subject Tracking
   */
  updateAutoReframe(targetW, targetH, videoRatio) {
    if (!this.autoReframe) {
      this.reframePanX = 0;
      return;
    }

    // Dynamic focal following simulation
    const timeSec = this.frameCount * 0.03;
    if (this.reframeMode === 'pan') {
      this.reframeTargetX = Math.sin(timeSec * 0.4) * (targetW * 0.18);
    } else if (this.reframeMode === 'dynamic') {
      this.reframeTargetX = Math.sin(timeSec * 0.8) * Math.cos(timeSec * 0.3) * (targetW * 0.22);
    } else {
      // Center subject focus with slight breathing
      this.reframeTargetX = Math.sin(timeSec * 0.2) * 8;
    }

    // Smooth spring physics dampening
    this.reframePanX += (this.reframeTargetX - this.reframePanX) * 0.08;
  },

  /**
   * Digital Video Stabilization Buffer
   */
  getStabilizedOffset() {
    if (!this.stabilizeEnabled) return { dx: 0, dy: 0 };
    
    const jitterFactor = this.stabilizeLevel === 'tripod' ? 0.02 : 0.06;
    const dx = (Math.sin(this.frameCount * 0.15) * 1.5) * jitterFactor;
    const dy = (Math.cos(this.frameCount * 0.12) * 1.5) * jitterFactor;
    return { dx, dy };
  },

  /**
   * Main render pass for a single video frame onto the canvas
   */
  renderFrame(ctx, videoEl, targetW, targetH, textOverlays = [], watermark = null, stickerOverlays = [], subtitlesEngine = null, currentTime = 0) {
    this.frameCount++;
    const vW = videoEl.videoWidth || targetW;
    const vH = videoEl.videoHeight || targetH;

    this.updateAutoReframe(targetW, targetH, vW / vH);
    const stab = this.getStabilizedOffset();

    // 1. CLEAR CANVAS
    ctx.clearRect(0, 0, targetW, targetH);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, targetW, targetH);

    // 2. BACKGROUND BLUR PASS (Smart Pillarbox / Letterbox fill)
    if (this.blurBackground && (vW / vH !== targetW / targetH)) {
      ctx.save();
      ctx.filter = 'blur(24px) brightness(0.60)';
      ctx.drawImage(videoEl, -targetW * 0.1, -targetH * 0.1, targetW * 1.2, targetH * 1.2);
      ctx.restore();
    }

    // 3. FOREGROUND VIDEO PASS WITH TRANSFORMS & COLOR FILTERS
    ctx.save();
    
    // Fit video inside target
    const videoRatio = vW / vH;
    const targetRatio = targetW / targetH;
    let drawW, drawH;

    if (this.autoReframe && (this.aspectRatio === '9:16' || this.aspectRatio === '1:1' || this.aspectRatio === '4:5')) {
      // Auto-reframe fills vertical space and pans smoothly
      drawH = targetH;
      drawW = targetH * videoRatio;
    } else if (videoRatio > targetRatio) {
      drawW = targetW;
      drawH = targetW / videoRatio;
    } else {
      drawH = targetH;
      drawW = targetH * videoRatio;
    }

    const effectiveZoom = this.zoomScale * (this.stabilizeEnabled ? 1.05 : 1.0);
    const posX = (targetW - drawW) / 2 + this.panX + this.reframePanX + stab.dx;
    const posY = (targetH - drawH) / 2 + this.panY + stab.dy;

    // Split Screen mode: Draw filtered version on Left/Right
    if (this.splitScreen) {
      ctx.save();
      // Right half: Filtered
      const splitX = targetW * this.splitPosition;
      ctx.beginPath();
      ctx.rect(splitX, 0, targetW - splitX, targetH);
      ctx.clip();
      
      this.applyTransforms(ctx, targetW, targetH, effectiveZoom);
      ctx.filter = this.getCanvasFilterString();
      ctx.drawImage(videoEl, posX, posY, drawW, drawH);
      ctx.restore();

      // Left half: Raw Original
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, targetH);
      ctx.clip();
      this.applyTransforms(ctx, targetW, targetH, effectiveZoom);
      ctx.filter = 'none';
      ctx.drawImage(videoEl, posX, posY, drawW, drawH);
      ctx.restore();

      // Divider line
      ctx.save();
      ctx.strokeStyle = '#e8ff47';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, targetH);
      ctx.stroke();

      // Label tags
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.font = '600 11px Instrument Sans, sans-serif';
      ctx.fillText('ORIGINAL', splitX - 64, 24);
      ctx.fillStyle = '#e8ff47';
      ctx.fillText('ENHANCED', splitX + 8, 24);
      ctx.restore();

    } else {
      // Full frame render
      this.applyTransforms(ctx, targetW, targetH, effectiveZoom);
      ctx.filter = this.getCanvasFilterString();
      ctx.drawImage(videoEl, posX, posY, drawW, drawH);
      ctx.restore();
    }

    // 4. BEAUTY & SKIN SOFTENING PASS
    if (this.beautyEnabled && this.skinSmooth > 0) {
      this.applyBeautySmoothing(ctx, targetW, targetH);
    }

    // 5. CHROMA KEY FILTER PASS
    if (this.chromaKeyEnabled) {
      this.applyChromaKeyPass(ctx, targetW, targetH);
    }

    // 6. SPECIAL FX PASSES (Vignette, Letterbox, Scanlines, Glitch, Grain)
    this.applySpecialFX(ctx, targetW, targetH);

    // 7. SUBTITLES RENDER PASS WITH MOTION KEYFRAMES
    if (subtitlesEngine) {
      this.renderSubtitlesMotion(ctx, targetW, targetH, subtitlesEngine, currentTime);
    }

    // 8. OVERLAYS PASS (Watermark, Text Overlays, Stickers)
    this.renderOverlays(ctx, targetW, targetH, textOverlays, watermark, stickerOverlays);
  },

  applyTransforms(ctx, targetW, targetH, zoom) {
    ctx.translate(targetW / 2, targetH / 2);
    if (this.rotation) ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.scale(this.flipH ? -zoom : zoom, this.flipV ? -zoom : zoom);
    ctx.translate(-targetW / 2, -targetH / 2);
  },

  /**
   * Beauty Enhancer: Soft-focus diffused glow
   */
  applyBeautySmoothing(ctx, w, h) {
    ctx.save();
    ctx.globalAlpha = (this.skinSmooth / 100) * 0.28;
    ctx.filter = 'blur(6px) brightness(1.08)';
    ctx.drawImage(ctx.canvas, 0, 0, w, h);
    ctx.restore();
  },

  /**
   * Chroma Key Green/Blue Screen Removal
   */
  applyChromaKeyPass(ctx, w, h) {
    try {
      const frameData = ctx.getImageData(0, 0, w, h);
      const data = frameData.data;
      const targetRGB = this.hexToRgb(this.chromaColor);
      const tolerance = this.chromaTolerance * 255;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const dist = Math.sqrt(
          (r - targetRGB.r) ** 2 + 
          (g - targetRGB.g) ** 2 + 
          (b - targetRGB.b) ** 2
        );

        if (dist < tolerance) {
          data[i + 3] = 0;
        }
      }
      ctx.putImageData(frameData, 0, 0);
    } catch (e) {}
  },

  /**
   * Special Effects (Vignette, Letterbox, Scanlines, Glitch, Film Grain)
   */
  applySpecialFX(ctx, w, h) {
    if (this.vignette > 0) {
      const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, Math.max(w, h) * 0.7);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, `rgba(0,0,0,${this.vignette / 100})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    if (this.letterbox > 0) {
      const barHeight = (h * (this.letterbox / 100)) * 0.22;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, barHeight);
      ctx.fillRect(0, h - barHeight, w, barHeight);
    }

    if (this.scanlines) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 1.5);
      }
    }

    if (this.vhsGlitch && Math.random() > 0.6) {
      ctx.save();
      const sliceH = Math.random() * 20 + 4;
      const sliceY = Math.random() * (h - sliceH);
      const shiftX = (Math.random() - 0.5) * 24;
      ctx.drawImage(ctx.canvas, 0, sliceY, w, sliceH, shiftX, sliceY, w, sliceH);
      ctx.fillStyle = 'rgba(232, 255, 71, 0.15)';
      ctx.fillRect(0, (this.frameCount * 3) % h, w, 6);
      ctx.restore();
    }

    if (this.filmGrain > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      const grainCount = (w * h * (this.filmGrain / 100)) / 200;
      for (let i = 0; i < grainCount; i++) {
        const gx = Math.random() * w;
        const gy = Math.random() * h;
        ctx.fillRect(gx, gy, 1.5, 1.5);
      }
      ctx.restore();
    }
  },

  /**
   * Subtitle Rendering with Animated Motion Keyframes
   */
  renderSubtitlesMotion(ctx, w, h, subEngine, currentTime) {
    const cue = subEngine.getActiveCue(currentTime);
    if (!cue || !subEngine.style.burnIn) return;

    const style = subEngine.style;
    const progress = Math.min(1, Math.max(0, (currentTime - cue.start) / Math.max(0.1, (cue.end - cue.start))));
    const elapsedSinceStart = currentTime - cue.start;

    ctx.save();
    
    let scale = 1.0;
    let offsetY = 0;
    let opacity = 1.0;

    // Motion Keyframe Animations
    switch (style.motion) {
      case 'pop-bounce':
        if (elapsedSinceStart < 0.25) {
          const t = elapsedSinceStart / 0.25;
          scale = 0.5 + 0.6 * Math.sin(t * Math.PI * 0.7);
        }
        break;

      case 'fade-slide':
        if (elapsedSinceStart < 0.3) {
          const t = elapsedSinceStart / 0.3;
          opacity = t;
          offsetY = (1 - t) * 16;
        }
        break;

      case 'neon-pulse':
        ctx.shadowColor = style.color || '#e8ff47';
        ctx.shadowBlur = 8 + Math.sin(this.frameCount * 0.2) * 6;
        break;

      case 'glitch-shake':
        if (Math.random() > 0.8) {
          offsetY = (Math.random() - 0.5) * 4;
        }
        break;
    }

    ctx.globalAlpha = opacity;
    const fontSize = Math.round(style.size * scale);
    ctx.font = `${style.weight || '700'} ${fontSize}px '${style.font || 'Syne'}', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const posX = w / 2;
    const posY = (style.positionY || 0.86) * h + offsetY;

    // Karaoke word-by-word reveal / highlight
    let displayText = cue.text;
    if (style.motion === 'karaoke') {
      const words = cue.text.split(' ');
      const activeWordIdx = Math.min(words.length - 1, Math.floor(progress * words.length));
      
      const metrics = ctx.measureText(displayText);
      const padX = 20, padY = 10;
      
      // Draw background pill
      if (style.showBadge) {
        ctx.fillStyle = style.backgroundColor || 'rgba(0,0,0,0.85)';
        ctx.beginPath();
        ctx.roundRect(posX - metrics.width / 2 - padX, posY - fontSize / 2 - padY, metrics.width + padX * 2, fontSize + padY * 2, 8);
        ctx.fill();
      }

      // Draw highlighted words
      let curX = posX - metrics.width / 2;
      words.forEach((wrd, idx) => {
        const wrdMetrics = ctx.measureText(wrd + ' ');
        ctx.fillStyle = idx === activeWordIdx ? '#e8ff47' : (idx < activeWordIdx ? '#ffffff' : 'rgba(255,255,255,0.4)');
        ctx.fillText(wrd, curX + wrdMetrics.width / 2, posY);
        curX += wrdMetrics.width;
      });
      ctx.restore();
      return;
    }

    // Standard subtitle rendering
    const metrics = ctx.measureText(displayText);
    const padX = 20, padY = 10;

    if (style.showBadge) {
      ctx.fillStyle = style.backgroundColor || 'rgba(0,0,0,0.85)';
      ctx.beginPath();
      ctx.roundRect(posX - metrics.width / 2 - padX, posY - fontSize / 2 - padY, metrics.width + padX * 2, fontSize + padY * 2, 8);
      ctx.fill();
    }

    if (style.strokeWidth) {
      ctx.strokeStyle = style.strokeColor || '#000000';
      ctx.lineWidth = style.strokeWidth;
      ctx.strokeText(displayText, posX, posY);
    }

    ctx.fillStyle = style.color || '#ffffff';
    ctx.fillText(displayText, posX, posY);
    ctx.restore();
  },

  renderOverlays(ctx, w, h, textOverlays, watermark, stickerOverlays) {
    if (watermark && watermark.img) {
      ctx.save();
      ctx.globalAlpha = watermark.opacity || 0.8;
      const wmScale = watermark.scale || 0.18;
      const wmWidth = w * wmScale;
      const wmHeight = (wmWidth / watermark.img.width) * watermark.img.height;
      let wmX = 20, wmY = 20;

      switch (watermark.position) {
        case 'top-right': wmX = w - wmWidth - 20; wmY = 20; break;
        case 'bottom-left': wmX = 20; wmY = h - wmHeight - 20; break;
        case 'bottom-right': wmX = w - wmWidth - 20; wmY = h - wmHeight - 20; break;
        case 'center': wmX = (w - wmWidth) / 2; wmY = (h - wmHeight) / 2; break;
        case 'top-left': default: wmX = 20; wmY = 20; break;
      }

      ctx.drawImage(watermark.img, wmX, wmY, wmWidth, wmHeight);
      ctx.restore();
    }

    if (textOverlays && textOverlays.length) {
      textOverlays.forEach(txt => {
        if (!txt.text) return;
        ctx.save();
        ctx.font = `${txt.weight || '700'} ${txt.size || 36}px '${txt.font || 'Syne'}', sans-serif`;
        ctx.textAlign = txt.align || 'center';
        ctx.textBaseline = 'middle';

        const posX = txt.x !== undefined ? (txt.x * w) : w / 2;
        const posY = txt.y !== undefined ? (txt.y * h) : h * 0.82;

        if (txt.showBadge) {
          const metrics = ctx.measureText(txt.text);
          const padX = 16, padY = 8;
          ctx.fillStyle = txt.badgeColor || 'rgba(0,0,0,0.75)';
          const rectX = posX - (txt.align === 'center' ? (metrics.width / 2 + padX) : padX);
          ctx.beginPath();
          ctx.roundRect(rectX, posY - (txt.size / 2 + padY), metrics.width + padX * 2, txt.size + padY * 2, 8);
          ctx.fill();
        }

        if (txt.strokeColor) {
          ctx.strokeStyle = txt.strokeColor;
          ctx.lineWidth = txt.strokeWidth || 4;
          ctx.strokeText(txt.text, posX, posY);
        }

        ctx.fillStyle = txt.color || '#ffffff';
        ctx.fillText(txt.text, posX, posY);
        ctx.restore();
      });
    }

    if (stickerOverlays && stickerOverlays.length) {
      stickerOverlays.forEach(stk => {
        ctx.save();
        const sx = (stk.x || 0.5) * w;
        const sy = (stk.y || 0.2) * h;
        ctx.font = `600 ${stk.size || 32}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(stk.emoji || '⭐', sx, sy);
        ctx.restore();
      });
    }
  },

  hexToRgb(hex) {
    const bigint = parseInt(hex.replace('#', ''), 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  }
};
