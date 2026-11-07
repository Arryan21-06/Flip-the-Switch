import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Newspaper,
  CheckSquare,
  AlertTriangle,
  Sliders,
  History,
  TrendingUp,
  Network,
  ShieldCheck,
  Copy,
  X,
} from 'lucide-react';
import { useDaybreakData } from '../data/source';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { data } = useDaybreakData();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const proposals = data.analysis.proposals || [];

  const navItems = [
    { label: 'Mission Control', path: '/', icon: LayoutDashboard, category: 'Navigation' },
    { label: 'Morning Standup Brief', path: '/brief', icon: Newspaper, category: 'Navigation' },
    { label: 'Proposals Board', path: '/proposals', icon: CheckSquare, category: 'Navigation' },
    { label: 'Early Warning System', path: '/early-warning', icon: AlertTriangle, category: 'Navigation' },
    { label: 'Rulebook & Thresholds', path: '/rules', icon: Sliders, category: 'Navigation' },
    { label: 'Audit Trail & Digest Ledger', path: '/audit', icon: History, category: 'Navigation' },
    { label: 'Weekly Impact Scoreboard', path: '/scoreboard', icon: TrendingUp, category: 'Navigation' },
    { label: 'Architecture & System Anatomy', path: '/architecture', icon: Network, category: 'Navigation' },
    { label: 'System Health & Diagnostics', path: '/health', icon: ShieldCheck, category: 'Navigation' },
  ];

  const filteredNav = navItems.filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredProposals = proposals.filter((p) =>
    p.summary.toLowerCase().includes(query.toLowerCase()) ||
    p.person.toLowerCase().includes(query.toLowerCase()) ||
    `#${p.target.number}`.includes(query)
  );

  const copyToClipboard = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border-strong bg-surface-1 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-border">
          <Search className="h-5 w-5 text-text-muted mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Search pages, proposals, PRs, or chat commands (ESC to close)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-text-primary text-sm placeholder:text-text-muted focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4">
          {/* Navigation */}
          {filteredNav.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Pages
              </div>
              <div className="space-y-1">
                {filteredNav.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors text-left"
                  >
                    <item.icon className="h-4 w-4 text-accent-amber" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Chat Commands */}
          <div>
            <div className="px-3 py-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Quick Chat Commands (Click to Copy)
            </div>
            <div className="space-y-1">
              <button
                onClick={() => copyToClipboard('brief')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors font-mono text-left"
              >
                <span>brief</span>
                <span className="text-xs text-text-muted font-sans flex items-center gap-1">
                  <Copy className="h-3 w-3" /> Copy command
                </span>
              </button>
              <button
                onClick={() => copyToClipboard('approve 1 2 3')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors font-mono text-left"
              >
                <span>approve 1 2 3</span>
                <span className="text-xs text-text-muted font-sans flex items-center gap-1">
                  <Copy className="h-3 w-3" /> Copy command
                </span>
              </button>
              <button
                onClick={() => copyToClipboard('rules show')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors font-mono text-left"
              >
                <span>rules show</span>
                <span className="text-xs text-text-muted font-sans flex items-center gap-1">
                  <Copy className="h-3 w-3" /> Copy command
                </span>
              </button>
            </div>
          </div>

          {/* Proposals */}
          {filteredProposals.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Proposals
              </div>
              <div className="space-y-1">
                {filteredProposals.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      navigate('/proposals');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors text-left"
                  >
                    <div className="truncate pr-4">
                      <span className="font-mono text-accent-amber mr-2">#{p.index}</span>
                      <span className="text-text-primary">{p.summary}</span>
                    </div>
                    <span className="text-xs text-text-muted font-mono whitespace-nowrap">
                      @{p.person}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

