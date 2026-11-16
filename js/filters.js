/**
 * VideoForge Pro - Visual Filter, LUT & Shader Pipeline
 * High-performance 2D Canvas & WebGL Color Engine
 */

export const FilterEngine = {
  // Adjustment state
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

  // Aspect ratio framing
  aspectRatio: '16:9', // '16:9', '9:16', '1:1', '4:5', '21:9', 'original'
  blurBackground: true, // Smart letterbox/pillarbox fill

  // Active LUT & FX
  activeLUT: 'none',
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

  // Frame counter for procedural animations
  frameCount: 0,

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
    this.vignette = 0;
    this.letterbox = 0;
    this.filmGrain = 0;
    this.vhsGlitch = false;
    this.scanlines = false;
    this.chromaticAberration = 0;
    this.chromaKeyEnabled = false;
  },

  /**
   * Builds the composite CSS filter string for standard canvas context
   */
  getCanvasFilterString() {
    const b = 1 + this.brightness / 100;
    const c = 1 + this.contrast / 100;
    const s = 1 + this.saturation / 100;
    const h = this.hueRotate;
    
    // Base adjustments
    let str = `brightness(${b}) contrast(${c}) saturate(${s}) hue-rotate(${h}deg)`;

    // LUT preset overrides & enhancements
    switch (this.activeLUT) {
      case 'cyberpunk':
        str += ` saturate(1.8) hue-rotate(185deg) contrast(1.3)`;
        break;
      case 'teal-orange':
        str += ` contrast(1.25) saturate(1.4) sepia(0.2)`;
        break;
      case 'moody-noir':
        str += ` grayscale(100%) contrast(1.45) brightness(0.9)`;
        break;
      case 'golden-hour':
        str += ` sepia(0.4) saturate(1.5) brightness(1.05)`;
        break;
      case 'retro-70s':
        str += ` sepia(0.55) contrast(0.95) saturate(1.2)`;
        break;
      case 'matrix':
        str += ` hue-rotate(85deg) saturate(2.0) contrast(1.3)`;
        break;
      case 'pastel':
        str += ` brightness(1.15) saturate(0.85) contrast(0.9)`;
        break;
      case 'dramatic':
        str += ` contrast(1.6) saturate(1.1) brightness(0.95)`;
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

    // Standardize master canvas height to 720p or 1080p for crisp editing
    const masterH = 720;
    const masterW = Math.round(masterH * targetRatio);
    return { width: masterW, height: masterH };
  },

  /**
   * Main render pass for a single video frame onto the canvas
   */
  renderFrame(ctx, videoEl, targetW, targetH, textOverlays = [], watermark = null, stickerOverlays = []) {
    this.frameCount++;
    const vW = videoEl.videoWidth || targetW;
    const vH = videoEl.videoHeight || targetH;

    // 1. CLEAR CANVAS
    ctx.clearRect(0, 0, targetW, targetH);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, targetW, targetH);

    // 2. BACKGROUND BLUR PASS (Smart Pillarbox / Letterbox fill)
    if (this.blurBackground && (vW / vH !== targetW / targetH)) {
      ctx.save();
      ctx.filter = 'blur(22px) brightness(0.65)';
      ctx.drawImage(videoEl, -targetW * 0.1, -targetH * 0.1, targetW * 1.2, targetH * 1.2);
      ctx.restore();
    }

    // 3. FOREGROUND VIDEO PASS WITH TRANSFORMS & COLOR FILTERS
    ctx.save();
    
    // Calculate best fit bounding box inside targetW x targetH
    const videoRatio = vW / vH;
    const targetRatio = targetW / targetH;
    let drawW, drawH;

    if (videoRatio > targetRatio) {
      drawW = targetW;
      drawH = targetW / videoRatio;
    } else {
      drawH = targetH;
      drawW = targetH * videoRatio;
    }

    const posX = (targetW - drawW) / 2 + this.panX;
    const posY = (targetH - drawH) / 2 + this.panY;

    // Apply Transformations (Rotate, Flip, Zoom)
    ctx.translate(targetW / 2, targetH / 2);
    if (this.rotation) ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.scale(this.flipH ? -this.zoomScale : this.zoomScale, this.flipV ? -this.zoomScale : this.zoomScale);
    ctx.translate(-targetW / 2, -targetH / 2);

    // Apply color filters
    ctx.filter = this.getCanvasFilterString();
    
    // Draw base video
    ctx.drawImage(videoEl, posX, posY, drawW, drawH);
    ctx.restore();

    // 4. CHROMA KEY FILTER PASS (Optional Green/Blue screen transparency)
    if (this.chromaKeyEnabled) {
      this.applyChromaKeyPass(ctx, targetW, targetH);
    }

    // 5. SPECIAL FX PASSES (Vignette, Letterbox, Scanlines, Glitch, Grain)
    this.applySpecialFX(ctx, targetW, targetH);

    // 6. OVERLAYS PASS (Watermark, Text Overlays, Stickers)
    this.renderOverlays(ctx, targetW, targetH, textOverlays, watermark, stickerOverlays);
  },

  /**
   * Procedural Chroma Keying (Canvas Pixel Manipulation)
   */
  applyChromaKeyPass(ctx, w, h) {
    try {
      const frameData = ctx.getImageData(0, 0, w, h);
      const data = frameData.data;
      const targetRGB = this.hexToRgb(this.chromaColor);
      const tolerance = this.chromaTolerance * 255;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const dist = Math.sqrt(
          (r - targetRGB.r) ** 2 + 
          (g - targetRGB.g) ** 2 + 
          (b - targetRGB.b) ** 2
        );

        if (dist < tolerance) {
          data[i + 3] = 0; // Transparent
        }
      }
      ctx.putImageData(frameData, 0, 0);
    } catch (e) {
      // Ignore security errors on cross-origin media
    }
  },

  /**
   * Special Effects (Vignette, Anamorphic Letterbox, VHS Glitch, Grain)
   */
  applySpecialFX(ctx, w, h) {
    // A. Vignette
    if (this.vignette > 0) {
      const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, Math.max(w, h) * 0.7);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, `rgba(0,0,0,${this.vignette / 100})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    // B. Cinematic Letterbox Bars
    if (this.letterbox > 0) {
      const barHeight = (h * (this.letterbox / 100)) * 0.22;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, barHeight);
      ctx.fillRect(0, h - barHeight, w, barHeight);
    }

    // C. CRT Scanlines
    if (this.scanlines) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 1.5);
      }
    }

    // D. VHS Glitch lines & RGB displacement simulation
    if (this.vhsGlitch && Math.random() > 0.6) {
      ctx.save();
      const sliceH = Math.random() * 20 + 4;
      const sliceY = Math.random() * (h - sliceH);
      const shiftX = (Math.random() - 0.5) * 24;
      ctx.drawImage(ctx.canvas, 0, sliceY, w, sliceH, shiftX, sliceY, w, sliceH);
      
      // Retro scan bar
      ctx.fillStyle = 'rgba(232, 255, 71, 0.15)';
      ctx.fillRect(0, (this.frameCount * 3) % h, w, 6);
      ctx.restore();
    }

    // E. Film Grain
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
   * Renders Text, Watermarks, and Stickers onto the canvas
   */
  renderOverlays(ctx, w, h, textOverlays, watermark, stickerOverlays) {
    // 1. Watermark logo
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

    // 2. Text Overlays
    if (textOverlays && textOverlays.length) {
      textOverlays.forEach(txt => {
        if (!txt.text) return;
        ctx.save();
        ctx.font = `${txt.weight || '700'} ${txt.size || 36}px ${txt.font || 'Syne'}, sans-serif`;
        ctx.textAlign = txt.align || 'center';
        ctx.textBaseline = 'middle';

        const posX = txt.x !== undefined ? (txt.x * w) : w / 2;
        const posY = txt.y !== undefined ? (txt.y * h) : h * 0.82;

        // Background badge
        if (txt.showBadge) {
          const metrics = ctx.measureText(txt.text);
          const padX = 16, padY = 8;
          ctx.fillStyle = txt.badgeColor || 'rgba(0,0,0,0.75)';
          const rectX = posX - (txt.align === 'center' ? (metrics.width / 2 + padX) : padX);
          ctx.beginPath();
          ctx.roundRect(rectX, posY - (txt.size / 2 + padY), metrics.width + padX * 2, txt.size + padY * 2, 8);
          ctx.fill();
        }

        // Text stroke outline
        if (txt.strokeColor) {
          ctx.strokeStyle = txt.strokeColor;
          ctx.lineWidth = txt.strokeWidth || 4;
          ctx.strokeText(txt.text, posX, posY);
        }

        // Text fill
        ctx.fillStyle = txt.color || '#ffffff';
        ctx.fillText(txt.text, posX, posY);
        ctx.restore();
      });
    }

    // 3. Stickers / Badges
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
