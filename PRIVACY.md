# PulseVerse Privacy Policy & Technical Architecture Disclosure

> **Effective Date:** November 2026  
> **Application:** PulseVerse — Your Body, Your Universe (v1.0.0)  
> **Engine:** Presage SmartSpectra SDK (`@smartspectra/node-sdk` v3.5.0)  
> **Framework:** Electron 33+ / Node.js 22+ / React 18  

---

## 1. Executive Summary & Philosophy

**PulseVerse — Your Body, Your Universe** was engineered from its inception to adhere to uncompromising **zero-leakage, privacy-by-design** principles for the **Presage SmartSpectra SDK Challenge 2026**. 

Unlike conventional health apps or cloud-connected wearables, PulseVerse does not record your video, does not collect personal identifiers, does not upload biometric data to the cloud, and does not run third-party tracking or analytics SDKs.

This document discloses how camera feeds are handled, how biological metrics are extracted, what local storage is maintained, what external network requests occur, and how you retain total control over your hardware and data.

---

## 2. Camera Consent & Hardware Lifecycle

### 2.1 Never Auto-Activated
- The webcam is **never activated on application launch**.
- Upon opening PulseVerse, all camera devices remain completely idle and unpowered.
- Camera access requires an explicit, affirmative action by the user (clicking **"Start Sensing"** or pressing `Space`).

### 2.2 Transparent Purpose of Access
Camera frames are accessed strictly for:
1. **Remote Photoplethysmography (rPPG):** Detecting microscopic color and luminance fluctuations in facial skin capillaries caused by pulsatile blood flow with each heartbeat.
2. **Thoracic Kinematics:** Detecting subtle spatial displacement of the chest and shoulders during respiration.

### 2.3 Immediate Revocation of Consent
- Clicking **"Stop Camera"**, ending a session, or clicking **"Withdraw Camera Consent"** in Settings immediately executes `stream.getTracks().forEach(t => t.stop())` and destroys the native FFI session.
- Hardware handles are immediately released to the operating system, and hardware camera indicator lights turn off immediately.

---

## 3. Local Processing & Zero Video Storage

### 3.1 Pure Volatile In-Memory Processing
- Camera frames acquired via `navigator.mediaDevices.getUserMedia` are cloned and forwarded to the Presage SmartSpectra C ABI engine via Electron's secure IPC channel (`MessageChannel`).
- **Frames reside exclusively in volatile RAM** during algorithmic signal processing.
- Once optical PPG and thoracic signals are extracted, the video buffer is instantly discarded and garbage-collected.

### 3.2 No Video or Photo Recording
- **Zero Raw Image Storage:** PulseVerse contains no code or capability to record video clips, take snapshots of your face, or save raw frames to disk.
- **Zero Facial Recognition or Biometrics:** PulseVerse does not perform facial recognition, does not match faces against databases, and does not construct or save permanent facial geometry embeddings.

---

## 4. Local Storage, Retention, & Deletion

### 4.1 In-Memory by Default
All live physiological telemetry (real-time pulse BPM, breathing BrPM, arterial waveform samples, thoracic displacement traces, and cardiopulmonary coherence scores) is kept in volatile Zustand application stores in memory.

### 4.2 Local Session Archive
- When a user explicitly ends a session, an optional session summary record (containing session duration, average heart rate, and historical vital trends) is saved locally on your device in the operating system's standard user data directory:
  - **Windows:** `%APPDATA%\pulseverse\pulseverse_sessions.json`
- This file is stored exclusively on your local computer. It is **never automatically uploaded to the cloud or shared with any external server**.

### 4.3 Instant Data Deletion
- **Clear Active Session:** Clicking *"Clear Active Session"* instantly purges all active telemetry, history arrays, and waveform buffers from volatile memory.
- **Purge All Saved Records:** Clicking *"Purge All Local Records"* in Settings permanently deletes `pulseverse_sessions.json` from your hard drive.

---

## 5. SDK Telemetry & Network Disclosures

PulseVerse believes in absolute transparency regarding network behavior. We reject misleading marketing claims of "100% offline air-gapped" when proprietary SDK licensing requires authorization. Here is the exact technical reality:

### 5.1 Telemetry Disabled in Implementation
- In `src/services/SmartSpectraService.ts`, the SDK instance is explicitly initialized with:
  ```typescript
  const sdk = new SmartSpectraSDK({
    apiKey: options.apiKey,
    requestedMetrics: [...breathingMetrics, ...cardioMetrics],
    enableTelemetry: false, // Explicitly opted out
    sendTimeoutMs: 15000,
  });
  ```
- Setting `enableTelemetry: false` instructs the Presage C ABI engine to **suppress all aggregate SDK diagnostic telemetry**. No physiological measurements or usage telemetry packets are sent to Presage servers.

### 5.2 Mandatory SDK Authentication Network Traffic
- When a user enters a Presage Developer API Key and initiates a live session, the SDK must verify the license key with Presage authorization servers.
- **Outbound Request Destination:** `https://*.presagetech.com` (over encrypted TLS/HTTPS).
- **Transmitted Data:** Developer API Key token and package version verification.
- **What is NOT sent:** Video frames, camera images, raw waveforms, audio, or user identifiers are **never** transmitted to Presage servers.

### 5.3 Zero Third-Party Analytics
PulseVerse contains:
- ❌ No Google Analytics
- ❌ No Sentry or Crashlytics
- ❌ No Mixpanel or Segment
- ❌ No advertising SDKs or tracking pixels

---

## 6. Security Hardening & Process Isolation

PulseVerse implements strict Electron multi-process security best practices:

| Security Control | Configuration | Purpose |
| :--- | :--- | :--- |
| **Context Isolation** | `contextIsolation: true` | Prevents renderer scripts from tampering with Electron main process prototypes. |
| **Node Integration** | `nodeIntegration: false` | Completely disables Node.js primitives (`fs`, `child_process`) from being accessed directly in the browser renderer. |
| **Renderer Sandboxing** | `sandbox: true` | Enforces Chromium renderer process sandbox isolation. |
| **IPC Bridge** | Bounded `contextBridge` | Exposes only safe, specific wrapper functions (`pulseVerse.getAppInfo`, `saveSession`). |
| **Content Security Policy** | Strict `meta CSP` | Restricts script sources to `'self'`, worker sources to `'self' blob:`, and network connections exclusively to `'self'` and `https://*.presagetech.com`. |
| **Navigation Restrictions** | `setWindowOpenHandler` | Blocks all unexpected popup window creation and prevents arbitrary web navigation. |
| **Credential Redaction** | Memory-only handling | API keys are held only in RAM for the active session and redacted from all console and debug logs. |

---

## 7. Privacy-Preserving Artwork Snapshot Export

PulseVerse allows users to capture visual artwork generated by the **Pulse Constellation** experience.
- When generating an artwork export, PulseVerse creates a clean high-resolution canvas snapshot containing only the celestial star geometry and constellation archetype name.
- **Default Privacy Guard:** Camera video frames, face landmarks, personal identifiers, and exact numeric physiological readings (BPM/BrPM) are **strictly excluded** from the exported PNG image.

---

## 8. Responsible Use & Medical Disclaimer

### 8.1 Wellness and Informational Use Only
> [!IMPORTANT]
> **PulseVerse is designed solely for general wellness exploration, artistic biofeedback, and creative technology demonstrations.**

- PulseVerse is **NOT** a certified medical diagnostic device under the FDA, CE, or any other medical regulatory framework.
- It is not designed, marketed, or intended to diagnose, treat, cure, mitigate, or prevent any illness, disease, cardiovascular ailment, or respiratory condition.
- PulseVerse does not classify users as "healthy", "unhealthy", "stressed", or "anxious", and does not recommend pharmacological or clinical treatments.

### 8.2 Covert Monitoring & Bystander Protection
- PulseVerse must never be used for covert surveillance or monitoring individuals without their explicit informed consent.
- The optical reticle is calibrated exclusively for single-user, front-facing voluntary interaction.

---

## 9. User Controls Summary

| Action | Control Mechanism | Result |
| :--- | :--- | :--- |
| **Start Camera** | Click *"Start Sensing"* or press `Space` | Prompts for OS permission; begins local RAM rPPG analysis. |
| **Stop Camera** | Click *"Stop Camera"* or press `Space` | Immediately cuts camera stream and shuts off camera LED. |
| **Demo Mode** | Click *"Demo Mode"* or press `M` | Completely disables webcam; uses synthetic model with prominent `SIMULATED DATA` badge. |
| **Revoke Consent** | Settings &rarr; *"Withdraw Camera Consent"* | Unauthorizes camera, shuts down stream, and reverts to Demo Mode. |
| **Clear Active Session**| Settings &rarr; *"Clear Active Session"* | Erases all current in-memory vital histories and waveform buffers. |
| **Purge Local Data** | Settings &rarr; *"Purge All Local Records"* | Deletes `pulseverse_sessions.json` from the hard drive. |
| **Troubleshoot** | Consent Screen & Settings | Step-by-step guidance for Windows/macOS camera access toggles. |

---

## 10. Contact & Challenge Verification

Developed by the **PulseVerse Team** for the **Presage SmartSpectra SDK Challenge 2026**.  
Official SDK Documentation: [https://presagetech.com/docs/smartspectra-sdk/nodejs](https://presagetech.com/docs/smartspectra-sdk/nodejs)
