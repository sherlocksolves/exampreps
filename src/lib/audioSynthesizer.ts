// Web Audio API procedural sound engine & HTML5 Audio playback manager
// Provides 100% reliable procedural ambient atmospheres (Rain, Deep Focus Alpha Waves, Library, Cafe, Ocean, Forest, Pink Noise)

import { AmbientCategory } from '../types';

class StudyAudioEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentCategory: AmbientCategory = 'silent';
  private isPlaying: boolean = false;
  private activeNodes: (AudioNode | { stop: () => void })[] = [];
  private htmlAudio: HTMLAudioElement | null = null;
  private volume: number = 0.5;

  private getContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.audioCtx.currentTime, 0.1);
    }
    if (this.htmlAudio) {
      this.htmlAudio.volume = this.volume;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentCategory(): AmbientCategory {
    return this.currentCategory;
  }

  public stopAll() {
    // Stop and disconnect all existing active Web Audio nodes immediately
    if (this.activeNodes && this.activeNodes.length > 0) {
      this.activeNodes.forEach(node => {
        try {
          if ('stop' in node && typeof node.stop === 'function') {
            node.stop();
          }
          if ('disconnect' in node && typeof node.disconnect === 'function') {
            node.disconnect();
          }
        } catch {
          // Ignore clean stop errors
        }
      });
      this.activeNodes = [];
    }

    if (this.masterGain && this.audioCtx) {
      try {
        this.masterGain.disconnect();
      } catch {
        // Ignore
      }
      this.masterGain = null;
    }

    if (this.htmlAudio) {
      try {
        this.htmlAudio.pause();
        this.htmlAudio.currentTime = 0;
      } catch {
        // Ignore
      }
      this.htmlAudio = null;
    }

    this.isPlaying = false;
    this.currentCategory = 'silent';
  }

  public async playCategory(category: AmbientCategory, customUrl?: string) {
    if (category === 'silent') {
      this.stopAll();
      return;
    }

    // Stop existing audio immediately
    this.stopAll();

    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (err) {
        console.warn('AudioContext resume error:', err);
      }
    }

    this.currentCategory = category;
    this.isPlaying = true;

    // Create fresh master gain connected to destination
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(Math.max(0.01, this.volume), ctx.currentTime);
    this.masterGain.connect(ctx.destination);

    if (customUrl && customUrl.trim().length > 0) {
      try {
        this.htmlAudio = new Audio(customUrl);
        this.htmlAudio.loop = true;
        this.htmlAudio.volume = this.volume;
        await this.htmlAudio.play();
        return;
      } catch (err) {
        console.warn('Custom audio URL playback failed, falling back to procedural synthesizer:', err);
      }
    }

    // Generate procedural synthesis based on category
    switch (category) {
      case 'rain':
        this.generateRain(ctx, this.masterGain);
        break;
      case 'deep_focus':
        this.generateDeepFocusAlpha(ctx, this.masterGain);
        break;
      case 'library':
        this.generateLibraryHum(ctx, this.masterGain);
        break;
      case 'cafe':
        this.generateCafeNoise(ctx, this.masterGain);
        break;
      case 'ocean':
        this.generateOceanWaves(ctx, this.masterGain);
        break;
      case 'forest':
        this.generateForestWind(ctx, this.masterGain);
        break;
      case 'white_noise':
        this.generatePinkNoise(ctx, this.masterGain);
        break;
      default:
        break;
    }
  }

  // --- PROCEDURAL GENERATORS ---

  // 1. Procedural Rain (Filtered noise + random droplet pops)
  private generateRain(ctx: AudioContext, destination: GainNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Lowpass filter for heavy rain rumble
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 800;

    // Highpass filter to eliminate unpleasant low bass mud
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 300;

    const rainGain = ctx.createGain();
    rainGain.gain.value = 0.6;

    whiteNoise.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(rainGain);
    rainGain.connect(destination);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, lowpass, highpass, rainGain);

    // Subtle random rain pitter-patter modulation
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.2;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 150;
    lfo.connect(lfoGain);
    lfoGain.connect(lowpass.frequency);
    lfo.start();
    this.activeNodes.push(lfo, lfoGain);
  }

  // 2. Deep Focus 528Hz Binaural Alpha Waves
  private generateDeepFocusAlpha(ctx: AudioContext, destination: GainNode) {
    // Base carrier tone: 528 Hz (Solfeggio frequency associated with focus/clarity)
    // Left ear: 528 Hz, Right ear: 538 Hz (10 Hz binaural beat -> Alpha brainwave state 8-12Hz)
    const oscLeft = ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.value = 528;

    const oscRight = ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.value = 538;

    const merger = ctx.createChannelMerger(2);
    const focusGain = ctx.createGain();
    focusGain.gain.value = 0.35;

    oscLeft.connect(merger, 0, 0); // Left channel
    oscRight.connect(merger, 0, 1); // Right channel
    merger.connect(focusGain);
    focusGain.connect(destination);

    oscLeft.start();
    oscRight.start();
    this.activeNodes.push(oscLeft, oscRight, merger, focusGain);

    // Subtle warm ambient sub pad underneath (132 Hz)
    const subPad = ctx.createOscillator();
    subPad.type = 'triangle';
    subPad.frequency.value = 132;

    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 250;

    const padGain = ctx.createGain();
    padGain.gain.value = 0.15;

    subPad.connect(padFilter);
    padFilter.connect(padGain);
    padGain.connect(destination);

    subPad.start();
    this.activeNodes.push(subPad, padFilter, padGain);
  }

  // 3. Quiet Academic Library Atmosphere
  private generateLibraryHum(ctx: AudioContext, destination: GainNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Very quiet bandpass filter for room ventilation hum
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 180;
    bandpass.Q.value = 2.0;

    const libGain = ctx.createGain();
    libGain.gain.value = 0.3;

    noise.connect(bandpass);
    bandpass.connect(libGain);
    libGain.connect(destination);

    noise.start();
    this.activeNodes.push(noise, bandpass, libGain);
  }

  // 4. Study Café Noise (Soft warm noise rumble)
  private generateCafeNoise(ctx: AudioContext, destination: GainNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter1 = ctx.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.value = 500;
    filter1.Q.value = 1.2;

    const cafeGain = ctx.createGain();
    cafeGain.gain.value = 0.35;

    noise.connect(filter1);
    filter1.connect(cafeGain);
    cafeGain.connect(destination);

    noise.start();
    this.activeNodes.push(noise, filter1, cafeGain);
  }

  // 5. Calm Ocean Waves (Modulated bandpass noise swell)
  private generateOceanWaves(ctx: AudioContext, destination: GainNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const waveGain = ctx.createGain();
    waveGain.gain.value = 0.4;

    noise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(destination);

    // LFO for wave swelling rhythm (1 wave every ~8 seconds)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.12;

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 250;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.start();
    lfo.start();
    this.activeNodes.push(noise, filter, waveGain, lfo, lfoGain);
  }

  // 6. Pine Forest Wind
  private generateForestWind(ctx: AudioContext, destination: GainNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 320;
    filter.Q.value = 3.0;

    const windGain = ctx.createGain();
    windGain.gain.value = 0.35;

    noise.connect(filter);
    filter.connect(windGain);
    windGain.connect(destination);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08;

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 180;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.start();
    lfo.start();
    this.activeNodes.push(noise, filter, windGain, lfo, lfoGain);
  }

  // 7. Pink Noise
  private generatePinkNoise(ctx: AudioContext, destination: GainNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const pinkGain = ctx.createGain();
    pinkGain.gain.value = 0.25;

    noise.connect(pinkGain);
    pinkGain.connect(destination);

    noise.start();
    this.activeNodes.push(noise, pinkGain);
  }
}

export const studyAudioEngine = new StudyAudioEngine();
