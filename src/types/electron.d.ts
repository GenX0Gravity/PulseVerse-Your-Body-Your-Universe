export interface AppInfo {
  version: string;
  name: string;
  platform: string;
  arch: string;
  electronVersion: string;
  nodeVersion: string;
  isPackaged: boolean;
}

export interface PulseVerseBridge {
  minimize: () => Promise<void>;
  maximize: () => Promise<boolean>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  toggleFullScreen: () => Promise<boolean>;
  isFullScreen: () => Promise<boolean>;
  onFullScreenChange?: (callback: (isFull: boolean) => void) => () => void;
  getAppInfo: () => Promise<AppInfo>;
  getConfigApiKey: () => Promise<string>;
  saveSession: (sessionData: unknown) => Promise<{ success: boolean; count: number }>;
  getSessions: () => Promise<unknown[]>;
  clearSessions: () => Promise<{ success: boolean }>;
  isElectron: boolean;
}

declare global {
  interface Window {
    pulseVerse?: PulseVerseBridge;
    smartspectra?: unknown;
  }
}
