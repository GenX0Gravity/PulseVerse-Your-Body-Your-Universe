import { useEffect, useState, useCallback } from 'react';
import {
  SmartSpectraService,
  SmartSpectraState,
  VitalsReading,
  ValidationFeedback,
  SmartSpectraErrorInfo,
} from '../services/SmartSpectraService';
import { useAppStore } from '../store/useAppStore';
import { useSettingsStore } from '../store/useSettingsStore';

/**
 * SmartSpectra Observer & Action Hook
 * Subscribes to the single SmartSpectraService instance and provides reactive state.
 * Lifecycle orchestration is safely centralized in useSessionCoordinator at the Shell root.
 */
export function useSmartSpectra() {
  const service = SmartSpectraService.getInstance();

  const { hasConsentedCamera, stopSession } = useAppStore();
  const { apiKey, cameraDeviceId } = useSettingsStore();

  const [state, setState] = useState<SmartSpectraState>(service.getState());
  const [vitals, setVitals] = useState<VitalsReading>(service.getVitals());
  const [validation, setValidation] = useState<ValidationFeedback>(service.getValidation());
  const [error, setError] = useState<SmartSpectraErrorInfo | null>(service.getLastError());
  const [stream, setStream] = useState<MediaStream | null>(service.getMediaStream());

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

  // Start live session (explicit user trigger)
  const startLive = useCallback(async () => {
    try {
      await service.startSession({
        apiKey,
        deviceId: cameraDeviceId || undefined,
        hasUserConsented: hasConsentedCamera,
      });
    } catch (err) {
      console.warn('[useSmartSpectra] startLive notice:', err);
    }
  }, [service, apiKey, cameraDeviceId, hasConsentedCamera]);

  // Stop live session (explicit user trigger)
  const stopLive = useCallback(async () => {
    try {
      await service.stopSession();
    } catch (err) {
      console.warn('[useSmartSpectra] stopLive notice:', err);
    }
  }, [service]);

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
