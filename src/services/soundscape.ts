import { Platform } from 'react-native';
import { SoundscapeId } from '../types';

let audioCtx: any = null;
let activeSourceNodes: any[] = [];
let masterGain: any = null;
let isAudioPlaying = false;

function getAudioContext() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass && !audioCtx) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

export function playZenChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, ctx.currentTime); // 528Hz Solfeggio "Transformation & Miracles" frequency
    osc.frequency.exponentialRampToValueAtTime(1056, ctx.currentTime + 1.2);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 2.6);
  } catch {
    // Graceful fallback
  }
}

export function startSoundscape(id: SoundscapeId, volume: number = 0.5) {
  stopSoundscape();
  if (id === 'none') return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
    masterGain.connect(ctx.destination);

    if (id === 'alpha_binaural') {
      // 10Hz Alpha Focus waves (200Hz Left / 210Hz Right)
      const merger = ctx.createChannelMerger(2);

      const oscLeft = ctx.createOscillator();
      oscLeft.type = 'sine';
      oscLeft.frequency.value = 200;

      const oscRight = ctx.createOscillator();
      oscRight.type = 'sine';
      oscRight.frequency.value = 210;

      const gainLeft = ctx.createGain();
      gainLeft.gain.value = 0.25;
      const gainRight = ctx.createGain();
      gainRight.gain.value = 0.25;

      oscLeft.connect(gainLeft);
      oscRight.connect(gainRight);

      gainLeft.connect(merger, 0, 0);
      gainRight.connect(merger, 0, 1);

      merger.connect(masterGain);

      oscLeft.start();
      oscRight.start();

      activeSourceNodes.push(oscLeft, oscRight);
      isAudioPlaying = true;
    } else if (id === 'rain_zen' || id === 'white_noise') {
      // Procedural Pink/White Noise buffer
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (id === 'rain_zen') {
          // Pink noise filter algorithm
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        } else {
          // Soft white noise
          data[i] = white * 0.15;
        }
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Low pass filter to make rain soothing
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = id === 'rain_zen' ? 1200 : 2500;

      noiseSource.connect(filter);
      filter.connect(masterGain);

      noiseSource.start();
      activeSourceNodes.push(noiseSource);
      isAudioPlaying = true;
    } else if (id === 'midnight_cafe' || id === 'forest_flow') {
      // Harmonic drone with soft frequencies
      const freqs = id === 'midnight_cafe' ? [110, 220, 330] : [144, 288, 432];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.value = 0.08 / (idx + 1);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        activeSourceNodes.push(osc);
      });
      isAudioPlaying = true;
    }
  } catch {
    isAudioPlaying = false;
  }
}

export function setSoundscapeVolume(volume: number) {
  try {
    if (masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(volume * 0.4, audioCtx.currentTime);
    }
  } catch {
    // Ignore
  }
}

export function stopSoundscape() {
  try {
    activeSourceNodes.forEach((node) => {
      try {
        node.stop();
        node.disconnect();
      } catch {}
    });
    activeSourceNodes = [];
    if (masterGain) {
      try {
        masterGain.disconnect();
      } catch {}
      masterGain = null;
    }
    isAudioPlaying = false;
  } catch {
    // Ignore
  }
}

export function getIsAudioPlaying() {
  return isAudioPlaying;
}
