import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Bot,
  Hash,
  Plug2,
  LayoutTemplate,
  Shield,
  ArrowLeft,
  ArrowRight,
  PanelLeft,
  ChevronsUpDown,
  Search,
  Settings,
  ExternalLink,
  Terminal,
  Sun,
  Moon,
  Clock,
  RefreshCw,
  Pause,
  Play,
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
} from 'lucide-react';
import { useDaybreakData } from '../../data/source';
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
  const [isSubNavCollapsed, setIsSubNavCollapsed] = useState<boolean>(false);
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

  const getPageTitle = (pathname: string): string => {
    switch (pathname) {
      case '/':
        return 'Mission Control';
      case '/connectors':
        return 'Connectors';
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
      {/* 1. PRIMARY SWITCH SIDEBAR (Exact match to Switch Console)   */}
      {/* ============================================================ */}
      <aside className="hidden xl:flex flex-col w-56 shrink-0 border-r border-border bg-[#111214] select-none text-sm z-30">
        {/* Top Controls: Back/Forward and Sidebar Toggle */}
        <div className="h-10 px-3 flex items-center justify-between text-text-muted border-b border-border/40">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-1 rounded hover:bg-surface-3 hover:text-text-primary transition-colors"
              title="Back"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="p-1 rounded hover:bg-surface-3 hover:text-text-primary transition-colors"
              title="Forward"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsSubNavCollapsed(!isSubNavCollapsed)}
            className="p-1 rounded hover:bg-surface-3 hover:text-text-primary transition-colors"
            title="Toggle secondary panel"
          >
            <PanelLeft className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Server & Workspace Selector Dropdown Card */}
        <div className="p-2 border-b border-border/40">
          <div className="flex items-center justify-between p-2 rounded-lg bg-surface-2/60 hover:bg-surface-2 cursor-pointer transition-colors border border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-md bg-status-success/20 text-status-success border border-status-success/30 flex items-center justify-center font-bold text-xs">
                L
              </div>
              <div className="leading-tight">
                <div className="font-semibold text-xs text-text-primary">
                  Local Switch server
                </div>
                <div className="flex items-center gap-1 text-[11px] text-text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
                  <span>This computer</span>
                </div>
              </div>
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 text-text-muted" />
          </div>
        </div>

        {/* Primary Switch Navigation Menu */}
        <div className="p-2 space-y-0.5 border-b border-border/40 text-xs">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors ${
                isActive && location.pathname === '/'
                  ? 'bg-surface-3 text-text-primary font-medium'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <Home className="h-4 w-4 text-text-muted" />
              <span>Home</span>
            </div>
          </NavLink>

          <NavLink
            to="/simulator"
            className={({ isActive }) =>
              `flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors ${
                isActive
                  ? 'bg-surface-3 text-text-primary font-medium'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <Bot className="h-4 w-4 text-text-muted" />
              <span>Your Agents</span>
            </div>
            <span className="text-[10px] font-mono text-status-success">3</span>
          </NavLink>

          <NavLink
            to="/brief"
            className={({ isActive }) =>
              `flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors ${
                isActive
                  ? 'bg-surface-3 text-text-primary font-medium'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <Hash className="h-4 w-4 text-text-muted" />
              <span>Your Rooms</span>
            </div>
            <span className="text-[10px] font-mono text-text-muted">#daybreak</span>
          </NavLink>

          <NavLink
            to="/connectors"
            className={({ isActive }) =>
              `flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors ${
                isActive
                  ? 'bg-surface-3 text-text-primary font-medium'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <Plug2 className="h-4 w-4 text-text-muted" />
              <span>Connectors</span>
            </div>
            <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
          </NavLink>

          <NavLink
            to="/architecture"
            className={({ isActive }) =>
              `flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors ${
                isActive
                  ? 'bg-surface-3 text-text-primary font-medium'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <LayoutTemplate className="h-4 w-4 text-text-muted" />
              <span>Templates</span>
            </div>
          </NavLink>

          <NavLink
            to="/health"
            className={({ isActive }) =>
              `flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors ${
                isActive
                  ? 'bg-surface-3 text-text-primary font-medium'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <Shield className="h-4 w-4 text-text-muted" />
              <span>Admin</span>
            </div>
            <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
          </NavLink>
        </div>

        {/* Tab Segment: Agents / Rooms */}
        <div className="p-2 border-b border-border/40">
          <div className="flex items-center justify-between text-xs mb-2 px-1">
            <div className="inline-flex rounded-lg bg-surface-2 p-0.5 border border-border/60">
              <button
                type="button"
                className="px-2 py-0.5 rounded-md bg-surface-3 text-text-primary font-medium text-[11px]"
              >
                Agents
              </button>
              <button
                type="button"
                className="px-2 py-0.5 rounded-md text-text-muted hover:text-text-primary text-[11px]"
              >
                Rooms
              </button>
            </div>
            <span className="text-[11px] font-mono text-text-muted">3 active</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1 rounded-md bg-surface-2/40 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-amber" />
                <span className="text-text-primary font-medium">Scribe</span>
              </div>
              <span className="text-[10px] text-text-muted font-mono">Claude</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 rounded-md bg-surface-2/40 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-coral" />
                <span className="text-text-primary font-medium">Sentinel</span>
              </div>
              <span className="text-[10px] text-text-muted font-mono">Codex</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 rounded-md bg-surface-2/40 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
                <span className="text-text-primary font-medium">Clerk</span>
              </div>
              <span className="text-[10px] text-text-muted font-mono">Claude</span>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom Sidebar Utility Links */}
        <div className="p-2 border-t border-border/40 space-y-0.5 text-xs text-text-secondary">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-surface-2 hover:text-text-primary transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Search className="h-4 w-4 text-text-muted" />
              <span>Search...</span>
            </div>
            <kbd className="text-[10px] font-mono text-text-muted px-1 rounded bg-surface-2 border border-border/40">
              ⌘K
            </kbd>
          </button>

          <NavLink
            to="/rules"
            className="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-surface-2 hover:text-text-primary transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Settings className="h-4 w-4 text-text-muted" />
              <span>Settings</span>
            </div>
            <kbd className="text-[10px] font-mono text-text-muted px-1 rounded bg-surface-2 border border-border/40">
              ⌘,
            </kbd>
          </NavLink>

          <a
            href="https://docs.switchagents.ai"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-surface-2 hover:text-text-primary transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="h-4 w-4 text-text-muted" />
              <span>Docs</span>
            </div>
            <span className="text-[10px] text-text-muted">↗</span>
          </a>

          <div className="pt-2 px-2.5 flex items-center justify-between text-[11px] text-text-muted border-t border-border/40 font-mono">
            <div className="flex items-center gap-1.5">
              <Terminal className="h-3 w-3" />
              <span>switch</span>
            </div>
            <span>v0.40.1</span>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. SECONDARY WORKSPACE SUB-NAV (Exact Switch Sub-sidebar)   */}
      {/* ============================================================ */}
      {!isSubNavCollapsed && (
        <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border bg-[#141517] select-none text-xs z-20">
          <div className="p-3 border-b border-border/40">
            <div className="text-[10px] font-mono uppercase text-text-muted tracking-wider mb-2 font-semibold">
              WORKSPACE · Daybreak
            </div>
            <div className="space-y-0.5">
              <SubNavLink to="/" icon={LayoutDashboard} label="Mission Control" />
              <SubNavLink to="/brief" icon={Newspaper} label="Morning Brief" />
              <SubNavLink
                to="/proposals"
                icon={CheckSquare}
                label="Proposals Queue"
                badge={pendingCount > 0 ? `${pendingCount}` : undefined}
                badgeColor="bg-accent-coral/20 text-accent-coral border-accent-coral/30"
              />
              <SubNavLink
                to="/early-warning"
                icon={AlertTriangle}
                label="Early Warning"
                badge={warningCount > 0 ? `${warningCount}` : undefined}
                badgeColor="bg-accent-amber/20 text-accent-amber border-accent-amber/30"
              />
              <SubNavLink to="/rules" icon={Sliders} label="Rulebook & SLAs" />
              <SubNavLink to="/audit" icon={History} label="Audit Ledger" />
              <SubNavLink to="/scoreboard" icon={TrendingUp} label="Velocity Scoreboard" />
            </div>
          </div>

          <div className="p-3 border-b border-border/40 flex-1">
            <div className="text-[10px] font-mono uppercase text-text-muted tracking-wider mb-2 font-semibold">
              SERVER · Local Switch server
            </div>
            <div className="space-y-0.5">
              <SubNavLink
                to="/connectors"
                icon={Plug2}
                label="Connectors"
                badge="3 Active"
                badgeColor="bg-status-success/20 text-status-success border-status-success/30"
              />
              <SubNavLink
                to="/simulator"
                icon={MessageSquare}
                label="Switch Room Chat"
                badge="Active"
                badgeColor="bg-status-success/20 text-status-success border-status-success/30"
              />
              <SubNavLink
                to="/health"
                icon={ShieldCheck}
                label="Status & Doctor"
                badge={data.doctor.passed ? 'PASS' : 'FAIL'}
                badgeColor={
                  data.doctor.passed
                    ? 'bg-status-success/20 text-status-success border-status-success/30'
                    : 'bg-status-danger/20 text-status-danger border-status-danger/30'
                }
              />
              <SubNavLink to="/architecture" icon={Network} label="Connector Apps" />
            </div>
          </div>

          <div className="p-3 border-t border-border/40 bg-surface-2/20">
            <div className="text-[10px] text-text-muted mb-1 uppercase font-mono">
              Target Repo
            </div>
            <div className="font-mono text-xs font-semibold text-text-primary truncate">
              {data.analysis.meta.repo}
            </div>
            <div className="mt-2 text-[10px] text-text-muted flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
              <span>ALLOW_WRITE=0 (Safe)</span>
            </div>
          </div>
        </aside>
      )}

      {/* ============================================================ */}
      {/* 3. MAIN CONTENT STAGE                                        */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar matching Switch screenshot breadcrumb */}
        <header className="sticky top-0 z-40 border-b border-border bg-[#131416]/95 backdrop-blur-md">
          <div className="px-4 sm:px-6 h-12 flex items-center justify-between gap-4">
            {/* Left: Breadcrumbs */}
            <div className="flex items-center gap-2.5 text-xs">
              <div className="h-6 w-6 rounded bg-status-success/20 text-status-success border border-status-success/40 flex items-center justify-center font-bold text-xs">
                D
              </div>
              <span className="font-medium text-text-primary">Daybreak</span>
              <span className="text-text-muted">/</span>
              <span className="font-mono text-text-secondary">#daybreak</span>
              <span className="text-text-muted">/</span>
              <span className="font-semibold text-text-primary">
                {getPageTitle(location.pathname)}
              </span>
            </div>

            {/* Right: Switch Running Indicator, Quiet Hours, Mode Toggle */}
            <div className="flex items-center gap-3">
              {/* Running Status Dot matching Switch Screenshot */}
              <div className="flex items-center gap-1.5 text-xs font-medium text-status-success">
                <span className="h-2 w-2 rounded-full bg-status-success animate-pulse" />
                <span>Running</span>
              </div>

              <div className="h-3.5 w-px bg-border/80 hidden sm:block" />

              {/* Quiet Hours Pill */}
              <div className="hidden md:flex items-center gap-1.5 text-xs text-text-muted font-mono">
                <Clock className="h-3 w-3 text-accent-amber" />
                <span>
                  {data.rules.quiet_hours.start}–{data.rules.quiet_hours.end} ({data.rules.timezone})
                </span>
              </div>

              <div className="h-3.5 w-px bg-border/80 hidden sm:block" />

              {/* Mode Toggle */}
              <div className="flex items-center rounded-lg bg-surface-2 p-0.5 border border-border text-xs">
                <button
                  type="button"
                  onClick={() => setMode('demo')}
                  className={`px-2 py-0.5 rounded transition-all text-xs ${
                    mode === 'demo'
                      ? 'bg-accent-amber/20 text-accent-amber font-semibold border border-accent-amber/30'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  Seeded demo data
                </button>
                <button
                  type="button"
                  onClick={() => setMode('live')}
                  className={`px-2 py-0.5 rounded transition-all text-xs flex items-center gap-1.5 ${
                    mode === 'live'
                      ? 'bg-status-success/20 text-status-success font-semibold border border-status-success/30'
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

              {/* Polling Refresh & Elapsed */}
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-text-muted font-mono">
                <span>{secondsAgo}s ago</span>
                <button
                  type="button"
                  onClick={() => setIsPolling(!isPolling)}
                  title={isPolling ? 'Pause polling' : 'Resume polling'}
                  className="p-1 rounded hover:bg-surface-3 transition-colors"
                >
                  {isPolling ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </button>
                <button
                  type="button"
                  onClick={() => refetch()}
                  title="Refresh now"
                  className="p-1 rounded hover:bg-surface-3 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
              </div>

              {/* Dark Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-1.5 rounded-lg bg-surface-2 text-text-secondary hover:text-text-primary border border-border transition-colors"
              >
                {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          <Outlet />
        </main>
      </div>

      {/* Mobile Floating Bottom Bar */}
      <div className="lg:hidden fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4">
        <DockNav />
      </div>

      {/* Global Cmd+K Search Palette */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
};

interface SubNavLinkProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
  badgeColor?: string;
}

const SubNavLink: React.FC<SubNavLinkProps> = ({
  to,
  icon: Icon,
  label,
  badge,
  badgeColor = 'bg-surface-3 text-text-secondary border-border',
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
          isActive
            ? 'bg-surface-3 text-text-primary font-medium border border-border/70'
            : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
        }`
      }
    >
      <div className="flex items-center gap-2 truncate">
        <Icon className="h-3.5 w-3.5 shrink-0 text-text-muted" />
        <span className="truncate">{label}</span>
      </div>
      {badge && (
        <span
          className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${badgeColor} shrink-0`}
        >
          {badge}
        </span>
      )}
    </NavLink>
  );
};
