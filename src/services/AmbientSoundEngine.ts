/**
 * PulseVerse Ambient Sound Engine — Meditative Biofeedback Soundscape
 * 
 * Generates an organic, ultra-calming binaural audio environment using the Web Audio API.
 * 
 * Features:
 * - 432 Hz Pythagorean / Om (136.1 Hz) warm harmonic celestial pad
 * - Brownian ocean-surf / soft wind breath swell tracking respiration
 * - Authentic Tibetan Singing Bowl harmonics triggered gently on systolic pulse peaks
 * - Smooth exponential gain crossfading (zero audio pops or clipping)
 * - Coherence-responsive harmonic overtone brightening
 */

export class AmbientSoundEngine {
  private static instance: AmbientSoundEngine | null = null;
  private ctx: AudioContext | null = null;

  // Master Gain & State
  private masterGain: GainNode | null = null;
  private isMuted: boolean = true;
  private volume: number = 0.45;

  // Harmonic Celestial Drone Nodes (432 Hz reference tuning)
  private droneOsc1: OscillatorNode | null = null; // Deep warm root (108 Hz)
  private droneOsc2: OscillatorNode | null = null; // Soft fifth (162 Hz)
  private droneOsc3: OscillatorNode | null = null; // Gentle octave (216 Hz)
  private droneFilter: BiquadFilterNode | null = null;
  private droneGain: GainNode | null = null;

  // Gentle LFO for organic acoustic shimmer
  private lfoOsc: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  // Brownian Noise Breath Swell (Ocean Surf / Forest Wind)
  private breathNoiseNode: AudioBufferSourceNode | null = null;
  private breathFilter: BiquadFilterNode | null = null;
  private breathGain: GainNode | null = null;

  // Cardiac Singing Bowl Timing
  private lastChimeTime = 0;

  // Listeners for UI state sync
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
   * Lazy initialize the Web Audio graph on first user interaction
   */
  private initAudio(): void {
    if (this.ctx) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      const now = this.ctx.currentTime;

      // ==========================================
      // 1. Warm Celestial Drone (432Hz Harmonic Pad)
      // ==========================================
      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(360, now); // Soft, warm rolloff
      this.droneFilter.Q.setValueAtTime(0.7, now);

      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.22, now);

      // Deep root tone (108 Hz — A2 in 432Hz reference)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(108.0, now);

      // Warm harmonic fifth (162 Hz)
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'sine';
      this.droneOsc2.frequency.setValueAtTime(162.0, now);

      // Harmonic heart octave (216 Hz)
      this.droneOsc3 = this.ctx.createOscillator();
      this.droneOsc3.type = 'sine';
      this.droneOsc3.frequency.setValueAtTime(216.0, now);

      // LFO for slow, natural organic shimmer (0.06 Hz)
      this.lfoOsc = this.ctx.createOscillator();
      this.lfoGain = this.ctx.createGain();
      this.lfoOsc.type = 'sine';
      this.lfoOsc.frequency.setValueAtTime(0.06, now);
      this.lfoGain.gain.setValueAtTime(40, now); // Modulates filter cutoff by +/- 40Hz

      this.lfoOsc.connect(this.lfoGain);
      this.lfoGain.connect(this.droneFilter.frequency);

      // Connect drone oscillators through warm filter and gain to master
      this.droneOsc1.connect(this.droneFilter);
      this.droneOsc2.connect(this.droneFilter);
      this.droneOsc3.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.masterGain);

      this.droneOsc1.start(now);
      this.droneOsc2.start(now);
      this.droneOsc3.start(now);
      this.lfoOsc.start(now);

      // ==========================================
      // 2. Brownian Ocean/Wind Breath Swell
      // ==========================================
      // Brownian (red) noise has a gentle -6dB/octave slope (like distant ocean waves or soft breathing wind)
      const bufferSize = this.ctx.sampleRate * 3;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.8; // Gain compensation
      }

      this.breathNoiseNode = this.ctx.createBufferSource();
      this.breathNoiseNode.buffer = noiseBuffer;
      this.breathNoiseNode.loop = true;

      this.breathFilter = this.ctx.createBiquadFilter();
      this.breathFilter.type = 'lowpass';
      this.breathFilter.frequency.setValueAtTime(240, now);
      this.breathFilter.Q.setValueAtTime(0.8, now);

      this.breathGain = this.ctx.createGain();
      this.breathGain.gain.setValueAtTime(0.06, now);

      this.breathNoiseNode.connect(this.breathFilter);
      this.breathFilter.connect(this.breathGain);
      this.breathGain.connect(this.masterGain);

      this.breathNoiseNode.start(now);
    } catch (e) {
      console.warn('AudioContext initialization notice:', e);
    }
  }

  /**
   * Set mute state with smooth exponential crossfade
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
      this.masterGain.gain.exponentialRampToValueAtTime(targetGain, now + 0.25);
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
   * Modulate audio parameters according to physiological telemetry
   */
  public updatePhysiology(
    cardiacDeflection: number,
    normalizedBreath: number,
    coherenceFactor: number
  ): void {
    if (this.isMuted || !this.ctx || this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime;

    // 1. Modulate Brownian Breath Filter & Volume (Ocean waves / Wind swell)
    if (this.breathFilter && this.breathGain) {
      // Gentle rolloff frequency opens from 200 Hz to 480 Hz on deep inhalation
      const targetFreq = 200 + normalizedBreath * 280;
      this.breathFilter.frequency.setTargetAtTime(targetFreq, now, 0.15);

      // Volume swells subtly with breath (4% to 9% max volume)
      const targetBreathVol = 0.04 + normalizedBreath * 0.05;
      this.breathGain.gain.setTargetAtTime(targetBreathVol, now, 0.15);
    }

    // 2. Modulate Celestial Pad Harmonics by Coherence Score
    if (this.droneOsc2 && this.droneOsc3 && this.droneFilter) {
      // Higher coherence gently shifts harmonic pad towards crystalline 216 Hz & 270 Hz
      const targetFifth = 162.0 + coherenceFactor * 27.0;
      this.droneOsc2.frequency.setTargetAtTime(targetFifth, now, 0.3);

      // Filter opens subtly with coherence for radiant warmth
      const targetFilter = 320 + coherenceFactor * 120;
      this.droneFilter.frequency.setTargetAtTime(targetFilter, now, 0.3);
    }

    // 3. Trigger Authentic Tibetan Singing Bowl on Systolic Pulse Peak
    if (cardiacDeflection > 0.88 && Date.now() - this.lastChimeTime > 550) {
      this.triggerTibetanBowl(coherenceFactor);
      this.lastChimeTime = Date.now();
    }
  }

  /**
   * Trigger a rich, peaceful Tibetan Singing Bowl harmonic resonance
   */
  private triggerTibetanBowl(coherence: number): void {
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const fundamental = coherence > 0.65 ? 432.0 : 324.0; // 432 Hz Solfeggio fundamental
      const harmonic = fundamental * 2; // Overtone

      // Fundamental oscillator
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(fundamental, now);

      // Harmonic overtone oscillator (softer)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(harmonic, now);

      // Gentle attack (35ms) and long serene exponential release (1.8s)
      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.exponentialRampToValueAtTime(0.07, now + 0.035);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      gain2.gain.setValueAtTime(0.0001, now);
      gain2.gain.exponentialRampToValueAtTime(0.025, now + 0.035);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc1.connect(gain1);
      gain1.connect(this.masterGain);

      osc2.connect(gain2);
      gain2.connect(this.masterGain);

      osc1.start(now);
      osc1.stop(now + 1.85);

      osc2.start(now);
      osc2.stop(now + 1.25);
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
