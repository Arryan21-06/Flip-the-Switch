import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Newspaper,
  CheckSquare,
  AlertTriangle,
  Sliders,
  History,
  TrendingUp,
  Network,
  ShieldCheck,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Mission Control', icon: LayoutDashboard },
  { to: '/brief', label: 'Morning Brief', icon: Newspaper },
  { to: '/proposals', label: 'Proposals', icon: CheckSquare },
  { to: '/early-warning', label: 'Early Warning', icon: AlertTriangle },
  { to: '/rules', label: 'Rules', icon: Sliders },
  { to: '/audit', label: 'Audit Trail', icon: History },
  { to: '/scoreboard', label: 'Scoreboard', icon: TrendingUp },
  { to: '/architecture', label: 'How It Works', icon: Network },
  { to: '/health', label: 'Health', icon: ShieldCheck },
];

export const DockNav: React.FC = () => {
  return (
    <nav
      aria-label="Primary Navigation"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-border-strong bg-surface-1/90 px-3 py-2 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-accent-amber/40"
    >
      <ul className="flex items-center gap-1.5 sm:gap-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="relative group">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex items-center justify-center rounded-xl p-2.5 sm:px-3 sm:py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-surface-3 text-text-primary shadow-sm border border-border-strong font-semibold'
                    : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                }`
              }
            >
              <Icon className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden md:inline text-xs">{label}</span>
            </NavLink>
            {/* Tooltip on smaller screens */}
            <div className="md:hidden pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-md bg-surface-3 px-2 py-1 text-[11px] font-medium text-text-primary opacity-0 shadow-lg border border-border transition-opacity group-hover:opacity-100 whitespace-nowrap">
              {label}
            </div>
          </li>
        ))}
      </ul>
    </nav>
  );
};

