# VideoForge Pro 🎬⚡
> The High-Performance, Privacy-First Browser Video Studio & Motion FX Suite.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![HTML5](https://img.shields.io/badge/HTML5-Canvas%202D-orange.svg)
![Web Audio API](https://img.shields.io/badge/Audio-Web%20Audio%20API-blue.svg)
![Speech Recognition](https://img.shields.io/badge/AI-Web%20Speech%20API-green.svg)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20Zero-success.svg)

VideoForge Pro is a modern, client-side video editor, color grading suite, and subtitle generator running entirely in the browser. No uploads to external servers, no subscriptions, zero watermarks forced on you, and instant real-time playback.

---

## 🌟 40+ Features Built-In

### 🎬 1. Ingestion & Multi-Track Assets
1. **Multi-Format Ingestion**: Native playback for MP4, WebM, MOV, MP3, WAV, PNG, JPG, and GIF.
2. **Interactive Drag & Drop**: Drop files directly onto the viewport with immediate aspect ratio matching.
3. **One-Click Demo Sample Generator**: Procedurally draws an interactive test sequence for testing without media files.
4. **Live Screen Recorder**: Native `getDisplayMedia` screen recording with internal/microphone audio.
5. **Live Webcam Recorder**: Direct camera capture with custom resolution settings.
6. **Project Assets Drawer**: Manage imported clips, logos, and audio tracks.

### ⏱️ 2. Timeline, Cutting & Playback
7. **Multi-Track Timeline**: Visual tracks for Video (V1), Audio (A1), and Subtitles/Text (T1).
8. **Dual In/Out Trim Handles**: Draggable trim brackets to set render boundaries with millisecond precision.
9. **Precision Playhead Scrubber**: Real-time seeking with hover timecode readouts.
10. **Split Clip at Playhead**: Split clips into segments at the current playhead (`Key S`).
11. **Frame-by-Frame Precision**: Micro-step forward (+0.05s) and backward (-0.05s) for surgical cutting.
12. **A-B Loop Playback**: Repeat preview of selected trim segments.
13. **Playback Speed Modulation**: Ramp speed from 0.25x to 4.0x with pitch correction.
14. **Timeline Zoom**: Dynamic zoom scale from Fit to 4.0x view.

### 🎨 3. Visual Filters, Color Grading & Look-Up Tables
15. **Real-time Color Grading Sliders**: Brightness, Contrast, Saturation, Exposure, Warmth, and Hue Rotation.
16. **Cinematic LUT Presets**:
    - *Cyberpunk 2077* (Neon Magenta & Cyan)
    - *Teal & Orange Hollywood* (Blockbuster warmth)
    - *Moody Noir* (High-contrast monochrome)
    - *Golden Hour Sunset* (Amber warmth)
    - *Retro 70s* (Faded vintage sepia)
    - *Emerald Matrix* (Green phosphorescent tint)
    - *Soft Pastel* (Low-contrast dreamy)
    - *Dramatic Film* (Punchy shadows & highlights)
17. **Aspect Ratio Engine**: 16:9 (YouTube), 9:16 (TikTok/Shorts), 1:1 (Square), 4:5 (Social Feed), 21:9 (Ultrawide).
18. **Intelligent Background Blur Fill**: Auto-generates an anamorphic blurred background behind the video to prevent black letterbox bars.
19. **Transform & Flip**: 90-degree incremental rotation, horizontal flip, vertical flip, and digital zoom.
20. **Vignette Edge Falloff**: Adjustable dark lens falloff for cinematic depth.
21. **Cinematic Letterbox Bars**: Anamorphic 2.39:1 cinema bars.
22. **VHS Retro Glitch**: Real-time procedural VHS tracking lines and RGB color shift.
23. **CRT Scanlines**: Retro television scanline overlay.
24. **Film Grain & Dust**: Dynamic particle grain simulation.
25. **Chroma Key (Green Screen Removal)**: Adjustable target key color, tolerance threshold, and transparency pass.

### 🎛️ 4. Audio Studio & Sound Design (Web Audio API)
26. **Real-Time Audio Spectrum Visualizer**: Animated frequency spectrum meter synced to video playback.
27. **Volume Booster**: Master gain boost from 0% (Mute) up to 300%.
28. **3-Band Equalizer**: Bass Boost (150Hz), Mid Vocals (1kHz), and Treble Sparkle (4kHz) via BiquadFilterNodes.
29. **Audio Effects Suite**: Room Reverb / Echo and Walkie-Talkie Radio filters.
30. **Royalty-Free SFX Synthesizer**: Built-in sound generator (Whoosh, Bell Ding, Cyber Pulse, LoFi Chords).
31. **Audio Extraction**: 1-click audio track rip directly to uncompressed 16-bit PCM WAV.

### 💬 5. Subtitles & AI Transcription
32. **Web Speech AI Speech-to-Text**: Real-time voice-to-text transcribing speech into timestamped subtitle cues.
33. **Interactive Subtitle Editor**: Create, edit, delete, and click-to-seek through subtitle cues.
34. **Burn-In Subtitle Engine**: Automatically renders high-contrast badges with customizable font and size.
35. **Subtitle Import & Export**: Full .SRT and .VTT parser and generator.

### 📦 6. Overlays, Watermarks & Export
36. **Custom Logo Watermark**: Overlay PNG logos with opacity, scale, and 5 anchor positions.
37. **Text Titles & Lower-Thirds**: Custom fonts, weights, colors, stroke outlines, and badge pill backgrounds.
38. **Sticker & Badge Library**: Instant animated overlay badges (🔥, 🔴 REC, ⭐ 4K, ⚡ NEW).
39. **In-Browser Video Exporter**: Records composite canvas stream + mixed Web Audio into high-bitrate WebM/MP4.
40. **4K Instant Frame Grabber**: Capture high-resolution PNG/JPG snapshot of the exact current frame.
41. **Undo / Redo History**: Full state history stack (Ctrl+Z / Ctrl+Y).
42. **Project Save & Load**: Export and restore entire project states as .videoforge JSON files.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space` | Play / Pause |
| `J` / `K` / `L` | Rewind 2s / Pause / Forward 2s |
| `←` / `→` | Seek 1 second |
| `Shift + ←` / `Shift + →` | Precision 1 Frame Step (0.05s) |
| `S` | Split Clip at Playhead |
| `I` | Set Trim In Point |
| `O` | Set Trim Out Point |
| `M` | Mute / Unmute Audio |
| `F` | Toggle Fullscreen Stage |
| `E` | Open Export Modal |
| `Ctrl + Z` / `Ctrl + Y` | Undo / Redo |

---

## 🚀 Running Locally

No installation or node modules required! Serve with any static web server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```

Open `http://localhost:8000` in Google Chrome or Microsoft Edge.

---

## 📄 License
MIT License. Built with ❤️ for creators, editors, and developers.
