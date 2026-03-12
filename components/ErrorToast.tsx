import React, { useEffect } from 'react';

const ErrorToast = ({ message, onDismiss }: { message: string; onDismiss: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-fade-in">
      <div className="glass-panel border-gents-orange/40 p-4 max-w-md mx-auto text-center">
        <p className="text-gents-orange text-sm">{message}</p>
      </div>
    </div>
  );
};

export default ErrorToast;
