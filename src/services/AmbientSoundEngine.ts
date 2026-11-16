/**
 * PulseVerse Ambient Sound Engine — Beethoven's Für Elise Background Audio
 * 
 * Single, pristine, continuous background loop of Beethoven's "Für Elise".
 * Strictly ONE single audio stream — zero competing voices, zero drones, zero echo delay.
 */

export class AmbientSoundEngine {
  private static instance: AmbientSoundEngine | null = null;
  private bgAudio: HTMLAudioElement | null = null;
  private isMuted: boolean = true;
  private volume: number = 0.55;

  private muteListeners: Set<(isMuted: boolean) => void> = new Set();
  private volumeListeners: Set<(vol: number) => void> = new Set();

  private constructor() {}

  public static getInstance(): AmbientSoundEngine {
    if (!AmbientSoundEngine.instance) {
      AmbientSoundEngine.instance = new AmbientSoundEngine();
    }
    return AmbientSoundEngine.instance;
  }

  /**
   * Initialize Beethoven's Für Elise audio stream on first interaction
   */
  private initAudio(): void {
    if (this.bgAudio || typeof window === 'undefined') return;

    try {
      const audio = new Audio();
      audio.src = './audio/fur-elise.wav';
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = this.volume;

      this.bgAudio = audio;

      if (!this.isMuted) {
        this.bgAudio.play().catch(() => {
          // Autoplay policy: will start on next user click
        });
      }
    } catch (err) {
      console.warn('[AmbientSoundEngine] Audio init notice:', err);
    }
  }

  /**
   * Toggle mute state cleanly for the single audio track
   */
  public setMuted(muted: boolean): boolean {
    this.isMuted = muted;
    this.initAudio();

    if (this.bgAudio) {
      if (muted) {
        this.bgAudio.pause();
      } else {
        this.bgAudio.play().catch(() => {});
      }
    }

    this.muteListeners.forEach((fn) => fn(this.isMuted));
    return this.isMuted;
  }

  public toggleMute(): boolean {
    return this.setMuted(!this.isMuted);
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.bgAudio) {
      this.bgAudio.volume = this.volume;
    }
    this.volumeListeners.forEach((fn) => fn(this.volume));
  }

  public getVolume(): number {
    return this.volume;
  }

  public onMuteChange(fn: (isMuted: boolean) => void): () => void {
    this.muteListeners.add(fn);
    return () => this.muteListeners.delete(fn);
  }

  public onVolumeChange(fn: (vol: number) => void): () => void {
    this.volumeListeners.add(fn);
    return () => this.volumeListeners.delete(fn);
  }

  public updatePhysiology(
    _cardiacDeflection: number,
    _normalizedBreath: number,
    _coherenceFactor: number
  ): void {
    // Single pure stream — zero competing voices, zero duplicate audio
  }

  public dispose(): void {
    if (this.bgAudio) {
      this.bgAudio.pause();
      this.bgAudio.src = '';
      this.bgAudio = null;
    }
  }
}
