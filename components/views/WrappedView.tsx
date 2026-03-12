import React, { useState, useEffect } from 'react';
import { Participant } from '@/types';
import * as Gemini from '@/geminiService';
import Button from '@/components/ui/Button';

const WrappedView = ({ participants }: { participants: Participant[] }) => {
  const me = participants.find(p => p.isSelf);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (me) {
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

export default WrappedView;
