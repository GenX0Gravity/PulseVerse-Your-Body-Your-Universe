import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Enable cross-realm instanceof for ArrayBuffer and Uint8Array in JSDOM test runner
Object.defineProperty(globalThis.ArrayBuffer, Symbol.hasInstance, {
  value: (instance: unknown) =>
    Object.prototype.toString.call(instance) === '[object ArrayBuffer]',
});

Object.defineProperty(globalThis.Uint8Array, Symbol.hasInstance, {
  value: (instance: unknown) =>
    Object.prototype.toString.call(instance) === '[object Uint8Array]' ||
    Object.prototype.toString.call(instance) === '[object Buffer]',
});

// Mock MediaStream in JSDOM
class MockMediaStreamTrack {
  kind = 'video';
  stop = vi.fn();
  clone() {
    return new MockMediaStreamTrack();
  }
}

class MockMediaStream {
  getTracks() {
    return [new MockMediaStreamTrack()];
  }
  getVideoTracks() {
    return [new MockMediaStreamTrack()];
  }
}

(globalThis as any).MediaStream = MockMediaStream;
(window as any).MediaStream = MockMediaStream;

// Mock MediaStreamTrackProcessor & OffscreenCanvas for Electron Chromium renderer in JSDOM
if (typeof (globalThis as any).MediaStreamTrackProcessor === 'undefined') {
  (globalThis as any).MediaStreamTrackProcessor = class {
    readable = {
      getReader: () => ({
        read: vi.fn().mockResolvedValue({ done: true, value: null }),
        releaseLock: vi.fn(),
        cancel: vi.fn(),
      }),
    };
  };
}

if (typeof (globalThis as any).OffscreenCanvas === 'undefined') {
  (globalThis as any).OffscreenCanvas = class {
    width: number;
    height: number;
    constructor(w: number, h: number) {
      this.width = w;
      this.height = h;
    }
    getContext() {
      return {
        drawImage: vi.fn(),
        getImageData: vi.fn().mockReturnValue({
          data: new Uint8Array(Math.max(1, this.width * this.height * 4)),
        }),
      };
    }
  };
}

// Mock window.pulseVerse bridge
window.pulseVerse = {
  minimize: vi.fn().mockResolvedValue(undefined),
  maximize: vi.fn().mockResolvedValue(true),
  close: vi.fn().mockResolvedValue(undefined),
  isMaximized: vi.fn().mockResolvedValue(false),
  toggleFullScreen: vi.fn().mockResolvedValue(true),
  isFullScreen: vi.fn().mockResolvedValue(false),
  onFullScreenChange: vi.fn().mockReturnValue(() => {}),
  getAppInfo: vi.fn().mockResolvedValue({
    version: '1.0.0',
    name: 'PulseVerse',
    platform: 'win32',
    arch: 'x64',
    electronVersion: '33.2.0',
    nodeVersion: '26.7.0',
    isPackaged: false,
  }),
  getConfigApiKey: vi.fn().mockResolvedValue('test_key'),
  saveSession: vi.fn().mockResolvedValue({ success: true, count: 1 }),
  getSessions: vi.fn().mockResolvedValue([]),
  clearSessions: vi.fn().mockResolvedValue({ success: true }),
  isElectron: true,
};

// Mock navigator.mediaDevices
if (!navigator.mediaDevices) {
  // @ts-expect-error mock mediaDevices
  navigator.mediaDevices = {};
}

navigator.mediaDevices.getUserMedia = vi.fn().mockImplementation(() => {
  return Promise.resolve(new (window as any).MediaStream());
});

navigator.mediaDevices.enumerateDevices = vi.fn().mockResolvedValue([
  {
    deviceId: 'camera-1',
    kind: 'videoinput',
    label: 'FaceTime HD Camera',
    groupId: 'group-1',
    toJSON: () => ({}),
  },
]);

// Mock window.__smartspectraBridge (for renderer SmartSpectraSDK in tests)
let bridgeMessageListener: ((data: any) => void) | null = null;
(window as any).__smartspectraBridge = {
  diagnostics: false,
  attach: vi.fn(),
  postMessage: vi.fn().mockImplementation((msg: any) => {
    const replyId = msg?.replyId ?? msg?.seq;
    // Acknowledge start/stop/configure calls from renderer SDK
    if (msg?.kind === 'start') {
      setTimeout(() => {
        bridgeMessageListener?.({
          kind: 'ack',
          replyId,
          ok: true,
          payload: {},
        });
        bridgeMessageListener?.({
          kind: 'processingStatus',
          status: 3, // kRunning
        });
        bridgeMessageListener?.({
          kind: 'validationStatus',
          code: 0,
          timestampUs: Date.now() * 1000,
          hint: 'Optimal conditions',
        });
      }, 5);
    } else if (msg?.kind === 'stop') {
      setTimeout(() => {
        bridgeMessageListener?.({
          kind: 'ack',
          replyId,
          ok: true,
          payload: {},
        });
        bridgeMessageListener?.({
          kind: 'processingStatus',
          status: 1, // kIdle
        });
      }, 5);
    } else if (replyId !== undefined) {
      setTimeout(() => {
        bridgeMessageListener?.({
          kind: 'ack',
          replyId,
          ok: true,
          payload: {},
        });
      }, 5);
    }
  }),
  onMessage: vi.fn().mockImplementation((cb: (data: any) => void) => {
    bridgeMessageListener = cb;
  }),
  close: vi.fn(),
};
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  arc: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  rotate: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  closePath: vi.fn(),
  shadowColor: '',
  shadowBlur: 0,
  strokeStyle: '',
  fillStyle: '',
  lineWidth: 1,
});
