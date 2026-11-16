import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAMPLE_RATE = 44100;
const SIXTEENTH = 0.155; // 155ms per 16th note (~97 BPM, tranquil and contemplative tempo)

// Musical notes and frequencies
const NOTES = {
  A2: 110.00, E2: 82.41, G2: 98.00,
  C3: 130.81, D3: 146.83, E3: 164.81, G3: 196.00, Gs3: 207.65, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, Ds4: 311.13, E4: 329.63, F4: 349.23, G4: 392.00, Gs4: 415.30, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, Ds5: 622.25, E5: 659.25, F5: 698.46, Gs5: 830.61, A5: 880.00,
  E6: 1318.51,
  REST: 0,
};

// Complete Ludwig van Beethoven - Für Elise score events: [timeInSixteenths, freq, durationInSixteenths, velocity, pan]
const events = [];

function addNote(time, freq, dur = 1, vel = 0.6, pan = 0) {
  if (freq > 0) {
    events.push({ start: time * SIXTEENTH, freq, dur: dur * SIXTEENTH, vel, pan });
  }
}

function addArpeggio(time, [f1, f2, f3], dur = 2.8, vel = 0.42) {
  addNote(time, f1, dur, vel * 1.1, -0.25);
  addNote(time + 1, f2, dur, vel * 0.9, -0.15);
  addNote(time + 2, f3, dur, vel * 0.85, -0.05);
}

// ----------------------------------------------------
// SCORE CONSTRUCTION: BEETHOVEN - FÜR ELISE (THEME A + B)
// ----------------------------------------------------
let t = 0;

// Pickup
addNote(t++, NOTES.E5, 1, 0.58, 0.15);
addNote(t++, NOTES.Ds5, 1, 0.55, 0.12);

// Section A - Part 1
function playThemeA() {
  // Bar 1
  addNote(t++, NOTES.E5, 1, 0.58, 0.15);
  addNote(t++, NOTES.Ds5, 1, 0.55, 0.12);
  addNote(t++, NOTES.E5, 1, 0.58, 0.15);
  addNote(t++, NOTES.B4, 1, 0.52, 0.05);
  addNote(t++, NOTES.D5, 1, 0.56, 0.12);
  addNote(t++, NOTES.C5, 1, 0.54, 0.08);

  // Bar 2
  addArpeggio(t, [NOTES.A2, NOTES.E3, NOTES.A3], 3.5, 0.45);
  addNote(t, NOTES.A4, 3, 0.65, -0.02);
  t += 3;
  addNote(t++, NOTES.C4, 1, 0.45, -0.1);
  addNote(t++, NOTES.E4, 1, 0.48, -0.05);
  addNote(t++, NOTES.A4, 1, 0.54, 0.02);

  // Bar 3
  addArpeggio(t, [NOTES.E2, NOTES.E3, NOTES.Gs3], 3.5, 0.42);
  addNote(t, NOTES.B4, 3, 0.62, 0.05);
  t += 3;
  addNote(t++, NOTES.E4, 1, 0.46, -0.05);
  addNote(t++, NOTES.Gs4, 1, 0.50, 0.02);
  addNote(t++, NOTES.B4, 1, 0.55, 0.08);

  // Bar 4
  addArpeggio(t, [NOTES.A2, NOTES.E3, NOTES.A3], 3.5, 0.45);
  addNote(t, NOTES.C5, 3, 0.64, 0.10);
  t += 3;
  addNote(t++, NOTES.E4, 1, 0.48, -0.05);
  addNote(t++, NOTES.E5, 1, 0.58, 0.15);
  addNote(t++, NOTES.Ds5, 1, 0.55, 0.12);

  // Bar 5
  addNote(t++, NOTES.E5, 1, 0.58, 0.15);
  addNote(t++, NOTES.Ds5, 1, 0.55, 0.12);
  addNote(t++, NOTES.E5, 1, 0.58, 0.15);
  addNote(t++, NOTES.B4, 1, 0.52, 0.05);
  addNote(t++, NOTES.D5, 1, 0.56, 0.12);
  addNote(t++, NOTES.C5, 1, 0.54, 0.08);

  // Bar 6
  addArpeggio(t, [NOTES.A2, NOTES.E3, NOTES.A3], 3.5, 0.45);
  addNote(t, NOTES.A4, 3, 0.65, -0.02);
  t += 3;
  addNote(t++, NOTES.C4, 1, 0.45, -0.1);
  addNote(t++, NOTES.E4, 1, 0.48, -0.05);
  addNote(t++, NOTES.A4, 1, 0.54, 0.02);

  // Bar 7
  addArpeggio(t, [NOTES.E2, NOTES.E3, NOTES.Gs3], 3.5, 0.42);
  addNote(t, NOTES.B4, 3, 0.62, 0.05);
  t += 3;
  addNote(t++, NOTES.E4, 1, 0.46, -0.05);
  addNote(t++, NOTES.C5, 1, 0.55, 0.08);
  addNote(t++, NOTES.B4, 1, 0.52, 0.05);
}

// First play of Theme A
playThemeA();

// Bar 8 (First Ending cadence leading to Theme B)
addArpeggio(t, [NOTES.A2, NOTES.E3, NOTES.A3], 4.0, 0.48);
addNote(t, NOTES.A4, 3, 0.68, -0.02);
t += 3;
addNote(t++, NOTES.B4, 1, 0.48, 0.05);
addNote(t++, NOTES.C5, 1, 0.52, 0.10);
addNote(t++, NOTES.D5, 1, 0.55, 0.14);

// Theme B (Lyrical, flowing major theme)
// Bar 9 (C Major)
addArpeggio(t, [NOTES.C3, NOTES.G3, NOTES.C4], 3.5, 0.46);
addNote(t, NOTES.E5, 3, 0.66, 0.18);
t += 3;
addNote(t++, NOTES.G4, 1, 0.48, 0.02);
addNote(t++, NOTES.F5, 1, 0.58, 0.20);
addNote(t++, NOTES.E5, 1, 0.56, 0.18);

// Bar 10 (G Major)
addArpeggio(t, [NOTES.G2, NOTES.D3, NOTES.G3], 3.5, 0.44);
addNote(t, NOTES.D5, 3, 0.64, 0.14);
t += 3;
addNote(t++, NOTES.F4, 1, 0.46, -0.02);
addNote(t++, NOTES.E5, 1, 0.56, 0.18);
addNote(t++, NOTES.D5, 1, 0.54, 0.14);

// Bar 11 (A minor)
addArpeggio(t, [NOTES.A2, NOTES.E3, NOTES.A3], 3.5, 0.45);
addNote(t, NOTES.C5, 3, 0.62, 0.10);
t += 3;
addNote(t++, NOTES.E4, 1, 0.46, -0.05);
addNote(t++, NOTES.D5, 1, 0.52, 0.12);
addNote(t++, NOTES.C5, 1, 0.50, 0.08);

// Bar 12 (E Dominant pedal)
addNote(t, NOTES.E2, 4.0, 0.50, -0.3);
addNote(t, NOTES.E3, 4.0, 0.45, -0.2);
addNote(t, NOTES.B4, 3, 0.60, 0.05);
t += 3;
addNote(t++, NOTES.E4, 1, 0.46, -0.05);
addNote(t++, NOTES.E5, 1, 0.56, 0.15);
addNote(t++, NOTES.REST, 1, 0, 0);

// Bar 13 (Ascending octave shimmer)
addNote(t++, NOTES.E5, 1, 0.50, 0.15);
addNote(t++, NOTES.E6, 1.5, 0.55, 0.25);
addNote(t++, NOTES.REST, 1, 0, 0);
addNote(t++, NOTES.Ds5, 1, 0.48, 0.12);
addNote(t++, NOTES.E5, 1, 0.50, 0.15);
addNote(t++, NOTES.REST, 1, 0, 0);

// Bar 14 (Chromatics preparing Theme A return)
addNote(t++, NOTES.Ds5, 1, 0.48, 0.12);
addNote(t++, NOTES.E5, 1, 0.50, 0.15);
addNote(t++, NOTES.Ds5, 1, 0.52, 0.12);
addNote(t++, NOTES.E5, 1, 0.54, 0.15);
addNote(t++, NOTES.Ds5, 1, 0.56, 0.12);
addNote(t++, NOTES.E5, 1, 0.58, 0.15);

// Recapitulation of Theme A
playThemeA();

// Final Cadence (Bar 18 - Serene, deep resolution chord)
addArpeggio(t, [NOTES.A2, NOTES.E3, NOTES.A3], 7.0, 0.52);
addNote(t, NOTES.A4, 6.0, 0.72, 0.0);
t += 6;

// Short pause before seamless loop restarts
t += 2;

const totalDuration = t * SIXTEENTH;
console.log(`Generated score: ${events.length} notes, duration: ${totalDuration.toFixed(2)}s`);

// ----------------------------------------------------
// PIANO ACOUSTIC SYNTHESIS ENGINE
// ----------------------------------------------------
const totalSamples = Math.ceil(totalDuration * SAMPLE_RATE);
const leftBuffer = new Float32Array(totalSamples);
const rightBuffer = new Float32Array(totalSamples);

// Reverb comb & allpass buffers for warm hall diffusion
const combDelays = [1557, 1617, 1491, 1422];
const combBuffersL = combDelays.map(len => new Float32Array(len));
const combBuffersR = combDelays.map(len => new Float32Array(len + 23)); // Stereo decorrelation
const combPointers = [0, 0, 0, 0];

for (const event of events) {
  const startSample = Math.floor(event.start * SAMPLE_RATE);
  const noteDuration = Math.max(0.6, event.dur * 2.2); // Natural piano sustain ring
  const noteSamples = Math.min(totalSamples - startSample, Math.floor(noteDuration * SAMPLE_RATE));
  const f0 = event.freq;
  const vel = event.vel;

  const panL = 0.5 * (1 - event.pan);
  const panR = 0.5 * (1 + event.pan);

  // Piano harmonic parameters: fundamental + 4 overtone partials + hammer strike
  const partials = [
    { mult: 1.0, amp: 1.00, decay: 1.4 },
    { mult: 2.0, amp: 0.42, decay: 2.2 },
    { mult: 3.0, amp: 0.18, decay: 3.4 },
    { mult: 4.0, amp: 0.08, decay: 4.8 },
    { mult: 5.0, amp: 0.03, decay: 6.5 },
  ];

  for (let i = 0; i < noteSamples; i++) {
    const time = i / SAMPLE_RATE;

    // Smooth soft 4ms hammer attack (zero clicks)
    const attack = Math.min(1.0, time / 0.004);

    let sampleVal = 0;
    for (const p of partials) {
      const freq = f0 * p.mult;
      // Slight detune for rich piano chorus
      const detune = 1.0 + (p.mult - 1) * 0.0004;
      const decayEnv = Math.exp(-p.decay * (time / (noteDuration * 0.5)));
      sampleVal += Math.sin(2 * Math.PI * freq * detune * time) * p.amp * decayEnv;
    }

    // Gentle felt hammer thump
    const hammer = Math.sin(2 * Math.PI * 120 * time) * Math.exp(-time * 120) * 0.12;

    const out = (sampleVal + hammer) * attack * vel * 0.18;
    const targetIdx = startSample + i;

    leftBuffer[targetIdx] += out * panL;
    rightBuffer[targetIdx] += out * panR;
  }
}

// ----------------------------------------------------
// STEREO CONCERT HALL REVERB SIMULATION
// ----------------------------------------------------
console.log('Applying spatial concert hall acoustics...');
for (let i = 0; i < totalSamples; i++) {
  const inL = leftBuffer[i];
  const inR = rightBuffer[i];
  let wetL = 0;
  let wetR = 0;

  for (let c = 0; c < 4; c++) {
    const bufL = combBuffersL[c];
    const bufR = combBuffersR[c];
    const ptr = combPointers[c];

    const outL = bufL[ptr];
    const outR = bufR[ptr];

    bufL[ptr] = inL + outL * 0.68;
    bufR[ptr] = inR + outR * 0.68;

    wetL += outL;
    wetR += outR;

    combPointers[c] = (ptr + 1) % bufL.length;
  }

  // 78% Dry + 22% Warm Cathedral Wet
  leftBuffer[i] = inL * 0.78 + (wetL * 0.25) * 0.22;
  rightBuffer[i] = inR * 0.78 + (wetR * 0.25) * 0.22;
}

// ----------------------------------------------------
// WRITE CD-QUALITY 16-BIT 44.1kHz STEREO WAV FILE
// ----------------------------------------------------
function writeWavFile(filename, left, right) {
  const numChannels = 2;
  const bitsPerSample = 16;
  const byteRate = SAMPLE_RATE * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = totalSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF Chunk
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Peak normalization to -0.5 dB (clean, zero clipping)
  let maxPeak = 0;
  for (let i = 0; i < totalSamples; i++) {
    const absL = Math.abs(left[i]);
    const absR = Math.abs(right[i]);
    if (absL > maxPeak) maxPeak = absL;
    if (absR > maxPeak) maxPeak = absR;
  }
  const normFactor = maxPeak > 0 ? (0.92 / maxPeak) : 1;

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const sL = Math.max(-1, Math.min(1, left[i] * normFactor));
    const sR = Math.max(-1, Math.min(1, right[i] * normFactor));

    const intL = sL < 0 ? sL * 32768 : sL * 32767;
    const intR = sR < 0 ? sR * 32768 : sR * 32767;

    buffer.writeInt16LE(Math.round(intL), offset);
    buffer.writeInt16LE(Math.round(intR), offset + 2);
    offset += 4;
  }

  fs.writeFileSync(filename, buffer);
  console.log(`Successfully wrote ${filename} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
}

const outDir = path.resolve(__dirname, '../public/audio');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const outFile = path.join(outDir, 'fur-elise.wav');
writeWavFile(outFile, leftBuffer, rightBuffer);
