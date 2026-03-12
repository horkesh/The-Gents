import React from 'react';
import { Participant } from '@/types';

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

export default VideoTile;
