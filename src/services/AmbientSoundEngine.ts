/**
 * PulseVerse Ambient Sound Engine
 * 
 * Generates procedural binaural and harmonic meditative audio landscapes using
 * the standard Web Audio API. Zero external audio file dependencies.
 * 
 * Features:
 * - 432Hz harmonic Pythagorean drone
 * - Gentle systolic chime triggered on cardiac pulse peak
 * - Respiratory pink-noise / filter wind swell tracking breath expansion
 * - Seamless pause/resume lifecycle & mute toggle
 */

export class AmbientSoundEngine {
  private static instance: AmbientSoundEngine | null = null;
  private ctx: AudioContext | null = null;

  // Master Gain
  private masterGain: GainNode | null = null;
  private isMuted: boolean = true;
  private volume: number = 0.5;

  // Drone Nodes
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;

  // Breath Swell Nodes
  private breathNoiseNode: AudioBufferSourceNode | null = null;
  private breathFilter: BiquadFilterNode | null = null;
  private breathGain: GainNode | null = null;

  // Heart Chime State
  private lastChimeTime = 0;

  private constructor() {}

  public static getInstance(): AmbientSoundEngine {
    if (!AmbientSoundEngine.instance) {
      AmbientSoundEngine.instance = new AmbientSoundEngine();
    }
    return AmbientSoundEngine.instance;
  }

  private initAudio(): void {
    if (this.ctx) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // 1. Dual Harmonic Drone (Root C#3 136.1Hz Om / 216Hz Harmonic)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneGain = this.ctx.createGain();

      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(108.0, this.ctx.currentTime); // Deep root

      this.droneOsc2.type = 'sine';
      this.droneOsc2.frequency.setValueAtTime(162.0, this.ctx.currentTime); // Harmonic fifth

      this.droneGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

      this.droneOsc1.connect(this.droneGain);
      this.droneOsc2.connect(this.droneGain);
      this.droneGain.connect(this.masterGain);

      this.droneOsc1.start();
      this.droneOsc2.start();

      // 2. Respiratory Swell (Filtered Gentle Noise)
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      this.breathNoiseNode = this.ctx.createBufferSource();
      this.breathNoiseNode.buffer = noiseBuffer;
      this.breathNoiseNode.loop = true;

      this.breathFilter = this.ctx.createBiquadFilter();
      this.breathFilter.type = 'bandpass';
      this.breathFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
      this.breathFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      this.breathGain = this.ctx.createGain();
      this.breathGain.gain.setValueAtTime(0.05, this.ctx.currentTime);

      this.breathNoiseNode.connect(this.breathFilter);
      this.breathFilter.connect(this.breathGain);
      this.breathGain.connect(this.masterGain);

      this.breathNoiseNode.start();
    } catch (e) {
      console.warn('AudioContext initialization deferred:', e);
    }
  }

  public setMuted(muted: boolean): boolean {
    this.isMuted = muted;
    if (!muted) {
      this.initAudio();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    if (this.masterGain && this.ctx) {
      const targetGain = muted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
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
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Modulate audio parameters according to physiological visual state
   */
  public updatePhysiology(cardiacDeflection: number, normalizedBreath: number, coherenceFactor: number): void {
    if (this.isMuted || !this.ctx || this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime;

    // 1. Modulate Breath Filter Frequency & Volume
    if (this.breathFilter && this.breathGain) {
      // Filter opens upwards on inhalation (200Hz to 800Hz)
      const targetFreq = 220 + normalizedBreath * 550;
      this.breathFilter.frequency.setTargetAtTime(targetFreq, now, 0.1);

      // Volume swells slightly on inhalation
      const targetBreathVol = 0.03 + normalizedBreath * 0.08;
      this.breathGain.gain.setTargetAtTime(targetBreathVol, now, 0.1);
    }

    // 2. Modulate Drone Harmonic by Coherence
    if (this.droneOsc2) {
      // Coherence shifts harmonic to crystalline higher fifth
      const targetHarmonic = 162.0 + coherenceFactor * 54.0;
      this.droneOsc2.frequency.setTargetAtTime(targetHarmonic, now, 0.2);
    }

    // 3. Trigger Soft Pulse Chime on Strong Systolic Peak
    if (cardiacDeflection > 0.85 && Date.now() - this.lastChimeTime > 400) {
      this.triggerCardiacChime(coherenceFactor);
      this.lastChimeTime = Date.now();
    }
  }

  private triggerCardiacChime(coherence: number): void {
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Harmonic pitch (432Hz or octaves depending on coherence)
      const baseFreq = coherence > 0.7 ? 432.0 : 324.0;
      osc.frequency.setValueAtTime(baseFreq, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.38);
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
