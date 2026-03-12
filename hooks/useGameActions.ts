import React from 'react';
import { Act, Vibe, Role, Participant, GameState } from '@/types';
import { MOCK_GUESTS, ROOM_CODES } from '@/constants';
import * as Gemini from '@/geminiService';

type SetGameState = React.Dispatch<React.SetStateAction<GameState>>;

export function useGameActions(gameState: GameState, setGameState: SetGameState) {

  const handleJoin = async (userName: string, userPhoto: string) => {
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

  return {
    handleJoin,
    startGame,
    triggerDrink,
    acceptDrink,
    triggerConfession,
    voteConfession,
    changeVibe,
    nextAct,
    sendReaction
  };
}
