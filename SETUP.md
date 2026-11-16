# PulseVerse — Developer & User Setup Guide

> **Presage SmartSpectra SDK Challenge 2026**  
> Complete instructions for installing, configuring, running, testing, and packaging **PulseVerse — Your Body, Your Universe**.

---

## 1. System Requirements

| Component | Minimum Specification | Recommended Specification |
| :--- | :--- | :--- |
| **Operating System** | Windows 10 x64, macOS 12+ (arm64/x64), Ubuntu 22.04+ x64 | Windows 11 x64 (Primary challenge target) |
| **Node.js** | Node.js v20.x or v22.x LTS | Node.js v22.x LTS |
| **Webcam** | 720p @ 30 FPS USB or built-in webcam | Front-facing 1080p @ 30 FPS camera |
| **Lighting** | Stable ambient room lighting | Soft, diffused frontal facial lighting |
| **GPU** | WebGL 2.0 compatible GPU | Dedicated GPU with Vulkan/DirectX 12 support |
| **SDK Credentials** | Presage Developer API Key (optional for Demo Mode) | Valid API key from [Presage Portal](https://smartspectra.presagetech.com) |

---

## 2. Installation & Quickstart

### Step 1: Clone Repository
```bash
git clone https://github.com/Rishav-99/PulseVerse-SmartSpectra-Human-Sensing.git
cd PulseVerse-SmartSpectra-Human-Sensing
```

### Step 2: Install Node Dependencies
```bash
npm install
```
*Note: The native Windows x64 C ABI package (`@smartspectra/node-sdk-win32-x64`) and koffi Pure-ABI bindings are installed automatically via npm.*

### Step 3: Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and set your Presage developer key:
```env
PRESAGE_API_KEY=your_presage_api_key_here
```
*(Alternatively, you can leave `.env` empty and enter your key directly in the application's **Settings &rarr; Presage Developer Key** input, where it is held strictly in volatile RAM for the active session).*

---

## 3. Running PulseVerse

### Development Mode (Hot Reloading)
```bash
npm run dev
```
This boots Vite with `vite-plugin-electron` and launches the Electron desktop shell with live hot module replacement (HMR).

### Production Renderer Compilation
```bash
npm run build:renderer
```
Compiles TypeScript and bundles React, Three.js, and Tailwind into `dist/` and `dist-electron/`.

### Desktop Packaging (Windows x64)
```bash
npm run pack
```
Packages the complete standalone Electron application into `release/win-unpacked/PulseVerse.exe`.

---

## 4. Operational Modes: Live Camera vs. Simulated Demo

### Mode A: Live Camera Sensing (Real Presage SmartSpectra SDK)
1. Launch PulseVerse.
2. Select **"Start Sensing"** on the dashboard or press `Space`.
3. An explicit **Camera Consent Modal** appears detailing what is measured and how data is processed locally.
4. Click **"Authorize Camera & Begin"**.
5. The application requests camera hardware permission from the operating system and initializes the Presage SDK.
6. The reticle overlay provides real-time guidance:
   - Green circle: Excellent facial framing and lighting.
   - Yellow warning: Minor head tilt or sub-optimal lighting.
   - Blue/Cyan: Live optical rPPG pulse waveforms and thoracic respiration tracking active.

### Mode B: Simulated Demo Mode (`M` key toggle)
- If you do not have a webcam connected or want to explore PulseVerse without an API key, switch to **Demo Mode** using the top header toggle or pressing `M`.
- A prominent badge displays **`SIMULATED DATA`** across the dashboard.
- The visual environments react to mathematical physiological wave simulations (72 BPM cardiac rhythm, 14 BrPM respiration curve).

---

## 5. Testing & Verification

### Run TypeScript Verification
```bash
npm run typecheck
```
Ensures zero type violations across the entire codebase (`tsc --noEmit`).

### Run Unit Tests
```bash
npm test
```
Executes the Vitest automated test suite:
- Signal-to-visual transformation filters
- SDK singleton lifecycle
- Zustand state synchronization
- Camera consent rejection and shutdown
- Volatile in-memory telemetry reset
- Three.js component mounting

### Run Playwright E2E Integration Tests
```bash
npm run test:e2e
```
Validates Electron window creation, titlebar controls, navigation, and modal flows.

---

## 6. Camera & Lighting Troubleshooting

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **`CAMERA_PERMISSION_DENIED`** | Windows/macOS privacy toggle blocked camera access. | Open **Windows Settings &rarr; Privacy & security &rarr; Camera** and ensure *"Let desktop apps access your camera"* is enabled. |
| **`INSUFFICIENT_SIGNAL`** | Backlighting or excessive facial shadows. | Face a window or lamp directly. Avoid strong light sources behind you. |
| **`EXCESSIVE_MOTION`** | Frequent head movement. | Rest comfortably and keep head relatively steady facing the webcam. |
| **Multiple Faces Detected** | Bystander visible in background. | Frame only your face inside the central camera reticle. |
| **SDK Auth Error** | Expired or incorrect Presage API key. | Verify your key at [smartspectra.presagetech.com](https://smartspectra.presagetech.com) and update in Settings. |
