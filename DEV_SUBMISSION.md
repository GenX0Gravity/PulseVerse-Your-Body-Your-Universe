# PulseVerse — Your Body, Your Universe

> **Presage SmartSpectra SDK Challenge 2026 Submission**  
> **Categories Entered:**  
> 1. 🌟 **Most Creative or Delightful Use**  
> 2. 🛡️ **Best Thoughtful Real-World Use**

---

## What I Built

**PulseVerse — Your Body, Your Universe** is a privacy-conscious, immersive human-sensing desktop application that transforms real camera-derived pulse and breathing signals into living, reactive interactive environments.

Traditional health applications reduce human physiology to static clinical numbers, line charts, and anxiety-inducing alerts. PulseVerse re-imagines biological sensing as an **artistic, somatic biofeedback experience**. Using the official **Presage SmartSpectra Node.js/Electron SDK (`@smartspectra/node-sdk` v3.5.0)**, PulseVerse extracts subtle optical skin color changes (remote photoplethysmography or rPPG) and thoracic respiratory motion from an ordinary webcam without wearable sensors.

These biological signals directly breathe life into:
1. **Heartbeat Universe:** 2,500+ glowing celestial particles orbiting a solar core that surges with every real arterial pulse wave crest.
2. **Breathing Garden:** A bioluminescent botanical grove that expands with inhalation and gently contracts with exhalation across 4 distinct biomes.
3. **Harmony Environment:** A coupled biological cosmos where cardiac cadence drives particle velocity and respiratory depth modulates dimensional space.
4. **Three Interactive Bio-Experiences:**
   - **Breathing Bloom:** A sacred geometric flower responding to respiration with optional breathing pacing cues (Box, 4-7-8, Coherence).
   - **Pulse Constellation:** A celestial star-chart dynamically mapped by each detected pulse, exportable as privacy-safe artwork.
   - **Harmony Quest:** A gentle somatic journey across 5 elemental visual realms responding to natural cardiopulmonary synchrony.

---

## Demo

- 🌐 **Live Website (GitHub Pages):** [https://genx0gravity.github.io/PulseVerse-Your-Body-Your-Universe/](https://genx0gravity.github.io/PulseVerse-Your-Body-Your-Universe/)
- 🎬 **Video Demonstration Script & Walkthrough:** [DEMO.md](https://github.com/GenX0Gravity/PulseVerse-Your-Body-Your-Universe/blob/main/DEMO.md)
- 📦 **Packaged Windows Desktop Binary:** Ready-to-run Windows x64 distribution available under GitHub Releases (`release/win-unpacked/PulseVerse.exe`).

---

## Code

- 💻 **GitHub Repository:** [https://github.com/GenX0Gravity/PulseVerse-Your-Body-Your-Universe](https://github.com/GenX0Gravity/PulseVerse-Your-Body-Your-Universe)
- **License:** MIT Open Source License

---

## How It Responds to Human Signals

PulseVerse rejects fake timers and synthetic animations in live mode. It establishes a dedicated **Signal-to-Visual Transformation Pipeline** (`src/engine/SignalToVisualMapper.ts`):

### 1. Optical Arterial Waveform Mapping
Rather than merely multiplying averaged BPM to guess beat times, PulseVerse subscribes to the raw protobuf-decoded `arterialPulseCurve` from the Presage SmartSpectra SDK. Real waveform crests trigger radial gravitational ripples across Three.js instanced mesh particle fields.

### 2. Thoracic Kinematic Respiration
The SDK tracks subtle vertical and volumetric displacements of the chest and shoulders. The resulting respiratory curve directly modulates flower petal vertex shaders, spore buoyancy, and camera z-depth.

### 3. Confidence-Aware Gating & Smoothing
Optical biological signals can experience momentary noise from ambient light shifts or head motion. PulseVerse implements timestamp-aware exponential smoothing ($\alpha = 1 - e^{-\Delta t / \tau}$) and confidence-gated damping. Visuals never snap or flicker abruptly; if the user looks away, environments gently transition into a serene ambient rest state.

---

## Prize Categories

### 1. Most Creative or Delightful Use
PulseVerse elevates human-sensing into a transcendent creative medium:
- **Living Cosmic Environments:** Transforming the human body into the conductor of a real-time 3D universe.
- **Procedural Web Audio Soundscape:** Real-time synthesis of gentle organic harmonic sine waves tuned to the user's pulse and breath rhythm (strictly opt-in, sound off by default).
- **Pulse Constellation Artwork Export:** Generates high-resolution celestial art where every star is a verified heartbeat.

### 2. Best Thoughtful Real-World Use
Biometric sensing requires uncompromising ethics and privacy:
- **Zero-Leakage Architecture:** Camera frames exist exclusively in volatile system RAM during optical rPPG extraction via the native C ABI engine. Zero frames are written to disk, zero video is recorded, and zero raw video is uploaded.
- **Telemetry Explicitly Disabled:** Initialized with `enableTelemetry: false`, suppressing SDK diagnostic telemetry reporting.
- **Explicit Consent & Instant Hardware Shutdown:** Webcams never turn on automatically. Stopping sensing immediately executes `track.stop()`, releasing OS handles and shutting off camera LEDs.
- **Responsible, Non-Medical Framing:** Clearly documented for general wellness and artistic exploration. Avoids diagnostic claims, mental health inference, or anxiety scoring.

---

## Consent and Data Handling

| Area | Implementation Reality |
| :--- | :--- |
| **Camera Consent** | Affirmative opt-in consent modal before any camera access. Immediate revocation in Settings. |
| **Video Handling** | Volatile RAM only. Zero disk writes. Zero cloud uploads. |
| **Facial Recognition** | Completely disabled. No biometric geometry matching or face databases. |
| **Network Requests** | Disclosed outbound TLS requests exclusively to `https://*.presagetech.com` for developer license verification. Zero third-party analytics (no Google Analytics, Sentry, or trackers). |
| **Electron Security** | `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`, strict CSP, and origin-locked camera permissions. |
| **Session Control** | Clear Active Session (wipes RAM) and Purge All Records (deletes local JSON history) available at all times. |

Read the full [PRIVACY.md](https://github.com/GenX0Gravity/PulseVerse-Your-Body-Your-Universe/blob/main/PRIVACY.md) and [ARCHITECTURE.md](https://github.com/GenX0Gravity/PulseVerse-Your-Body-Your-Universe/blob/main/ARCHITECTURE.md) for detailed technical specifications.

---

## Technology Stack

- **Desktop Framework:** Electron 33+ (Multi-process secure architecture)
- **Frontend & Visuals:** React 18, TypeScript 5, Vite 5, Tailwind CSS, Three.js, React Three Fiber, Framer Motion
- **Sensing Engine:** Official Presage SmartSpectra Node.js/Electron SDK (`@smartspectra/node-sdk` v3.5.0) with koffi Pure-ABI Windows x64 native C runtime
- **State Management:** Zustand (Separated reactive stores for app, vitals, and settings)
- **Audio:** Native Web Audio API procedural synthesis
- **Testing:** Vitest automated unit test suite (36 tests passing) and Playwright integration suite
- **Packaging:** electron-builder Windows x64 distribution

---

*Built with passion and scientific precision for the Presage SmartSpectra SDK Challenge 2026.*
