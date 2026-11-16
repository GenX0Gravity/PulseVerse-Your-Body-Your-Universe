import { describe, it, expect, beforeEach } from 'vitest';
import { SignalVisualMapper, RawTelemetrySnapshot } from '../services/SignalVisualMapper';

describe('SignalVisualMapper (Signal-to-Visual Engine)', () => {
  let mapper: SignalVisualMapper;

  beforeEach(() => {
    mapper = new SignalVisualMapper({
      reducedMotion: false,
      visualIntensity: 1.0,
      staleThresholdMs: 2000,
      confidenceThreshold: 40,
    });
  });

  it('initializes with default resting baseline parameters', () => {
    const raw: RawTelemetrySnapshot = {
      pulseBpm: null,
      pulseConfidence: null,
      breathingBrpm: null,
      breathingConfidence: null,
      arterialWaveformSample: null,
      chestWaveformSample: null,
      signalQuality: 0,
      isCalibrating: true,
      timestampMs: 1000,
    };

    const state = mapper.update(raw, 1000);
    expect(state.isPulseActive).toBe(false);
    expect(state.isBreathingActive).toBe(false);
    expect(state.isCalibrating).toBe(true);
    expect(state.pulsePace).toBeGreaterThan(0.8);
    expect(state.pulsePace).toBeLessThan(1.2);
    expect(state.signalReliability).toBeLessThanOrEqual(0.5);
  });

  it('filters out low-confidence pulse measurements below threshold', () => {
    const lowConfidenceRaw: RawTelemetrySnapshot = {
      pulseBpm: 120, // Erroneous high spike
      pulseConfidence: 25, // Below 40 threshold
      breathingBrpm: null,
      breathingConfidence: null,
      arterialWaveformSample: null,
      chestWaveformSample: null,
      signalQuality: 20,
      isCalibrating: false,
      timestampMs: 1000,
    };

    const state = mapper.update(lowConfidenceRaw, 1000);
    // Should reject the low confidence 120 BPM and remain at resting baseline ~70 BPM (pace ~ 0.97)
    expect(state.isPulseActive).toBe(false);
    expect(state.pulsePace).toBeCloseTo(0.97, 1);
  });

  it('accepts valid high-confidence pulse and smooths with timestamp-aware lerp', () => {
    const t0 = 1000;
    const validRaw: RawTelemetrySnapshot = {
      pulseBpm: 90,
      pulseConfidence: 85,
      breathingBrpm: 18,
      breathingConfidence: 90,
      arterialWaveformSample: 0.8,
      chestWaveformSample: 0.5,
      signalQuality: 92,
      isCalibrating: false,
      timestampMs: t0,
    };

    // First frame
    const s1 = mapper.update(validRaw, t0);
    expect(s1.isPulseActive).toBe(true);
    expect(s1.isBreathingActive).toBe(true);

    // After 0.5 seconds of consistent 90 BPM
    const s2 = mapper.update(validRaw, t0 + 500);
    expect(s2.pulsePace).toBeGreaterThan(s1.pulsePace);
    expect(s2.breathPace).toBeGreaterThan(s1.breathPace);

    // Simulate successive frames over 2 seconds
    let s3 = s2;
    for (let step = 1; step <= 20; step++) {
      s3 = mapper.update(validRaw, t0 + 500 + step * 100);
    }
    expect(s3.pulsePace).toBeCloseTo(1.25, 1);
  });

  it('handles missing/stale measurements gracefully and fades visuals', () => {
    const t0 = 1000;
    const validRaw: RawTelemetrySnapshot = {
      pulseBpm: 80,
      pulseConfidence: 85,
      breathingBrpm: 16,
      breathingConfidence: 85,
      arterialWaveformSample: 0.5,
      chestWaveformSample: 0.2,
      signalQuality: 90,
      isCalibrating: false,
      timestampMs: t0,
    };

    // Feed active data
    mapper.update(validRaw, t0);
    mapper.update(validRaw, t0 + 100);

    // Now measurements cease (e.g. user moved away or camera blocked)
    const emptyRaw: RawTelemetrySnapshot = {
      pulseBpm: null,
      pulseConfidence: null,
      breathingBrpm: null,
      breathingConfidence: null,
      arterialWaveformSample: null,
      chestWaveformSample: null,
      signalQuality: 0,
      isCalibrating: false,
      timestampMs: t0 + 3000, // Exceeds staleThresholdMs (2000ms)
    };

    const staleState = mapper.update(emptyRaw, t0 + 3000);
    expect(staleState.isSignalStale).toBe(true);
    expect(staleState.isPulseActive).toBe(false);
    expect(staleState.isBreathingActive).toBe(false);
    // Visuals are gracefully faded/dimmed rather than crashing or freezing abruptly
    expect(staleState.signalReliability).toBeLessThan(0.6);
  });

  it('detects cardiac systolic peak from actual raw waveform without fabricating beats', () => {
    const t0 = 1000;
    const makeSample = (val: number, t: number): RawTelemetrySnapshot => ({
      pulseBpm: 75,
      pulseConfidence: 80,
      breathingBrpm: 15,
      breathingConfidence: 80,
      arterialWaveformSample: val,
      chestWaveformSample: 0,
      signalQuality: 85,
      isCalibrating: false,
      timestampMs: t,
    });

    // Ascending systolic slope: 0.2 -> 0.5 -> 0.95 -> 0.8 (peak passed)
    mapper.update(makeSample(0.2, t0), t0);
    mapper.update(makeSample(0.5, t0 + 50), t0 + 50);
    mapper.update(makeSample(0.95, t0 + 100), t0 + 100);
    const peakState = mapper.update(makeSample(0.8, t0 + 150), t0 + 150);

    // Peak deflection should be high
    expect(peakState.cardiacDeflection).toBeGreaterThan(0.7);
  });

  it('applies reduced motion transformations correctly', () => {
    mapper.setOptions({ reducedMotion: true });

    const raw: RawTelemetrySnapshot = {
      pulseBpm: 80,
      pulseConfidence: 90,
      breathingBrpm: 16,
      breathingConfidence: 90,
      arterialWaveformSample: 0.9,
      chestWaveformSample: 0.6,
      signalQuality: 95,
      isCalibrating: false,
      timestampMs: 1000,
    };

    const state = mapper.update(raw, 1000);
    expect(state.isReducedMotion).toBe(true);
    expect(state.effectiveParticleSpeed).toBeLessThanOrEqual(0.3);
    expect(state.effectiveShockwaveScale).toBeLessThanOrEqual(0.25);
  });

  it('scales response based on visualIntensity option', () => {
    mapper.setOptions({ visualIntensity: 1.5 });

    const raw: RawTelemetrySnapshot = {
      pulseBpm: 75,
      pulseConfidence: 85,
      breathingBrpm: 15,
      breathingConfidence: 85,
      arterialWaveformSample: 0.5,
      chestWaveformSample: 0.5,
      signalQuality: 90,
      isCalibrating: false,
      timestampMs: 1000,
    };

    const state = mapper.update(raw, 1000);
    expect(state.effectiveBloomIntensity).toBeCloseTo(1.5, 1);
  });
});
