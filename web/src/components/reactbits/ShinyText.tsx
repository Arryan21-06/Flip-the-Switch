import React from 'react';

interface ShinyTextProps {
  text: string;
  className?: string;
  disabled?: boolean;
  speed?: number; // seconds
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  className = '',
  disabled = false,
  speed = 4,
}) => {
  return (
    <span
      className={`relative inline-block font-medium ${
        disabled
          ? 'text-text-primary'
          : 'bg-clip-text text-transparent bg-gradient-to-r from-text-primary via-accent-amber to-text-primary bg-[length:200%_auto] animate-shimmer'
      } ${className}`}
      style={{
        animationDuration: `${speed}s`,
      }}
    >
      {text}
    </span>
  );
};

