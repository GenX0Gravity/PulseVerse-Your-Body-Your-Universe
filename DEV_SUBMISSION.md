*This is a submission for the [Presage SmartSpectra SDK Challenge](https://dev.to/challenges/presage-2026-11-04)*

## What I Built

**PulseVerse — Your Body, Your Universe** is a privacy-first, immersive human-sensing desktop application that transforms real camera-derived pulse and breathing signals into living, reactive cosmoses.

Conventional health and wellness trackers reduce human physiology to static numbers, spreadsheets, and anxiety-inducing red alerts. **PulseVerse** reimagines contactless biological sensing as an **artistic, somatic biofeedback experience**. Using an ordinary webcam and the official **Presage SmartSpectra Node.js/Electron SDK (`@smartspectra/node-sdk` v3.5.0)**, PulseVerse extracts subtle optical skin color changes (remote photoplethysmography or rPPG) and thoracic respiratory movements without wearable sensors.

These biological signals directly power:

1. **Heartbeat Universe:** Over 2,500 glowing celestial stars orbiting a central energy sun. Rather than estimating rhythm with artificial timers, real arterial waveform crests send radial gravitational shockwaves through the starfield with each cardiac cycle.
2. **Breathing Garden:** A bioluminescent botanical grove that rhythmically breathes with your chest movements across 4 selectable biomes (Forest, Lotus Sanctuary, Deep Sea, and Nebula). Inhalation blossoms flower petals outward and elevates luminous spores; exhalation gently draws the sanctuary inward.
3. **Harmony Mode:** Dual-signal biological coupling where cardiac cadence drives particle orbital velocity while respiratory depth commands spatial camera depth and dimensionality.
4. **Three Interactive Bio-Experiences:**
   - **Breathing Bloom:** A sacred geometric flower responding to respiration with optional visual pacing halos (Box Breathing, 4-7-8, and Coherence rhythms).
   - **Pulse Constellation:** A procedural celestial star-chart dynamically mapped by each detected pulse beat. Users can export private visual artwork free of camera images or biometric numbers.
   - **Harmony Quest:** A gentle, noncompetitive somatic discovery journey across 5 elemental visual realms responding to natural cardiopulmonary synchrony.
5. **Procedural Ambient Soundscape:** An opt-in Web Audio API synthesizer generating organic sine waves in real time tuned to pulse and breath cadences (sound off by default).

---

## Demo

- 🌐 **Live Marketing & Architecture Website:** [https://genx0gravity.github.io/PulseVerse-Your-Body-Your-Universe/](https://genx0gravity.github.io/PulseVerse-Your-Body-Your-Universe/)  
- 📦 **Packaged Windows Desktop Binary (`.exe`):** Available under [GitHub Releases](https://github.com/GenX0Gravity/PulseVerse-Your-Body-Your-Universe/releases) (`release/win-unpacked/PulseVerse.exe`)  
- 🎬 **Scene-by-Scene Video Walkthrough Script:** [DEMO.md](https://github.com/GenX0Gravity/PulseVerse-Your-Body-Your-Universe/blob/main/DEMO.md)

---

## Code

- 💻 **Public GitHub Repository:** [https://github.com/GenX0Gravity/PulseVerse-Your-Body-Your-Universe](https://github.com/GenX0Gravity/PulseVerse-Your-Body-Your-Universe)
- 📖 **Developer Setup & Verification Guide:** [SETUP.md](https://github.com/GenX0Gravity/PulseVerse-Your-Body-Your-Universe/blob/main/SETUP.md)
- 🔒 **Privacy Policy & Technical Disclosures:** [PRIVACY.md](https://github.com/GenX0Gravity/PulseVerse-Your-Body-Your-Universe/blob/main/PRIVACY.md)
- 🏛️ **Multi-Process Architecture:** [ARCHITECTURE.md](https://github.com/GenX0Gravity/PulseVerse-Your-Body-Your-Universe/blob/main/ARCHITECTURE.md)
- **License:** MIT Open Source License

---

## How It Responds to Human Signals

PulseVerse uses live physiological streams from the **Presage SmartSpectra SDK**:

- **Cardiovascular Signals:** `cardio.pulseRate` (BPM) and raw `arterialPulseCurve` (continuous optical rPPG waveform).
- **Respiratory Signals:** `breathing.rate` (BrPM) and continuous `respiratoryCurve` (thoracic chest/abdomen displacement).
- **Calibration & Quality Feedback:** Real-time validation status codes (facial framing, head angle, illumination quality) and RMSSD heart rate variability (accumulated over a 60-second window).

### SmartSpectra SDK Integration Pipeline

```
Webcam Frame (720p @ 30 FPS)
   │
   ▼
Chromium Renderer (MediaStreamTrackProcessor)
   │
   ▼ [MessagePort / IPC Bridge]
Electron Main Process (koffi Pure-ABI Engine)
   │
   ▼ [Protobuf Stream Decoding]
Signal-to-Visual Transformation Mapper
   │
   ├── Gated Confidence Filtering (>40%)
   ├── Timestamp-Aware Exponential Smoothing (α = 1 - e^(-Δt/τ))
   └── Waveform Crest Detection
   │
   ▼
Three.js Shaders & Reactive Zustand Stores (60 FPS)
```

1. **Main Process (`electron/main.ts`):** Imports `bindSmartSpectraIpc` from `@smartspectra/node-sdk/main` to bridge native message ports to the Electron BrowserWindow, filtering and redacting API credentials from all logs.
2. **Preload Isolation (`electron/preload.ts`):** Initializes the official `@smartspectra/node-sdk/preload` bridge while keeping renderer sandboxing and context isolation strictly enforced.
3. **Renderer Service (`src/services/SmartSpectraService.ts`):** Instantiates `SmartSpectraSDK` with `enableTelemetry: false`, requests cardiac and breathing metric bundles, and decodes binary protobuf buffers via `decodeMetrics`.
4. **Signal-to-Visual Transformation (`src/services/SignalVisualMapper.ts`):** Applies confidence gating and exponential smoothing so that visuals remain stable during micro-movements. If the user steps away from the frame, visuals smoothly fade to a resting celestial glow rather than snapping or freezing.

---

## Prize Categories

### 🌟 Most Creative or Delightful Use
* **Inspiration:** Traditional health tech often incites anxiety with graphs, red text, and clinical metrics. We wanted to see what happens when the human body is treated as a creative conductor of art.
* **Originality:** 
  - Instead of static beat averages, real arterial waveforms physically ripple Three.js instanced mesh starfields via GLSL vertex shaders.
  - Generates bespoke celestial artwork in **Pulse Constellation**, allowing users to save and share visual snapshots where every star represents a real, verified heartbeat.
  - Real-time procedural audio synthesis via the Web Audio API translates biological rhythms into harmonious ambient tones.

### 🛡️ Best Thoughtful Real-World Use
* **Real-World Need:** Contactless biometric sensing introduces significant privacy and surveillance concerns. Users cannot be expected to trust an app that secretly uploads video or records biometrics.
* **Ethical, Usable Design:**
  - **Zero Video Storage:** Camera frames reside exclusively in volatile RAM during optical processing and are immediately discarded. Zero frames are ever written to disk or uploaded.
  - **Transparent Consent:** The webcam is never activated on launch. An explicit modal explains rPPG and thoracic kinematics before asking for camera authorization.
  - **Immediate Revocation:** Clicking *"Stop Camera"* or *"Withdraw Camera Consent"* halts hardware tracks immediately and shuts off the camera LED.
  - **Responsible Wellness Framing:** Explicitly designed for relaxation and somatic awareness. It never diagnoses illness, infers mental health disorders, or scores users as "healthy" or "unhealthy".

---

## Consent and Data Handling

| Security & Privacy Control | Application Reality |
| :--- | :--- |
| **Camera Consent** | Affirmative opt-in required before hardware activation. Explicit consent dialog explains optical capillary detection and chest motion. Consent can be revoked instantly at any time. |
| **Video Handling** | Volatile RAM only. Zero disk writes. Zero video recording. Zero photo snapshots. |
| **Facial Recognition** | Completely disabled. No facial recognition, geometry templates, or identity tracking. |
| **SDK Telemetry** | Explicitly initialized with `enableTelemetry: false`. No diagnostic telemetry packets are transmitted to Presage servers. |
| **Network Disclosure** | Outbound HTTPS requests occur strictly to `https://*.presagetech.com` for developer license verification. Zero third-party analytics (no Google Analytics, Sentry, or tracking pixels). |
| **Process Isolation** | `contextIsolation: true`, `sandbox: true`, and `nodeIntegration: false`. Hardened Content Security Policy (CSP). |
| **Data Hygiene** | "Clear Active Session" instantly wipes volatile memory. "Purge All Saved Records" deletes local session JSON files from the computer. |

---

## Agent Session

This application was architected, implemented, and verified using **Antigravity**. The agent assisted across all phases:
- Establishing the Electron multi-process security bridge with `contextIsolation: true` and sandboxing.
- Integrating the official Presage SmartSpectra SDK (`@smartspectra/node-sdk` v3.5.0) via `koffi` Pure-ABI on Windows x64.
- Authoring custom Three.js particle shaders, bioluminescent botanical models, and signal smoothing algorithms.
- Writing 36 automated Vitest unit and integration tests covering signal filtering, consent revocation, and volatile memory hygiene.
- Creating the Windows x64 desktop distribution via `electron-builder` with unpacked native C ABI libraries.

Transcript and session artifacts are documented within the repository under [`ARCHITECTURE.md`](https://github.com/GenX0Gravity/PulseVerse-Your-Body-Your-Universe/blob/main/ARCHITECTURE.md).

---

*PulseVerse — Your Body, Your Universe. Built with scientific care and creative passion for the Presage SmartSpectra SDK Challenge 2026.*
