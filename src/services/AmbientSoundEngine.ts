/**
 * PulseVerse Ambient Sound Engine — Beethoven's Für Elise Looped Biofeedback Soundscape
 * 
 * Features:
 * - Beethoven's iconic masterpiece "Für Elise" (Bagatelle No. 25 in A minor) on continuous loop
 * - Concert grand acoustic piano timbre with stereo hall acoustic reverb
 * - Bio-interactive modulation:
 *     - Inhalation gently expands filter airiness and presence
 *     - Systolic pulse peaks trigger delicate crystal singing bowl overtones
 *     - Coherence brightens acoustic space
 * - Seamless volume control and click-free exponential fading
 */

export class AmbientSoundEngine {
  private static instance: AmbientSoundEngine | null = null;
  private ctx: AudioContext | null = null;

  // Master Gain & Volume
  private masterGain: GainNode | null = null;
  private isMuted: boolean = true;
  private volume: number = 0.55;

  // Background Audio Element for Beethoven's Für Elise Loop
  private bgAudio: HTMLAudioElement | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;

  // Warm Celestial Underbed Harmonics (Soft A Minor Bed)
  private oscRoot: OscillatorNode | null = null;      // A3 (220.0 Hz)
  private oscFifth: OscillatorNode | null = null;     // E4 (330.0 Hz)
  private gainRoot: GainNode | null = null;
  private gainFifth: GainNode | null = null;

  // Concert Acoustic Low-Pass Filter (opens naturally with breath)
  private padFilter: BiquadFilterNode | null = null;

  // Spatial Ambient Delay (Concert Hall Reverb Simulation)
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayFilter: BiquadFilterNode | null = null;

  // Cardiac Singing Bowl Timing
  private lastChimeTime = 0;

  // State Sync Listeners
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
   * Initialize the Web Audio graph & Beethoven's Für Elise on first user interaction
   */
  private initAudio(): void {
    if (this.ctx) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      const now = this.ctx.currentTime;

      // Master output gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0001 : this.volume, now);
      this.masterGain.connect(this.ctx.destination);

      // ==========================================
      // 1. Spatial Delay / Concert Hall Reverb Unit
      // ==========================================
      this.delayNode = this.ctx.createDelay(1.0);
      this.delayNode.delayTime.setValueAtTime(0.35, now); // 350ms warm reflection

      this.delayFeedback = this.ctx.createGain();
      this.delayFeedback.gain.setValueAtTime(0.28, now); // 28% feedback for airy space

      this.delayFilter = this.ctx.createBiquadFilter();
      this.delayFilter.type = 'lowpass';
      this.delayFilter.frequency.setValueAtTime(1400, now);

      this.delayNode.connect(this.delayFilter);
      this.delayFilter.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delayNode);
      this.delayFilter.connect(this.masterGain);

      // ==========================================
      // 2. Concert Piano Dynamic Presence Filter
      // ==========================================
      this.padFilter = this.ctx.createBiquadFilter();
      this.padFilter.type = 'lowpass';
      this.padFilter.frequency.setValueAtTime(2600, now); // Full, bright piano presence
      this.padFilter.Q.setValueAtTime(0.6, now);

      this.padFilter.connect(this.masterGain);
      this.padFilter.connect(this.delayNode);

      // ==========================================
      // 3. Gentle Underbed Resonance (Soft A minor glow)
      // ==========================================
      this.oscRoot = this.ctx.createOscillator();
      this.gainRoot = this.ctx.createGain();
      this.oscRoot.type = 'sine';
      this.oscRoot.frequency.setValueAtTime(220.0, now);
      this.gainRoot.gain.setValueAtTime(0.04, now); // Very soft background bed
      this.oscRoot.connect(this.gainRoot);
      this.gainRoot.connect(this.padFilter);
      this.oscRoot.start(now);

      this.oscFifth = this.ctx.createOscillator();
      this.gainFifth = this.ctx.createGain();
      this.oscFifth.type = 'sine';
      this.oscFifth.frequency.setValueAtTime(330.0, now);
      this.gainFifth.gain.setValueAtTime(0.03, now);
      this.oscFifth.connect(this.gainFifth);
      this.gainFifth.connect(this.padFilter);
      this.oscFifth.start(now);

      // Initialize the Für Elise background track
      this.initBackgroundTrack();
    } catch (e) {
      console.warn('AudioContext initialization notice:', e);
    }
  }

  /**
   * Initialize Beethoven's Für Elise looped playback
   */
  private initBackgroundTrack(): void {
    if (this.bgAudio || typeof window === 'undefined') return;

    try {
      const audio = new Audio();
      audio.src = './audio/fur-elise.wav';
      audio.loop = true;
      audio.crossOrigin = 'anonymous';
      audio.preload = 'auto';
      audio.volume = this.volume;

      this.bgAudio = audio;

      // Connect through Web Audio if context is active
      if (this.ctx && this.padFilter && this.delayNode) {
        try {
          this.audioSourceNode = this.ctx.createMediaElementSource(audio);
          this.audioSourceNode.connect(this.padFilter);
          this.audioSourceNode.connect(this.delayNode);
        } catch {
          // If media element source creation is guarded by browser policy, native audio playback still works
        }
      }

      if (!this.isMuted) {
        this.playBackgroundTrack();
      }
    } catch (err) {
      console.warn('[AmbientSoundEngine] Background track notice:', err);
    }
  }

  private playBackgroundTrack(): void {
    if (!this.bgAudio) return;
    this.bgAudio.play().catch(() => {
      // Browsers restrict autoplay until user gestures; will play on first click
    });
  }

  private pauseBackgroundTrack(): void {
    if (this.bgAudio) {
      this.bgAudio.pause();
    }
  }

  /**
   * Set mute state with smooth, click-free exponential crossfade
   */
  public setMuted(muted: boolean): boolean {
    this.isMuted = muted;
    if (!muted) {
      this.initAudio();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      this.playBackgroundTrack();
    } else {
      this.pauseBackgroundTrack();
    }

    if (this.masterGain && this.ctx) {
      const targetGain = muted ? 0.0001 : this.volume;
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.exponentialRampToValueAtTime(targetGain, now + 0.3);
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
    if (!this.isMuted && this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, this.volume), now + 0.1);
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

  /**
   * Modulate acoustic parameters according to live physiological telemetry
   * 
   * - Respiration gently opens filter airiness and spatial reflection on inhalation
   * - Coherence expands acoustic clarity
   * - Cardiac peaks trigger pure crystal bell chimes harmonized with A minor
   */
  public updatePhysiology(
    cardiacDeflection: number,
    normalizedBreath: number,
    coherenceFactor: number
  ): void {
    if (this.isMuted || !this.ctx || this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime;

    // 1. Respiration Swell: Inhalation naturally opens acoustic airiness
    if (this.padFilter) {
      // Moves smoothly between 2200 Hz and 4200 Hz with breathing chest
      const targetCutoff = 2200 + normalizedBreath * 1800 + coherenceFactor * 600;
      this.padFilter.frequency.setTargetAtTime(targetCutoff, now, 0.2);
    }

    // 2. Cardiac Crystal Singing Bowl: Systolic peaks trigger an A-minor tuned bell chime
    if (cardiacDeflection > 0.88 && Date.now() - this.lastChimeTime > 600) {
      this.triggerCrystalChime(coherenceFactor);
      this.lastChimeTime = Date.now();
    }
  }

  /**
   * Trigger a warm, pure Crystal Bell chime tuned to Beethoven's A minor key
   */
  private triggerCrystalChime(coherence: number): void {
    if (!this.ctx || !this.masterGain || !this.delayNode) return;

    try {
      const now = this.ctx.currentTime;
      // High harmonic E6 (1318.5 Hz) or A5 (880 Hz) harmonic chime
      const fundamental = coherence > 0.65 ? 1318.5 : 880.0;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.035, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      gain.connect(this.masterGain);
      gain.connect(this.delayNode);

      osc.start(now);
      osc.stop(now + 1.85);
    } catch {
      // Ignore background audio limits
    }
  }

  public dispose(): void {
    if (this.bgAudio) {
      this.bgAudio.pause();
      this.bgAudio.src = '';
      this.bgAudio = null;
    }
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {}
      this.ctx = null;
    }
  }
}
