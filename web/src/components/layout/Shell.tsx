import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
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
  LayoutDashboard,
  Newspaper,
  CheckSquare,
  AlertTriangle,
  Sliders,
  History,
  TrendingUp,
  MessageSquare,
  Network,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useDaybreakData } from '../../data/source';
import { AuroraBackground } from '../reactbits/AuroraBackground';
import { CommandPalette } from '../CommandPalette';
import { DockNav } from '../reactbits/DockNav';

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
  const location = useLocation();

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

  const warningCount = (data.analysis.proposals || []).filter(
    (p) => p.severity === 'warning'
  ).length;

  // Active view title mapping
  const getPageTitle = (pathname: string): string => {
    switch (pathname) {
      case '/':
        return 'Mission Control';
      case '/simulator':
        return 'Switch Room Simulator';
      case '/brief':
        return 'Morning Standup Brief';
      case '/proposals':
        return 'Proposals Board';
      case '/early-warning':
        return 'Early Warning Engine';
      case '/rules':
        return 'Rulebook & SLAs';
      case '/audit':
        return 'Audit Ledger';
      case '/scoreboard':
        return 'Velocity Scoreboard';
      case '/architecture':
        return 'System Anatomy';
      case '/health':
        return 'System Health';
      default:
        return 'Overview';
    }
  };

  return (
    <div className="min-h-screen bg-surface-0 text-text-primary flex font-sans antialiased selection:bg-accent-coral/30 selection:text-white">
      {/* ============================================================ */}
      {/* DESKTOP SIDEBAR (Switch Console Pro Workspace)              */}
      {/* ============================================================ */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border bg-surface-1/95 backdrop-blur-xl z-30 select-none">
        {/* Workspace Brand / Header */}
        <div className="h-14 px-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-sunrise-gradient p-0.5 shadow-glow-amber flex items-center justify-center">
              <div className="h-full w-full bg-surface-1 rounded-[6px] flex items-center justify-center font-bold text-xs bg-clip-text text-transparent bg-sunrise-gradient">
                SW
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs tracking-tight text-text-primary">
                  Switch Console
                </span>
                <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-surface-3 text-accent-amber border border-border">
                  v1.0
                </span>
              </div>
              <div className="text-[10px] text-text-muted font-mono truncate">
                Daybreak Room
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-status-success animate-pulse" title="Connected to Room" />
          </div>
        </div>

        {/* Room Channel & Agent Presence Strip */}
        <div className="p-3 border-b border-border/70 space-y-2 bg-surface-2/30">
          <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted uppercase tracking-wider px-1">
            <span>Room Channel</span>
            <span className="font-mono text-[10px] text-accent-amber">#daybreak</span>
          </div>

          {/* 3 Agents Online Indicator */}
          <div className="p-2 rounded-lg bg-surface-1 border border-border space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[10px] text-text-muted font-medium">
              <span>ACTIVE AGENTS</span>
              <span className="text-status-success font-mono font-semibold">3 / 3 Ready</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-amber" />
                  <span className="font-medium text-text-primary">Scribe</span>
                </div>
                <span className="font-mono text-[10px] text-text-muted">Claude Code</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-coral" />
                  <span className="font-medium text-text-primary">Sentinel</span>
                </div>
                <span className="font-mono text-[10px] text-text-muted">Codex</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
                  <span className="font-medium text-text-primary">Clerk</span>
                </div>
                <span className="font-mono text-[10px] text-text-muted">Claude Code</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menus */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Group 1: Workspace */}
          <div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2 mb-1">
              Workspace & Feed
            </div>
            <div className="space-y-0.5">
              <SidebarNavLink to="/" icon={LayoutDashboard} label="Mission Control" />
              <SidebarNavLink
                to="/simulator"
                icon={MessageSquare}
                label="Switch Room"
                badge="Chat"
                badgeColor="bg-accent-amber/15 text-accent-amber border-accent-amber/30"
              />
              <SidebarNavLink to="/brief" icon={Newspaper} label="Standup Brief" />
            </div>
          </div>

          {/* Group 2: Governance & Safety */}
          <div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2 mb-1">
              Safety & Proposals
            </div>
            <div className="space-y-0.5">
              <SidebarNavLink
                to="/proposals"
                icon={CheckSquare}
                label="Proposals Queue"
                badge={pendingCount > 0 ? `${pendingCount}` : undefined}
                badgeColor="bg-accent-coral/20 text-accent-coral border-accent-coral/30"
              />
              <SidebarNavLink
                to="/early-warning"
                icon={AlertTriangle}
                label="Early Warning"
                badge={warningCount > 0 ? `${warningCount}` : undefined}
                badgeColor="bg-accent-amber/15 text-accent-amber border-accent-amber/30"
              />
              <SidebarNavLink to="/rules" icon={Sliders} label="Rulebook & SLAs" />
              <SidebarNavLink to="/audit" icon={History} label="Audit Ledger" />
              <SidebarNavLink to="/scoreboard" icon={TrendingUp} label="Velocity Scoreboard" />
            </div>
          </div>

          {/* Group 3: Architecture & System */}
          <div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2 mb-1">
              System & Diagnostics
            </div>
            <div className="space-y-0.5">
              <SidebarNavLink to="/architecture" icon={Network} label="System Anatomy" />
              <SidebarNavLink
                to="/health"
                icon={ShieldCheck}
                label="Diagnostics (doctor)"
                badge={data.doctor.passed ? 'PASS' : 'FAIL'}
                badgeColor={
                  data.doctor.passed
                    ? 'bg-status-success/15 text-status-success border-status-success/30'
                    : 'bg-status-danger/15 text-status-danger border-status-danger/30'
                }
              />
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Target Repo & Safety Mode */}
        <div className="p-3 border-t border-border bg-surface-2/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-mono text-text-muted uppercase">Target Repo</span>
            <span className="font-mono text-xs font-semibold text-text-primary truncate max-w-[120px]">
              {data.analysis.meta.repo}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-surface-1 border border-border text-[11px] font-mono text-text-muted flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-status-success">
              <Shield className="h-3 w-3" />
              <span className="font-semibold">ALLOW_WRITE=0</span>
            </div>
            <span className="text-[10px] text-text-muted">Safe Lock</span>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MAIN VIEWPORT                                                */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Navigation Bar */}
        <header className="sticky top-0 z-40 border-b border-border bg-surface-1/90 backdrop-blur-md">
          <div className="px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
            {/* Left: Breadcrumb */}
            <div className="flex items-center gap-2 text-xs">
              <div className="lg:hidden flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-sunrise-gradient p-0.5 shadow-glow-amber flex items-center justify-center">
                  <div className="h-full w-full bg-surface-1 rounded-[6px] flex items-center justify-center font-bold text-xs bg-clip-text text-transparent bg-sunrise-gradient">
                    SW
                  </div>
                </div>
              </div>

              <span className="text-text-muted hidden sm:inline">Switch Console</span>
              <ChevronRight className="h-3 w-3 text-text-muted hidden sm:inline" />
              <span className="font-mono text-accent-amber font-semibold">#daybreak</span>
              <ChevronRight className="h-3 w-3 text-text-muted" />
              <span className="font-bold text-text-primary truncate">
                {getPageTitle(location.pathname)}
              </span>
            </div>

            {/* Center: Command Palette Trigger (Cmd+K) */}
            <div className="hidden md:flex flex-1 max-w-sm">
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-2 text-text-muted border border-border hover:border-border-strong text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-3.5 w-3.5" />
                  <span>Search views, proposals, or chat commands...</span>
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

              {/* Poll Status */}
              <div className="hidden xl:flex items-center gap-1.5 text-xs text-text-muted font-mono">
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

          {/* Safety Governance Strip */}
          <div className="border-t border-border/60 bg-surface-2/40 px-4 sm:px-6 lg:px-8 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-text-secondary">
              {/* Quiet Hours State */}
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <Clock className="h-3.5 w-3.5 text-accent-amber" />
                <span>
                  Quiet hours: {data.rules.quiet_hours.start}–{data.rules.quiet_hours.end} ({data.rules.timezone})
                </span>
              </div>

              {/* Write Guard */}
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-text-muted">
                <Shield className="h-3.5 w-3.5 text-status-success" />
                <span>DAYBREAK_ALLOW_WRITE=0 (Safe)</span>
              </div>

              {/* Approvals Pending Counter */}
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

            <div className="text-[11px] text-text-muted hidden md:block">
              <span>Read-only companion dashboard. Actions execute via chat commands in Switch room.</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <AuroraBackground className="flex-1 pb-24 lg:pb-12 pt-6">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </AuroraBackground>

        {/* Mobile Floating Bottom Dock (hidden on desktop where sidebar is present) */}
        <div className="lg:hidden">
          <DockNav />
        </div>

        {/* Command Palette Modal */}
        <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
      </div>
    </div>
  );
};

interface SidebarNavLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: string;
  badgeColor?: string;
}

const SidebarNavLink: React.FC<SidebarNavLinkProps> = ({
  to,
  icon: Icon,
  label,
  badge,
  badgeColor = 'bg-surface-3 text-text-muted border-border',
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
          isActive
            ? 'bg-surface-3 text-text-primary font-semibold shadow-xs border border-border-strong'
            : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
        }`
      }
    >
      <div className="flex items-center gap-2.5 truncate">
        <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
        <span className="truncate">{label}</span>
      </div>
      {badge && (
        <span
          className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-semibold shrink-0 ${badgeColor}`}
        >
          {badge}
        </span>
      )}
    </NavLink>
  );
};
