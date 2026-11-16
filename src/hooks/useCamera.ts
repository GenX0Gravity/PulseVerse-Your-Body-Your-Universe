import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface CameraDeviceInfo {
  deviceId: string;
  label: string;
}

export function useCamera() {
  const [devices, setDevices] = useState<CameraDeviceInfo[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { cameraDeviceId, setCameraDeviceId } = useSettingsStore();

  useEffect(() => {
    async function enumerateCameras() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          return;
        }

        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices
          .filter((d) => d.kind === 'videoinput')
          .map((d, index) => ({
            deviceId: d.deviceId,
            label: d.label || `Camera ${index + 1}`,
          }));

        setDevices(videoDevices);

        if (videoDevices.length > 0 && !cameraDeviceId) {
          setCameraDeviceId(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.warn('Failed to enumerate cameras:', err);
      }
    }

    enumerateCameras();

    // Listen for device changes (plug/unplug)
    navigator.mediaDevices?.addEventListener('devicechange', enumerateCameras);
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', enumerateCameras);
    };
  }, [cameraDeviceId, setCameraDeviceId]);

  const requestPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop immediately after checking permission
      stream.getTracks().forEach((t) => t.stop());
      setHasPermission(true);
      return true;
    } catch (err) {
      console.warn('Camera permission denied or failed:', err);
      setHasPermission(false);
      return false;
    }
  };

  return {
    devices,
    selectedDeviceId: cameraDeviceId,
    setSelectedDeviceId: setCameraDeviceId,
    hasPermission,
    requestPermission,
  };
}
