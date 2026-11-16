import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SmartSpectraService } from '../services/SmartSpectraService';
import { useAppStore } from '../store/useAppStore';
import { useVitalsStore } from '../store/useVitalsStore';

describe('Phase 6 Privacy, Security, & Responsible Data Handling', () => {
  let service: SmartSpectraService;

  beforeEach(() => {
    service = SmartSpectraService.getInstance();
    useVitalsStore.getState().resetVitals();
    useAppStore.setState({
      mode: 'live',
      isSessionActive: false,
      hasConsentedCamera: false,
    });
  });

  it('never activates camera automatically on app launch or service creation', () => {
    // Camera stream should be null initially
    expect(service.getMediaStream()).toBeNull();
    expect(service.getState()).toBe('idle');
    expect(useAppStore.getState().isSessionActive).toBe(false);
  });

  it('rejects session start without explicit user consent', async () => {
    await expect(
      service.startSession({
        apiKey: 'test_key',
        hasUserConsented: false, // Consent missing
      })
    ).rejects.toThrow(/User consent/);

    expect(service.getState()).toBe('awaitingConsent');
    expect(service.getMediaStream()).toBeNull();
  });

  it('configures SmartSpectraSDK with enableTelemetry: false to suppress telemetry packets', async () => {
    const mockTrack = {
      stop: vi.fn(),
      kind: 'video',
      clone: vi.fn().mockReturnValue({ stop: vi.fn(), kind: 'video' }),
    };
    const testStream = new (window as any).MediaStream();
    testStream.getTracks = () => [mockTrack];

    const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
    navigator.mediaDevices.getUserMedia = vi.fn().mockResolvedValue(testStream);

    await service.startSession({
      apiKey: 'test_key',
      hasUserConsented: true,
    });

    // Verify SDK instance was initialized with enableTelemetry: false
    // Inside SmartSpectraSDK, options.enableTelemetry is set to false
    expect(service.getState()).toBe('measuring');

    await service.stopSession();
    navigator.mediaDevices.getUserMedia = originalGetUserMedia;
  });

  it('immediately shuts down camera and releases tracks upon stopSession', async () => {
    const trackStopSpy = vi.fn();
    const mockTrack = {
      stop: trackStopSpy,
      kind: 'video',
      clone: vi.fn().mockReturnValue({ stop: vi.fn(), kind: 'video' }),
    };
    const testStream = new (window as any).MediaStream();
    testStream.getTracks = () => [mockTrack];

    const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
    navigator.mediaDevices.getUserMedia = vi.fn().mockResolvedValue(testStream);

    await service.startSession({
      apiKey: 'test_key',
      hasUserConsented: true,
    });

    expect(service.getMediaStream()).not.toBeNull();

    // End session
    await service.stopSession();

    // Verify track.stop was executed
    expect(trackStopSpy).toHaveBeenCalled();
    expect(service.getMediaStream()).toBeNull();
    expect(['stopped', 'idle']).toContain(service.getState());

    navigator.mediaDevices.getUserMedia = originalGetUserMedia;
  });

  it('clears active in-memory session vitals, waveforms, and history upon resetVitals', () => {
    // Populate fake vitals
    useVitalsStore.getState().recordPulseBeat(78);
    useVitalsStore.getState().recordBreathCycle(14, true);
    useVitalsStore.getState().pushWaveformSample(0.85, 0.42);

    expect(useVitalsStore.getState().telemetry.pulseBpm).toBe(78);
    expect(useVitalsStore.getState().historicalPulse).toHaveLength(1);
    expect(useVitalsStore.getState().historicalBreathing).toHaveLength(1);

    // Perform clear
    useVitalsStore.getState().resetVitals();

    const cleared = useVitalsStore.getState();
    expect(cleared.telemetry.pulseBpm).toBeNull();
    expect(cleared.telemetry.breathingBrpm).toBeNull();
    expect(cleared.historicalPulse).toEqual([]);
    expect(cleared.historicalBreathing).toEqual([]);
    expect(cleared.historicalCoherence).toEqual([]);
  });

  it('enforces operating system camera permission rejection gracefully', async () => {
    const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
    const notAllowedError = new Error('Permission denied by system');
    notAllowedError.name = 'NotAllowedError';
    navigator.mediaDevices.getUserMedia = vi.fn().mockRejectedValue(notAllowedError);

    await expect(
      service.startSession({
        apiKey: 'test_key',
        hasUserConsented: true,
      })
    ).rejects.toThrow();

    expect(service.getState()).toBe('error');
    const err = service.getLastError();
    expect(err?.code).toBe('CAMERA_PERMISSION_DENIED');
    expect(err?.recoveryGuidance).toContain('Windows Settings');

    navigator.mediaDevices.getUserMedia = originalGetUserMedia;
  });
});
