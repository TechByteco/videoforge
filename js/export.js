/**
 * VideoForge Pro - Client-Side Video Export, Snapshot & Encoding Engine
 * Powered by Canvas captureStream() and MediaRecorder API
 */

export const ExportEngine = {
  isExporting: false,
  recorder: null,
  recordedChunks: [],

  /**
   * Captures the full resolution snapshot of current frame
   */
  grabFrameSnapshot(canvas, format = 'png', quality = 0.95) {
    if (!canvas) return;
    const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(mime, quality);
    
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `studio-frame-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },

  /**
   * Real in-browser video rendering and export with resolution scaling & image/video support
   */
  async exportVideo({
    canvas,
    videoElement,
    audioContext,
    audioSourceNode,
    startTime = 0,
    endTime = 0,
    resolution = '1080p',
    fps = 30,
    bitrate = 12000000,
    onProgress,
    onComplete,
    onError
  }) {
    if (this.isExporting) return;
    this.isExporting = true;
    this.recordedChunks = [];

    const origW = canvas.width;
    const origH = canvas.height;

    // Apply Resolution Scaling
    const resMap = {
      '720p': 720,
      '1080p': 1080,
      '4k': 2160
    };
    const targetBase = resMap[resolution] || 1080;
    const aspect = origW / (origH || 1);

    let targetW = Math.round(targetBase * aspect);
    let targetH = targetBase;
    if (aspect < 1) { // Portrait (9:16)
      targetW = targetBase;
      targetH = Math.round(targetBase / aspect);
    }
    // Ensure even dimensions
    targetW = targetW % 2 === 0 ? targetW : targetW + 1;
    targetH = targetH % 2 === 0 ? targetH : targetH + 1;

    canvas.width = targetW;
    canvas.height = targetH;

    const restoreCanvas = () => {
      canvas.width = origW;
      canvas.height = origH;
    };

    try {
      // 1. Prepare video stream from canvas
      const canvasStream = canvas.captureStream(fps);
      let combinedStream = canvasStream;

      // 2. Mix Web Audio destination stream if available
      if (audioContext && audioSourceNode) {
        try {
          const dest = audioContext.createMediaStreamDestination();
          audioSourceNode.connect(dest);
          dest.stream.getAudioTracks().forEach(track => {
            combinedStream.addTrack(track);
          });
        } catch (e) {
          console.warn("Audio stream track mixing note:", e);
        }
      }

      // 3. Determine supported MIME types
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
      }

      this.recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: bitrate
      });

      this.recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.recorder.onstop = () => {
        restoreCanvas();
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        this.isExporting = false;

        if (onComplete) {
          onComplete({ blob, url, sizeMB: (blob.size / 1024 / 1024).toFixed(2) });
        }
      };

      const isVideo = videoElement && videoElement.src && !isNaN(videoElement.duration);
      const totalDuration = Math.max(1, (endTime || (isVideo ? videoElement.duration : 12)) - startTime);

      if (isVideo) {
        videoElement.currentTime = startTime;
        await new Promise(r => { videoElement.onseeked = r; });
        this.recorder.start(100);
        videoElement.play();

        const progressInterval = setInterval(() => {
          if (!this.isExporting) {
            clearInterval(progressInterval);
            restoreCanvas();
            return;
          }

          const elapsed = Math.max(0, videoElement.currentTime - startTime);
          const progressPct = Math.min(100, Math.round((elapsed / totalDuration) * 100));

          if (onProgress) {
            onProgress(progressPct, elapsed, totalDuration);
          }

          if (videoElement.currentTime >= (endTime || videoElement.duration) || videoElement.ended) {
            clearInterval(progressInterval);
            videoElement.pause();
            this.recorder.stop();
          }
        }, 100);
      } else {
        // Image / Canvas Demo export loop
        this.recorder.start(100);
        let elapsed = 0;
        const progressInterval = setInterval(() => {
          if (!this.isExporting) {
            clearInterval(progressInterval);
            restoreCanvas();
            return;
          }

          elapsed += 0.1;
          const progressPct = Math.min(100, Math.round((elapsed / totalDuration) * 100));
          if (onProgress) onProgress(progressPct, elapsed, totalDuration);

          if (elapsed >= totalDuration) {
            clearInterval(progressInterval);
            this.recorder.stop();
          }
        }, 100);
      }

    } catch (err) {
      restoreCanvas();
      this.isExporting = false;
      if (onError) onError(err);
    }
  },

  cancelExport() {
    if (this.recorder && this.isExporting) {
      this.recorder.stop();
      this.isExporting = false;
    }
  }
};
