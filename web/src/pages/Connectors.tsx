import React, { useState } from 'react';
import {
  Search,
  AlertCircle,
} from 'lucide-react';
import { useDaybreakData } from '../data/source';

interface ConnectorItem {
  id: string;
  name: string;
  category: string;
  description: string;
  status: string;
  connected: boolean;
  iconBg: string;
  badge?: string;
}

export const Connectors: React.FC = () => {
  const { data } = useDaybreakData();
  const [searchQuery, setSearchQuery] = useState('');
  const [connectorsState, setConnectorsState] = useState<Record<string, boolean>>({
    github: true,
    switch: true,
    mattermost: true,
    atlassian: false,
    datadog: false,
    google: false,
  });

  const repo = data.analysis.meta.repo;

  const connectors: ConnectorItem[] = [
    {
      id: 'atlassian',
      name: 'Atlassian',
      category: 'Project management',
      description: 'Nobody has connected it yet',
      status: 'Available · Jira & Confluence',
      connected: connectorsState.atlassian,
      iconBg: 'bg-[#0052CC]',
    },
    {
      id: 'datadog',
      name: 'Datadog',
      category: 'Observability',
      description: 'Nobody has connected it yet',
      status: 'Available · Metrics & APM',
      connected: connectorsState.datadog,
      iconBg: 'bg-[#632CA6]',
    },
    {
      id: 'github',
      name: 'GitHub',
      category: 'Source control',
      description: `Connected: ${repo}`,
      status: 'Active · Read-only audit mode',
      connected: connectorsState.github,
      iconBg: 'bg-[#24292E]',
      badge: 'ALLOW_WRITE=0',
    },
    {
      id: 'google',
      name: 'Google Workspace',
      category: 'Productivity',
      description: 'Nobody has connected it yet',
      status: 'Available · Docs, Sheets & Gmail',
      connected: connectorsState.google,
      iconBg: 'bg-[#4285F4]',
    },
    {
      id: 'switch',
      name: 'Switch Console & Agents',
      category: 'Agent runtime',
      description: 'Connected: Scribe, Sentinel, Clerk in #daybreak',
      status: 'Active · Local Switch server',
      connected: connectorsState.switch,
      iconBg: 'bg-status-success',
      badge: 'Room #daybreak',
    },
    {
      id: 'mattermost',
      name: 'Mattermost Standup Channel',
      category: 'Team chat & webhooks',
      description: 'Incoming webhook configured for 09:30 IST standup brief',
      status: 'Active · Standup Zero',
      connected: connectorsState.mattermost,
      iconBg: 'bg-[#0058CC]',
      badge: 'Webhook Ready',
    },
  ];

  const toggleConnector = (id: string) => {
    // Read-only safety notice: show state change in UI
    setConnectorsState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = connectors.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Subtitle matching Switch screenshot */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          Connectors
        </h1>
        <p className="text-sm text-text-secondary">
          Choose which services people in Default can connect and give to their agents.
        </p>
      </div>

      {/* Search Bar matching Switch screenshot */}
      <div className="space-y-2">
        <div className="relative max-w-xl">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or category"
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#18191B] border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-strong transition-colors"
          />
        </div>
        <p className="text-xs text-text-muted">
          Turning a service off takes it from every agent within a minute. Turning it back on restores their access.
        </p>
      </div>

      {/* Grid of Switch Connector Cards matching Switch screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-xl bg-[#161719] border border-border hover:border-border-strong transition-all flex items-center justify-between gap-4"
          >
            {/* Left Icon and Details */}
            <div className="flex items-center gap-3.5 min-w-0">
              {/* App Icon Box */}
              <div
                className={`h-11 w-11 rounded-lg ${item.iconBg} flex items-center justify-center text-white shrink-0 shadow-xs border border-white/10`}
              >
                {item.id === 'github' && (
                  <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                )}
                {item.id === 'atlassian' && (
                  <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                    <path d="M11.53 2c0 2.4-1.97 4.35-4.4 4.35H2.8C2.36 6.35 2 6.7 2 7.15c0 .24.1.46.26.62l9.04 9.04c.16.16.38.26.62.26.45 0 .8-.36.8-.8V2.73c0-.4-.32-.73-.72-.73h-.47zm.94 4.93v14.34c0 .4.32.73.72.73h.48c0-2.4 1.97-4.35 4.4-4.35h4.33c.44 0 .8-.35.8-.8 0-.24-.1-.46-.26-.62l-9.05-9.04a.87.87 0 00-.62-.26c-.45 0-.8.36-.8.8z" />
                  </svg>
                )}
                {item.id === 'datadog' && (
                  <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
                  </svg>
                )}
                {item.id === 'google' && (
                  <span className="font-bold text-lg font-sans">G</span>
                )}
                {item.id === 'switch' && (
                  <span className="font-black text-sm font-mono tracking-tighter">SW</span>
                )}
                {item.id === 'mattermost' && (
                  <span className="font-black text-sm font-mono tracking-tighter">MM</span>
                )}
              </div>

              {/* Text Info */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-text-primary truncate">
                    {item.name}
                  </h2>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-3 text-status-success border border-status-success/30 font-semibold">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="text-xs text-text-secondary truncate mt-0.5">
                  {item.category}
                </div>
                <div className="text-xs text-text-muted truncate mt-1">
                  {item.description}
                </div>
              </div>
            </div>

            {/* Right Toggle Switch matching Switch screenshot */}
            <button
              type="button"
              onClick={() => toggleConnector(item.id)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                item.connected ? 'bg-status-success' : 'bg-surface-3'
              }`}
              role="switch"
              aria-checked={item.connected}
              title={item.connected ? 'Enabled' : 'Disabled'}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  item.connected ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Information Card */}
      <div className="p-4 rounded-xl border border-border bg-[#141517] text-xs text-text-secondary flex items-start gap-3">
        <AlertCircle className="h-4 w-4 text-accent-amber shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-text-primary">
            Daybreak Governance Guardrails
          </div>
          <div>
            The GitHub and Switch connectors are pre-configured to operate in read-only observation mode with <code className="font-mono text-accent-amber font-bold">DAYBREAK_ALLOW_WRITE=0</code>. All outbound human comments and review requests remain strictly gated behind recorded typed room approvals.
          </div>
        </div>
      </div>
    </div>
  );
};
