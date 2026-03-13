import { useEffect, useState } from 'react';
import { usePartyContext } from '@/contexts/PartyContext';
import { ACTS } from '@the-toast/shared';

export function ActTimer() {
  const { act, actStartedAt } = usePartyContext();
  const [elapsed, setElapsed] = useState(0);

  const actDef = ACTS[act as keyof typeof ACTS];
  const durationMs = actDef ? actDef.durationMinutes * 60 * 1000 : 0;

  useEffect(() => {
    if (!actStartedAt || !durationMs) return;

    const interval = setInterval(() => {
      setElapsed(Date.now() - actStartedAt);
    }, 1000);

    return () => clearInterval(interval);
  }, [actStartedAt, durationMs]);

  if (!actDef || !durationMs) return null;

  const progress = Math.min(elapsed / durationMs, 1);
  const remaining = Math.max(0, durationMs - elapsed);
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="flex items-center gap-3 bg-charcoal-light/60 rounded-xl px-4 py-2.5 border border-cream/5">
      <span className="label text-cream/25">{actDef.name}</span>
      <div className="flex-1 h-0.5 bg-cream/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-gold/40 to-gold/20 rounded-full transition-all duration-1000"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <span className="text-cream/25 text-xs font-body tabular-nums">
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
