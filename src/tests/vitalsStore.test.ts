import { describe, it, expect, beforeEach } from 'vitest';
import { useVitalsStore } from '../store/useVitalsStore';

describe('useVitalsStore', () => {
  beforeEach(() => {
    useVitalsStore.getState().resetTelemetry();
  });

  it('initializes with default telemetry state', () => {
    const { telemetry } = useVitalsStore.getState();
    expect(telemetry.pulseBpm).toBeNull();
    expect(telemetry.breathingBrpm).toBeNull();
    expect(telemetry.signalQuality).toBe(0);
    expect(telemetry.pulseWaveform).toHaveLength(160);
    expect(telemetry.breathingWaveform).toHaveLength(160);
  });

  it('records pulse beat and stores history', () => {
    const store = useVitalsStore.getState();
    store.recordPulseBeat(74);

    const updated = useVitalsStore.getState();
    expect(updated.telemetry.pulseBpm).toBe(74);
    expect(updated.historicalPulse).toContain(74);
    expect(updated.telemetry.lastHeartbeatTime).toBeGreaterThan(0);
  });

  it('records breathing cycle and marks inhalation', () => {
    const store = useVitalsStore.getState();
    store.recordBreathCycle(14.2, true);

    const updated = useVitalsStore.getState();
    expect(updated.telemetry.breathingBrpm).toBe(14.2);
    expect(updated.telemetry.isBreathingIn).toBe(true);
    expect(updated.historicalBreathing).toContain(14.2);
  });

  it('rotates waveform buffer sample correctly', () => {
    const store = useVitalsStore.getState();
    store.pushWaveformSample(0.85, 0.42);

    const { pulseWaveform, breathingWaveform } = useVitalsStore.getState().telemetry;
    expect(pulseWaveform[pulseWaveform.length - 1]).toBe(0.85);
    expect(breathingWaveform[breathingWaveform.length - 1]).toBe(0.42);
    expect(pulseWaveform).toHaveLength(160);
  });
});
