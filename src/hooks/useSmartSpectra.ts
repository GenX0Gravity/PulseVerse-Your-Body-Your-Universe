import { useEffect, useState, useCallback, useRef } from 'react';
import {
  SmartSpectraService,
  SmartSpectraState,
  VitalsReading,
  ValidationFeedback,
  SmartSpectraErrorInfo,
} from '../services/SmartSpectraService';
import { useAppStore } from '../store/useAppStore';
import { useVitalsStore } from '../store/useVitalsStore';
import { useSettingsStore } from '../store/useSettingsStore';

export function useSmartSpectra() {
  const service = SmartSpectraService.getInstance();

  const { mode, isSessionActive, hasConsentedCamera, stopSession } = useAppStore();
  const { updateVitals, pushWaveformSample, recordPulseBeat, recordBreathCycle } = useVitalsStore();
  const { apiKey, cameraDeviceId } = useSettingsStore();

  const [state, setState] = useState<SmartSpectraState>(service.getState());
  const [vitals, setVitals] = useState<VitalsReading>(service.getVitals());
  const [validation, setValidation] = useState<ValidationFeedback>(service.getValidation());
  const [error, setError] = useState<SmartSpectraErrorInfo | null>(service.getLastError());
  const [stream, setStream] = useState<MediaStream | null>(service.getMediaStream());

  const simulationTimerRef = useRef<number | null>(null);
  const apiKeyRef = useRef(apiKey);
  apiKeyRef.current = apiKey;
  const cameraDeviceIdRef = useRef(cameraDeviceId);
  cameraDeviceIdRef.current = cameraDeviceId;
  const hasConsentedRef = useRef(hasConsentedCamera);
  hasConsentedRef.current = hasConsentedCamera;

  // Subscribe to service events
  useEffect(() => {
    const unsubState = service.onStateChange(setState);
    const unsubVitals = service.onVitals(setVitals);
    const unsubValidation = service.onValidation(setValidation);
    const unsubError = service.onError(setError);
    const unsubStream = service.onStream(setStream);

    return () => {
      unsubState();
      unsubVitals();
      unsubValidation();
      unsubError();
      unsubStream();
    };
  }, [service]);

  // Sync real decoded vitals to application store in Live mode
  useEffect(() => {
    if (mode !== 'live') return;

    // Pulse
    if (vitals.pulseBpm !== null && vitals.pulseBpm > 0) {
      recordPulseBeat(vitals.pulseBpm);
    }

    // Breathing
    if (vitals.breathingBrpm !== null && vitals.breathingBrpm > 0) {
      recordBreathCycle(vitals.breathingBrpm, (vitals.latestChestWaveform?.value ?? 0) > 0);
    }

    // Real Waveforms
    if (vitals.latestArterialWaveform || vitals.latestChestWaveform) {
      pushWaveformSample(
        vitals.latestArterialWaveform?.value ?? 0,
        vitals.latestChestWaveform?.value ?? 0
      );
    }

    // Real HRV & Coherence calculation
    let calculatedCoherence = 75;
    if (vitals.hrvRmssd !== null && vitals.pulseBpm !== null && vitals.breathingBrpm !== null) {
      // Coherence is higher when breathing rate is around 5.5-6 BrPM and HRV RMSSD is healthy
      const breathingProximity = Math.max(0, 100 - Math.abs(vitals.breathingBrpm - 5.5) * 12);
      const hrvBonus = Math.min(30, (vitals.hrvRmssd / 60) * 30);
      calculatedCoherence = Math.round(Math.min(99, breathingProximity * 0.7 + hrvBonus));
    }

    updateVitals({
      hrvRmssd: vitals.hrvRmssd,
      coherenceScore: calculatedCoherence,
      signalQuality: validation.isMeasurementReady
        ? Math.min(100, Math.max(40, (vitals.pulseConfidence ?? 50)))
        : 25,
      isFaceDetected: validation.facePositionStatus === 'centered',
      trackingHint: validation.hint,
    });
  }, [mode, vitals, validation, pushWaveformSample, recordBreathCycle, recordPulseBeat, updateVitals]);

  // Start live session
  const startLive = useCallback(async () => {
    try {
      await service.startSession({
        apiKey: apiKeyRef.current,
        deviceId: cameraDeviceIdRef.current || undefined,
        hasUserConsented: hasConsentedRef.current,
      });
    } catch (err) {
      console.warn('[useSmartSpectra] startLive notice:', err);
    }
  }, [service]);

  // Stop live session
  const stopLive = useCallback(async () => {
    try {
      await service.stopSession();
    } catch (err) {
      console.warn('[useSmartSpectra] stopLive notice:', err);
    }
  }, [service]);

  // Manage start/stop in response to session state in Live mode
  useEffect(() => {
    if (mode === 'live' && isSessionActive) {
      startLive();
    } else if (mode === 'live' && !isSessionActive) {
      stopLive();
    }

    return () => {
      if (mode === 'live') {
        stopLive();
      }
    };
  }, [mode, isSessionActive, startLive, stopLive]);

  // Separate Simulated Demo Mode — Strictly segregated with prominent SIMULATED DATA flag
  useEffect(() => {
    if (mode !== 'demo' || !isSessionActive) {
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
        simulationTimerRef.current = null;
      }
      return;
    }

    let phase = 0;
    let breathPhase = 0;

    simulationTimerRef.current = window.setInterval(() => {
      phase += 0.15;
      breathPhase += 0.035;

      const pulseWave = Math.sin(phase) + 0.35 * Math.sin(2 * phase) + 0.15 * Math.sin(3 * phase);
      const breathWave = Math.sin(breathPhase);

      const simBpm = 72 + 3 * Math.sin(breathPhase);
      const simBrpm = 14 + 1 * Math.sin(breathPhase * 0.5);

      pushWaveformSample(pulseWave, breathWave);

      if (Math.sin(phase) > 0.95) {
        recordPulseBeat(simBpm);
      }

      if (Math.sin(breathPhase) > 0.95) {
        recordBreathCycle(simBrpm, true);
      } else if (Math.sin(breathPhase) < -0.95) {
        recordBreathCycle(simBrpm, false);
      }

      updateVitals({
        hrvRmssd: 56,
        coherenceScore: 85,
        signalQuality: 100,
        isFaceDetected: true,
        trackingHint: 'SIMULATED DATA: Running synthetic physiological waveform model.',
      });
    }, 50);

    return () => {
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
        simulationTimerRef.current = null;
      }
    };
  }, [mode, isSessionActive, pushWaveformSample, recordPulseBeat, recordBreathCycle, updateVitals]);

  return {
    state,
    vitals,
    validation,
    error,
    stream,
    isRunning: state === 'measuring' || state === 'initializing' || state === 'insufficientSignal',
    isInitializing: state === 'initializing' || state === 'requestingPermission',
    isMeasuring: state === 'measuring',
    isInsufficientSignal: state === 'insufficientSignal',
    startLive,
    stopLive,
    stopSession,
  };
}
