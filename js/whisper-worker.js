/**
 * VideoForge Pro - Whisper AI Web Worker
 * Runs @huggingface/transformers Whisper speech recognition completely off the main UI thread
 * so the browser never shows "Page Unresponsive" during transcription.
 */

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.4.0';

env.allowLocalModels = false;
env.useBrowserCache = true;

const pipelines = {};

const LANG_MAP = {
  es: 'spanish',
  fr: 'french',
  de: 'german',
  hi: 'hindi',
  ar: 'arabic',
  ja: 'japanese',
  pt: 'portuguese',
  it: 'italian',
  zh: 'chinese',
  ko: 'korean'
};

/**
 * Segment 16kHz mono PCM into active speech windows (max 15s each)
 * so Whisper skips dead silence and streams progress after every segment.
 */
function segmentPCMByEnergy(pcm, sr = 16000, totalDur = 30) {
  const win = Math.floor(sr * 0.1); // 100ms
  const energies = [];
  for (let i = 0; i < pcm.length - win; i += win) {
    let s = 0;
    for (let j = 0; j < win; j++) s += pcm[i + j] * pcm[i + j];
    energies.push({ t: i / sr, e: Math.sqrt(s / win) });
  }
  const avg = energies.reduce((a, b) => a + b.e, 0) / (energies.length || 1);
  const thr = Math.max(0.012, avg * 0.55);

  const segs = [];
  let inSp = false;
  let st = 0;
  for (const p of energies) {
    if (!inSp && p.e > thr) {
      inSp = true;
      st = Math.max(0, p.t - 0.15);
    } else if (inSp && (p.e < thr || (p.t - st) >= 15)) {
      const en = Math.min(totalDur, p.t + 0.25);
      if (en - st >= 0.5) segs.push({ start: +st.toFixed(2), end: +en.toFixed(2) });
      inSp = false;
    }
  }
  if (inSp) segs.push({ start: +st.toFixed(2), end: +totalDur.toFixed(2) });

  if (!segs.length) {
    for (let t = 0; t < totalDur; t += 12) {
      const en = Math.min(totalDur, t + 12);
      if (en - t >= 0.8) segs.push({ start: +t.toFixed(2), end: +en.toFixed(2) });
    }
  }
  return segs;
}

function splitTextToCues(start, end, text, maxWords = 6) {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  if (/^[\[(]\s*(blank_audio|silence|no\s*speech|music|applause)\s*[\])]$/i.test(clean)) return [];

  const words = clean.split(' ');
  const safeEnd = Math.max(start + 0.4, end);
  if (words.length <= maxWords) {
    return [{ start: +start.toFixed(2), end: +safeEnd.toFixed(2), text: clean }];
  }

  const out = [];
  const totalWords = words.length;
  const totalDur = safeEnd - start;
  let idx = 0;
  while (idx < totalWords) {
    const slice = words.slice(idx, idx + maxWords);
    const fracStart = idx / totalWords;
    const fracEnd = Math.min(1, (idx + slice.length) / totalWords);
    const cStart = start + fracStart * totalDur;
    const cEnd = Math.max(cStart + 0.35, start + fracEnd * totalDur);
    out.push({ start: +cStart.toFixed(2), end: +cEnd.toFixed(2), text: slice.join(' ') });
    idx += maxWords;
  }
  return out;
}

self.onmessage = async (e) => {
  const { type, jobId, pcmBuffer, duration, language, maxWordsPerCue = 6 } = e.data || {};
  if (type !== 'transcribe') return;

  try {
    const pcm = new Float32Array(pcmBuffer);
    const isEnglish = !language || language.toLowerCase().startsWith('en');
    const modelId = isEnglish ? 'Xenova/whisper-tiny.en' : 'Xenova/whisper-tiny';
    const shortCode = (language || 'en-US').split('-')[0].toLowerCase();

    self.postMessage({
      type: 'progress',
      jobId,
      message: `Loading Whisper AI speech model (${isEnglish ? 'English' : language})…`,
      pct: 20
    });

    if (!pipelines[modelId]) {
      pipelines[modelId] = await pipeline('automatic-speech-recognition', modelId, {
        progress_callback: (info) => {
          if (info && typeof info.progress === 'number') {
            const pct = Math.min(62, 20 + Math.round(info.progress * 0.42));
            const fileLabel = info.file ? ` (${info.file.split('/').pop()})` : '';
            self.postMessage({
              type: 'progress',
              jobId,
              message: `Downloading Whisper AI model${fileLabel}: ${Math.round(info.progress)}%`,
              pct
            });
          }
        }
      });
    }

    const transcriber = pipelines[modelId];
    const effectiveDur = duration || pcm.length / 16000 || 30;
    const segs = segmentPCMByEnergy(pcm, 16000, effectiveDur);

    const langOpts = (!isEnglish && LANG_MAP[shortCode])
      ? { language: LANG_MAP[shortCode], task: 'transcribe' }
      : {};

    const allCues = [];

    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i];
      const sIdx = Math.max(0, Math.floor(seg.start * 16000));
      const eIdx = Math.min(pcm.length, Math.ceil(seg.end * 16000));
      if (eIdx - sIdx < 3200) continue; // < 0.2s

      const pct = 65 + Math.round((i / Math.max(1, segs.length)) * 32);
      self.postMessage({
        type: 'progress',
        jobId,
        message: `Transcribing speech segment ${i + 1}/${segs.length} (${seg.start.toFixed(1)}s–${seg.end.toFixed(1)}s)…`,
        pct
      });

      const slice = pcm.subarray(sIdx, eIdx);
      const res = await transcriber(slice, {
        return_timestamps: true,
        ...langOpts
      });

      const segCues = [];
      const chunks = Array.isArray(res?.chunks) ? res.chunks : [];
      if (chunks.length > 0) {
        for (const ch of chunks) {
          const ts = ch.timestamp || [0, seg.end - seg.start];
          const cStart = seg.start + (typeof ts[0] === 'number' ? Math.max(0, ts[0]) : 0);
          const cEnd = seg.start + (typeof ts[1] === 'number' ? Math.min(seg.end - seg.start, ts[1]) : (seg.end - seg.start));
          segCues.push(...splitTextToCues(cStart, cEnd, ch.text, maxWordsPerCue));
        }
      } else if (res?.text && res.text.trim()) {
        segCues.push(...splitTextToCues(seg.start, seg.end, res.text, maxWordsPerCue));
      }

      if (segCues.length > 0) {
        allCues.push(...segCues);
        self.postMessage({
          type: 'partial',
          jobId,
          cues: segCues
        });
      }
    }

    self.postMessage({
      type: 'done',
      jobId,
      cues: allCues
    });
  } catch (err) {
    self.postMessage({
      type: 'error',
      jobId,
      error: err?.message || String(err)
    });
  }
};
