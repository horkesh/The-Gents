import type { VibeMode } from '@the-toast/shared';

type SfxName = 'pour' | 'clink' | 'shutter' | 'envelope' | 'scratch';

const AMBIENT_TRACKS: Record<VibeMode, string> = {
  slow_burn: '/audio/slow-burn.mp3',
  cruise: '/audio/cruise.mp3',
  ignition: '/audio/ignition.mp3',
};

const SFX_FILES: Record<SfxName, string> = {
  pour: '/audio/pour.mp3',
  clink: '/audio/clink.mp3',
  shutter: '/audio/shutter.mp3',
  envelope: '/audio/envelope.mp3',
  scratch: '/audio/scratch.mp3',
};

const CROSSFADE_MS = 2000;

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientSources: Map<VibeMode, { buffer: AudioBuffer; source: AudioBufferSourceNode | null; gain: GainNode }> = new Map();
  private sfxBuffers: Map<SfxName, AudioBuffer> = new Map();
  private currentVibe: VibeMode | null = null;
  private _volume = 0.6;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this._volume;
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;

      // Load all audio in background — don't block init
      this.loadAll();
    } catch {
      // Web Audio API not available
    }
  }

  private async loadAll(): Promise<void> {
    // Load ambient tracks
    const ambientEntries = Object.entries(AMBIENT_TRACKS) as [VibeMode, string][];
    const ambientPromises = ambientEntries.map(async ([vibe, path]) => {
      const buffer = await this.loadBuffer(path);
      if (buffer && this.ctx && this.masterGain) {
        const gain = this.ctx.createGain();
        gain.gain.value = 0;
        gain.connect(this.masterGain);
        this.ambientSources.set(vibe, { buffer, source: null, gain });
      }
    });

    // Load SFX
    const sfxEntries = Object.entries(SFX_FILES) as [SfxName, string][];
    const sfxPromises = sfxEntries.map(async ([name, path]) => {
      const buffer = await this.loadBuffer(path);
      if (buffer) this.sfxBuffers.set(name, buffer);
    });

    await Promise.allSettled([...ambientPromises, ...sfxPromises]);
  }

  private async loadBuffer(path: string): Promise<AudioBuffer | null> {
    if (!this.ctx) return null;
    try {
      const response = await fetch(path);
      if (!response.ok) return null;
      const arrayBuffer = await response.arrayBuffer();
      return await this.ctx.decodeAudioData(arrayBuffer);
    } catch {
      return null;
    }
  }

  async resume(): Promise<void> {
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  crossfadeTo(vibe: VibeMode): void {
    if (!this.ctx || !this.masterGain || vibe === this.currentVibe) return;

    const now = this.ctx.currentTime;
    const fadeDuration = CROSSFADE_MS / 1000;

    // Fade out current
    if (this.currentVibe) {
      const current = this.ambientSources.get(this.currentVibe);
      if (current) {
        current.gain.gain.linearRampToValueAtTime(0, now + fadeDuration);
        const oldSource = current.source;
        if (oldSource) {
          setTimeout(() => { try { oldSource.stop(); } catch { /* already stopped */ } }, CROSSFADE_MS);
          current.source = null;
        }
      }
    }

    // Fade in new
    const next = this.ambientSources.get(vibe);
    if (next && next.buffer) {
      const source = this.ctx.createBufferSource();
      source.buffer = next.buffer;
      source.loop = true;
      source.connect(next.gain);
      next.gain.gain.setValueAtTime(0, now);
      next.gain.gain.linearRampToValueAtTime(0.4, now + fadeDuration);
      source.start();
      next.source = source;
    }

    this.currentVibe = vibe;
  }

  playSfx(name: SfxName): void {
    if (!this.ctx || !this.masterGain) return;
    const buffer = this.sfxBuffers.get(name);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.7;
    source.connect(gain);
    gain.connect(this.masterGain);
    source.start();
  }

  set volume(v: number) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) {
      this.masterGain.gain.value = this._volume;
    }
  }

  get volume(): number {
    return this._volume;
  }

  destroy(): void {
    this.ambientSources.forEach(({ source }) => {
      try { source?.stop(); } catch { /* already stopped */ }
    });
    this.ambientSources.clear();
    this.sfxBuffers.clear();
    this.ctx?.close();
    this.ctx = null;
    this.masterGain = null;
    this.initialized = false;
    this.currentVibe = null;
  }
}

export const audioManager = new AudioManager();
export type { SfxName };
