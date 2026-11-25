/**
 * VideoForge Pro - Client-Side Video Export, Snapshot & Encoding Engine
 * Powered by Canvas captureStream() and MediaRecorder API
 */

import { FilterEngine } from './filters.js';
import { Timeline } from './timeline.js';
import { AudioStudio } from './audio.js';

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
    FilterEngine.isExporting = true;

    let exportAudioDest = null;
    const outputNode = AudioStudio.analyser || audioSourceNode;

    const restoreCanvas = () => {
      canvas.width = origW;
      canvas.height = origH;
      FilterEngine.isExporting = false;
      AudioStudio.syncMusicPlayback(false);
      if (exportAudioDest && outputNode) {
        try { outputNode.disconnect(exportAudioDest); } catch (e) {}
      }
    };

    try {
      // 1. Prepare video stream from canvas
      const canvasStream = canvas.captureStream(fps);
      let combinedStream = canvasStream;

      // 2. Mix Web Audio post-DSP destination stream (EQ, Noise Reduction, Music Mix)
      if (audioContext && outputNode) {
        try {
          exportAudioDest = audioContext.createMediaStreamDestination();
          outputNode.connect(exportAudioDest);
          exportAudioDest.stream.getAudioTracks().forEach(track => {
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
        if (Math.abs(videoElement.currentTime - startTime) > 0.05) {
          videoElement.currentTime = startTime;
          await new Promise(r => {
            const done = () => { videoElement.onseeked = null; r(); };
            videoElement.onseeked = done;
            setTimeout(done, 600);
          });
        }
        this.recorder.start(100);
        videoElement.play();
        AudioStudio.syncMusicPlayback(true, startTime);

        const progressInterval = setInterval(() => {
          if (!this.isExporting) {
            clearInterval(progressInterval);
            restoreCanvas();
            return;
          }

          const skipTo = Timeline.getNextPlayableTime(videoElement.currentTime);
          if (skipTo !== null && skipTo < (endTime || videoElement.duration)) {
            videoElement.currentTime = skipTo;
            return;
          }

          const elapsed = Math.max(0, videoElement.currentTime - startTime);
          AudioStudio.triggerScheduledSFX(videoElement.currentTime);
          const progressPct = Math.min(100, Math.round((elapsed / totalDuration) * 100));

          if (onProgress) {
            onProgress(progressPct, elapsed, totalDuration);
          }

          if (videoElement.currentTime >= (endTime || videoElement.duration) || videoElement.ended) {
            clearInterval(progressInterval);
            videoElement.pause();
            AudioStudio.syncMusicPlayback(false);
            if (this.recorder && this.recorder.state !== 'inactive') {
              this.recorder.stop();
            }
          }
        }, 80);
      } else {
        // Image / Canvas Demo export loop
        this.recorder.start(100);
        AudioStudio.syncMusicPlayback(true, 0);
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
            AudioStudio.syncMusicPlayback(false);
            if (this.recorder && this.recorder.state !== 'inactive') {
              this.recorder.stop();
            }
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
