/**
 * PulseVerse Signal-to-Visual Mapping Engine
 * 
 * Sits between raw physiological telemetry and 3D WebGL rendering.
 * Provides:
 * - Separation of raw telemetry from renderable visual state
 * - Confidence-aware filtering and graceful stale-data degradation
 * - Timestamp-aware delta smoothing (exponential decay & lerping)
 * - Cardiac systolic waveform peak detection (no beat hallucination from average BPM)
 * - Respiratory thoracic volume mapping
 * - Reduced-motion accessibility transform
 * - Visual intensity modulation
 * - Zero medical diagnosis labeling
 */

export interface RawTelemetrySnapshot {
  pulseBpm: number | null;
  pulseConfidence: number | null;
  breathingBrpm: number | null;
  breathingConfidence: number | null;
  arterialWaveformSample: number | null; // Raw rPPG sample
  chestWaveformSample: number | null;    // Raw thoracic displacement sample
  signalQuality: number;                // 0 to 100
  isCalibrating: boolean;
  timestampMs: number;
}

export interface MappedVisualState {
  // Pacing multipliers (1.0 = baseline resting tempo)
  pulsePace: number;          // Typically 0.5 to 2.2
  breathPace: number;         // Typically 0.4 to 1.8

  // Instantaneous continuous waveforms (-1.0 to 1.0 or normalized 0.0 to 1.0)
  cardiacDeflection: number;  // 0.0 to 1.0 (peaks on real systolic wave)
  breathExpansion: number;    // -1.0 to 1.0 (negative = exhalation, positive = inhalation)
  normalizedBreath: number;   // 0.0 to 1.0 (0 = fully exhaled, 1 = fully inhaled)

  // System resonance & stability
  coherenceFactor: number;    // 0.0 to 1.0 (smooth cardiopulmonary synchrony factor)
  signalReliability: number;  // 0.0 to 1.0 (drives visual opacity / saturation fading)

  // Status flags for shaders & components
  isPulseActive: boolean;
  isBreathingActive: boolean;
  isSignalStale: boolean;
  isCalibrating: boolean;

  // Accessibility & visual customization factors
  effectiveParticleSpeed: number;
  effectiveShockwaveScale: number;
  effectiveBloomIntensity: number;
  isReducedMotion: boolean;
}

export interface MapperOptions {
  reducedMotion?: boolean;
  visualIntensity?: number; // 0.5 to 2.0 (default 1.0)
  staleThresholdMs?: number; // Grace period before fading (default 3000ms)
  confidenceThreshold?: number; // Minimum confidence to accept (default 35)
}

export class SignalVisualMapper {
  private options: Required<MapperOptions>;

  // Smoothed internal values
  private smoothedPulseBpm = 70;
  private smoothedBreathBrpm = 14;
  private smoothedCardiacDeflection = 0;
  private smoothedBreathExpansion = 0;
  private smoothedReliability = 0;
  private smoothedCoherence = 0.5;

  // Peak detection state for real waveform events
  private prevWaveformSample = 0;
  private prevWaveformSlope = 0;
  private lastSystolicPeakTime = 0;
  private systolicDecayWindowMs = 380; // Duration of visual cardiac pulse bloom

  // Timestamps of last valid inputs
  private lastPulseUpdateMs = 0;
  private lastBreathUpdateMs = 0;
  private lastUpdateMs = 0;

  constructor(options?: MapperOptions) {
    this.options = {
      reducedMotion: options?.reducedMotion ?? false,
      visualIntensity: options?.visualIntensity ?? 1.0,
      staleThresholdMs: options?.staleThresholdMs ?? 3000,
      confidenceThreshold: options?.confidenceThreshold ?? 35,
    };
  }

  public setOptions(options: Partial<MapperOptions>): void {
    if (options.reducedMotion !== undefined) {
      this.options.reducedMotion = options.reducedMotion;
    }
    if (options.visualIntensity !== undefined) {
      this.options.visualIntensity = Math.max(0.2, Math.min(2.5, options.visualIntensity));
    }
    if (options.staleThresholdMs !== undefined) {
      this.options.staleThresholdMs = options.staleThresholdMs;
    }
    if (options.confidenceThreshold !== undefined) {
      this.options.confidenceThreshold = options.confidenceThreshold;
    }
  }

  public getOptions(): Required<MapperOptions> {
    return { ...this.options };
  }

  /**
   * Reset smoothing to resting baseline
   */
  public reset(): void {
    this.smoothedPulseBpm = 70;
    this.smoothedBreathBrpm = 14;
    this.smoothedCardiacDeflection = 0;
    this.smoothedBreathExpansion = 0;
    this.smoothedReliability = 0;
    this.smoothedCoherence = 0.5;
    this.lastSystolicPeakTime = 0;
    this.lastPulseUpdateMs = 0;
    this.lastBreathUpdateMs = 0;
    this.lastUpdateMs = 0;
    this.prevWaveformSample = 0;
    this.prevWaveformSlope = 0;
  }

  /**
   * Transforms raw telemetry into smooth, bounded visual rendering state
   * @param raw Raw telemetry snapshot from SDK or Demo simulation
   * @param currentTimeMs Optional high-resolution timestamp
   */
  public update(raw: RawTelemetrySnapshot, currentTimeMs: number = Date.now()): MappedVisualState {
    const dt = this.lastUpdateMs > 0 ? Math.min(0.2, Math.max(0.001, (currentTimeMs - this.lastUpdateMs) / 1000)) : 0.016;
    this.lastUpdateMs = currentTimeMs;

    // 1. Evaluate Cardio Signal Reliability & Stale Timing
    const hasValidPulse =
      raw.pulseBpm !== null &&
      raw.pulseBpm > 0 &&
      (raw.pulseConfidence === null || raw.pulseConfidence >= this.options.confidenceThreshold);

    if (hasValidPulse) {
      this.lastPulseUpdateMs = currentTimeMs;
      // Exponential smoothing towards incoming pulse (damping factor ~ 2.5 per sec)
      const pulseLerpFactor = 1.0 - Math.exp(-2.5 * dt);
      this.smoothedPulseBpm += (raw.pulseBpm! - this.smoothedPulseBpm) * pulseLerpFactor;
    } else if (currentTimeMs - this.lastPulseUpdateMs > this.options.staleThresholdMs) {
      // Gently drift back towards neutral resting 70 BPM if stale
      const decayLerp = 1.0 - Math.exp(-0.8 * dt);
      this.smoothedPulseBpm += (70 - this.smoothedPulseBpm) * decayLerp;
    }

    // 2. Evaluate Breathing Signal Reliability & Stale Timing
    const hasValidBreath =
      raw.breathingBrpm !== null &&
      raw.breathingBrpm > 0 &&
      (raw.breathingConfidence === null || raw.breathingConfidence >= this.options.confidenceThreshold);

    if (hasValidBreath) {
      this.lastBreathUpdateMs = currentTimeMs;
      const breathLerpFactor = 1.0 - Math.exp(-1.8 * dt);
      this.smoothedBreathBrpm += (raw.breathingBrpm! - this.smoothedBreathBrpm) * breathLerpFactor;
    } else if (currentTimeMs - this.lastBreathUpdateMs > this.options.staleThresholdMs) {
      // Gently drift back towards neutral resting 14 BrPM
      const decayLerp = 1.0 - Math.exp(-0.5 * dt);
      this.smoothedBreathBrpm += (14 - this.smoothedBreathBrpm) * decayLerp;
    }

    // 3. Process Waveform Samples for Direct Frame Animation
    // Real cardiac deflection from arterial waveform sample
    let targetCardiacDeflection = 0;

    if (raw.arterialWaveformSample !== null && hasValidPulse) {
      const sample = raw.arterialWaveformSample;
      const slope = sample - this.prevWaveformSample;

      // Peak detection: positive-to-negative slope zero crossing on high amplitude
      if (this.prevWaveformSlope > 0 && slope <= 0 && sample > 0.3) {
        this.lastSystolicPeakTime = currentTimeMs;
      }

      this.prevWaveformSample = sample;
      this.prevWaveformSlope = slope;

      // Continuous deflection from waveform sample combined with recent peak bloom
      const timeSincePeak = currentTimeMs - this.lastSystolicPeakTime;
      const peakImpulse = Math.max(0, 1.0 - timeSincePeak / this.systolicDecayWindowMs);
      targetCardiacDeflection = Math.max(0, Math.min(1.0, Math.max(sample, peakImpulse)));
    } else if (hasValidPulse) {
      // No raw waveform available: fallback to smooth sinusoidal cardiac tempo derived from smoothed BPM
      // IMPORTANT: Do not pretend this is individual beat timing; provide smooth rhythmic wave
      const phase = (currentTimeMs / 1000) * (this.smoothedPulseBpm / 60) * Math.PI * 2;
      const beatShape = Math.pow(Math.max(0, Math.sin(phase)), 4); // Concentrated systolic beat
      targetCardiacDeflection = beatShape * 0.75;
    } else {
      // Calibrating or stale: very gentle resting wave
      const idlePhase = (currentTimeMs / 1000) * (60 / 60) * Math.PI * 2;
      targetCardiacDeflection = Math.pow(Math.max(0, Math.sin(idlePhase)), 4) * 0.25;
    }

    // Smooth cardiac deflection
    const cardiacLerp = 1.0 - Math.exp(-15.0 * dt);
    this.smoothedCardiacDeflection += (targetCardiacDeflection - this.smoothedCardiacDeflection) * cardiacLerp;

    // Real respiratory expansion from chest displacement sample
    let targetBreathExpansion = 0;
    if (raw.chestWaveformSample !== null && hasValidBreath) {
      targetBreathExpansion = Math.max(-1.0, Math.min(1.0, raw.chestWaveformSample));
    } else if (hasValidBreath) {
      // Smooth sinusoidal respiratory cycle derived from smoothed BrPM
      const breathPhase = (currentTimeMs / 1000) * (this.smoothedBreathBrpm / 60) * Math.PI * 2;
      targetBreathExpansion = Math.sin(breathPhase);
    } else {
      // Resting gentle cycle
      const idleBreathPhase = (currentTimeMs / 1000) * (12 / 60) * Math.PI * 2;
      targetBreathExpansion = Math.sin(idleBreathPhase) * 0.3;
    }

    const breathLerp = 1.0 - Math.exp(-6.0 * dt);
    this.smoothedBreathExpansion += (targetBreathExpansion - this.smoothedBreathExpansion) * breathLerp;

    // 4. Signal Reliability & Fading
    const isPulseStale = currentTimeMs - this.lastPulseUpdateMs > this.options.staleThresholdMs;
    const isBreathStale = currentTimeMs - this.lastBreathUpdateMs > this.options.staleThresholdMs;
    const isSignalStale = isPulseStale && isBreathStale;

    let targetReliability = 0;
    if (raw.isCalibrating) {
      targetReliability = 0.35; // Dimmed during calibration
    } else if (isSignalStale) {
      targetReliability = 0.2; // Faded during stale periods
    } else {
      const q = Math.max(0, Math.min(100, raw.signalQuality)) / 100;
      targetReliability = Math.max(0.4, q);
    }

    const relLerp = 1.0 - Math.exp(-2.0 * dt);
    this.smoothedReliability += (targetReliability - this.smoothedReliability) * relLerp;

    // 5. Coherence Factor (Physiological Synchrony)
    // Non-diagnostic cardiopulmonary phase alignment
    const pulsePace = Math.max(0.4, Math.min(2.5, this.smoothedPulseBpm / 72));
    const breathPace = Math.max(0.3, Math.min(2.0, this.smoothedBreathBrpm / 14));

    // Calculate ratio of pulse to breath (ideal physiological harmony is ~ 4:1 to 5:1 heartbeats per breath)
    const ratio = this.smoothedPulseBpm / Math.max(1, this.smoothedBreathBrpm);
    const targetCoherence = Math.max(0.2, 1.0 - Math.min(1.0, Math.abs(ratio - 4.8) / 3.5));
    const cohLerp = 1.0 - Math.exp(-1.0 * dt);
    this.smoothedCoherence += (targetCoherence - this.smoothedCoherence) * cohLerp;

    // 6. Apply Reduced Motion & Intensity Modulations
    const intensity = this.options.visualIntensity;
    const isReduced = this.options.reducedMotion;

    const motionVelocityScale = isReduced ? 0.3 : 1.0;
    const motionShockwaveScale = isReduced ? 0.25 : 1.0;

    return {
      pulsePace: pulsePace * (isReduced ? 0.5 : 1.0),
      breathPace: breathPace * (isReduced ? 0.6 : 1.0),
      cardiacDeflection: Math.max(0, Math.min(1, this.smoothedCardiacDeflection * intensity)),
      breathExpansion: Math.max(-1, Math.min(1, this.smoothedBreathExpansion * intensity)),
      normalizedBreath: Math.max(0, Math.min(1, (this.smoothedBreathExpansion + 1.0) / 2.0)),
      coherenceFactor: Math.max(0, Math.min(1, this.smoothedCoherence)),
      signalReliability: Math.max(0, Math.min(1, this.smoothedReliability)),
      isPulseActive: hasValidPulse && !isPulseStale,
      isBreathingActive: hasValidBreath && !isBreathStale,
      isSignalStale,
      isCalibrating: raw.isCalibrating,
      effectiveParticleSpeed: motionVelocityScale * intensity,
      effectiveShockwaveScale: motionShockwaveScale * intensity,
      effectiveBloomIntensity: Math.max(0.2, intensity * (isReduced ? 0.7 : 1.0)),
      isReducedMotion: isReduced,
    };
  }
}
