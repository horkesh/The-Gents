import { useState } from 'react';
import { useSocketContext } from '@/contexts/SocketContext';
import { useRoomContext } from '@/contexts/RoomContext';
import { usePartyContext } from '@/contexts/PartyContext';
import { Button } from '../ui/Button';

export function LorekeeperPanel() {
  const { socket } = useSocketContext();
  const { participants } = useRoomContext();
  const { act } = usePartyContext();
  const [spotlightCooldown, setSpotlightCooldown] = useState(false);
  const [toastUsed, setToastUsed] = useState(false);

  const guests = participants.filter((p) => p.role === 'guest');

  const handleSpotlight = (targetId: string) => {
    socket?.emit('TRIGGER_SPOTLIGHT', { targetId });
    setSpotlightCooldown(true);
    setTimeout(() => setSpotlightCooldown(false), 30000);
  };

  const handleToast = () => {
    socket?.emit('TRIGGER_TOAST');
    setToastUsed(true);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-3xl mb-2">📜</p>
        <h3 className="label text-gold">THE ARCHITECT</h3>
      </div>

      <div className="space-y-3">
        <Button
          variant="gold"
          size="md"
          className="w-full"
          onClick={() => socket?.emit('TRIGGER_SNAP')}
        >
          SNAP
        </Button>

        <Button
          variant="gold"
          size="md"
          className="w-full"
          onClick={() => socket?.emit('TRIGGER_CONFESSION')}
        >
          CONFESSION
        </Button>
      </div>

      {/* Spotlight */}
      <div className="pt-4 border-t border-cream/5 space-y-2">
        <p className="label text-cream/30 tracking-[0.2em]">SPOTLIGHT</p>
        {guests.map((guest) => (
          <Button
            key={guest.id}
            variant="secondary"
            size="sm"
            className="w-full"
            disabled={spotlightCooldown}
            onClick={() => handleSpotlight(guest.id)}
          >
            {guest.alias || guest.name}
          </Button>
        ))}
        {spotlightCooldown && (
          <p className="text-cream/20 text-xs font-body text-center">Cooling down...</p>
        )}
      </div>

      {/* The Toast */}
      {act >= 3 && !toastUsed && (
        <div className="pt-4 border-t border-gold/15">
          <Button
            variant="gold"
            size="lg"
            className="w-full"
            onClick={handleToast}
          >
            THE TOAST
          </Button>
        </div>
      )}

      <div className="pt-4 border-t border-cream/5 space-y-3">
        <p className="label text-cream/30 tracking-[0.2em]">ACT CONTROLS</p>
        <Button
          variant="secondary"
          size="md"
          className="w-full"
          onClick={() => socket?.emit('NEXT_ACT')}
        >
          NEXT ACT
        </Button>
        <Button
          variant="ghost"
          size="md"
          className="w-full"
          onClick={() => socket?.emit('WRAP_IT_UP')}
        >
          WRAP IT UP
        </Button>
      </div>
    </div>
  );
}
