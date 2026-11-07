import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  RotateCcw,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { useDaybreakData } from '../data/source';
import { SpotlightCard } from '../components/reactbits/SpotlightCard';

interface ChatMessage {
  id: string;
  sender: 'user' | 'scribe' | 'sentinel' | 'clerk';
  senderName: string;
  avatarColor: string;
  roleBadge: string;
  time: string;
  content: React.ReactNode;
}

export const SwitchSimulator: React.FC = () => {
  const { data } = useDaybreakData();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'user',
      senderName: 'You (Team Lead)',
      avatarColor: 'bg-accent-violet',
      roleBadge: 'Human Approver',
      time: '09:30 AM',
      content: <span className="font-mono">brief</span>,
    },
    {
      id: 'init-2',
      sender: 'scribe',
      senderName: 'Scribe',
      avatarColor: 'bg-accent-amber text-black',
      roleBadge: 'Claude Code · Standup Zero',
      time: '09:30 AM',
      content: (
        <div className="space-y-2 text-xs">
          <p className="font-bold text-text-primary">
            🌅 Daybreak standup brief · {data.analysis.meta.repo} · last 24h
          </p>
          <div className="p-3 rounded-lg bg-surface-2/80 border border-border space-y-1.5 font-mono text-[11px]">
            <p><strong>@priya:</strong> Merged PR #41 (Token refresh), opened PR #48. Today: PR #42.</p>
            <p><strong>@sam:</strong> Pushed commit abc006, opened PR #52. Today: PR #47, PR #49, PR #50.</p>
            <p><strong>@arjun:</strong> 2 commits pushed. Today: PR #39, Issue #31.</p>
          </div>
          <p className="text-text-muted italic text-[11px]">
            Heads-up: proposals are in the thread below. Reply in this thread to approve or edit.
          </p>
        </div>
      ),
    },
    {
      id: 'init-3',
      sender: 'sentinel',
      senderName: 'Sentinel',
      avatarColor: 'bg-accent-coral text-white',
      roleBadge: 'Codex · Risk & Heuristics',
      time: '09:30 AM',
      content: (
        <div className="space-y-3 text-xs">
          <p className="font-bold text-text-primary">
            🛡️ 4 Stuck items & 1 Early warning flagged:
          </p>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="p-2 rounded bg-surface-2 border border-border">
              <span className="text-accent-coral font-bold">[1]</span> Issue #30 stale, 96h since update (limit 72h) @sam
            </div>
            <div className="p-2 rounded bg-surface-2 border border-border">
              <span className="text-accent-coral font-bold">[2]</span> PR #42 waiting 31h for @arjun (SLA 24h)
            </div>
            <div className="p-2 rounded bg-surface-2 border border-border">
              <span className="text-accent-coral font-bold">[3]</span> PR #39 approved 26h ago, not merged (limit 24h)
            </div>
            <div className="p-2 rounded bg-surface-2 border border-border">
              <span className="text-accent-coral font-bold">[4]</span> PR #45 CI red for 14h (limit 12h) @meera
            </div>
            <div className="p-2 rounded bg-accent-coral/15 border border-accent-coral/30 text-accent-coral font-semibold">
              <span className="font-black">[5] HIGH EARLY WARNING</span> PR #52 (65 pts, 3 signals): unassigned reviewer, author has 3 other PRs, depends on open #48
            </div>
          </div>
          <p className="text-text-muted text-[11px]">
            Reply with: <code className="font-mono text-accent-amber font-semibold">approve 2 5</code> · <code className="font-mono text-accent-amber">skip 1</code> · <code className="font-mono text-accent-amber">snooze 3 2d</code>
          </p>
        </div>
      ),
    },
  ]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      senderName: 'You (Team Lead)',
      avatarColor: 'bg-accent-violet text-white',
      roleBadge: 'Human Approver',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: <span className="font-mono font-semibold">{trimmed}</span>,
    };

    let replyMsg: ChatMessage | null = null;
    const lower = trimmed.toLowerCase();

    if (lower.startsWith('approve')) {
      const indices = lower.replace('approve', '').trim() || 'all';
      replyMsg = {
        id: `clerk-${Date.now()}`,
        sender: 'clerk',
        senderName: 'Clerk',
        avatarColor: 'bg-status-success text-black',
        roleBadge: 'Claude Code · Gatekeeper',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: (
          <div className="space-y-2 text-xs">
            <p className="font-bold text-status-success flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>Approved proposals: [{indices}] by @lead</span>
            </p>
            <p className="text-text-secondary leading-relaxed">
              Bound immutable SHA-256 action digests to approver identity. Quiet hours check: inactive. Rate limits: within budget.
            </p>
            <div className="p-2.5 rounded-lg bg-surface-2 font-mono text-[11px] text-text-primary border border-border">
              Dry run execution verified: 2 actions queued for GitHub (comments with hidden idempotency markers).
            </div>
          </div>
        ),
      };
    } else if (lower.startsWith('snooze')) {
      replyMsg = {
        id: `clerk-${Date.now()}`,
        sender: 'clerk',
        senderName: 'Clerk',
        avatarColor: 'bg-status-success text-black',
        roleBadge: 'Claude Code · Gatekeeper',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: (
          <div className="space-y-1 text-xs">
            <p className="font-bold text-accent-violet flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>Snoozed target for 2 days</span>
            </p>
            <p className="text-text-secondary">
              Proposal suppressed from standup briefs until Thursday 04:00 AM UTC. Recorded in state ledger.
            </p>
          </div>
        ),
      };
    } else if (lower.startsWith('rules set') || lower.startsWith('set')) {
      replyMsg = {
        id: `sentinel-${Date.now()}`,
        sender: 'sentinel',
        senderName: 'Sentinel',
        avatarColor: 'bg-accent-coral text-white',
        roleBadge: 'Codex · Risk & Heuristics',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: (
          <div className="space-y-1 text-xs">
            <p className="font-bold text-accent-amber">
              Rulebook updated by human lead:
            </p>
            <p className="font-mono text-text-primary p-2 rounded bg-surface-2 border border-border">
              {trimmed} → updated in state/rules.json
            </p>
          </div>
        ),
      };
    } else if (lower.includes('scoreboard')) {
      replyMsg = {
        id: `sentinel-${Date.now()}`,
        sender: 'sentinel',
        senderName: 'Sentinel',
        avatarColor: 'bg-accent-coral text-white',
        roleBadge: 'Codex · Risk & Heuristics',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: (
          <div className="space-y-2 text-xs">
            <p className="font-bold text-text-primary">
              📊 Daybreak weekly impact scoreboard
            </p>
            <div className="p-2.5 rounded bg-surface-2 border border-border font-mono text-[11px] space-y-1">
              <div>Median first-review wait: 24.0h</div>
              <div>Standup minutes returned: 75 min (5 members × 15 min × 1 day)</div>
              <div>Interventions accepted: 1 approved · 0 false positive skips</div>
            </div>
          </div>
        ),
      };
    } else {
      replyMsg = {
        id: `scribe-${Date.now()}`,
        sender: 'scribe',
        senderName: 'Scribe',
        avatarColor: 'bg-accent-amber text-black',
        roleBadge: 'Claude Code',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: (
          <div className="text-xs text-text-secondary">
            Command received: <code className="font-mono">{trimmed}</code>. Supported Switch room commands: <code className="font-mono text-accent-amber">brief</code>, <code className="font-mono text-accent-amber">approve &lt;N&gt;</code>, <code className="font-mono text-accent-amber">skip &lt;N&gt;</code>, <code className="font-mono text-accent-amber">snooze &lt;N&gt; 2d</code>, <code className="font-mono text-accent-amber">rules set &lt;K&gt; &lt;V&gt;</code>, <code className="font-mono text-accent-amber">scoreboard</code>.
          </div>
        ),
      };
    }

    setMessages((prev) => [...prev, userMsg, replyMsg]);
    setInput('');
  };

  const handleReset = () => {
    setMessages(messages.slice(0, 3));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-accent-amber mb-1">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>SWITCH PLATFORM · LIVE ROOM WORKSPACE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Switch Shared Room Simulator
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Live simulation of the collaborative Switch room: Scribe drafts, Sentinel alerts, and Clerk guards execution.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 text-text-secondary hover:text-text-primary border border-border text-xs font-medium transition-colors shadow-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Room Thread</span>
        </button>
      </div>

      {/* Agents Presence Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <SpotlightCard className="p-3 border border-border/80 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-accent-violet flex items-center justify-center font-bold text-xs text-white shadow-sm">
            You
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-text-primary truncate">Team Lead</div>
            <div className="text-[10px] text-text-muted">Human Approver</div>
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-3 border border-border/80 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-accent-amber flex items-center justify-center font-bold text-xs text-black shadow-sm">
            SC
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-text-primary truncate">Scribe</div>
            <div className="text-[10px] text-text-muted">Claude Code · Briefs</div>
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-3 border border-border/80 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-accent-coral flex items-center justify-center font-bold text-xs text-white shadow-sm">
            SE
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-text-primary truncate">Sentinel</div>
            <div className="text-[10px] text-text-muted">Codex · Early Warning</div>
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-3 border border-border/80 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-status-success flex items-center justify-center font-bold text-xs text-black shadow-sm">
            CL
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-text-primary truncate">Clerk</div>
            <div className="text-[10px] text-text-muted">Claude Code · Gatekeeper</div>
          </div>
        </SpotlightCard>
      </div>

      {/* ============================================================ */}
      {/* SWITCH CONSOLE DESKTOP WINDOW FRAME                          */}
      {/* ============================================================ */}
      <SpotlightCard className="p-0 rounded-2xl overflow-hidden border border-border-strong shadow-2xl bg-surface-1">
        {/* Window Chrome Titlebar */}
        <div className="px-4 py-2.5 border-b border-border bg-surface-2/80 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-accent-coral/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-accent-amber/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-status-success/80" />
            </div>
            <span className="text-[11px] font-mono text-text-muted ml-2">
              Switch Console — Room Workspace (#daybreak)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-status-success">
            <span className="h-1.5 w-1.5 rounded-full bg-status-success animate-pulse" />
            <span className="text-[11px]">Mattermost Bridge Active</span>
          </div>
        </div>

        {/* Message Thread Stream */}
        <div className="p-5 space-y-5 max-h-[520px] overflow-y-auto">
          {messages.map((m) => (
            <div key={m.id} className="flex items-start gap-3.5">
              <div
                className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs shadow-xs ${m.avatarColor}`}
              >
                {m.sender === 'user' ? 'YOU' : m.sender.slice(0, 2).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-primary">{m.senderName}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-3 text-text-muted border border-border/80">
                    {m.roleBadge}
                  </span>
                  <span className="text-[10px] text-text-muted font-mono">{m.time}</span>
                </div>
                <div className="text-sm text-text-secondary leading-relaxed bg-surface-2/40 p-3 rounded-xl border border-border/60 shadow-xs">
                  {m.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Simulator Commands Bar */}
        <div className="px-5 py-3 border-t border-border bg-surface-2/40 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-text-muted uppercase tracking-wider">
            <span>Quick Room Commands (Click to simulate typing)</span>
            <span className="font-mono text-[10px] text-accent-amber">Interactive Prompts</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleCommand('approve 2 5')}
              className="px-3 py-1 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border text-xs font-mono font-semibold text-accent-amber transition-colors shadow-xs"
            >
              approve 2 5
            </button>
            <button
              type="button"
              onClick={() => handleCommand('snooze 3 2d')}
              className="px-3 py-1 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border text-xs font-mono font-semibold text-text-primary transition-colors shadow-xs"
            >
              snooze 3 2d
            </button>
            <button
              type="button"
              onClick={() => handleCommand('rules set quiet_hours.friday_cutoff 16:00')}
              className="px-3 py-1 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border text-xs font-mono font-semibold text-text-primary transition-colors shadow-xs"
            >
              set friday_cutoff 16:00
            </button>
            <button
              type="button"
              onClick={() => handleCommand('scoreboard')}
              className="px-3 py-1 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border text-xs font-mono font-semibold text-text-primary transition-colors shadow-xs"
            >
              scoreboard
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCommand(input);
          }}
          className="p-3 border-t border-border flex items-center gap-2 bg-surface-1"
        >
          <input
            type="text"
            placeholder="Type a message or command in #daybreak (e.g. approve 1 2, snooze 3 2d, scoreboard)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-surface-2 px-3.5 py-2.5 rounded-xl text-xs font-mono text-text-primary placeholder:text-text-muted border border-border focus:outline-none focus:border-accent-amber"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-accent-amber text-black font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400 transition-colors shadow-xs cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Send</span>
          </button>
        </form>
      </SpotlightCard>
    </div>
  );
};
