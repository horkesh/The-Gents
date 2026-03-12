import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

const TIMEOUT_MS = 30_000;

const LoadingScreen = ({ message, onDismiss }: { message: string; onDismiss: () => void }) => {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    setTimedOut(false);
    const timer = setTimeout(() => setTimedOut(true), TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gents-charcoal text-gents-cream">
      {!timedOut ? (
        <>
          <div className="w-16 h-16 border-4 border-gents-gold border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-xl font-display tracking-wider text-gents-gold animate-pulse">{message}</h2>
        </>
      ) : (
        <>
          <h2 className="text-xl font-display tracking-wider text-gents-gold mb-4">Taking too long...</h2>
          <p className="text-gray-400 text-sm mb-6">The signal seems to have faded.</p>
          <Button onClick={onDismiss} variant="secondary">Continue Anyway</Button>
        </>
      )}
    </div>
  );
};

export default LoadingScreen;
