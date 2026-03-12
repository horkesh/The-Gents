import React from 'react';
import { Participant } from '@/types';
import Button from '@/components/ui/Button';

interface LobbyViewProps {
  participants: Participant[];
  roomCode: string;
  hasJoined: boolean;
  userName: string;
  userPhoto: string | null;
  onUserNameChange: (name: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onJoin: () => void;
  onStartGame: () => void;
}

const LobbyView = ({ participants, roomCode, hasJoined, userName, userPhoto, onUserNameChange, onFileUpload, onJoin, onStartGame }: LobbyViewProps) => {
  if (hasJoined) {
    return (
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
        <h1 className="text-6xl font-display text-gents-gold mb-4">The Lobby</h1>
        <p className="text-xl font-light text-gents-cream mb-8">{roomCode}</p>
        <div className="grid grid-cols-4 gap-4 mb-12">
          {participants.map(p => (
            <div key={p.id} className="w-16 h-16 rounded-full border border-gents-gold overflow-hidden">
              <img src={p.photoUrl} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <Button onClick={onStartGame}>Open The Doors</Button>
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
          onChange={(e) => onUserNameChange(e.target.value)}
        />

        <div className="border border-dashed border-gray-700 p-8 text-center cursor-pointer hover:border-gents-gold transition-colors relative">
          <input type="file" accept="image/*" onChange={onFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
          {userPhoto ? (
            <img src={userPhoto} className="w-32 h-32 object-cover mx-auto rounded-full" />
          ) : (
            <p className="text-gray-500">Tap to upload a selfie</p>
          )}
        </div>

        <Button onClick={onJoin} disabled={!userName || !userPhoto} className="w-full">
          Enter
        </Button>
      </div>
    </div>
  );
};

export default LobbyView;
