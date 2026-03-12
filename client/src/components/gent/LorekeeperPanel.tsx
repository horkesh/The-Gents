import { useSocketContext } from '@/contexts/SocketContext';
import { Button } from '../ui/Button';

export function LorekeeperPanel() {
  const { socket } = useSocketContext();

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
          📸 SNAP
        </Button>

        <Button
          variant="gold"
          size="md"
          className="w-full"
          onClick={() => socket?.emit('TRIGGER_CONFESSION')}
        >
          🤫 CONFESSION
        </Button>
      </div>

      <div className="pt-4 border-t border-cream/5 space-y-3">
        <p className="label text-cream/30">ACT CONTROLS</p>
        <Button
          variant="secondary"
          size="md"
          className="w-full"
          onClick={() => socket?.emit('NEXT_ACT')}
        >
          ⏭ NEXT ACT
        </Button>
        <Button
          variant="ghost"
          size="md"
          className="w-full"
          onClick={() => socket?.emit('WRAP_IT_UP')}
        >
          🎬 WRAP IT UP
        </Button>
      </div>
    </div>
  );
}
