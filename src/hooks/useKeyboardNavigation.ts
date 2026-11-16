import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

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
      // Ignore key events when typing inside input or textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
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
