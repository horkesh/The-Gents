
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Act, Vibe, Role, Participant, GameState, INITIAL_SCENE, Cocktail, Confession } from './types';
import { THE_GENTS, MOCK_GUESTS, ROOM_CODES } from './constants';
import * as Gemini from './geminiService';

// --- Sub-components ---

const LoadingScreen = ({ message }: { message: string }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gents-charcoal text-gents-cream">
    <div className="w-16 h-16 border-4 border-gents-gold border-t-transparent rounded-full animate-spin mb-6"></div>
    <h2 className="text-xl font-display tracking-wider text-gents-gold animate-pulse">{message}</h2>
  </div>
);

const Button = ({ onClick, children, variant = 'primary', className = '', disabled = false }: any) => {
  const baseStyle = "px-6 py-3 font-bold tracking-widest text-xs uppercase transition-all duration-300 transform active:scale-95";
  const variants = {
    primary: "bg-gents-gold text-gents-charcoal hover:bg-white",
    secondary: "border border-gents-gold text-gents-gold hover:bg-gents-gold hover:text-gents-charcoal",
    ghost: "text-gents-cream hover:text-gents-gold",
    danger: "bg-gents-orange text-white hover:bg-red-700"
  };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const ProfileCard = ({ participant, onClose }: { participant: Participant; onClose: () => void }) => (
  <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-gents-charcoal border border-gents-gold w-full max-w-sm p-6 relative shadow-2xl" onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-2 right-2 text-gents-gold p-2">✕</button>
      <div className="flex flex-col items-center">
        <div className="w-32 h-32 rounded-full border-2 border-gents-gold overflow-hidden mb-4">
          <img src={participant.photoUrl} alt={participant.alias} className="w-full h-full object-cover" />
        </div>
        <h2 className="text-3xl font-display text-gents-gold mb-1">{participant.alias}</h2>
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">{participant.role.replace('HOST_', 'Host: ')}</p>
        
        <div className="flex gap-2 mb-6">
          {participant.traits.map(t => (
            <span key={t} className="px-2 py-1 border border-gray-600 text-xs text-gray-300 rounded-sm uppercase tracking-wider">{t}</span>
          ))}
        </div>
        
        <p className="text-gents-cream/80 italic text-center mb-6 font-display text-lg">"{participant.dossier}"</p>
        
        <div className="w-full grid grid-cols-2 gap-4 text-center border-t border-gray-800 pt-4">
          <div>
            <div className="text-2xl font-display text-gents-orange">{participant.stats.drinksAccepted}</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500">Drinks</div>
          </div>
          <div>
            <div className="text-2xl font-display text-gents-teal">{participant.stats.confessions}</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500">Confessions</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Added key to props type to resolve TypeScript error when mapping components
const VideoTile = ({ participant, onClick }: { participant: Participant; onClick: () => void; key?: React.Key }) => (
  <div onClick={onClick} className="relative group cursor-pointer overflow-hidden aspect-[3/4] bg-gray-900 border border-gray-800 hover:border-gents-gold transition-colors">
    <img src={participant.photoUrl} alt={participant.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
      <div className="text-gents-gold font-display text-lg leading-none">{participant.alias}</div>
      {participant.role.startsWith('HOST') && (
        <div className="text-[9px] uppercase tracking-widest text-gray-400 mt-1">Host</div>
      )}
    </div>
  </div>
);

const EventToast = ({ activeCocktail, activeConfession, onVote, onAcceptDrink }: { 
  activeCocktail: Cocktail | null; 
  activeConfession: Confession | null;
  onVote: (vote: 'YES' | 'NO') => void;
  onAcceptDrink: () => void;
}) => {
  if (activeCocktail && !activeCocktail.recipientId) {
    return (
      <div className="fixed bottom-32 left-4 right-4 z-30 animate-float-up">
        <div className="glass-panel p-6 max-w-md mx-auto text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gents-gold"></div>
          <h3 className="text-gents-gold uppercase tracking-widest text-xs mb-2">The Alchemist serves</h3>
          <h2 className="text-3xl font-display text-white mb-2">{activeCocktail.name}</h2>
          <p className="text-gray-300 italic font-serif mb-4">"{activeCocktail.story}"</p>
          <Button onClick={onAcceptDrink} variant="primary">Accept Drink</Button>
        </div>
      </div>
    );
  }

  if (activeConfession && activeConfession.isActive && !activeConfession.myVote) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-lg w-full text-center">
          <h3 className="text-gents-gold uppercase tracking-widest mb-4">Confession Round</h3>
          <h2 className="text-3xl md:text-5xl font-display text-white mb-8 leading-tight">{activeConfession.question}</h2>
          <div className="flex gap-4 justify-center">
            <button onClick={() => onVote('NO')} className="w-24 h-24 rounded-full border border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-500 hover:bg-red-500/10 transition-all font-bold">NO</button>
            <button onClick={() => onVote('YES')} className="w-24 h-24 rounded-full border border-gray-600 text-gray-400 hover:border-green-500 hover:text-green-500 hover:bg-green-500/10 transition-all font-bold">YES</button>
          </div>
        </div>
      </div>
    );
  }
  
  if (activeConfession && activeConfession.isActive && activeConfession.myVote) {
      return (
        <div className="fixed bottom-32 left-4 right-4 z-30 animate-fade-in">
            <div className="glass-panel p-4 max-w-sm mx-auto text-center">
                 <p className="text-gents-gold">Voting in progress...</p>
                 <div className="mt-2 text-2xl font-display">
                     {activeConfession.yesCount + activeConfession.noCount} votes cast
                 </div>
            </div>
        </div>
      )
  }

  return null;
};

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
    loadingMessage: ''
  });

  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [viewedProfile, setViewedProfile] = useState<Participant | null>(null);

  const handleJoin = async () => {
    if (!userName || !userPhoto) return;
    setGameState(prev => ({ ...prev, isLoading: true, loadingMessage: 'Analyzing persona...' }));
    
    try {
      const profileData = await Gemini.generateProfile(userName, userPhoto.split(',')[1]);
      const newGuest: Participant = {
        id: 'me',
        name: userName,
        alias: profileData.alias || userName,
        role: Role.GUEST,
        photoUrl: userPhoto,
        traits: profileData.traits || ['New', 'Guest'],
        dossier: profileData.dossier || 'Just arrived.',
        stats: { drinksReceived: 0, drinksAccepted: 0, drinksDodged: 0, confessions: 0, spotlights: 0 },
        isSelf: true
      };

      setGameState(prev => ({
          ...prev,
          act: Act.LOBBY,
          participants: [...prev.participants, newGuest, ...MOCK_GUESTS],
          roomCode: ROOM_CODES[Math.floor(Math.random() * ROOM_CODES.length)],
          isLoading: false
      }));
    } catch (e) {
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const startGame = async () => {
    setGameState(prev => ({ ...prev, isLoading: true, loadingMessage: 'Setting the scene...' }));
    const sceneData = await Gemini.generateScene("Act I", "Arrivals");
    
    setGameState(prev => ({
      ...prev,
      isLoading: false,
      act: Act.ACT_I,
      currentScene: {
          title: sceneData.title || "The Beginning",
          description: sceneData.description || "The night begins.",
          imageUrl: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1920&auto=format&fit=crop"
      }
    }));

    setTimeout(triggerDrink, 2000);
  };

  const triggerDrink = async () => {
    const drinkData = await Gemini.generateCocktail(gameState.currentScene?.title || "Party");
    setGameState(prev => ({
      ...prev,
      activeCocktail: {
        name: drinkData.name,
        story: drinkData.story,
        imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=500&auto=format&fit=crop"
      }
    }));
  };

  const acceptDrink = () => {
    setGameState(prev => ({
      ...prev,
      activeCocktail: null,
      participants: prev.participants.map(p => 
        p.isSelf ? { ...p, stats: { ...p.stats, drinksAccepted: p.stats.drinksAccepted + 1, drinksReceived: p.stats.drinksReceived + 1 } } : p
      )
    }));
  };

  const triggerConfession = async () => {
    setGameState(prev => ({ ...prev, isLoading: true, loadingMessage: 'Lorekeeper is thinking...' }));
    const confessionData = await Gemini.generateConfessionPrompt(gameState.act);
    setGameState(prev => ({
      ...prev,
      isLoading: false,
      activeConfession: {
        question: confessionData.question,
        commentary: confessionData.commentary,
        yesCount: 0,
        noCount: 0,
        totalVotes: 0,
        isActive: true
      }
    }));
  };

  const voteConfession = (vote: 'YES' | 'NO') => {
    setGameState(prev => {
        if (!prev.activeConfession) return prev;
        const randomYes = Math.floor(Math.random() * (prev.participants.length - 1));
        const randomNo = (prev.participants.length - 1) - randomYes;
        return {
            ...prev,
            activeConfession: {
                ...prev.activeConfession,
                myVote: vote,
                yesCount: vote === 'YES' ? randomYes + 1 : randomYes,
                noCount: vote === 'NO' ? randomNo + 1 : randomNo,
                totalVotes: prev.participants.length
            }
        };
    });

    setTimeout(() => {
        setGameState(prev => ({
            ...prev,
            activeConfession: null,
            participants: prev.participants.map(p => 
                p.isSelf ? { ...p, stats: { ...p.stats, confessions: p.stats.confessions + 1 } } : p
            )
        }));
    }, 4000);
  };

  const changeVibe = async (vibe: Vibe) => {
      setGameState(prev => ({ ...prev, isLoading: true, loadingMessage: `Shifting vibe...` }));
      const sceneData = await Gemini.generateScene(gameState.act, vibe);
      let imageUrl = gameState.currentScene?.imageUrl || "";
      if (vibe === Vibe.IGNITION) imageUrl = "https://images.unsplash.com/photo-1570572225016-560df365c192?q=80&w=1920&auto=format&fit=crop";
      if (vibe === Vibe.CRUISE) imageUrl = "https://images.unsplash.com/photo-1559333086-b0a56225a93c?q=80&w=1920&auto=format&fit=crop";

      setGameState(prev => ({
          ...prev,
          isLoading: false,
          currentVibe: vibe,
          currentScene: {
              title: sceneData.title,
              description: sceneData.description,
              imageUrl: imageUrl
          }
      }));
  };

  const nextAct = async () => {
    const nextActMap: Record<Act, Act> = {
        [Act.LOBBY]: Act.ACT_I,
        [Act.ACT_I]: Act.ACT_II,
        [Act.ACT_II]: Act.ACT_III,
        [Act.ACT_III]: Act.ACT_IV,
        [Act.ACT_IV]: Act.WRAPPED,
        [Act.WRAPPED]: Act.LOBBY
    };
    const next = nextActMap[gameState.act];
    if (next === Act.WRAPPED) {
        setGameState(prev => ({ ...prev, act: next }));
    } else {
        setGameState(prev => ({ ...prev, isLoading: true, loadingMessage: 'Transitioning...' }));
        const sceneData = await Gemini.generateScene(next, "Transition");
        setGameState(prev => ({ 
            ...prev, 
            act: next, 
            isLoading: false,
            currentScene: {
                title: sceneData.title,
                description: sceneData.description,
                imageUrl: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=1920&auto=format&fit=crop"
            }
        }));
    }
  };

  const sendReaction = (emoji: string) => {
    const id = Date.now().toString();
    const x = Math.random() * 80 + 10;
    setGameState(prev => ({
        ...prev,
        reactions: [...prev.reactions, { id, emoji, sender: 'Me', x }]
    }));
    setTimeout(() => {
        setGameState(prev => ({
            ...prev,
            reactions: prev.reactions.filter(r => r.id !== id)
        }));
    }, 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result) setUserPhoto(ev.target.result as string);
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const renderLobby = () => {
      if (gameState.act === Act.LOBBY && gameState.participants.length > 3) {
           return (
              <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
                  <h1 className="text-6xl font-display text-gents-gold mb-4">The Lobby</h1>
                  <p className="text-xl font-light text-gents-cream mb-8">{gameState.roomCode}</p>
                  <div className="grid grid-cols-4 gap-4 mb-12">
                      {gameState.participants.map(p => (
                          <div key={p.id} className="w-16 h-16 rounded-full border border-gents-gold overflow-hidden">
                              <img src={p.photoUrl} className="w-full h-full object-cover" />
                          </div>
                      ))}
                  </div>
                  <Button onClick={startGame}>Open The Doors</Button>
              </div>
           );
      }

      return (
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 max-w-md mx-auto">
            <div className="mb-8">
                <div className="w-32 h-32 rounded-full border-4 border-gents-gold flex items-center justify-center text-4xl text-gents-gold font-display mx-auto mb-6">
                    TG
                </div>
                <h1 className="text-4xl font-display text-center text-gents-gold">The Gents</h1>
                <p className="text-center text-gents-cream/60 mt-2 uppercase tracking-widest text-xs">Virtual Cocktail Party</p>
            </div>

            <div className="w-full space-y-4">
                <input 
                    type="text" 
                    placeholder="Your Name" 
                    className="w-full bg-gents-charcoal border border-gray-700 p-4 text-gents-cream focus:border-gents-gold outline-none"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                />
                
                <div className="border border-dashed border-gray-700 p-8 text-center cursor-pointer hover:border-gents-gold transition-colors relative">
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    {userPhoto ? (
                        <img src={userPhoto} className="w-32 h-32 object-cover mx-auto rounded-full" />
                    ) : (
                        <p className="text-gray-500">Tap to upload a selfie</p>
                    )}
                </div>

                <Button onClick={handleJoin} disabled={!userName || !userPhoto} className="w-full">
                    Enter
                </Button>
            </div>
        </div>
      );
  };

  const renderVideoGrid = () => (
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
  );

  const renderWrapped = () => {
    const me = gameState.participants.find(p => p.isSelf);
    const [note, setNote] = useState('');

    useEffect(() => {
        if(me) {
             Gemini.generateWrappedNote(me.alias, me.stats).then(setNote);
        }
    }, [me]);

    if (!me) return null;

    return (
        <div className="absolute inset-0 z-50 bg-black overflow-y-auto no-scrollbar">
            <div className="max-w-md mx-auto min-h-screen bg-gents-charcoal border-x border-gray-800 p-8 flex flex-col relative">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto border-2 border-gents-gold rounded-full flex items-center justify-center text-gents-gold font-display text-2xl mb-4">TG</div>
                    <h2 className="font-display text-3xl text-gents-cream">The Gents</h2>
                    <p className="text-xs uppercase tracking-widest text-gray-500">The Havana Session • {new Date().toLocaleDateString()}</p>
                </div>

                <div className="flex flex-col items-center mb-10">
                    <div className="w-40 h-40 rounded-full border-4 border-gents-gold overflow-hidden mb-6 relative">
                         <img src={me.photoUrl} className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-5xl font-display text-gents-gold mb-2">{me.alias}</h1>
                    <div className="flex gap-2">
                        {me.traits.map(t => <span key={t} className="text-xs uppercase tracking-widest text-gray-400 border border-gray-700 px-2 py-1">{t}</span>)}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-10 border-y border-gray-800 py-8">
                     <div className="text-center">
                         <div className="text-4xl font-display text-gents-orange">{me.stats.drinksAccepted}</div>
                         <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Drinks Sipped</div>
                     </div>
                     <div className="text-center">
                         <div className="text-4xl font-display text-gents-teal">{me.stats.confessions}</div>
                         <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Secrets Told</div>
                     </div>
                </div>

                <div className="mb-12 text-center">
                    <h3 className="font-serif italic text-2xl text-gents-cream/90 leading-relaxed">
                        "{note || 'Generating lore...'}"
                    </h3>
                    <p className="mt-4 text-xs uppercase tracking-widest text-gents-gold">— The Lorekeeper</p>
                </div>

                <Button onClick={() => window.location.reload()} variant="secondary" className="mt-auto">Return to Lobby</Button>
            </div>
        </div>
    );
  };

  const renderHostControls = () => (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gents-charcoal border-t border-gents-gold/20 p-4 safe-area-pb">
          <div className="flex justify-between items-center max-w-5xl mx-auto">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                  <Button variant="secondary" onClick={() => sendReaction('❤️')}>❤️</Button>
                  <Button variant="secondary" onClick={() => sendReaction('🔥')}>🔥</Button>
                  <Button variant="secondary" onClick={() => sendReaction('🥂')}>🥂</Button>
                  <Button variant="secondary" onClick={() => sendReaction('👀')}>👀</Button>
              </div>

              <div className="flex gap-2 hidden md:flex">
                  <Button onClick={triggerDrink} variant="secondary" className="text-[10px]">Mix Drink</Button>
                  <Button onClick={triggerConfession} variant="secondary" className="text-[10px]">Confession</Button>
                  <Button onClick={() => changeVibe(Vibe.IGNITION)} variant="secondary" className="text-[10px]">Vibe Shift</Button>
                  <Button onClick={nextAct} variant="primary" className="text-[10px]">Next Act</Button>
              </div>
              <div className="md:hidden">
                   <Button onClick={nextAct} variant="primary" className="text-xs">Next</Button>
              </div>
          </div>
      </div>
  );

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans text-gents-cream">
      {gameState.currentScene && (
        <div className="absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out opacity-60">
           <img src={gameState.currentScene.imageUrl} className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-black/40" />
           <div className={`absolute inset-0 mix-blend-overlay opacity-50 ${gameState.currentVibe === Vibe.IGNITION ? 'bg-red-900' : gameState.currentVibe === Vibe.CRUISE ? 'bg-blue-900' : 'bg-orange-900'}`} />
        </div>
      )}

      {gameState.isLoading && <LoadingScreen message={gameState.loadingMessage} />}
      {gameState.act === Act.LOBBY ? renderLobby() : null}
      {(gameState.act !== Act.LOBBY && gameState.act !== Act.WRAPPED) && renderVideoGrid()}
      {gameState.act === Act.WRAPPED && renderWrapped()}

      <EventToast 
        activeCocktail={gameState.activeCocktail} 
        activeConfession={gameState.activeConfession}
        onVote={voteConfession}
        onAcceptDrink={acceptDrink}
      />
      {viewedProfile && <ProfileCard participant={viewedProfile} onClose={() => setViewedProfile(null)} />}

      {gameState.reactions.map(r => (
          <div key={r.id} className="fixed bottom-32 z-30 text-4xl animate-float-up pointer-events-none" style={{ left: `${r.x}%` }}>
              {r.emoji}
              <div className="text-[10px] text-white/50 text-center -mt-1">{r.sender}</div>
          </div>
      ))}

      {gameState.act !== Act.LOBBY && gameState.act !== Act.WRAPPED && renderHostControls()}
      
      {gameState.act !== Act.LOBBY && gameState.act !== Act.WRAPPED && (
          <div className="absolute top-4 left-4 z-20">
              <h4 className="text-gents-gold uppercase tracking-widest text-[10px]">Current Scene</h4>
              <h2 className="font-display text-xl">{gameState.currentScene?.title}</h2>
              <p className="text-xs text-gray-400 max-w-xs">{gameState.currentScene?.description}</p>
          </div>
      )}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
