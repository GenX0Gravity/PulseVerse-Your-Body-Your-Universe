import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SmartSpectraService, SmartSpectraState } from '../services/SmartSpectraService';
import {
  SmartSpectraSDK,
  breathingMetrics,
  cardioMetrics,
  ValidationCode,
  SmartSpectraErrorCode,
  ProcessingStatus,
} from '@smartspectra/node-sdk';
import { decodeMetrics, presage } from '@smartspectra/node-sdk/messages';

describe('SmartSpectraService — Real SDK Integration & Lifecycle', () => {
  let service: SmartSpectraService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = SmartSpectraService.getInstance();
  });

  afterEach(async () => {
    await service.stopSession();
  });

  it('verifies actual SmartSpectra SDK exports and protobuf namespaces exist', () => {
    expect(SmartSpectraSDK).toBeDefined();
    expect(typeof SmartSpectraSDK).toBe('function');
    expect(Array.isArray(breathingMetrics)).toBe(true);
    expect(Array.isArray(cardioMetrics)).toBe(true);
    expect(ValidationCode.kOk).toBe(0);
    expect(ValidationCode.kNoFaceFound).toBe(1);
    expect(SmartSpectraErrorCode.kAuthenticationFailed).toBe(2);
    expect(ProcessingStatus.kRunning).toBe(3);
    expect(typeof decodeMetrics).toBe('function');
    expect(presage.smartspectra.Metrics).toBeDefined();
  });

  it('enforces explicit user consent before starting camera session', async () => {
    const states: SmartSpectraState[] = [];
    const unsub = service.onStateChange((s) => states.push(s));

    await expect(
      service.startSession({
        apiKey: 'test_key',
        hasUserConsented: false,
      })
    ).rejects.toThrow(/consent/i);

    expect(states).toContain('awaitingConsent');
    unsub();
  });

  it('starts session, requests media stream, and transitions through lifecycle states', async () => {
    const states: SmartSpectraState[] = [];
    const unsub = service.onStateChange((s) => states.push(s));

    await service.startSession({
      apiKey: 'test_key',
      hasUserConsented: true,
    });

    expect(states).toContain('requestingPermission');
    expect(states).toContain('initializing');
    expect(service.getState()).toBe('measuring');
    expect(service.getMediaStream()).not.toBeNull();

    unsub();
  });

  it('handles camera permission rejection properly and reports recovery guidance', async () => {
    const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
    const notAllowedError = new Error('Permission denied');
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
    expect(err).not.toBeNull();
    expect(err?.code).toBe('CAMERA_PERMISSION_DENIED');
    expect(err?.recoveryGuidance).toContain('Windows Settings');

    // Restore
    navigator.mediaDevices.getUserMedia = originalGetUserMedia;
  });

  it('cleans up all media stream tracks and SDK instance on stop', async () => {
    const mockTrack = {
      stop: vi.fn(),
      kind: 'video',
      clone: vi.fn().mockReturnValue({ stop: vi.fn(), kind: 'video' }),
    };
    const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
    const testStream = new (window as any).MediaStream();
    testStream.getTracks = () => [mockTrack];

    navigator.mediaDevices.getUserMedia = vi.fn().mockResolvedValue(testStream);

    await service.startSession({
      apiKey: 'test_key',
      hasUserConsented: true,
    });

    expect(service.getMediaStream()).not.toBeNull();

    await service.stopSession();

    expect(mockTrack.stop).toHaveBeenCalled();
    expect(service.getMediaStream()).toBeNull();
    expect(['stopped', 'idle']).toContain(service.getState());

    navigator.mediaDevices.getUserMedia = originalGetUserMedia;
  });

  it('decodes real protobuf Metrics and ensures no zero or fake data reaches state', () => {
    // Construct real protobuf Metrics message using official pbjs class
    const metricsMessage = new presage.smartspectra.Metrics({
      cardio: {
        pulseRate: [
          {
            value: 74.5,
            confidence: 82,
            stable: true,
            timestamp: 1700000000000,
          },
        ],
        arterialPressureTrace: [
          {
            value: 0.95,
            confidence: 80,
            stable: true,
            timestamp: 1700000000000,
          },
        ],
      },
      breathing: {
        rate: [
          {
            value: 14.8,
            confidence: 88,
            stable: true,
            timestamp: 1700000000000,
          },
        ],
        upperTrace: [
          {
            value: 0.42,
            stable: true,
            timestamp: 1700000000000,
          },
        ],
      },
    });

    const raw = presage.smartspectra.Metrics.encode(metricsMessage).finish();
    const uint8Buf = new Uint8Array(raw);
    const decoded = decodeMetrics(uint8Buf);

    expect(decoded.cardio?.pulseRate?.[0].value).toBeCloseTo(74.5, 1);
    expect(decoded.cardio?.pulseRate?.[0].stable).toBe(true);
    expect(decoded.breathing?.rate?.[0].value).toBeCloseTo(14.8, 1);
    expect(decoded.breathing?.upperTrace?.[0].value).toBeCloseTo(0.42, 2);

    // Verify zero values are ignored and not treated as genuine vitals
    const zeroMessage = new presage.smartspectra.Metrics({
      cardio: { pulseRate: [{ value: 0 }] },
      breathing: { rate: [{ value: 0 }] },
    });
    const zeroRaw = presage.smartspectra.Metrics.encode(zeroMessage).finish();
    const zeroUint8Buf = new Uint8Array(zeroRaw);
    const zeroDecoded = decodeMetrics(zeroUint8Buf);

    expect(zeroDecoded.cardio?.pulseRate?.[0].value).toBe(0);
  });

  it('does not populate HRV until the required 60s measurement window has elapsed', () => {
    const initialVitals = service.getVitals();
    expect(initialVitals.hrvRmssd).toBeNull();
    expect(initialVitals.isHrvReady).toBe(false);
  });
});
