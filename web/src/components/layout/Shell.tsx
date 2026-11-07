import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Sun,
  Moon,
  Clock,
  Shield,
  RefreshCw,
  Pause,
  Play,
  Search,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useDaybreakData } from '../../data/source';
import { DockNav } from '../reactbits/DockNav';
import { AuroraBackground } from '../reactbits/AuroraBackground';
import { CommandPalette } from '../CommandPalette';

export const Shell: React.FC = () => {
  const {
    data,
    mode,
    setMode,
    isPolling,
    setIsPolling,
    refetch,
    lastUpdated,
  } = useDaybreakData();

  const [isDark, setIsDark] = useState<boolean>(true);
  const [secondsAgo, setSecondsAgo] = useState<number>(0);
  const [paletteOpen, setPaletteOpen] = useState<boolean>(false);

  // Time elapsed counter since last update
  useEffect(() => {
    const updateElapsed = () => {
      const now = Date.now();
      const updated = new Date(lastUpdated).getTime();
      const elapsed = Math.max(0, Math.floor((now - updated) / 1000));
      setSecondsAgo(elapsed);
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const pendingCount = (data.analysis.proposals || []).filter(
    (p) => p.status === 'proposed'
  ).length;

  return (
    <div className="min-h-screen bg-surface-0 text-text-primary flex flex-col font-sans">
      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface-1/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {/* Left: Branding & Repo */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-sunrise-gradient p-0.5 shadow-glow-amber flex items-center justify-center">
              <div className="h-full w-full bg-surface-1 rounded-[6px] flex items-center justify-center font-bold text-xs bg-clip-text text-transparent bg-sunrise-gradient">
                DB
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight">Daybreak Cockpit</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-surface-3 text-text-muted border border-border">
                  Read-Only
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center text-xs font-mono text-text-secondary bg-surface-2 px-2.5 py-1 rounded-md border border-border">
              <span>{data.analysis.meta.repo}</span>
            </div>
          </div>

          {/* Center: Search / Command Palette Trigger */}
          <div className="hidden md:flex flex-1 max-w-sm">
            <button
              onClick={() => setPaletteOpen(true)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-2 text-text-muted border border-border hover:border-border-strong text-xs transition-colors"
            >
              <div className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5" />
                <span>Quick search or command...</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-3 text-[10px] font-mono border border-border">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Data Mode Badge, Polling Status, Theme */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mode Switcher Pill */}
            <div className="flex items-center rounded-lg bg-surface-2 p-0.5 border border-border text-xs font-medium">
              <button
                type="button"
                onClick={() => setMode('demo')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  mode === 'demo'
                    ? 'bg-accent-amber/20 text-accent-amber font-semibold border border-accent-amber/30 shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Seeded demo data
              </button>
              <button
                type="button"
                onClick={() => setMode('live')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  mode === 'live'
                    ? 'bg-status-success/20 text-status-success font-semibold border border-status-success/30 shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    mode === 'live' ? 'bg-status-success animate-pulse' : 'bg-text-muted'
                  }`}
                />
                Live
              </button>
            </div>

            {/* Poll Status (Live mode) */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-text-muted font-mono">
              <span>Updated {secondsAgo}s ago</span>
              <button
                type="button"
                onClick={() => setIsPolling(!isPolling)}
                title={isPolling ? 'Pause polling' : 'Resume polling'}
                className="p-1 rounded hover:bg-surface-2 hover:text-text-primary transition-colors"
              >
                {isPolling ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </button>
              <button
                type="button"
                onClick={() => refetch()}
                title="Refresh now"
                className="p-1 rounded hover:bg-surface-2 hover:text-text-primary transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg bg-surface-2 text-text-secondary hover:text-text-primary border border-border transition-colors"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Safety Strip */}
        <div className="border-t border-border/60 bg-surface-2/40 px-4 sm:px-6 lg:px-8 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-text-secondary">
            {/* Quiet Hours */}
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <Clock className="h-3.5 w-3.5 text-accent-amber" />
              <span>
                Quiet hours: {data.rules.quiet_hours.start}–{data.rules.quiet_hours.end} (
                {data.rules.timezone})
              </span>
            </div>

            {/* Write Guard */}
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-text-muted">
              <Shield className="h-3.5 w-3.5 text-status-success" />
              <span>DAYBREAK_ALLOW_WRITE=0 (Safe)</span>
            </div>

            {/* Approvals Pending */}
            {pendingCount > 0 ? (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-accent-coral">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{pendingCount} proposal{pendingCount > 1 ? 's' : ''} awaiting room review</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-status-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Zero pending approvals</span>
              </div>
            )}
          </div>

          <div className="text-[11px] text-text-muted hidden sm:block">
            <span>Decisions must be issued in the Switch room via chat commands.</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <AuroraBackground className="flex-1 pb-28 pt-6">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </AuroraBackground>

      {/* Floating Bottom Dock Navigation */}
      <DockNav />

      {/* Command Palette Modal */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
};
