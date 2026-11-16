import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ActiveView } from '../types/experiences';
import { AmbientSoundEngine } from '../services/AmbientSoundEngine';

const VIEW_ORDER: ActiveView[] = [
  'dashboard',
  'live-sensing',
  'pulse-universe',
  'breathing-garden',
  'harmony',
  'interactive',
  'summary',
  'settings',
];

export function useKeyboardNavigation(onOpenHelp?: () => void) {
  const {
    activeView,
    setActiveView,
    isSessionActive,
    startSession,
    stopSession,
    mode,
    setMode,
    toggleTheme,
  } = useAppStore();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Ignore key events when typing inside input, textarea, or select
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Fullscreen shortcuts (F11 or F)
      if (event.key === 'F11' || event.key === 'f' || event.key === 'F') {
        event.preventDefault();
        if (window.pulseVerse?.toggleFullScreen) {
          window.pulseVerse.toggleFullScreen().catch(console.warn);
        } else if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
        return;
      }

      // Exit fullscreen with Escape
      if (event.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else if (window.pulseVerse?.isFullScreen) {
          window.pulseVerse.isFullScreen().then((full) => {
            if (full && window.pulseVerse?.toggleFullScreen) {
              window.pulseVerse.toggleFullScreen().catch(console.warn);
            }
          });
        }
        return;
      }

      // Arrow navigation across views
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        if (activeView !== 'welcome' && activeView !== 'consent') {
          event.preventDefault();
          const currentIndex = VIEW_ORDER.indexOf(activeView);
          if (currentIndex !== -1) {
            const nextIndex =
              event.key === 'ArrowDown'
                ? (currentIndex + 1) % VIEW_ORDER.length
                : (currentIndex - 1 + VIEW_ORDER.length) % VIEW_ORDER.length;
            setActiveView(VIEW_ORDER[nextIndex]);
          }
          return;
        }
      }

      switch (event.key) {
        // Navigation shortcuts
        case '1':
        case 'd':
        case 'D':
          if (activeView !== 'welcome' && activeView !== 'consent') {
            setActiveView('dashboard');
          }
          break;

        case '2':
        case 'l':
        case 'L':
          if (activeView !== 'welcome' && activeView !== 'consent') {
            setActiveView('live-sensing');
          }
          break;

        case '3':
        case 'p':
        case 'P':
          if (activeView !== 'welcome' && activeView !== 'consent') {
            setActiveView('pulse-universe');
          }
          break;

        case '4':
        case 'b':
        case 'B':
          if (activeView !== 'welcome' && activeView !== 'consent') {
            setActiveView('breathing-garden');
          }
          break;

        case 'h':
        case 'H':
          if (activeView !== 'welcome' && activeView !== 'consent') {
            setActiveView('harmony');
          }
          break;

        case '5':
        case 'i':
        case 'I':
          if (activeView !== 'welcome' && activeView !== 'consent') {
            setActiveView('interactive');
          }
          break;

        case '6':
        case 'u':
        case 'U':
          if (activeView !== 'welcome' && activeView !== 'consent') {
            setActiveView('summary');
          }
          break;

        case '7':
        case ',':
          if (activeView !== 'welcome' && activeView !== 'consent') {
            setActiveView('settings');
          }
          break;

        // Session controls
        case ' ':
          event.preventDefault();
          if (isSessionActive) {
            stopSession();
          } else {
            startSession();
          }
          break;

        // Mode toggle
        case 'm':
        case 'M':
          setMode(mode === 'live' ? 'demo' : 'live');
          break;

        // Ambient sound toggle
        case 'a':
        case 'A':
          AmbientSoundEngine.getInstance().toggleMute();
          break;

        // Theme toggle
        case 't':
        case 'T':
          toggleTheme();
          break;

        // Help modal
        case '?':
          if (onOpenHelp) {
            onOpenHelp();
          }
          break;

        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    activeView,
    setActiveView,
    isSessionActive,
    startSession,
    stopSession,
    mode,
    setMode,
    toggleTheme,
    onOpenHelp,
  ]);
}
