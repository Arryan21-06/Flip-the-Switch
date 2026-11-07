import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  command: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'subtle' | 'outline' | 'danger';
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  command,
  label,
  variant = 'secondary',
  className = '',
  size = 'md',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = command;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const baseStyle =
    'relative inline-flex items-center justify-center font-mono font-medium rounded-lg transition-all duration-150 active:scale-95 select-none focus:outline-none focus:ring-1 focus:ring-accent-amber/50 cursor-pointer';

  const sizeStyle =
    size === 'xs'
      ? 'px-1.5 py-0.5 text-[10px] gap-1'
      : size === 'sm'
      ? 'px-2.5 py-1 text-xs gap-1.5'
      : 'px-3 py-1.5 text-xs gap-2';

  const variantStyles = {
    primary:
      'bg-accent-amber text-black hover:bg-amber-400 font-semibold shadow-xs hover:shadow-glow-amber',
    secondary:
      'bg-surface-2 text-text-primary hover:bg-surface-3 border border-border hover:border-border-strong',
    outline:
      'bg-surface-1 text-text-secondary hover:text-text-primary hover:bg-surface-2 border border-border',
    subtle:
      'text-text-secondary hover:text-text-primary hover:bg-surface-2/70 border border-transparent',
    danger:
      'bg-accent-coral/15 text-accent-coral hover:bg-accent-coral/25 border border-accent-coral/30',
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Copy: ${command}`}
      className={`${baseStyle} ${sizeStyle} ${variantStyles[variant]} ${className}`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-status-success animate-in fade-in" />
          <span className="text-status-success font-sans font-semibold">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3 opacity-60 shrink-0" />
          <span className="truncate">{label || command}</span>
        </>
      )}
    </button>
  );
};
