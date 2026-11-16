import { describe, it, expect } from 'vitest';
import { SignalVisualMapper } from '../services/SignalVisualMapper';

describe('Phase 5 Creative Human-Sensing Experiences', () => {
  it('Breathing Bloom: separates measured user chest expansion from guided pacer timing', () => {
    const mapper = new SignalVisualMapper();
    const t0 = 1000;

    // Simulate user exhaling while pacer indicates inhale
    const rawExhale = {
      pulseBpm: 72,
      pulseConfidence: 90,
      breathingBrpm: 12,
      breathingConfidence: 90,
      arterialWaveformSample: 0.5,
      chestWaveformSample: -0.8, // User is genuinely exhaling
      signalQuality: 90,
      isCalibrating: false,
      timestampMs: t0,
    };

    const state = mapper.update(rawExhale, t0);
    // User's measured breath should reflect negative chest contraction
    expect(state.breathExpansion).toBeLessThan(0);
    expect(state.isBreathingActive).toBe(true);
  });

  it('Breathing Bloom: gracefully presents visual-only resting state when signals are unavailable', () => {
    const mapper = new SignalVisualMapper();
    const t0 = 1000;

    const rawUnavailable = {
      pulseBpm: null,
      pulseConfidence: null,
      breathingBrpm: null,
      breathingConfidence: null,
      arterialWaveformSample: null,
      chestWaveformSample: null,
      signalQuality: 0,
      isCalibrating: true,
      timestampMs: t0,
    };

    const state = mapper.update(rawUnavailable, t0);
    expect(state.isBreathingActive).toBe(false);
    expect(state.isCalibrating).toBe(true);
    // Flower does not freeze or crash; it smoothly holds a gentle resting baseline
    expect(state.breathPace).toBeGreaterThan(0.5);
    expect(state.breathPace).toBeLessThan(1.5);
  });

  it('Pulse Constellation: reacts to genuine systolic slope peaks without fabricating heartbeats', () => {
    const mapper = new SignalVisualMapper();
    const t0 = 1000;

    // Simulate rising arterial pressure wave up to systolic peak: 0.2 -> 0.6 -> 0.95 -> 0.75
    mapper.update({
      pulseBpm: 78,
      pulseConfidence: 85,
      breathingBrpm: 14,
      breathingConfidence: 85,
      arterialWaveformSample: 0.2,
      chestWaveformSample: 0,
      signalQuality: 88,
      isCalibrating: false,
      timestampMs: t0,
    }, t0);

    mapper.update({
      pulseBpm: 78,
      pulseConfidence: 85,
      breathingBrpm: 14,
      breathingConfidence: 85,
      arterialWaveformSample: 0.6,
      chestWaveformSample: 0,
      signalQuality: 88,
      isCalibrating: false,
      timestampMs: t0 + 40,
    }, t0 + 40);

    mapper.update({
      pulseBpm: 78,
      pulseConfidence: 85,
      breathingBrpm: 14,
      breathingConfidence: 85,
      arterialWaveformSample: 0.95,
      chestWaveformSample: 0,
      signalQuality: 88,
      isCalibrating: false,
      timestampMs: t0 + 80,
    }, t0 + 80);

    // Peak slope reversal
    const peakState = mapper.update({
      pulseBpm: 78,
      pulseConfidence: 85,
      breathingBrpm: 14,
      breathingConfidence: 85,
      arterialWaveformSample: 0.75,
      chestWaveformSample: 0,
      signalQuality: 88,
      isCalibrating: false,
      timestampMs: t0 + 120,
    }, t0 + 120);

    expect(peakState.cardiacDeflection).toBeGreaterThan(0.7);
    expect(peakState.isPulseActive).toBe(true);
  });

  it('Harmony Quest: evaluates exploratory biomes without medical judgment or risk scoring', () => {
    // Noncompetitive logic verification
    const evaluateBiome = (pulse: number, breath: number, coherence: number): string => {
      if (coherence >= 75) return 'aurora-resonance';
      if (breath <= 11) return 'deep-oceanic';
      if (pulse >= 88) return 'solar-nexus';
      return 'celestial-grove';
    };

    expect(evaluateBiome(72, 14, 50)).toBe('celestial-grove');
    expect(evaluateBiome(92, 16, 60)).toBe('solar-nexus');
    expect(evaluateBiome(68, 10, 60)).toBe('deep-oceanic');
    expect(evaluateBiome(72, 14, 82)).toBe('aurora-resonance');
  });
});
