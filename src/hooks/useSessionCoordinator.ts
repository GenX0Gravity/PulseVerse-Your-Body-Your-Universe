import { useEffect, useRef } from 'react';
import { SmartSpectraService } from '../services/SmartSpectraService';
import { useAppStore } from '../store/useAppStore';
import { useVitalsStore } from '../store/useVitalsStore';
import { useSettingsStore } from '../store/useSettingsStore';

/**
 * Root Session Coordinator
 * Mounts exclusively at the top-level Shell to manage:
 * 1. Single-flight start/stop of SmartSpectra capture session
 * 2. Vitals store synchronization from decoded sensor telemetry
 * 3. Synthetic physiological demo mode waveform generation
 * 4. Automatic API key initialization from secure desktop environment
 */
export function useSessionCoordinator() {
  const service = SmartSpectraService.getInstance();
  const { mode, isSessionActive, hasConsentedCamera } = useAppStore();
  const { updateVitals, pushWaveformSample, recordPulseBeat, recordBreathCycle } = useVitalsStore();
  const { apiKey, cameraDeviceId, initApiKey } = useSettingsStore();

  const simulationTimerRef = useRef<number | null>(null);

  // Initialize environment API key on boot if available
  useEffect(() => {
    initApiKey();
  }, [initApiKey]);

  // Sync real decoded vitals to application store in Live mode
  useEffect(() => {
    const unsubVitals = service.onVitals((vitals) => {
      if (useAppStore.getState().mode !== 'live') return;

      if (vitals.pulseBpm !== null && vitals.pulseBpm > 0) {
        recordPulseBeat(vitals.pulseBpm);
      }

      if (vitals.breathingBrpm !== null && vitals.breathingBrpm > 0) {
        recordBreathCycle(vitals.breathingBrpm, (vitals.latestChestWaveform?.value ?? 0) > 0);
      }

      if (vitals.latestArterialWaveform || vitals.latestChestWaveform) {
        pushWaveformSample(
          vitals.latestArterialWaveform?.value ?? 0,
          vitals.latestChestWaveform?.value ?? 0
        );
      }

      const val = service.getValidation();
      let calculatedCoherence = 75;
      if (vitals.hrvRmssd !== null && vitals.pulseBpm !== null && vitals.breathingBrpm !== null) {
        const breathingProximity = Math.max(0, 100 - Math.abs(vitals.breathingBrpm - 5.5) * 12);
        const hrvBonus = Math.min(30, (vitals.hrvRmssd / 60) * 30);
        calculatedCoherence = Math.round(Math.min(99, breathingProximity * 0.7 + hrvBonus));
      }

      updateVitals({
        hrvRmssd: vitals.hrvRmssd,
        coherenceScore: calculatedCoherence,
        signalQuality: val.isMeasurementReady
          ? Math.min(100, Math.max(40, vitals.pulseConfidence ?? 50))
          : 25,
        isFaceDetected: val.facePositionStatus === 'centered',
        trackingHint: val.hint,
      });
    });

    return () => {
      unsubVitals();
    };
  }, [service, recordPulseBeat, recordBreathCycle, pushWaveformSample, updateVitals]);

  // Single-flight Live session management
  useEffect(() => {
    if (mode === 'live' && isSessionActive) {
      service
        .startSession({
          apiKey,
          deviceId: cameraDeviceId || undefined,
          hasUserConsented: hasConsentedCamera,
        })
        .catch((err) => {
          console.warn('[useSessionCoordinator] startSession notice:', err);
        });
    } else if (mode === 'live' && !isSessionActive) {
      service.stopSession().catch((err) => {
        console.warn('[useSessionCoordinator] stopSession notice:', err);
      });
    }

    return () => {
      if (mode === 'live') {
        service.stopSession().catch(() => {});
      }
    };
  }, [mode, isSessionActive, apiKey, cameraDeviceId, hasConsentedCamera, service]);

  // Separate Simulated Demo Mode (single instance)
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
}
