// Generates assets/audio/infrasound.wav
// 18.98 Hz primary tone + harmonics, 30s mono PCM 44100 Hz
// Run: node scripts/generate-infrasound.js
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const DURATION = 30;
const NUM_SAMPLES = SAMPLE_RATE * DURATION;

const TONES = [
  { freq: 18.98, amp: 0.65 },
  { freq: 37.96, amp: 0.20 },
  { freq: 56.94, amp: 0.10 },
];

// WAV header (44 bytes) + PCM data (signed 16-bit LE mono)
const dataBytes = NUM_SAMPLES * 2;
const buf = Buffer.alloc(44 + dataBytes);

buf.write('RIFF', 0);
buf.writeUInt32LE(36 + dataBytes, 4);
buf.write('WAVE', 8);
buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);      // PCM
buf.writeUInt16LE(1, 22);      // mono
buf.writeUInt32LE(SAMPLE_RATE, 24);
buf.writeUInt32LE(SAMPLE_RATE * 2, 28);
buf.writeUInt16LE(2, 32);
buf.writeUInt16LE(16, 34);
buf.write('data', 36);
buf.writeUInt32LE(dataBytes, 40);

for (let i = 0; i < NUM_SAMPLES; i++) {
  let sample = 0;
  for (const { freq, amp } of TONES) {
    sample += Math.sin(2 * Math.PI * freq * i / SAMPLE_RATE) * amp;
  }
  // Soft clip
  sample = Math.max(-1, Math.min(1, sample));
  buf.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
}

const outPath = path.join(__dirname, '..', 'assets', 'audio', 'infrasound.wav');
fs.writeFileSync(outPath, buf);
console.log(`Written: ${outPath} (${(dataBytes / 1024 / 1024).toFixed(1)} MB)`);
