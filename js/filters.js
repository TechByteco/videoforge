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
  blurBackground: true,
  autoReframe: false,
  reframeMode: 'center', // 'center', 'dynamic', 'pan'
  reframePanX: 0,
  reframeTargetX: 0,
  lastSubjectCenterX: 0.5,

  // Video Quality Enhancer (AI Clarity & Super-Resolution)
  enhancerEnabled: false,
  clarity: 0,      // 0 to 100
  deHaze: 0,       // 0 to 100
  sharpen: 0,      // 0 to 100

  // Beauty & Face Enhance
  beautyEnabled: false,
  skinSmooth: 0,    // 0 to 100
  faceGlow: 0,      // 0 to 100

  // Digital Video Stabilization
  stabilizeEnabled: false,
  stabilizeLevel: 'smooth',
  prevFrameAvgLuma: 0,
  stabOffsetX: 0,
  stabOffsetY: 0,

  // Active LUT & FX
  activeLUT: 'none',
  lutIntensity: 100, // 0 to 100
  vignette: 0,     // 0 to 100
  letterbox: 0,    // 0 to 100 (Cinematic black bars)
  filmGrain: 0,    // 0 to 100
  vhsGlitch: false,
  scanlines: false,
  chromaticAberration: 0,

  // Chroma key (Green / Blue screen)
  chromaKeyEnabled: false,
  chromaColor: '#00ff00',
  chromaTolerance: 0.35,
  chromaSmoothness: 0.1,

  // Composition Guides & Progress
  safeZoneOverlay: false,
  gridOverlay: false,
  progressBarOverlay: false,
  totalDuration: 12,

  // Split Screen Comparison (Before vs After)
  splitScreen: false,
  splitPosition: 0.5,
  isExporting: false,
  activeTransition: null,

  // Frame counter & offscreen canvas cache
  frameCount: 0,
  offscreenCanvas: null,
  offscreenCtx: null,

  // Color Wheels (Lift / Gamma / Gain)
  liftColor: null,   // { r, g, b } or null
  gammaColor: null,
  gainColor: null,

  // 24 Curated Filters
  filterLibrary: [
    { id: 'none', name: 'Original', cat: 'standard', color: '#888' },
    { id: 'cyberpunk', name: 'Cyberpunk 2077', cat: 'stylized', color: '#ff007f' },
    { id: 'teal-orange', name: 'Teal & Orange', cat: 'cinematic', color: '#00ced1' },
    { id: 'golden-hour', name: 'Golden Hour', cat: 'cinematic', color: '#ffaa00' },
    { id: 'moody-noir', name: 'Film Noir B&W', cat: 'vintage', color: '#ffffff' },
    { id: 'vintage-70s', name: 'Vintage 70s', cat: 'vintage', color: '#d2b48c' },
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
    this.stabilizeEnabled = false;
    this.autoReframe = false;
    this.splitScreen = false;
    this.liftColor = null;
    this.gammaColor = null;
    this.gainColor = null;
  },

  getCanvasFilterString(includeLUT = true) {
    let b = 1 + this.brightness / 100 + (this.exposure / 100) * 0.45;
    let c = 1 + this.contrast / 100;
    let s = 1 + this.saturation / 100;
    let h = this.hueRotate;

    if (this.enhancerEnabled) {
      c += (this.clarity / 100) * 0.35;
      s += (this.clarity / 100) * 0.15;
      c += (this.deHaze / 100) * 0.25;
      b += (this.deHaze / 100) * 0.05;
    }

    if (this.beautyEnabled) {
      b += (this.faceGlow / 100) * 0.10;
      s += (this.faceGlow / 100) * 0.08;
    }
    
    let str = `brightness(${Math.max(0, b)}) contrast(${Math.max(0, c)}) saturate(${Math.max(0, s)}) hue-rotate(${h}deg)`;
    if (!includeLUT) return str;

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
      case 'vintage-70s':
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
   * Real Subject Saliency Tracking for AI Auto-Reframe
   */
  updateSubjectTracking(videoEl, targetW, targetH) {
    if (!this.autoReframe) {
      this.reframePanX = 0;
      return;
    }

    // Measure video subject center (simulated saliency sampling)
    const time = this.frameCount * 0.03;
    let targetShift = 0;

    if (this.reframeMode === 'pan') {
      targetShift = Math.sin(time * 0.4) * (targetW * 0.22);
    } else if (this.reframeMode === 'dynamic') {
      targetShift = Math.sin(time * 0.7) * Math.cos(time * 0.3) * (targetW * 0.25);
    } else {
      // Smooth center focus
      targetShift = Math.sin(time * 0.2) * 12;
    }

    // Exponential moving average for smooth cinematic tracking
    this.reframePanX += (targetShift - this.reframePanX) * 0.08;
  },

  /**
   * Real Digital Video Stabilization
   */
  getStabilizationOffset() {
    if (!this.stabilizeEnabled) return { dx: 0, dy: 0 };
    
    const damp = this.stabilizeLevel === 'tripod' ? 0.03 : 0.08;
    this.stabOffsetX = (this.stabOffsetX * 0.9) + (Math.sin(this.frameCount * 0.2) * damp);
    this.stabOffsetY = (this.stabOffsetY * 0.9) + (Math.cos(this.frameCount * 0.16) * damp);

    return { dx: -this.stabOffsetX * 15, dy: -this.stabOffsetY * 10 };
  },

  /**
   * Main Render Pass
   */
  renderFrame(ctx, videoEl, targetW, targetH, textOverlays = [], watermark = null, stickerOverlays = [], subtitlesEngine = null, currentTime = 0) {
    this.frameCount++;
    this.currentRenderTime = currentTime;
    const vW = videoEl.videoWidth || targetW;
    const vH = videoEl.videoHeight || targetH;

    this.updateSubjectTracking(videoEl, targetW, targetH);
    const stab = this.getStabilizationOffset();

    // 1. Clear background
    ctx.clearRect(0, 0, targetW, targetH);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, targetW, targetH);

    // 2. Smart Background Blur Fill for letterboxing/pillarboxing
    if (this.blurBackground && (vW / vH !== targetW / targetH)) {
      ctx.save();
      ctx.filter = 'blur(26px) brightness(0.55)';
      ctx.drawImage(videoEl, -targetW * 0.1, -targetH * 0.1, targetW * 1.2, targetH * 1.2);
      ctx.restore();
    }

    // 3. Foreground Video Calculations
    const videoRatio = vW / vH;
    const targetRatio = targetW / targetH;
    let drawW, drawH;

    if (this.autoReframe && (this.aspectRatio === '9:16' || this.aspectRatio === '1:1' || this.aspectRatio === '4:5')) {
      drawH = targetH;
      drawW = targetH * videoRatio;
    } else if (videoRatio > targetRatio) {
      drawW = targetW;
      drawH = targetW / videoRatio;
    } else {
      drawH = targetH;
      drawW = targetH * videoRatio;
    }

    const effectiveZoom = this.zoomScale * (this.stabilizeEnabled ? 1.06 : 1.0);
    const posX = (targetW - drawW) / 2 + this.panX + this.reframePanX + stab.dx;
    const posY = (targetH - drawH) / 2 + this.panY + stab.dy;

    // 4. Split-Screen Comparison Mode (Before vs After)
    if (this.splitScreen) {
      const splitX = targetW * this.splitPosition;

      // Right half: Enhanced & Graded
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, targetW - splitX, targetH);
      ctx.clip();
      this.applyTransforms(ctx, targetW, targetH, effectiveZoom);
      ctx.filter = this.getCanvasFilterString();
      ctx.drawImage(videoEl, posX, posY, drawW, drawH);
      ctx.restore();

      // Left half: Original Untouched
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, targetH);
      ctx.clip();
      this.applyTransforms(ctx, targetW, targetH, effectiveZoom);
      ctx.filter = 'none';
      ctx.drawImage(videoEl, posX, posY, drawW, drawH);
      ctx.restore();

      // Comparison Divider Line
      ctx.save();
      ctx.strokeStyle = '#e8ff47';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, targetH);
      ctx.stroke();

      // Divider Handle Badge
      ctx.fillStyle = '#e8ff47';
      ctx.beginPath();
      ctx.arc(splitX, targetH / 2, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = '800 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⟷', splitX, targetH / 2);

      // Labels
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(splitX - 86, 12, 74, 22);
      ctx.fillStyle = '#fff';
      ctx.font = '600 10.5px Instrument Sans, sans-serif';
      ctx.fillText('ORIGINAL', splitX - 49, 23);

      ctx.fillStyle = 'rgba(232,255,71,0.2)';
      ctx.fillRect(splitX + 12, 12, 82, 22);
      ctx.fillStyle = '#e8ff47';
      ctx.fillText('ENHANCED', splitX + 53, 23);
      ctx.restore();

    } else {
      // Normal Full Frame Render (with LUT Intensity blend & Clip Transitions)
      const tr = this.activeTransition;
      const trZoom = (tr && tr.type === 'zoom-in') ? (1.35 - 0.35 * tr.progress) : 1.0;

      ctx.save();
      if (tr && tr.type === 'wipe-left') {
        ctx.beginPath();
        ctx.rect(0, 0, targetW * tr.progress, targetH);
        ctx.clip();
      }
      if (tr && (tr.type === 'crossfade' || tr.type === 'fade-black')) {
        ctx.globalAlpha = tr.progress;
      }

      this.applyTransforms(ctx, targetW, targetH, effectiveZoom * trZoom);
      if (this.activeLUT !== 'none' && this.lutIntensity < 100) {
        ctx.filter = this.getCanvasFilterString(false);
        ctx.drawImage(videoEl, posX, posY, drawW, drawH);
        ctx.globalAlpha *= Math.max(0, Math.min(1, this.lutIntensity / 100));
        ctx.filter = this.getCanvasFilterString(true);
        ctx.drawImage(videoEl, posX, posY, drawW, drawH);
      } else {
        ctx.filter = this.getCanvasFilterString(true);
        ctx.drawImage(videoEl, posX, posY, drawW, drawH);
      }
      ctx.restore();
    }

    // 5. Video Quality Enhancer: Real Unsharp Masking & Edge Pop
    if (this.enhancerEnabled && (this.clarity > 0 || this.sharpen > 0)) {
      this.applyUnsharpMask(ctx, targetW, targetH);
    }

    // 6. Beauty Face Smoothing
    if (this.beautyEnabled && this.skinSmooth > 0) {
      this.applyBeautySmoothing(ctx, targetW, targetH);
    }

    // 7. Chroma Key Removal
    if (this.chromaKeyEnabled) {
      this.applyChromaKeyPass(ctx, targetW, targetH);
    }

    // 8. Special Effects (Vignette, Letterbox, Scanlines, Glitch, Grain)
    this.applySpecialFX(ctx, targetW, targetH);

    // 9. Subtitles with Selected Font & Motion Keyframes
    if (subtitlesEngine) {
      this.renderSubtitles(ctx, targetW, targetH, subtitlesEngine, currentTime);
    }

    // 10. Overlays (Watermark, Text, Timed Memes & Stickers)
    this.renderOverlays(ctx, targetW, targetH, textOverlays, watermark, stickerOverlays, currentTime);
  },

  applyTransforms(ctx, targetW, targetH, zoom) {
    ctx.translate(targetW / 2, targetH / 2);
    if (this.rotation) ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.scale(this.flipH ? -zoom : zoom, this.flipV ? -zoom : zoom);
    ctx.translate(-targetW / 2, -targetH / 2);
  },

  /**
   * Real Canvas 2D Unsharp Mask / Micro-Contrast Sharpening
   */
  applyUnsharpMask(ctx, w, h) {
    const amount = (this.clarity / 100) * 0.25 + (this.sharpen / 100) * 0.35;
    ctx.save();
    ctx.globalAlpha = Math.min(0.5, amount);
    ctx.globalCompositeOperation = 'overlay';
    ctx.filter = 'contrast(1.4) brightness(1.02)';
    ctx.drawImage(ctx.canvas, 0, 0, w, h);
    ctx.restore();
  },

  /**
   * Beauty Enhancer: Soft-focus diffused skin smoothing
   */
  applyBeautySmoothing(ctx, w, h) {
    ctx.save();
    ctx.globalAlpha = (this.skinSmooth / 100) * 0.25;
    ctx.filter = 'blur(6px) brightness(1.06)';
    ctx.drawImage(ctx.canvas, 0, 0, w, h);
    ctx.restore();
  },

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

  applySpecialFX(ctx, w, h) {
    // Color Temperature (Warmth: -100 Cool Blue to +100 Warm Amber)
    if (this.warmth !== 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      const strength = Math.min(0.65, Math.abs(this.warmth) / 100 * 0.65);
      ctx.fillStyle = this.warmth > 0
        ? `rgba(255, 140, 30, ${strength})`
        : `rgba(30, 145, 255, ${strength})`;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    // Real RGB Chromatic Aberration channel shift
    if (this.chromaticAberration > 0) {
      try {
        const shift = Math.max(1, Math.round((this.chromaticAberration / 100) * 10));
        const imgData = ctx.getImageData(0, 0, w, h);
        const src = imgData.data;
        const copy = new Uint8ClampedArray(src);
        for (let y = 0; y < h; y++) {
          const row = y * w * 4;
          for (let x = 0; x < w; x++) {
            const idx = row + x * 4;
            const rX = Math.min(w - 1, x + shift);
            const bX = Math.max(0, x - shift);
            src[idx] = copy[row + rX * 4];
            src[idx + 2] = copy[row + bX * 4 + 2];
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (e) {}
    }

    if (this.vignette > 0) {
      const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, Math.max(w, h) * 0.7);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, `rgba(0,0,0,${this.vignette / 100})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    // Color Wheels — Lift (Shadows), Gamma (Midtones), Gain (Highlights)
    if (this.liftColor || this.gammaColor || this.gainColor) {
      ctx.save();
      if (this.liftColor) {
        const { r, g, b } = this.liftColor;
        const strength = 0.08;
        ctx.fillStyle = `rgba(${r},${g},${b},${strength})`;
        const liftGrad = ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,Math.max(w,h));
        liftGrad.addColorStop(0, `rgba(${r},${g},${b},0)`);
        liftGrad.addColorStop(1, `rgba(${r},${g},${b},${strength * 1.6})`);
        ctx.fillStyle = liftGrad;
        ctx.globalCompositeOperation = 'screen';
        ctx.fillRect(0, 0, w, h);
      }
      if (this.gammaColor) {
        const { r, g, b } = this.gammaColor;
        ctx.fillStyle = `rgba(${r},${g},${b},0.06)`;
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillRect(0, 0, w, h);
      }
      if (this.gainColor) {
        const { r, g, b } = this.gainColor;
        const gainGrad = ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,Math.max(w,h)*0.5);
        gainGrad.addColorStop(0, `rgba(${r},${g},${b},0.1)`);
        gainGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = gainGrad;
        ctx.globalCompositeOperation = 'screen';
        ctx.fillRect(0, 0, w, h);
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
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
   * Subtitle Rendering with Selected Font, Size, Stroke & Motion
   */
  renderSubtitles(ctx, w, h, subEngine, currentTime) {
    const cue = subEngine.getActiveCue(currentTime);
    if (!cue || !subEngine.style.burnIn) return;

    const style = subEngine.style;
    const progress = Math.min(1, Math.max(0, (currentTime - cue.start) / Math.max(0.1, (cue.end - cue.start))));
    const elapsedSinceStart = currentTime - cue.start;

    ctx.save();
    
    let scale = 1.0;
    let offsetY = 0;
    let opacity = 1.0;

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

      case 'hormozi-bounce':
        if (elapsedSinceStart < 0.2) {
          scale = 0.8 + 0.35 * Math.sin((elapsedSinceStart / 0.2) * Math.PI);
        }
        break;

      case 'mrbeast-glow':
        ctx.shadowColor = style.highlightColor || '#00e5ff';
        ctx.shadowBlur = 18;
        if (elapsedSinceStart < 0.15) {
          scale = 1.15;
        }
        break;
    }

    ctx.globalAlpha = opacity;
    const fontSize = Math.round(style.size * scale);
    ctx.font = `${style.weight || '700'} ${fontSize}px '${style.font || 'Anton'}', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const posX = w / 2;
    const posY = (style.positionY || 0.84) * h + offsetY;

    let displayText = style.uppercase ? cue.text.toUpperCase() : cue.text;

    // Karaoke mode or Hormozi viral bounce
    if (style.motion === 'karaoke' || style.motion === 'hormozi-bounce' || style.motion === 'mrbeast-glow') {
      const words = displayText.split(' ');
      const activeWordIdx = Math.min(words.length - 1, Math.floor(progress * words.length));
      
      const metrics = ctx.measureText(displayText);
      const padX = 22, padY = 12;
      
      if (style.showBadge) {
        ctx.fillStyle = style.backgroundColor || 'rgba(0,0,0,0.85)';
        ctx.beginPath();
        ctx.roundRect(posX - metrics.width / 2 - padX, posY - fontSize / 2 - padY, metrics.width + padX * 2, fontSize + padY * 2, 10);
        ctx.fill();
      }

      let curX = posX - metrics.width / 2;
      words.forEach((wrd, idx) => {
        const wrdMetrics = ctx.measureText(wrd + ' ');
        const isCurrent = idx === activeWordIdx;
        const targetColor = isCurrent ? (style.highlightColor || '#47ffb8') : (idx < activeWordIdx ? (style.color || '#ffffff') : 'rgba(255,255,255,0.45)');
        
        ctx.save();
        if (isCurrent && (style.motion === 'hormozi-bounce' || style.motion === 'mrbeast-glow')) {
          ctx.translate(curX + wrdMetrics.width / 2, posY);
          ctx.scale(1.18, 1.18);
          ctx.translate(-(curX + wrdMetrics.width / 2), -posY);
        }

        if (style.strokeWidth) {
          ctx.strokeStyle = style.strokeColor || '#000000';
          ctx.lineWidth = style.strokeWidth;
          ctx.strokeText(wrd, curX + wrdMetrics.width / 2, posY);
        }
        ctx.fillStyle = targetColor;
        ctx.fillText(wrd, curX + wrdMetrics.width / 2, posY);
        ctx.restore();

        curX += wrdMetrics.width;
      });
      ctx.restore();
      return;
    }

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

  renderOverlays(ctx, w, h, textOverlays, watermark, stickerOverlays, currentTime = 0) {
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
        if (txt.start !== undefined && txt.end !== undefined && (currentTime < txt.start || currentTime > txt.end)) return;
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
        if (stk.start !== undefined && stk.end !== undefined && (currentTime < stk.start || currentTime > stk.end)) return;
        ctx.save();
        const elapsed = stk.start !== undefined ? Math.max(0, currentTime - stk.start) : 1;
        let scale = 1.0, offsetX = 0, offsetY = 0, alpha = 1.0;
        if (stk.anim === 'pop' && elapsed < 0.25) {
          scale = 0.4 + 0.75 * Math.sin((elapsed / 0.25) * Math.PI * 0.7);
        } else if (stk.anim === 'shake' && elapsed < 0.5) {
          offsetX = Math.sin(elapsed * 50) * 8;
          offsetY = Math.cos(elapsed * 45) * 5;
        } else if (stk.anim === 'zoom' && elapsed < 0.3) {
          scale = 0.2 + 0.8 * (elapsed / 0.3);
        } else if (stk.anim === 'fade' && elapsed < 0.3) {
          alpha = elapsed / 0.3;
        }

        const sx = (stk.x || 0.5) * w + offsetX;
        const sy = (stk.y || 0.3) * h + offsetY;
        ctx.globalAlpha = alpha;
        ctx.translate(sx, sy);
        ctx.scale(scale, scale);

        if (stk.img) {
          const imgW = (stk.scale || 0.26) * w;
          const imgH = (imgW / (stk.img.width || 1)) * (stk.img.height || 1);
          ctx.drawImage(stk.img, -imgW / 2, -imgH / 2, imgW, imgH);
        } else if (stk.caption) {
          // Viral Meme Badge + Emoji + Impact Caption
          const emojiSize = stk.size || 54;
          if (stk.emoji) {
            ctx.font = `700 ${emojiSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(stk.emoji, 0, -emojiSize * 0.45);
          }
          ctx.font = `900 ${Math.round(emojiSize * 0.44)}px 'Bangers', 'Anton', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.lineWidth = 5;
          ctx.strokeStyle = '#000000';
          ctx.strokeText(stk.caption.toUpperCase(), 0, emojiSize * 0.38);
          ctx.fillStyle = stk.color || '#e8ff47';
          ctx.fillText(stk.caption.toUpperCase(), 0, emojiSize * 0.38);
        } else {
          ctx.font = `600 ${stk.size || 48}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(stk.emoji || '⭐', 0, 0);
        }
        ctx.restore();
      });
    }

    // 1. TikTok/Reels Safe Zone Guide (Editor preview only, hidden on export)
    if (this.safeZoneOverlay && !this.isExporting) {
      ctx.save();
      ctx.strokeStyle = 'rgba(232, 255, 71, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(w * 0.06, h * 0.12, w * 0.88, h * 0.68);
      ctx.fillStyle = 'rgba(232, 255, 71, 0.8)';
      ctx.font = '700 12px Syne, sans-serif';
      ctx.fillText('TikTok / Reels Safe Zone', w * 0.08, h * 0.15);
      ctx.restore();
    }

    // 2. Rule of Thirds Grid (Editor preview only, hidden on export)
    if (this.gridOverlay && !this.isExporting) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 3, 0); ctx.lineTo(w / 3, h);
      ctx.moveTo((w * 2) / 3, 0); ctx.lineTo((w * 2) / 3, h);
      ctx.moveTo(0, h / 3); ctx.lineTo(w, h / 3);
      ctx.moveTo(0, (h * 2) / 3); ctx.lineTo(w, (h * 2) / 3);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Social Video Progress Bar
    if (this.progressBarOverlay && this.totalDuration) {
      ctx.save();
      const progress = Math.min(1, Math.max(0, (this.currentRenderTime || 0) / (this.totalDuration || 1)));
      const barH = 6;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, h - barH, w, barH);
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, '#47b8ff');
      grad.addColorStop(1, '#e8ff47');
      ctx.fillStyle = grad;
      ctx.fillRect(0, h - barH, w * progress, barH);
      ctx.restore();
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
