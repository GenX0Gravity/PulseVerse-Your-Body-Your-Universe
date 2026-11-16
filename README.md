# PulseVerse — Your Body, Your Universe

> **A privacy-conscious, immersive human-sensing desktop experience powered by the Presage SmartSpectra SDK for the Presage SmartSpectra SDK Challenge 2026.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20x64%20%7C%20Electron%2033%2B-cyan.svg)](https://github.com/GenX0Gravity/PulseVerse-Your-Body-Your-Universe)
[![Presage SDK](https://img.shields.io/badge/Presage%20SmartSpectra-v3.5.0-purple.svg)](https://presagetech.com/docs/smartspectra-sdk/nodejs)
[![Tests](https://img.shields.io/badge/Vitest-36%20Passed-emerald.svg)](tests/)

---

## 🌌 Project Vision

**PulseVerse** transforms camera-derived biological signals into interactive generative cosmoses and natural living environments. Through contactless remote photoplethysmography (rPPG) and thoracic respiratory motion tracking, your real pulse becomes a gravitational shockwave across an interactive 3D particle universe, and your breathing rhythms rhythmically unfurl bioluminescent flora in an ethereal garden.

PulseVerse reimagines physiological monitoring away from clinical charts and anxiety-inducing alerts toward **artistic, somatic biofeedback and self-exploration**.

---

## ⚡ Tech Stack & Architecture

- **Desktop Framework:** Electron 33+ with secure multi-process architecture (`contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`)
- **Frontend Core:** React 18 + Vite 5 + TypeScript 5
- **Styling & UI:** Tailwind CSS with custom glassmorphism, glowing borders, and cosmic color language
- **3D Graphics & Shaders:** Three.js, React Three Fiber (`@react-three/fiber`), and `@react-three/drei`
- **State Management:** Zustand with segregated stores for app state, volatile vitals, and user settings
- **Motion & Audio:** Framer Motion, Native Web Audio API procedural synthesis
- **Sensing Engine:** Official Presage SmartSpectra Node.js/Electron SDK (`@smartspectra/node-sdk` v3.5.0) via `koffi` Pure-ABI Windows x64 native C runtime
- **Testing:** Vitest (36 automated unit & integration tests) and Playwright
- **Packaging:** `electron-builder` for Windows x64 distribution

---

## 🔒 Security & Privacy by Design

PulseVerse adheres strictly to zero-leakage, on-device privacy principles:

1. **Camera Consent:** Webcams are **never auto-activated on application launch**. Explicit consent modal discloses exact rPPG extraction before hardware activation.
2. **Pure Volatile In-Memory Processing:** Video frames captured from `navigator.mediaDevices.getUserMedia` reside strictly in volatile RAM during optical processing. **Zero video recording, zero photo snapshots, and zero disk writes.**
3. **Telemetry Suppressed:** SDK initialized with `enableTelemetry: false`, suppressing SDK diagnostic telemetry packets.
4. **Transparent Network Disclosures:** Outbound HTTPS requests occur strictly to `https://*.presagetech.com` for developer license verification. Zero third-party analytics (no Google Analytics, Sentry, or ad trackers).
5. **Instant Revocation:** Clicking *"Stop Camera"* or *"Withdraw Camera Consent"* immediately halts media tracks (`track.stop()`), shuts off camera LEDs, and clears volatile memory buffers.
6. **Responsible Non-Medical Tool:** Designed exclusively for general wellness and artistic biofeedback. Does not diagnose diseases, recommend medical treatments, or score mental health conditions.

Detailed policy: [PRIVACY.md](PRIVACY.md)  
System architecture: [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 🧬 Official Presage SmartSpectra SDK Integration

PulseVerse directly leverages the official `@smartspectra/node-sdk` Electron IPC architecture:

* **Main Process (`electron/main.ts`):**  
  ```typescript
  import { bindSmartSpectraIpc } from '@smartspectra/node-sdk/main';
  bindSmartSpectraIpc(mainWindow, {
    logger: (level, msg) => {
      // Redacts sensitive tokens or API credentials from log streams
      const sanitized = sanitizeCredentials(msg);
      console.log(`[SmartSpectra IPC ${level}]`, sanitized);
    },
  });
  ```
* **Preload Script (`electron/preload.ts`):**  
  Initializes `@smartspectra/node-sdk/preload` alongside the hardened `window.pulseVerse` bridge.
* **Renderer Service (`src/services/SmartSpectraService.ts`):**  
  ```typescript
  import { SmartSpectraSDK } from '@smartspectra/node-sdk/renderer';
  import { breathingMetrics, cardioMetrics } from '@smartspectra/node-sdk';
  import { decodeMetrics } from '@smartspectra/node-sdk/messages';

  const sdk = new SmartSpectraSDK({
    apiKey: options.apiKey,
    requestedMetrics: [...breathingMetrics, ...cardioMetrics],
    enableTelemetry: false,
    sendTimeoutMs: 15000,
  });

  sdk.on('metrics', (buffer) => {
    const metrics = decodeMetrics(buffer);
    // Real arterial waveforms & thoracic curves
  });
  ```

---

## 🖥️ Screen Directory & Environments

| Screen | Description |
| :--- | :--- |
| **Main Dashboard** | Live vital scorecards (BPM, BrPM, RMSSD HRV, Coherence), real-time dual-stream oscilloscopes, and realm portals. |
| **Heartbeat Universe** | Immersive 3D Three.js particle field (2,500+ stars) emitting gravitational shockwaves in sync with real arterial pulse waves. |
| **Breathing Garden** | Ethereal bioluminescent botanical grove with multi-theme flora (Forest, Lotus, Deep Sea, Nebula) expanding with thoracic respiration. |
| **Harmony Mode** | Dual-sensing biological coupling: cardiac cadence drives particle velocity while respiration modulates spatial camera depth. |
| **Interactive Experiences** | **Breathing Bloom** (luminous flower with guided pacing cues), **Pulse Constellation** (starbursts & private visual art export), and **Harmony Quest** (noncompetitive somatic realm exploration). |
| **Session Summary** | Session reports, physiological trends, local session records, and privacy-safe JSON exports. |
| **Privacy & Settings** | SmartSpectra API key management (in-memory session), camera device selection, consent revocation, and cache purge. |

---

## ⌨️ Accessible Keyboard Navigation

PulseVerse can be navigated entirely hands-free via accessible keyboard shortcuts:

* `1` or `D`: Main Dashboard
* `2` or `H`: Heartbeat Universe (3D)
* `3` or `B`: Breathing Garden (3D)
* `4` or `Y`: Harmony Mode (Dual Bio-Sensing 3D)
* `5` or `I`: Interactive Experiences
* `6` or `U`: Session Summary
* `7` or `,`: Privacy & Settings
* `F`: Toggle Fullscreen Immersive Mode
* `S`: Toggle Ambient Procedural Synthesizer Sound
* `Space`: Start / Stop Sensing Session
* `M`: Toggle Live Sensor vs. Demo Simulation Mode
* `T`: Toggle Dark (Cosmic Midnight) / Light (Sanctuary) Theme
* `?`: Show Keyboard Shortcuts & Help Modal
* `Esc`: Close open dialogs or modals

---

## 🚀 Getting Started

### Prerequisites
* **Node.js:** Node.js 20.x or 22.x LTS
* **OS:** Windows 10/11 x64 (Native C ABI package included)
* **Webcam:** Any standard USB or integrated camera (720p 30fps recommended)
* **Presage Developer Key:** Free key from [Presage Technologies](https://smartspectra.presagetech.com/) *(optional for Demo Mode)*

### 1. Installation
```bash
git clone https://github.com/GenX0Gravity/PulseVerse-Your-Body-Your-Universe.git
cd PulseVerse-SmartSpectra-Human-Sensing
npm install
```

### 2. Configure Environment (`.env`)
```bash
cp .env.example .env
# Set PRESAGE_API_KEY=your_key_here
```
*(Alternatively, enter your key directly at runtime in **Settings**, where it is kept strictly in volatile RAM for the active session).*

### 3. Launch Development Mode
```bash
npm run dev
```

### 4. Run Automated Test Suite
```bash
npm run typecheck  # TypeScript zero-error verification
npm test           # 36 Vitest tests passing across 8 suites
npm run test:e2e   # Playwright end-to-end integration tests
```

### 5. Desktop Windows x64 Distribution
```bash
npm run pack       # Builds standalone executable at release/win-unpacked/PulseVerse.exe
```

---

## 🌐 Marketing Website & Video Guide

- **Live Marketing Website:** [https://genx0gravity.github.io/PulseVerse-Your-Body-Your-Universe/](https://genx0gravity.github.io/PulseVerse-Your-Body-Your-Universe/) *(Deployable to Vercel via `vercel.json`)*
- **Demonstration Video Script:** [DEMO.md](DEMO.md)
- **Challenge Submission Details:** [DEV_SUBMISSION.md](DEV_SUBMISSION.md)
- **Setup & Troubleshooting:** [SETUP.md](SETUP.md)

---

## ⚠️ Known Limitations & Responsible Framing

1. **Hardware & Lighting Sensitivity:** Remote photoplethysmography requires adequate, non-backlit facial illumination and stable head positioning.
2. **Desktop Requirement:** Genuine camera rPPG extraction requires the native Presage C ABI engine running within the Electron desktop application.
3. **General Wellness Only:** PulseVerse is not a certified medical device and must never be used for clinical diagnosis, critical life-support, or unconsented bystander surveillance.

---

## ⚖️ License

Developed for the **Presage SmartSpectra SDK Challenge 2026**.  
Licensed under the [MIT License](LICENSE).
