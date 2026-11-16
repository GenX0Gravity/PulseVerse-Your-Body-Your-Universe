# PulseVerse — System Architecture & Technical Specifications

> **Submission for Presage SmartSpectra SDK Challenge 2026**  
> **Application:** PulseVerse — Your Body, Your Universe (v1.0.0)  
> **Authors:** PulseVerse Engineering & Creative Technology Team

---

## 1. System Topology Overview

PulseVerse is engineered as an enterprise-grade, high-performance desktop application leveraging Electron 33+, React 18, TypeScript 5, Vite 5, Tailwind CSS, and Three.js / React Three Fiber. It connects to the official **Presage SmartSpectra Node.js/Electron SDK (`@smartspectra/node-sdk` v3.5.0)** to transform real optical skin color variations and thoracic kinematics into living, responsive cosmoses.

```
┌───────────────────────────────────────────────────────────────────────────┐
│                             OPERATING SYSTEM                              │
│              (Windows 10/11 x64 / macOS arm64 / Linux x64)                │
└─────────────────────┬───────────────────────────────┬─────────────────────┘
                      │                               │
                      ▼                               ▼
       ┌──────────────────────────────┐ ┌──────────────────────────────┐
       │     HARDWARE WEBCAM FEED     │ │    ELECTRON MAIN PROCESS     │
       │    (720p @ 30 FPS Stream)    │ │   (Node.js 22+ / C ABI)      │
       └──────────────┬───────────────┘ └─────────────┬────────────────┘
                      │                               │
                      │  MediaStream                  │ bindSmartSpectraIpc()
                      │  Track Processor              │
                      ▼                               ▼
       ┌──────────────────────────────┐ ┌──────────────────────────────┐
       │  CHROMIUM RENDERER PROCESS   │ │  NATIVE SMARTSPECTRA ENGINE  │
       │  (Sandboxed / Isolated)      │ │  (koffi Pure-ABI Runtime)    │
       │                              │ │  - smartspectra.dll          │
       │  - SmartSpectraSDK Instance  │◄┼─►- smartspectra_capi.dll     │
       │  - MessageChannel / Port2    │ │  - opencv_world4100.dll      │
       │  - Protobuf Metrics Decoder  │ │  - vulkan-1.dll              │
       └──────────────┬───────────────┘ └──────────────────────────────┘
                      │
                      ▼ Decoded Measurements & Waveforms
       ┌──────────────────────────────┐
       │   SIGNAL-TO-VISUAL MAPPER    │
       │   - Confidence Filtering     │
       │   - Timestamp-aware Smoothing│
       │   - Outlier Rejection        │
       └──────────────┬───────────────┘
                      │
                      ▼ Reactive Biological Vectors
       ┌────────────────────────────────────────────────────────────────┐
       │                     VISUAL & AUDIO RUNTIMES                    │
       │                                                                │
       │  ┌───────────────────────┐         ┌────────────────────────┐  │
       │  │ THREE.JS / R3F SCENES │         │     WEB AUDIO API      │  │
       │  │ - Heartbeat Universe  │         │ - Dynamic Sine Waves   │  │
       │  │ - Breathing Garden    │         │ - Low-pass Filters     │  │
       │  │ - Harmony Mode        │         │ - Sound Off by Default │  │
       │  │ - 3 Bio-Experiences   │         │ - Harmonic Pacing      │  │
       │  └───────────────────────┘         └────────────────────────┘  │
       └────────────────────────────────────────────────────────────────┘
```

---

## 2. Process Separation & Security Boundary

PulseVerse adheres strictly to Electron's security model:

### 2.1 Electron Main Process (`electron/main.ts`)
- Configured with `contextIsolation: true`, `sandbox: true`, and `nodeIntegration: false`.
- Executes `bindSmartSpectraIpc(mainWindow, { logger })` from `@smartspectra/node-sdk/main` to bridge native message ports.
- Sanitizes and redacts all credential patterns (`key`, `token`, `bearer`) from log streams.
- Intercepts all window creation attempts via `setWindowOpenHandler` and denies arbitrary popup creation.
- Origin-locks hardware camera permissions: only grants `media` access to verified local application URLs (`file://` or `localhost:5173`).

### 2.2 Preload Isolation Bridge (`electron/preload.ts`)
- Loads the official `@smartspectra/node-sdk/preload` bridge, setting up isolated `MessagePort` channels between Chromium renderer workers and the main process C ABI runtime.
- Exposes a minimal, hardened `window.pulseVerse` API for window controls (minimize, maximize, close) and local non-biometric session records.

### 2.3 Chromium Renderer Process (`src/`)
- Pure sandboxed browser context.
- Directly imports `SmartSpectraSDK` from `@smartspectra/node-sdk/renderer`.
- Zero Node.js primitives exposed to DOM scripts or user-facing components.

---

## 3. Presage SmartSpectra SDK Integration

### 3.1 SDK Initialization & Lifecycle
The SDK is managed as a thread-safe singleton inside `src/services/SmartSpectraService.ts`:

```typescript
const sdk = new SmartSpectraSDK({
  apiKey: options.apiKey,
  requestedMetrics: [
    ...breathingMetrics, // breathingRate, respiratoryCurve, chest/abdomen displacement
    ...cardioMetrics,    // pulseRate, arterialPulseCurve, cardiacCoherence
  ],
  enableTelemetry: false, // Suppresses diagnostic telemetry packets
  sendTimeoutMs: 15000,
});
```

### 3.2 Protobuf Decoding & Metric Event Pipeline
1. **Camera Frame Acquisition:** Frames from `navigator.mediaDevices.getUserMedia` are sent into `sdk.startSession({ stream, videoElement })`.
2. **Native C ABI Computation:** The native engine applies remote photoplethysmography (rPPG) on skin pixels and optical flow kinematics across thoracic landmarks.
3. **Stream Metrics Event:** Raw binary buffers are delivered to the renderer via `sdk.on('metrics', (buffer) => ...)` and decoded using `decodeMetrics(buffer)`.
4. **Validation Status Event:** Real-time facial framing, head tilt, motion artifacts, and illumination quality are parsed from `sdk.on('validationStatus', (status) => ...)`.
5. **Session Teardown:** Upon user command, `sdk.stopSession()` cleanly halts the C ABI thread, flushes ports, and shuts down camera hardware tracks.

---

## 4. Signal-to-Visual Transformation Pipeline (`src/engine/SignalToVisualMapper.ts`)

Direct biological sensor readings cannot be fed raw into 60 FPS graphics shaders without creating visual jitter. PulseVerse implements a dedicated mathematical transformation layer:

1. **Confidence-Aware Gating:** Measurements with quality scores below 40% are smoothly damped or held at historical averages to prevent visual discontinuities.
2. **Timestamp-Aware Exponential Smoothing:** Continuous visual targets use time-delta exponential filters ($\alpha = 1 - e^{-\Delta t / \tau}$) rather than linear interpolation.
3. **Waveform Peak Detection:** Rather than estimating beat timings from averaged BPM, real waveform crests from `arterialPulseCurve` trigger instantaneous particle excitations.
4. **Missing Signal Graceful Fallback:** If the user moves out of frame, visuals gradually fade into a resting celestial glow rather than snapping or freezing.

---

## 5. Visual Rendering Architecture

All visual scenes are built with **Three.js** and **React Three Fiber**:
- **Heartbeat Universe:** Custom InstancedMesh particle field (2,500+ particles) with custom GLSL vertex shaders modulating point scale and radial displacement based on arterial waveform amplitude.
- **Breathing Garden:** Procedural spline flower petals and bioluminescent spores animated by smooth sinusoidal thoracic expansion vectors.
- **Harmony Mode:** Dual-signal coupled attractor equations where pulse rate controls particle orbital velocity and breathing depth controls spatial camera z-depth and flower petal bloom.

---

## 6. Audio Synthesis Engine (`src/services/AudioService.ts`)

PulseVerse includes an ambient biological soundscape using the native browser **Web Audio API**:
- **Sound Off by Default:** Audio is strictly opt-in to respect user focus.
- **Subtle Organic Resonance:** Sine and triangle oscillators run through low-pass biquad filters (180 Hz - 450 Hz cutoff) with soft exponential gain envelopes.
- **Zero Pre-recorded Audio Files:** 100% procedurally synthesized in real-time based on actual pulse and breathing cadences.

---

## 7. State Management Topology

The application coordinates reactive state across three dedicated **Zustand** stores:
- `useAppStore`: Active view, session status, camera consent state, visual theme, active experience mode (Live Camera vs. Simulated Demo).
- `useVitalsStore`: High-frequency volatile vitals (BPM, BrPM, HRV, arterial and thoracic waveforms, signal quality).
- `useSettingsStore`: In-memory developer API key, metric toggles, hardware camera device IDs, and local storage purge controls.
