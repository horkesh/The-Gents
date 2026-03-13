import { createContext, useContext, useEffect, useCallback, useState, type ReactNode } from 'react';
import { audioManager, type SfxName } from '@/lib/audio';
import { usePartyContext } from './PartyContext';

interface AudioContextValue {
  playSfx: (name: SfxName) => void;
  volume: number;
  setVolume: (v: number) => void;
  muted: boolean;
  toggleMute: () => void;
}

const AudioCtx = createContext<AudioContextValue>({
  playSfx: () => {},
  volume: 0.6,
  setVolume: () => {},
  muted: false,
  toggleMute: () => {},
});

export function AudioProvider({ children }: { children: ReactNode }) {
  const { vibe, isPartyActive } = usePartyContext();
  const [volume, setVolumeState] = useState(0.6);
  const [muted, setMuted] = useState(false);

  // Init on first user interaction (required by browser autoplay policy)
  useEffect(() => {
    const handleInteraction = () => {
      audioManager.init().then(() => audioManager.resume());
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // Crossfade ambient when vibe changes during party
  useEffect(() => {
    if (isPartyActive) {
      audioManager.crossfadeTo(vibe);
    }
  }, [vibe, isPartyActive]);

  // Sync volume/mute
  useEffect(() => {
    audioManager.volume = muted ? 0 : volume;
  }, [volume, muted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => audioManager.destroy();
  }, []);

  const playSfx = useCallback((name: SfxName) => {
    audioManager.playSfx(name);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  return (
    <AudioCtx.Provider value={{ playSfx, volume, setVolume, muted, toggleMute }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  return useContext(AudioCtx);
}
