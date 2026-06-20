import { Audio } from 'expo-av';

let sound: Audio.Sound | null = null;

export async function startAmbient(): Promise<void> {
  if (sound) return;
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    sound = new Audio.Sound();
    await sound.loadAsync(require('../../assets/audio/infrasound.wav'));
    await sound.setIsLoopingAsync(true);
    await sound.setVolumeAsync(0.02);
    await sound.playAsync();
  } catch {
    sound = null;
  }
}

export async function setAmbientIntensity(intensity: number): Promise<void> {
  if (!sound) return;
  try {
    const clamped = Math.max(0, Math.min(1, intensity));
    await sound.setVolumeAsync(0.02 + clamped * 0.33);
  } catch {}
}

export async function stopAmbient(): Promise<void> {
  if (!sound) return;
  try {
    await sound.stopAsync();
    await sound.unloadAsync();
  } catch {}
  sound = null;
}
