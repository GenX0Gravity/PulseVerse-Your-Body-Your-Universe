import { contextBridge, ipcRenderer } from 'electron';

// 1. Initialize Presage SmartSpectra Bridge
const ATTACH_CHANNEL = 'smartspectra:attach';
let smartSpectraPort: MessagePort | null = null;
let smartSpectraListener: ((data: any) => void) | null = null;

try {
  // Try loading the official SDK preload first if reachable
  require('@smartspectra/node-sdk/preload');
  console.log('[Preload] Official SmartSpectra preload script initialized');
} catch {
  // Pure inline bridge implementing the exact @smartspectra/node-sdk/preload specification
  const onPortMessage = (event: MessageEvent) => {
    if (smartSpectraListener) {
      smartSpectraListener(event.data);
    }
  };

  contextBridge.exposeInMainWorld('__smartspectraBridge', {
    diagnostics: process.env.SMARTSPECTRA_DIAGNOSTICS === '1',

    attach() {
      if (smartSpectraPort) return;
      const channel = new MessageChannel();
      smartSpectraPort = channel.port1;
      smartSpectraPort.onmessage = onPortMessage;
      ipcRenderer.postMessage(ATTACH_CHANNEL, null, [channel.port2]);
      smartSpectraPort.start();
    },

    postMessage(message: unknown) {
      if (!smartSpectraPort) {
        // Silently drop frames when port is closed or detached to prevent unhandled frame loop exceptions
        return;
      }
      smartSpectraPort.postMessage(message);
    },

    onMessage(callback: (data: any) => void) {
      smartSpectraListener = typeof callback === 'function' ? callback : null;
    },

    close() {
      if (smartSpectraPort) {
        try {
          smartSpectraPort.close();
        } catch {
          // Ignore
        }
        smartSpectraPort = null;
      }
      smartSpectraListener = null;
    },
  });
  console.log('[Preload] Pure SmartSpectra context bridge successfully active');
}

// 2. Expose the secure PulseVerse application bridge
contextBridge.exposeInMainWorld('pulseVerse', {
  // Window controls for custom frameless futuristic titlebar
  minimize: () => ipcRenderer.invoke('pulseverse:window-minimize'),
  maximize: () => ipcRenderer.invoke('pulseverse:window-maximize'),
  close: () => ipcRenderer.invoke('pulseverse:window-close'),
  isMaximized: () => ipcRenderer.invoke('pulseverse:is-maximized'),
  toggleFullScreen: () => ipcRenderer.invoke('pulseverse:window-toggle-fullscreen'),
  isFullScreen: () => ipcRenderer.invoke('pulseverse:is-fullscreen'),
  onFullScreenChange: (callback: (isFull: boolean) => void) => {
    const listener = (_event: unknown, isFull: boolean) => callback(isFull);
    ipcRenderer.on('pulseverse:fullscreen-changed', listener);
    return () => {
      ipcRenderer.removeListener('pulseverse:fullscreen-changed', listener);
    };
  },

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
