import React from 'react';

const LoadingScreen = ({ message }: { message: string }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gents-charcoal text-gents-cream">
    <div className="w-16 h-16 border-4 border-gents-gold border-t-transparent rounded-full animate-spin mb-6"></div>
    <h2 className="text-xl font-display tracking-wider text-gents-gold animate-pulse">{message}</h2>
  </div>
);

export default LoadingScreen;
