/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SMARTSPECTRA_API_KEY: string;
  readonly VITE_DEFAULT_CAMERA_DEVICE_ID: string;
  readonly VITE_ENABLE_CARDIO_METRICS: string;
  readonly VITE_ENABLE_BREATHING_METRICS: string;
  readonly VITE_ENABLE_FACE_METRICS: string;
  readonly VITE_DEV_SERVER_PORT: string;
  readonly VITE_ENABLE_DEVTOOLS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
