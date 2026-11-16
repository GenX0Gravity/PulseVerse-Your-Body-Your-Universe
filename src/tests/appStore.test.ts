import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store/useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      activeView: 'welcome',
      hasCompletedOnboarding: false,
      hasConsentedCamera: false,
      mode: 'live',
      isSessionActive: false,
      sessionStartTime: null,
      currentSession: null,
      theme: 'dark',
    });
  });

  it('updates active view and tracks previous view', () => {
    const store = useAppStore.getState();
    store.setActiveView('dashboard');

    const updated = useAppStore.getState();
    expect(updated.activeView).toBe('dashboard');
    expect(updated.previousView).toBe('welcome');
  });

  it('starts and stops sensing session', () => {
    const store = useAppStore.getState();
    store.startSession();

    let state = useAppStore.getState();
    expect(state.isSessionActive).toBe(true);
    expect(state.sessionStartTime).toBeGreaterThan(0);

    const sessionRecord = store.stopSession();
    state = useAppStore.getState();
    expect(state.isSessionActive).toBe(false);
    expect(state.sessionStartTime).toBeNull();
    expect(sessionRecord).not.toBeNull();
    expect(sessionRecord?.mode).toBe('live');
  });

  it('toggles theme between dark and light', () => {
    const store = useAppStore.getState();
    expect(store.theme).toBe('dark');

    store.toggleTheme();
    expect(useAppStore.getState().theme).toBe('light');

    store.toggleTheme();
    expect(useAppStore.getState().theme).toBe('dark');
  });
});
