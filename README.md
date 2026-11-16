# VideoForge Pro 🎬⚡
> The High-Performance, Privacy-First Browser Video Studio, Motion FX & AI Subtitle Suite.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![HTML5](https://img.shields.io/badge/HTML5-Canvas%202D-orange.svg)
![Web Audio API](https://img.shields.io/badge/Audio-Web%20Audio%20API-blue.svg)
![AI Speech Recognition](https://img.shields.io/badge/AI-Speech%20Recognition-green.svg)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20Zero-success.svg)

VideoForge Pro is a modern, client-side video editor, color grading suite, audio studio, and AI subtitle generator running entirely in the browser. Zero cloud uploads, zero subscriptions, zero watermarks forced on you, and instant real-time playback.

---

## 🌟 Premium Features Built-In

### 💬 1. Subtitles Auto Generator, Multi-Font Typography & Motion
- **AI Subtitle Auto-Generator**: Real-time voice-to-text transcribing speech into timestamped subtitle blocks with automatic grammar and punctuation.
- **Multiple Font Typography Selection**:
  - `Syne` (Bold Modern Display)
  - `Anton` (Viral TikTok / Reels Impact)
  - `Bebas Neue` (Cinematic Condensed)
  - `Montserrat` (Clean Modern Editorial)
  - `Instrument Sans` (Contemporary Interface)
  - `DM Mono` (Developer Code Monospace)
  - `Playfair Display` (Luxury Editorial Serif)
  - `Orbitron` (Futuristic Sci-Fi)
  - `Caveat` (Handwritten Organic)
- **Subtitles Motion Keyframes & Animations**:
  - `Pop-Up Bounce`: Energetic scale-in punch for short-form social videos.
  - `Fade-In Slide Up`: Smooth cinematic vertical entrance.
  - `Karaoke Highlight`: Word-by-word active highlight synced to speech cadence.
  - `Neon Pulse Glow`: Vibrant pulsing cyber aura.
  - `Digital Glitch Shake`: Twitch effect for energetic cuts.
- **Video Language Translator**: 1-click instant subtitle translation into Spanish (`es`), French (`fr`), German (`de`), Japanese (`ja`), Hindi (`hi`), or Arabic (`ar`).
- **Subtitle Export/Import**: Full `.SRT` and `.VTT` parser and generator.

### 🎨 2. Visual Filter Gallery (24 Curated Presets)
Visual filter gallery with interactive preview cards:
1. `Original`: Raw untouched footage
2. `Cyberpunk 2077`: Neon magenta and cyan contrast
3. `Teal & Orange`: Blockbuster cinematic Hollywood warmth
4. `Golden Hour`: Sunset amber glow
5. `Film Noir B&W`: High-contrast black and white
6. `Vintage 70s`: Warm nostalgic sepia
7. `Emerald Matrix`: Phosphor digital green
8. `Pastel Dream`: Soft low-contrast aesthetic
9. `Dramatic Film`: Deep cinematic shadows
10. `Vaporwave 80s`: Retro purple synthwave
11. `Kodachrome 64`: Vintage film stock simulation
12. `HDR Vivid Pop`: Punchy saturation and dynamic clarity
13. `Nordic Frost`: Cold arctic blue tones
14. `Warm Sepia`: Classical documentary tint
15. `Bleach Bypass`: Gritty war film look
16. `Cross Process`: Experimental color shift
17. `Infrared Thermal`: False-color heat vision
18. `Solarize Alien`: Inverted midtone glow
19. `Technicolor 3-Strip`: Golden age Hollywood color
20. `Pop Comic Halftone`: Graphic pop-art look
21. `Velvet Midnight`: Deep royal violet shadows
22. `Luxury Champagne`: Warm high-end commercial glow
23. `Forest Emerald`: Lush organic green enhancement
24. `Digital Glitch FX`: RGB chromatic color aberration

### 🔍 3. Video Quality Enhancer & Beauty Effects
- **AI Clarity & Super-Resolution**: Unsharp mask micro-contrast filter bringing out fine facial textures and sharp details.
- **De-Haze Filter**: Removes atmospheric milkiness and fog.
- **Skin Softening**: Smooths skin blemishes while preserving natural eye and hair edge sharpness.
- **Face Glow / Radiance**: Diffused highlight bloom for portrait shots.
- **Split-Screen Before/After Slider**: Interactive draggable divider comparing raw input vs enhanced output in real time.

### 🎯 4. AI Auto-Reframe & Digital Stabilization
- **AI Auto-Reframe**: Automatically tracks subjects when reframing 16:9 widescreen footage into 9:16 (TikTok/Shorts), 1:1 (Square), or 4:5 (Social Feed). Modes include:
  - `Center Action Focus`: Smooth spring-damped subject centering.
  - `Dynamic Action Tracking`: Keeps high-velocity movement centered.
  - `Cinematic Slow Pan Sweep`: Panoramic landscape sweeps.
- **Digital Video Stabilization**: Anti-shake smoothing filter with dynamic edge-crop buffer dampening handheld camera jitter.

### 🎙️ 5. Audio Studio, Noise Reduction & Voice Cloning
- **Audio Noise Reduction**: Highpass rumble filter (<80Hz) + 60Hz electrical hum notch + 7kHz sibilance de-esser.
- **AI Voice Cloning & TTS Studio**: Built-in voiceover generator with 5 custom formant personas:
  - 🎬 *Deep Movie Trailer Narrator*
  - 🎙️ *Studio Podcast Host*
  - 🤖 *Cyberpunk AI Assistant*
  - ✨ *Dynamic Storyteller*
  - 🌙 *Soft ASMR Whisper*
- **Beatmarking & Rhythm Sync**: Automatic audio transient peak detector that scans music beats and places snapping pins on the timeline ruler.
- **Volume Booster & 3-Band EQ**: Bass Boost (150Hz), Mid Vocals (1kHz), and Treble Sparkle (4kHz) with volume boost up to $300\%$.
- **Audio WAV Detach / Extract**: 1-click lossless 16-bit PCM WAV extraction.

### 📦 6. Ingestion, Multi-Track Timeline & Rendering
- **Multi-Track Timeline**: V1 Video, A1 Audio, and T1 Subtitle tracks.
- **Dual Trim Handles & Split**: In/Out brackets and playhead clip splitting (`Key S`).
- **4K Frame Snapshot**: 1-click full-resolution PNG capture.
- **In-Browser Export**: Canvas `captureStream()` + mixed Web Audio into high-bitrate WebM/MP4.
- **Project Save & Load**: Export and restore entire projects as `.videoforge` JSON files.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space` | Play / Pause |
| `J` / `K` / `L` | Rewind 2s / Pause / Fast-Forward 2s |
| `←` / `→` | Seek 1 second |
| `Shift + ←` / `Shift + →` | Precision 1 Frame Step (0.05s) |
| `S` | Split Clip at Playhead |
| `I` / `O` | Set Trim In / Out Points |
| `M` | Mute / Unmute Audio |
| `F` | Toggle Fullscreen Stage |
| `E` | Open Export Modal |
| `Ctrl + Z` / `Ctrl + Y` | Undo / Redo |

---

## 🚀 Running Locally

No npm dependencies required:

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
