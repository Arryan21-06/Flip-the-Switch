import React from 'react';

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Ambient Sunrise Aurora Blur */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[1000px] -translate-x-1/2 opacity-25 blur-3xl filter"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.4), rgba(244, 63, 94, 0.3) 40%, rgba(139, 92, 246, 0.2) 70%, transparent 90%)',
        }}
      />
      {children}
    </div>
  );
};

