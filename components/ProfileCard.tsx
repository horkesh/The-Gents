import React from 'react';
import { Participant } from '@/types';

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

export default ProfileCard;
