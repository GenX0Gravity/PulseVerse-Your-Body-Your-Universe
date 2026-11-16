import { contextBridge, ipcRenderer } from 'electron';

// 1. Attempt to load the official Presage SmartSpectra preload script
try {
  // When running with @smartspectra/node-sdk installed, this executes the official
  // contextBridge setup that connects renderer MessagePorts to the main process IPC.
  // Using require dynamic import to remain resilient during builds and testing
  require('@smartspectra/node-sdk/preload');
  console.log('[Preload] Official SmartSpectra preload script successfully initialized');
} catch (e: unknown) {
  const err = e as Error;
  console.info(
    '[Preload] SmartSpectra preload script notice (running in mock/test or SDK not present in bundle):',
    err.message
  );
}

// 2. Expose the secure PulseVerse application bridge
contextBridge.exposeInMainWorld('pulseVerse', {
  // Window controls for custom frameless futuristic titlebar
  minimize: () => ipcRenderer.invoke('pulseverse:window-minimize'),
  maximize: () => ipcRenderer.invoke('pulseverse:window-maximize'),
  close: () => ipcRenderer.invoke('pulseverse:window-close'),
  isMaximized: () => ipcRenderer.invoke('pulseverse:is-maximized'),

  // Application environment & diagnostics
  getAppInfo: () => ipcRenderer.invoke('pulseverse:get-app-info'),
  getConfigApiKey: () => ipcRenderer.invoke('pulseverse:get-config-api-key'),

  // Secure local session storage
  saveSession: (sessionData: unknown) => ipcRenderer.invoke('pulseverse:save-session', sessionData),
  getSessions: () => ipcRenderer.invoke('pulseverse:get-sessions'),
  clearSessions: () => ipcRenderer.invoke('pulseverse:clear-sessions'),

  // Platform flag
  isElectron: true,
});
