import React from 'react';

const Button = ({ onClick, children, variant = 'primary', className = '', disabled = false }: any) => {
  const baseStyle = "px-6 py-3 font-bold tracking-widest text-xs uppercase transition-all duration-300 transform active:scale-95";
  const variants = {
    primary: "bg-gents-gold text-gents-charcoal hover:bg-white",
    secondary: "border border-gents-gold text-gents-gold hover:bg-gents-gold hover:text-gents-charcoal",
    ghost: "text-gents-cream hover:text-gents-gold",
    danger: "bg-gents-orange text-white hover:bg-red-700"
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

export default Button;
