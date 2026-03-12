import React, { useState } from 'react';
import { Act, Vibe, Participant, GameState } from './types';
import { THE_GENTS, INITIAL_SCENE } from './constants';
import { useGameActions } from '@/hooks/useGameActions';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorToast from '@/components/ErrorToast';
import ProfileCard from '@/components/ProfileCard';
import VideoTile from '@/components/VideoTile';
import EventToast from '@/components/EventToast';
import Button from '@/components/ui/Button';
import LobbyView from '@/components/views/LobbyView';
import WrappedView from '@/components/views/WrappedView';

const App = () => {
  const [gameState, setGameState] = useState<GameState>({
    act: Act.LOBBY,
    roomCode: '',
    participants: [...THE_GENTS],
    currentScene: INITIAL_SCENE,
    currentVibe: Vibe.SLOW_BURN,
    activeCocktail: null,
    activeConfession: null,
    reactions: [],
    isLoading: false,
    loadingMessage: '',
    errorMessage: ''
  });

  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [viewedProfile, setViewedProfile] = useState<Participant | null>(null);

  const actions = useGameActions(gameState, setGameState);

  const hasJoined = gameState.participants.length > 3;
  const isInParty = gameState.act !== Act.LOBBY && gameState.act !== Act.WRAPPED;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setUserPhoto(ev.target.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans text-gents-cream">
      {/* Scene background */}
      {gameState.currentScene && (
        <div className="absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out opacity-60">
          <img src={gameState.currentScene.imageUrl} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <div className={`absolute inset-0 mix-blend-overlay opacity-50 ${gameState.currentVibe === Vibe.IGNITION ? 'bg-red-900' : gameState.currentVibe === Vibe.CRUISE ? 'bg-blue-900' : 'bg-orange-900'}`} />
        </div>
      )}

      {/* Loading */}
      {gameState.isLoading && (
        <LoadingScreen
          message={gameState.loadingMessage}
          onDismiss={() => setGameState(prev => ({ ...prev, isLoading: false }))}
        />
      )}

      {/* Error toast */}
      {gameState.errorMessage && (
        <ErrorToast
          message={gameState.errorMessage}
          onDismiss={() => setGameState(prev => ({ ...prev, errorMessage: '' }))}
        />
      )}

      {/* Views */}
      {gameState.act === Act.LOBBY && (
        <LobbyView
          participants={gameState.participants}
          roomCode={gameState.roomCode}
          hasJoined={hasJoined}
          userName={userName}
          userPhoto={userPhoto}
          onUserNameChange={setUserName}
          onFileUpload={handleFileUpload}
          onJoin={() => userPhoto && actions.handleJoin(userName, userPhoto)}
          onStartGame={actions.startGame}
        />
      )}

      {isInParty && (
        <div className="absolute inset-0 z-10 p-4 pt-20 pb-32 flex items-center justify-center">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-5xl aspect-video">
            {gameState.participants.filter(p => p.role.startsWith('HOST')).map(p => (
              <VideoTile key={p.id} participant={p} onClick={() => setViewedProfile(p)} />
            ))}
            {gameState.participants.filter(p => !p.role.startsWith('HOST')).map(p => (
              <VideoTile key={p.id} participant={p} onClick={() => setViewedProfile(p)} />
            ))}
          </div>
        </div>
      )}

      {gameState.act === Act.WRAPPED && <WrappedView participants={gameState.participants} />}

      {/* Overlays */}
      <EventToast
        activeCocktail={gameState.activeCocktail}
        activeConfession={gameState.activeConfession}
        onVote={actions.voteConfession}
        onAcceptDrink={actions.acceptDrink}
      />
      {viewedProfile && <ProfileCard participant={viewedProfile} onClose={() => setViewedProfile(null)} />}

      {/* Reactions */}
      {gameState.reactions.map(r => (
        <div key={r.id} className="fixed bottom-32 z-30 text-4xl animate-float-up pointer-events-none" style={{ left: `${r.x}%` }}>
          {r.emoji}
          <div className="text-[10px] text-white/50 text-center -mt-1">{r.sender}</div>
        </div>
      ))}

      {/* Host controls */}
      {isInParty && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gents-charcoal border-t border-gents-gold/20 p-4 safe-area-pb">
          <div className="flex justify-between items-center max-w-5xl mx-auto">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              <Button variant="secondary" onClick={() => actions.sendReaction('❤️')}>❤️</Button>
              <Button variant="secondary" onClick={() => actions.sendReaction('🔥')}>🔥</Button>
              <Button variant="secondary" onClick={() => actions.sendReaction('🥂')}>🥂</Button>
              <Button variant="secondary" onClick={() => actions.sendReaction('👀')}>👀</Button>
            </div>

            <div className="flex gap-2 hidden md:flex">
              <Button onClick={actions.triggerDrink} variant="secondary" className="text-[10px]">Mix Drink</Button>
              <Button onClick={actions.triggerConfession} variant="secondary" className="text-[10px]">Confession</Button>
              <Button onClick={() => actions.changeVibe(Vibe.IGNITION)} variant="secondary" className="text-[10px]">Vibe Shift</Button>
              <Button onClick={actions.nextAct} variant="primary" className="text-[10px]">Next Act</Button>
            </div>
            <div className="md:hidden">
              <Button onClick={actions.nextAct} variant="primary" className="text-xs">Next</Button>
            </div>
          </div>
        </div>
      )}

      {/* Scene info */}
      {isInParty && (
        <div className="absolute top-4 left-4 z-20">
          <h4 className="text-gents-gold uppercase tracking-widest text-[10px]">Current Scene</h4>
          <h2 className="font-display text-xl">{gameState.currentScene?.title}</h2>
          <p className="text-xs text-gray-400 max-w-xs">{gameState.currentScene?.description}</p>
        </div>
      )}
    </div>
  );
};

export default App;
