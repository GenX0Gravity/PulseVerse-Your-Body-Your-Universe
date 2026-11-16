/**
 * PulseVerse Ambient Sound Engine — Meditative Harmonic Soundscape
 * 
 * Generates an ultra-pure, heavenly harmonic soundscape using pure additive synthesis
 * and spatial acoustic delay.
 * 
 * Tuning: 432 Hz Natural Pythagorean Reference
 * Harmonic Chord: A3 (216Hz), E4 (324Hz), A4 (432Hz), C#5 (540Hz)
 * Zero noise generators, zero speaker distortion, zero buzzing.
 */

export class AmbientSoundEngine {
  private static instance: AmbientSoundEngine | null = null;
  private ctx: AudioContext | null = null;

  // Master Gain & Volume
  private masterGain: GainNode | null = null;
  private isMuted: boolean = true;
  private volume: number = 0.5;

  // Harmonic Chord Voices (Pure 432Hz Harmonic Spectrum)
  private oscRoot: OscillatorNode | null = null;      // 216.0 Hz (A3 - Warm, grounded tone)
  private oscFifth: OscillatorNode | null = null;     // 324.0 Hz (E4 - Golden fifth)
  private oscA432: OscillatorNode | null = null;      // 432.0 Hz (A4 - Sacred Solfeggio center)
  private oscCelestial: OscillatorNode | null = null; // 540.0 Hz (C#5 - Ethereal major third)

  // Individual Voice Gains (for respiratory and coherence modulation)
  private gainRoot: GainNode | null = null;
  private gainFifth: GainNode | null = null;
  private gainA432: GainNode | null = null;
  private gainCelestial: GainNode | null = null;

  // Silky Pad Low-Pass Filter
  private padFilter: BiquadFilterNode | null = null;

  // Spatial Ambient Delay (Cathedral Reverb Sim)
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayFilter: BiquadFilterNode | null = null;

  // Soft Slow LFO for Gentle Acoustic Shimmer (0.05 Hz)
  private lfoOsc: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

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
   * Initialize the Web Audio graph on first user interaction
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
      // 1. Spatial Delay / Ambient Reverb Unit
      // ==========================================
      this.delayNode = this.ctx.createDelay(1.0);
      this.delayNode.delayTime.setValueAtTime(0.38, now); // 380ms warm acoustic reflection

      this.delayFeedback = this.ctx.createGain();
      this.delayFeedback.gain.setValueAtTime(0.32, now); // 32% feedback for airy space

      this.delayFilter = this.ctx.createBiquadFilter();
      this.delayFilter.type = 'lowpass';
      this.delayFilter.frequency.setValueAtTime(800, now); // Soft reflections, zero harshness

      // Delay loop: delay -> filter -> feedback -> delay
      this.delayNode.connect(this.delayFilter);
      this.delayFilter.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delayNode);

      // Reverb output to master
      this.delayFilter.connect(this.masterGain);

      // ==========================================
      // 2. Silky Celestial Low-Pass Filter
      // ==========================================
      this.padFilter = this.ctx.createBiquadFilter();
      this.padFilter.type = 'lowpass';
      this.padFilter.frequency.setValueAtTime(650, now);
      this.padFilter.Q.setValueAtTime(0.5, now); // Buttery, gentle rolloff

      this.padFilter.connect(this.masterGain);
      this.padFilter.connect(this.delayNode); // Also send into spatial delay

      // Slow 0.05 Hz LFO for gentle acoustic shimmer
      this.lfoOsc = this.ctx.createOscillator();
      this.lfoGain = this.ctx.createGain();
      this.lfoOsc.type = 'sine';
      this.lfoOsc.frequency.setValueAtTime(0.05, now);
      this.lfoGain.gain.setValueAtTime(50, now); // +/- 50 Hz filter modulation

      this.lfoOsc.connect(this.lfoGain);
      this.lfoGain.connect(this.padFilter.frequency);
      this.lfoOsc.start(now);

      // ==========================================
      // 3. Four Pure Harmonic Voices (432Hz Tuning)
      // ==========================================

      // Voice 1: Root A3 (216 Hz) — Grounding, warm fundamental
      this.oscRoot = this.ctx.createOscillator();
      this.gainRoot = this.ctx.createGain();
      this.oscRoot.type = 'sine';
      this.oscRoot.frequency.setValueAtTime(216.0, now);
      this.gainRoot.gain.setValueAtTime(0.18, now);
      this.oscRoot.connect(this.gainRoot);
      this.gainRoot.connect(this.padFilter);
      this.oscRoot.start(now);

      // Voice 2: Fifth E4 (324 Hz) — Peaceful harmonic foundation
      this.oscFifth = this.ctx.createOscillator();
      this.gainFifth = this.ctx.createGain();
      this.oscFifth.type = 'sine';
      this.oscFifth.frequency.setValueAtTime(324.0, now);
      this.gainFifth.gain.setValueAtTime(0.14, now);
      this.oscFifth.connect(this.gainFifth);
      this.gainFifth.connect(this.padFilter);
      this.oscFifth.start(now);

      // Voice 3: Sacred Solfeggio Center A4 (432 Hz) — Swells with breath
      this.oscA432 = this.ctx.createOscillator();
      this.gainA432 = this.ctx.createGain();
      this.oscA432.type = 'sine';
      this.oscA432.frequency.setValueAtTime(432.0, now);
      this.gainA432.gain.setValueAtTime(0.08, now);
      this.oscA432.connect(this.gainA432);
      this.gainA432.connect(this.padFilter);
      this.oscA432.start(now);

      // Voice 4: Celestial Major Third C#5 (540 Hz) — Expands with coherence
      this.oscCelestial = this.ctx.createOscillator();
      this.gainCelestial = this.ctx.createGain();
      this.oscCelestial.type = 'sine';
      this.oscCelestial.frequency.setValueAtTime(540.0, now);
      this.gainCelestial.gain.setValueAtTime(0.04, now);
      this.oscCelestial.connect(this.gainCelestial);
      this.gainCelestial.connect(this.padFilter);
      this.oscCelestial.start(now);
    } catch (e) {
      console.warn('AudioContext initialization notice:', e);
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
   * Modulate harmonic parameters according to live physiological telemetry
   * 
   * - Respiration expands the upper A432 and C#5 celestial harmonies
   * - Coherence opens the warm analog filter for radiant clarity
   * - Cardiac peaks trigger pure Tibetan Singing Bowl tones
   */
  public updatePhysiology(
    cardiacDeflection: number,
    normalizedBreath: number,
    coherenceFactor: number
  ): void {
    if (this.isMuted || !this.ctx || this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime;

    // 1. Respiration Swell: The chord breathes naturally with your chest
    if (this.gainA432 && this.gainCelestial) {
      // Inhalation gently elevates the sacred 432 Hz and 540 Hz overtones
      const targetA432Gain = 0.05 + normalizedBreath * 0.11;
      const targetCelestialGain = 0.02 + normalizedBreath * 0.07;
      this.gainA432.gain.setTargetAtTime(targetA432Gain, now, 0.2);
      this.gainCelestial.gain.setTargetAtTime(targetCelestialGain, now, 0.2);
    }

    // 2. Coherence Radiance: Higher heart-breath coherence expands filter clarity
    if (this.padFilter) {
      // Moves from 550 Hz (deep meditation) to 950 Hz (radiant peaceful clarity)
      const targetCutoff = 550 + coherenceFactor * 350;
      this.padFilter.frequency.setTargetAtTime(targetCutoff, now, 0.35);
    }

    // 3. Gentle Tibetan Crystal Singing Bowl on Systolic Pulse Peak
    if (cardiacDeflection > 0.88 && Date.now() - this.lastChimeTime > 600) {
      this.triggerCrystalBowl(coherenceFactor);
      this.lastChimeTime = Date.now();
    }
  }

  /**
   * Trigger a warm, pure Crystal Singing Bowl harmonic chime
   */
  private triggerCrystalBowl(coherence: number): void {
    if (!this.ctx || !this.masterGain || !this.delayNode) return;

    try {
      const now = this.ctx.currentTime;
      // 528 Hz ("Transformation / Peace" Solfeggio) or 432 Hz harmonic
      const fundamental = coherence > 0.65 ? 528.0 : 432.0;
      const overtone = fundamental * 1.5; // Pure perfect fifth overtone

      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(fundamental, now);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(overtone, now);

      // Smooth 50ms attack (zero clicks) and luxurious 2.2s exponential decay
      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.exponentialRampToValueAtTime(0.065, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      gain2.gain.setValueAtTime(0.0001, now);
      gain2.gain.exponentialRampToValueAtTime(0.02, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      gain1.connect(this.delayNode); // Send bowl resonance into ambient delay

      osc2.connect(gain2);
      gain2.connect(this.masterGain);

      osc1.start(now);
      osc1.stop(now + 2.25);

      osc2.start(now);
      osc2.stop(now + 1.45);
    } catch {
      // Ignore background audio limits
    }
  }

  public dispose(): void {
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {}
      this.ctx = null;
    }
  }
}
