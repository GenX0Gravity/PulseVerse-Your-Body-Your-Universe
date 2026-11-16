import { app, BrowserWindow, ipcMain, session } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In packaged Electron builds, native DLLs cannot be loaded from inside the virtual asar archive.
// Explicitly resolve and set SMARTSPECTRA_CAPI_PATH to the physical disk location in app.asar.unpacked.
if (!process.env.SMARTSPECTRA_CAPI_PATH) {
  const candidatePaths = [
    // Packaged build: process.resourcesPath/app.asar.unpacked/...
    process.resourcesPath
      ? path.join(
          process.resourcesPath,
          'app.asar.unpacked',
          'node_modules',
          '@smartspectra',
          'node-sdk-win32-x64',
          'smartspectra_capi.dll'
        )
      : '',
    // Packaged build: relative from __dirname in dist-electron inside app.asar
    path.join(
      __dirname,
      '../../app.asar.unpacked',
      'node_modules',
      '@smartspectra',
      'node-sdk-win32-x64',
      'smartspectra_capi.dll'
    ),
    // Adjacent to executable resources directory
    path.join(
      path.dirname(process.execPath),
      'resources',
      'app.asar.unpacked',
      'node_modules',
      '@smartspectra',
      'node-sdk-win32-x64',
      'smartspectra_capi.dll'
    ),
    // Development mode in workspace
    path.join(
      __dirname,
      '../node_modules',
      '@smartspectra',
      'node-sdk-win32-x64',
      'smartspectra_capi.dll'
    ),
  ];

  for (const candidate of candidatePaths) {
    if (candidate && fs.existsSync(candidate)) {
      process.env.SMARTSPECTRA_CAPI_PATH = candidate;
      const dllDir = path.dirname(candidate);
      process.env.PATH = `${dllDir};${process.env.PATH}`;
      console.log('[Native C-ABI] Configured SMARTSPECTRA_CAPI_PATH:', candidate);
      break;
    }
  }
}

const require = createRequire(import.meta.url);
let bindSmartSpectraIpc: any = null;
try {
  const sdkMain = require('@smartspectra/node-sdk/main');
  bindSmartSpectraIpc = sdkMain.bindSmartSpectraIpc;
} catch (loadErr: unknown) {
  const err = loadErr as Error;
  console.warn('[SmartSpectra] Native IPC module load notice:', err.message);
}

// Ensure single app instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow(): BrowserWindow {
  const preloadCandidate = [
    path.join(__dirname, 'preload.cjs'),
    path.join(__dirname, 'preload.js'),
  ].find((p) => fs.existsSync(p)) || path.join(__dirname, 'preload.cjs');

  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 700,
    frame: false, // Custom futuristic glass titlebar
    titleBarStyle: 'hidden',
    backgroundColor: '#070a14',
    show: false,
    webPreferences: {
      preload: preloadCandidate,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  // Bind the official Presage SmartSpectra native runtime IPC bridge to the browser window
  if (typeof bindSmartSpectraIpc === 'function') {
    try {
      bindSmartSpectraIpc(win, {
        logger: (level: string, msg: unknown) => {
          // Redact any potential credentials or bearer tokens from logging
          const sanitized = typeof msg === 'string'
            ? msg.replace(/(?:key|token|auth|bearer)[:=]\s*['"]?[a-zA-Z0-9_\-\.]{12,}['"]?/gi, '[REDACTED_CREDENTIAL]')
            : msg;
          console.log(`[SmartSpectra IPC ${level}]`, sanitized);
        },
      });
      console.log('[SmartSpectra] Successfully bound native IPC bridge to BrowserWindow');
    } catch (err: unknown) {
      const error = err as Error;
      console.warn('[SmartSpectra] Main process IPC binding notice:', error.message);
    }
  } else {
    console.warn('[SmartSpectra] bindSmartSpectraIpc is unavailable; continuing in UI/mock mode');
  }

  // Guard against untrusted external navigation
  win.webContents.setWindowOpenHandler(({ url }) => {
    console.warn(`[Security] Blocked external window creation for: ${url}`);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (isDev && (parsedUrl.host.startsWith('localhost:') || parsedUrl.host.startsWith('127.0.0.1:'))) {
      return;
    }
    if (parsedUrl.protocol !== 'file:') {
      event.preventDefault();
      console.warn(`[Security] Prevented navigation to untrusted URL: ${navigationUrl}`);
    }
  });

  // Restrict camera permission strictly to the trusted local application origin
  // NEVER grant media permissions automatically to arbitrary websites
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const requestingUrl = webContents.getURL();
    const isTrustedLocalOrigin =
      (isDev &&
        (requestingUrl.startsWith('http://localhost:5173') ||
          requestingUrl.startsWith('http://127.0.0.1:5173'))) ||
      (!isDev && requestingUrl.startsWith('file://'));

    if (permission === 'media' && isTrustedLocalOrigin) {
      callback(true);
      return;
    }

    console.warn(
      `[Security] Rejected '${permission}' permission request from untrusted origin: ${requestingUrl}`
    );
    callback(false);
  });

  // Load URL in dev mode or file in production
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Forward renderer console logs and errors to terminal for debugging
  win.webContents.on('console-message', (event, level, message) => {
    console.log(`[Renderer]`, message);
  });

  // Synchronize fullscreen state events with the renderer
  win.on('enter-full-screen', () => {
    win.webContents.send('pulseverse:fullscreen-changed', true);
  });
  win.on('leave-full-screen', () => {
    win.webContents.send('pulseverse:fullscreen-changed', false);
  });

  // Native F11 and Escape shortcuts for immersive fullscreen
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11' && input.type === 'keyDown') {
      event.preventDefault();
      win.setFullScreen(!win.isFullScreen());
    } else if (input.key === 'Escape' && input.type === 'keyDown' && win.isFullScreen()) {
      event.preventDefault();
      win.setFullScreen(false);
    }
  });

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('[Electron] Failed to load:', validatedURL, errorDescription, errorCode);
  });

  win.once('ready-to-show', () => {
    win.show();
    if (isDev && process.env.VITE_ENABLE_DEVTOOLS === '1') {
      win.webContents.openDevTools({ mode: 'detach' });
    }
  });

  return win;
}

// Local Storage for encrypted session records (stored locally on device, zero cloud upload)
const SESSIONS_FILE = path.join(app.getPath('userData'), 'pulseverse_sessions.json');

function readLocalSessions(): unknown[] {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[SessionStore] Error reading sessions:', e);
  }
  return [];
}

function writeLocalSessions(sessions: unknown[]) {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
  } catch (e) {
    console.error('[SessionStore] Error writing sessions:', e);
  }
}

// IPC Handlers for window controls, secure session storage and runtime settings
function setupIpcHandlers() {
  ipcMain.handle('pulseverse:window-minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.handle('pulseverse:window-maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
    return mainWindow?.isMaximized();
  });

  ipcMain.handle('pulseverse:window-close', () => {
    mainWindow?.close();
  });

  ipcMain.handle('pulseverse:window-toggle-fullscreen', () => {
    if (mainWindow) {
      const next = !mainWindow.isFullScreen();
      mainWindow.setFullScreen(next);
      return mainWindow.isFullScreen();
    }
    return false;
  });

  ipcMain.handle('pulseverse:is-fullscreen', () => {
    return mainWindow?.isFullScreen() ?? false;
  });

  ipcMain.handle('pulseverse:is-maximized', () => {
    return mainWindow?.isMaximized() ?? false;
  });

  ipcMain.handle('pulseverse:get-app-info', () => {
    return {
      version: app.getVersion(),
      name: app.getName(),
      platform: process.platform,
      arch: process.arch,
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
      isPackaged: app.isPackaged,
    };
  });

  ipcMain.handle('pulseverse:save-session', (_event, sessionData) => {
    const sessions = readLocalSessions();
    sessions.unshift(sessionData);
    const truncated = sessions.slice(0, 50);
    writeLocalSessions(truncated);
    return { success: true, count: truncated.length };
  });

  ipcMain.handle('pulseverse:get-sessions', () => {
    return readLocalSessions();
  });

  ipcMain.handle('pulseverse:clear-sessions', () => {
    writeLocalSessions([]);
    return { success: true };
  });

  ipcMain.handle('pulseverse:get-config-api-key', () => {
    return process.env.VITE_SMARTSPECTRA_API_KEY || process.env.SMARTSPECTRA_API_KEY || '';
  });
}

// Lifecycle
app.whenReady().then(() => {
  setupIpcHandlers();
  mainWindow = createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
