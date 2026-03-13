import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useSocketContext } from './SocketContext';
import type { ActNumber, VibeMode, SceneData, Cocktail, SessionEvent, ParticipantProfile } from '@the-toast/shared';

interface EntranceData {
  profile: ParticipantProfile;
  intro: string;
  arrivalOrder: number;
}

interface SpotlightData {
  profile: ParticipantProfile;
  roast: string;
}

interface PartyState {
  act: ActNumber;
  scene: SceneData | null;
  vibe: VibeMode;
  events: SessionEvent[];
  actStartedAt: number | null;
  actDuration: number | null; // ms
  activeConfession: { question: string } | null;
  activeDrink: { cocktail: Cocktail; fromGent: string; dedicatedTo?: string } | null;
  snapCountdown: number | null;
  activeEntrance: EntranceData | null;
  activeSpotlight: SpotlightData | null;
  guestBookOpen: boolean;
}

interface PartyContextValue extends PartyState {
  isPartyActive: boolean;
  isWrapped: boolean;
}

const PartyContext = createContext<PartyContextValue>({
  act: 0,
  scene: null,
  vibe: 'slow_burn',
  events: [],
  actStartedAt: null,
  actDuration: null,
  activeConfession: null,
  activeDrink: null,
  snapCountdown: null,
  activeEntrance: null,
  activeSpotlight: null,
  guestBookOpen: false,
  isPartyActive: false,
  isWrapped: false,
});

export function PartyProvider({ children }: { children: ReactNode }) {
  const { socket } = useSocketContext();
  const [state, setState] = useState<PartyState>({
    act: 0,
    scene: null,
    vibe: 'slow_burn',
    events: [],
    actStartedAt: null,
    actDuration: null,
    activeConfession: null,
    activeDrink: null,
    snapCountdown: null,
    activeEntrance: null,
    activeSpotlight: null,
    guestBookOpen: false,
  });

  const entranceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spotlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('PARTY_STARTED', ({ scene }) => {
      setState((prev) => ({
        ...prev,
        act: 1 as ActNumber,
        scene,
        actStartedAt: Date.now(),
      }));
    });

    socket.on('ACT_TRANSITION', ({ act, scene, narration: _narration }) => {
      setState((prev) => ({
        ...prev,
        act: act as ActNumber,
        scene,
        actStartedAt: Date.now(),
        activeConfession: null,
        activeDrink: null,
      }));
    });

    socket.on('SCENE_UPDATE', (scene) => {
      setState((prev) => ({ ...prev, scene }));
    });

    socket.on('TIMER_SYNC', ({ act, elapsed: _elapsed, duration }) => {
      setState((prev) => ({
        ...prev,
        act: act as ActNumber,
        actDuration: duration * 1000,
      }));
    });

    socket.on('VIBE_CHANGED', ({ mode }) => {
      setState((prev) => ({ ...prev, vibe: mode }));
    });

    socket.on('CONFESSION_PROMPT', ({ question }) => {
      setState((prev) => ({ ...prev, activeConfession: { question } }));
    });

    socket.on('CONFESSION_RESULT', () => {
      setState((prev) => ({ ...prev, activeConfession: null }));
    });

    socket.on('DRINK_SENT', ({ cocktail, fromGent, dedicatedTo }) => {
      setState((prev) => ({ ...prev, activeDrink: { cocktail, fromGent, dedicatedTo } }));
    });

    socket.on('GUEST_ENTRANCE', (data) => {
      if (entranceTimerRef.current) clearTimeout(entranceTimerRef.current);
      setState((prev) => ({ ...prev, activeEntrance: data }));
      entranceTimerRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, activeEntrance: null }));
        entranceTimerRef.current = null;
      }, 4000);
    });

    socket.on('SPOTLIGHT', (data) => {
      if (spotlightTimerRef.current) clearTimeout(spotlightTimerRef.current);
      setState((prev) => ({ ...prev, activeSpotlight: data }));
      spotlightTimerRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, activeSpotlight: null }));
        spotlightTimerRef.current = null;
      }, 6000);
    });

    socket.on('GUEST_BOOK_OPEN', () => {
      setState((prev) => ({ ...prev, guestBookOpen: true }));
    });

    socket.on('SNAP_COUNTDOWN', ({ seconds }) => {
      setState((prev) => ({ ...prev, snapCountdown: seconds }));
    });

    socket.on('PHOTO_READY', () => {
      setState((prev) => ({ ...prev, snapCountdown: null }));
    });

    return () => {
      socket.off('PARTY_STARTED');
      socket.off('ACT_TRANSITION');
      socket.off('SCENE_UPDATE');
      socket.off('TIMER_SYNC');
      socket.off('VIBE_CHANGED');
      socket.off('CONFESSION_PROMPT');
      socket.off('CONFESSION_RESULT');
      socket.off('DRINK_SENT');
      socket.off('SNAP_COUNTDOWN');
      socket.off('PHOTO_READY');
      socket.off('GUEST_ENTRANCE');
      socket.off('SPOTLIGHT');
      socket.off('GUEST_BOOK_OPEN');
      if (entranceTimerRef.current) clearTimeout(entranceTimerRef.current);
      if (spotlightTimerRef.current) clearTimeout(spotlightTimerRef.current);
    };
  }, [socket]);

  const isPartyActive = state.act >= 1 && state.act <= 4;
  const isWrapped = state.act === 5;

  return (
    <PartyContext.Provider value={{ ...state, isPartyActive, isWrapped }}>
      {children}
    </PartyContext.Provider>
  );
}

export function usePartyContext() {
  return useContext(PartyContext);
}
