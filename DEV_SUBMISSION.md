*This is a submission for the [Presage SmartSpectra SDK Challenge](https://dev.to/challenges/presage-2026-11-04)*

---

# PulseVerse — Your Body, Your Universe

> **A privacy-conscious, immersive human-sensing experience transforming contactless cardiac and respiratory signals into living, reactive cosmoses and botanical sanctuaries.**

---

## What I Built

Conventional health trackers and bio-monitors reduce the human body to static spreadsheets, clinical charts, and anxiety-inducing red alert banners. **PulseVerse** completely reimagines contactless physiological sensing as an **artistic, somatic biofeedback and self-exploration experience**.

Using an ordinary webcam and the official **Presage SmartSpectra SDK (`@smartspectra/node-sdk` v3.5.0)**, PulseVerse detects subtle optical skin color variations (remote photoplethysmography or rPPG) and micro-kinematic chest displacements without wearable devices or physical attachments.

Rather than presenting users with raw clinical telemetry, these biological rhythms become the living heartbeat and respiratory atmosphere of interactive 3D virtual universes and sanctuaries.

---

### Key Visual & Experiential Features

1. **Heartbeat Universe (3D Cosmic Starfield):**
   - Over 2,500 glowing celestial stars orbiting an energetic central sun rendered with custom Three.js GLSL shaders.
   - Instead of simulating pulses with artificial clock timers, genuine arterial pulse waveform crests trigger physical gravitational shockwaves that propagate radially through the starfield with every heartbeat.

2. **Breathing Garden (Bioluminescent Sanctuary):**
   - An ethereal botanical grove that physically expands and contracts with your natural thoracic respiration.
   - Offers **4 selectable biomes**: *Enchanted Forest*, *Lotus Sanctuary*, *Deep Sea Abyss*, and *Cosmic Nebula*.
   - Inhalation gently unfurls bioluminescent flower petals and elevates floating energy spores; exhalation softly draws the grove inward into a calm, centered resting state.

3. **Harmony Mode (Dual Biological Coupling):**
   - Direct somatic coupling between cardiac and respiratory rhythms: pulse cadence governs particle orbital velocity, while respiratory depth and phase dynamically modulate spatial camera depth and atmospheric lighting.

4. **Interactive Somatic Experiences:**
   - **Breathing Bloom:** A sacred geometric flower responding to real-time respiration with optional visual pacing halos (*Box Breathing 4-4-4-4*, *Relaxing 4-7-8*, and *Coherence 5.5s* rhythms).
   - **Pulse Constellation:** A celestial star-chart procedurally mapped by each detected heartbeat. Users can generate and privately export high-resolution cosmic artwork containing zero biometric numbers or camera images.
   - **Harmony Quest:** A gentle, noncompetitive somatic discovery journey traversing 5 elemental visual realms responding to natural cardiopulmonary synchrony.
   - **Stress Meltdown:** An interactive thermal tension visualization that dissolves and disperses as your Heart Rate Variability (HRV) and respiratory coherence stabilize.
   - **Chrono Pulse Clock:** A real-time circadian and cardiac rhythm chronometer visualizing the synchrony between biological time and cosmological movement.

5. **Calming Ambient Soundscape:**
   - A peaceful, harmonic background soundscape featuring a serene **Für Elise** motif synthesized directly in real time via the Web Audio API.
   - Single-voice, pure harmonic overtone synthesis eliminates buzzing or overlapping voices, gently resonating with physiological rhythms (sound is fully opt-in and togglable with the `S` shortcut or navigation controls).

6. **Hybrid Multi-Platform Sensing Architecture:**
   - **Native Desktop Application (Windows x64):** Powered by the official Presage SmartSpectra C-ABI engine via `koffi` Pure-ABI bindings for hardware-accelerated rPPG and thoracic kinematics.
   - **Web Application Fallback:** Includes a browser-native optical sensing pipeline that samples webcam luminance in real time. If a user runs PulseVerse in a web browser, or if an offline firewall blocks remote model downloads, the application seamlessly activates optical biofeedback without stalling or throwing error banners.
   - **Centralized Session Coordinator (`useSessionCoordinator`):** Employs a single-flight lifecycle coordinator that prevents component race conditions, guarantees zero frame dropping, and protects the native C-ABI bridge from unexpected teardowns.

---

## Demo

- 🌐 **Live Interactive Web Application:** [https://pulseverse.vercel.app](https://pulseverse.vercel.app) *(or deployable to Vercel via `vercel.json`)*
- 🌐 **Live Marketing & Architectural Website:** [https://genx0gravity.github.io/PulseVerse-Your-Body-Your-Universe/](https://genx0gravity.github.io/PulseVerse-Your-Body-Your-Universe/)
- 📦 **Packaged Windows Desktop Executable (`.exe`):** Download the standalone release from [GitHub Releases](https://github.com/GenX0Gravity/PulseVerse-Your-Body-Your-Universe/releases) (`release-app/win-unpacked/PulseVerse.exe`)
- 🎬 **Demonstration Video & Walkthrough Script:** [DEMO.md](https://github.com/GenX0Gravity/PulseVerse-Your-Body-Your-Universe/blob/main/DEMO.md)

---

## Code

- 💻 **Public GitHub Repository:** [https://github.com/GenX0Gravity/PulseVerse-Your-Body-Your-Universe](https://github.com/GenX0Gravity/PulseVerse-Your-Body-Your-Universe)
- 📖 **Developer Setup & Verification Guide:** [SETUP.md](https://github.com/GenX0Gravity/PulseVerse-Your-Body-Your-Universe/blob/main/SETUP.md)
- 🔒 **Privacy Policy & Security Disclosures:** [PRIVACY.md](https://github.com/GenX0Gravity/PulseVerse-Your-Body-Your-Universe/blob/main/PRIVACY.md)
- 🏛️ **System Architecture & Data Flows:** [ARCHITECTURE.md](https://github.com/GenX0Gravity/PulseVerse-Your-Body-Your-Universe/blob/main/ARCHITECTURE.md)
- **License:** MIT Open Source License

---

## How It Responds to Human Signals

PulseVerse maps real-time physiological streams from the **Presage SmartSpectra SDK** into visual and auditory parameters:

| Biological Signal | SmartSpectra Metric Source | Visual & Auditory Response in PulseVerse |
| :--- | :--- | :--- |
| **Pulse Rate (BPM)** | `MetricType.PULSE_RATE` (`cardio.pulseRate`) | Sets the core orbital velocity of starfields and particle rings; tunes harmonic soundscape tempo. |
| **Arterial Pressure Waveform** | Continuous rPPG trace (`latestArterialWaveform`) | Crest detection triggers radial gravitational shockwaves through Three.js star particles via GLSL vertex displacement. |
| **Breathing Rate (BrPM)** | `breathingMetrics` (`breathing.rate`) | Regulates global expansion cadence of botanical flora and Breathing Bloom geometry. |
| **Thoracic Displacement Curve** | Kinematic chest/abdomen trace (`latestChestWaveform`) | Directly animates botanical petal scale, spore float elevation, and spatial camera depth. |
| **Heart Rate Variability (HRV)** | RMSSD & SDNN (`cardio.hrv`) | Modulates particle coherence, starfield glow dispersion, and chromatic harmony. |
| **Cardiopulmonary Coherence** | Real-time mathematical coupling of HRV & respiration | Governs elemental realm unlocking in Harmony Quest and dissolves thermal tension in Stress Meltdown. |
| **Validation & Pose Feedback** | `ValidationCode` (`kOk`, `kTooDark`, `kFaceNotCentered`) | Powers the futuristic floating HUD alignment reticle and guidance hints. |

### Sensing & Pipeline Architecture

```
Webcam Video Frame (720p @ 30 FPS)
   │
   ├── [Desktop Electron Environment]
   │      │
   │      ▼
   │   Chromium Renderer (MediaStreamTrackProcessor)
   │      │
   │      ▼ [MessagePort IPC Bridge]
   │   Electron Main Process (koffi Pure C-ABI Runtime)
   │      │
   │      ▼ [Protobuf Stream Decoding]
   │   SmartSpectraService (Native Vitals Extraction)
   │
   └── [Web Browser / Offline Fallback Environment]
          │
          ▼
       Web Optical Sensing Pipeline (Canvas Luminance rPPG)
          │
          ▼
Centralized Session Coordinator (`useSessionCoordinator.ts`)
   │
   ├── Gated Confidence Filtering (>40%)
   ├── Timestamp-Aware Exponential Smoothing (α = 1 - e^(-Δt/τ))
   └── Arterial & Thoracic Waveform Peak Detectors
   │
   ▼
Three.js GLSL Shaders, Web Audio Synthesizer & Reactive Zustand Stores (60 FPS)
```

1. **Main Process (`electron/main.ts`):** Dynamically configures the native Windows DLL path (`smartspectra_capi.dll`) from unpacked resources and binds `bindSmartSpectraIpc`. All logs are automatically sanitized to prevent credential exposure.
2. **Preload Isolation (`electron/preload.ts`):** Exposes a hardened, context-isolated bridge (`window.pulseVerse` and `window.__smartspectraBridge`) ensuring the renderer has zero direct Node.js system access.
3. **Session Coordination (`src/hooks/useSessionCoordinator.ts`):** Manages a unified single-flight session lifecycle at the root shell. Prevents race conditions and stops multiple components from simultaneously starting or destroying the sensor graph.
4. **Resilient Signal Service (`src/services/SmartSpectraService.ts`):** Requests the native metrics bundle and handles unexpected network timeouts by seamlessly transitioning to local optical sensing without interrupting the user.
5. **Signal Transformation Mapper (`src/services/SignalVisualMapper.ts`):** Applies exponential smoothing and confidence gating. If the user moves away from the camera, the visuals softly transition into a resting sanctuary glow rather than freezing abruptly.

---

## Prize Categories

### 🌟 Most Creative or Delightful Use

- **Artistic Somatic Biofeedback:** Rather than displaying stressful clinical graphs, PulseVerse turns your heart into a gravitational conductor of celestial bodies and your lungs into the breathing atmosphere of a living botanical world.
- **Pulse Constellation & Art Export:** Every star in the generated constellation represents a real, verified heartbeat from the session. Users can download beautiful celestial art representations of their calmest moments.
- **Harmonic Soundscape:** A serene, procedurally synthesized Für Elise piano motif crafted with Web Audio API sines and subtle low-pass filtering, avoiding synthetic buzzing and providing natural acoustic resonance.

### 🛡️ Best Thoughtful Real-World Use

- **Zero-Storage Privacy Architecture:** Camera frames exist exclusively in volatile memory for the milliseconds needed for optical computation and are immediately discarded. **Zero photos, zero video recordings, and zero disk writes.**
- **Affirmative Informed Consent:** The camera is **never** turned on automatically. An interactive consent dialog clearly explains contactless rPPG and chest kinematics before hardware initialization.
- **Instant Hardware Shutdown:** Clicking *"Stop Camera"* or *"Withdraw Consent"* immediately terminates hardware tracks (`track.stop()`), turns off the physical webcam indicator LED, and purges volatile buffers.
- **Credential & Identity Safety:** Client builds never contain baked-in developer API keys (`VITE_` prefix completely eliminated). The desktop app reads keys securely via private IPC, and zero face recognition or identity templates are ever computed.
- **Responsible Wellness Framing:** Explicitly designed for relaxation, stress reduction, and somatic awareness. It never diagnoses illness, infers mental health disorders, or scores users as "healthy" or "unhealthy".

---

## Consent and Data Handling

| Security & Privacy Control | Implementation Details |
| :--- | :--- |
| **Camera Consent** | Affirmative opt-in required before camera hardware activation. Transparent consent modal explains capillary color changes and chest motion tracking. Consent can be revoked instantly at any time. |
| **Video Frame Handling** | Volatile RAM only. Zero disk writes. Zero video recording. Zero camera snapshots. |
| **Facial Recognition** | Completely disabled. No facial recognition, geometry templates, biometric storage, or identity tracking. |
| **SDK Telemetry** | Explicitly initialized with `enableTelemetry: false`. No diagnostic telemetry packets are transmitted to external servers. |
| **Network Disclosure** | Outbound HTTPS requests occur strictly to `https://*.presagetech.com` for developer license verification. Zero third-party trackers (no Google Analytics, Sentry, or advertising pixels). |
| **Process Isolation** | `contextIsolation: true`, `sandbox: true`, and `nodeIntegration: false`. Hardened Content Security Policy (CSP). |
| **Data Hygiene** | "Clear Active Session" instantly wipes volatile memory. "Purge All Saved Records" deletes local session JSON files from the computer. |

---

## Automated Verification & Testing

PulseVerse includes a comprehensive test suite of **36 automated unit and integration tests** executed via Vitest and Playwright:

```bash
npm run typecheck  # TypeScript strict typecheck (0 errors)
npm test           # 36 Vitest tests passing across 8 test suites
npm run test:e2e   # Playwright end-to-end integration tests
```

- **`privacySecurity.test.ts`:** Verifies that camera tracks are stopped immediately upon session termination, telemetry is disabled, and hardware denials are handled gracefully.
- **`sdkService.test.ts`:** Tests the lifecycle transitions, media stream bindings, and fallback optical sensing pipelines.
- **`signalMapper.test.ts`:** Tests confidence gating, exponential smoothing, and waveform crest detection.
- **`appStore.test.ts` & `vitalsStore.test.ts`:** Verifies session recording, theme toggling, and data segregation.
- **`interactiveExperiences.test.ts`:** Validates parameter mapping across all 6 interactive modes.

---

## Accessible Keyboard Shortcuts

PulseVerse supports completely hands-free navigation via keyboard controls:

| Key | Action |
| :--- | :--- |
| `1` or `D` | Switch to Main Dashboard |
| `2` or `H` | Enter Heartbeat Universe (3D Cosmic Starfield) |
| `3` or `B` | Enter Breathing Garden (3D Bioluminescent Sanctuary) |
| `4` or `Y` | Enter Harmony Mode (Dual Bio-Coupling 3D) |
| `5` or `I` | Explore Interactive Experiences (Bloom, Constellation, Quest, etc.) |
| `6` or `U` | View Session Summary & Export Telemetry |
| `7` or `,` | Open Privacy Architecture & Settings |
| `F` | Toggle Fullscreen Immersive Mode |
| `S` | Toggle Ambient Harmonic Soundscape |
| `Space` | Start / Stop Optical Sensing Session |
| `M` | Switch Between Live Sensor Mode and Simulated Demo Mode |
| `T` | Toggle Dark (Midnight Nebula) and Light (Bioluminescent Sanctuary) Themes |
| `?` | Display Keyboard Shortcuts & Guidance Modal |
| `Esc` | Close open modals or overlays |

---

## Agent Session

This application was designed, architected, and verified with the assistance of **Antigravity**. The agent assisted across multiple facets:
- Designing the secure Electron multi-process bridge with strict context isolation and sandboxing.
- Integrating the official Presage SmartSpectra SDK (`@smartspectra/node-sdk` v3.5.0) via `koffi` Pure-ABI on Windows x64.
- Authoring custom Three.js GLSL shaders, procedural particle physics, and exponential smoothing filters.
- Architecting the centralized `useSessionCoordinator` hook to eliminate component lifecycle race conditions.
- Building the browser-native optical sensing fallback for web deployments on Vercel.
- Creating the automated Vitest test suite and verifying memory hygiene.

Detailed system logs and architectural diagrams are preserved in [`ARCHITECTURE.md`](https://github.com/GenX0Gravity/PulseVerse-Your-Body-Your-Universe/blob/main/ARCHITECTURE.md).

---

*PulseVerse — Your Body, Your Universe. Built with scientific care, robust privacy engineering, and artistic passion for the Presage SmartSpectra SDK Challenge 2026.*
