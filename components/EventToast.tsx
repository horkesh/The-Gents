import React from 'react';
import { Cocktail, Confession } from '@/types';
import Button from '@/components/ui/Button';

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
    );
  }

  return null;
};

export default EventToast;
