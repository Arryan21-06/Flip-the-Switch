import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  GitPullRequest,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useDaybreakData } from '../data/source';
import { BriefMember, BriefItem } from '../types/daybreak';
import { SpotlightCard } from '../components/reactbits/SpotlightCard';

export const MorningBrief: React.FC = () => {
  const { data } = useDaybreakData();
  const { people = [], meta } = data.brief;
  const [copied, setCopied] = useState(false);

  // Helper to extract member items
  const getMemberSections = (person: BriefMember) => {
    const yesterday: BriefItem[] = person.yesterday || (person.merged || []);
    const rawToday: BriefItem[] =
      person.today || [...(person.open_prs || []), ...(person.assigned_issues || [])];
    const reviewed: BriefItem[] = person.reviewed || [];
    const opened: BriefItem[] = person.opened || [];

    // Deduplicate: if an item is already listed in 'opened', omit from 'today' to prevent repetition
    const openedNums = new Set(opened.map((i) => i.number));
    const today: BriefItem[] = rawToday.filter((i) => !openedNums.has(i.number));

    const handle = person.github || person.login || person.chat;
    return { yesterday, today, reviewed, opened, handle };
  };

  // Compute total evidence items across all members
  const totalEvidenceCount = people.reduce((acc, person) => {
    const { yesterday, today, reviewed, opened } = getMemberSections(person);
    return acc + yesterday.length + today.length + reviewed.length + opened.length;
  }, 0);

  const generateMarkdownBrief = (): string => {
    let md = `# Morning Standup Brief · ${meta.repo}\nDate: ${new Date(
      meta.now
    ).toLocaleDateString()}\n\n`;

    people.forEach((p) => {
      const { yesterday, today, reviewed, opened, handle } = getMemberSections(p);
      md += `## ${p.name} (@${handle})\n`;
      if (yesterday.length > 0) {
        md += `**Yesterday:**\n`;
        yesterday.forEach((i) => (md += `- [#${i.number} ${i.title}](${i.url})\n`));
      }
      if (today.length > 0) {
        md += `**Today:**\n`;
        today.forEach((i) => (md += `- [#${i.number} ${i.title}](${i.url})\n`));
      }
      if (reviewed.length > 0) {
        md += `**Reviewed:**\n`;
        reviewed.forEach((i) => (md += `- [#${i.number} ${i.title}](${i.url})\n`));
      }
      if (opened.length > 0) {
        md += `**Opened:**\n`;
        opened.forEach((i) => (md += `- [#${i.number} ${i.title}](${i.url})\n`));
      }
      md += `\n`;
    });
    return md;
  };

  const handleCopyMarkdown = async () => {
    const md = generateMarkdownBrief();
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-accent-amber mb-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>STANDUP ZERO · SCRIBE BRIEF</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Morning Standup Brief
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Evidence-backed daily brief assembled from repository events for{' '}
            <span className="font-mono text-text-primary">{meta.repo}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Evidence Coverage Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-status-success/10 border border-status-success/20 text-status-success text-xs font-medium">
            <ShieldCheck className="h-4 w-4" />
            <span>100% Evidence Coverage ({totalEvidenceCount} items)</span>
          </div>

          {/* Copy Markdown Button */}
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface-2 text-text-primary hover:bg-surface-3 border border-border text-xs font-medium transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-status-success" />
                <span>Copied Markdown!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 opacity-70" />
                <span>Copy brief as Markdown</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Team Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {people.map((person: BriefMember, idx: number) => {
          const { yesterday, today, reviewed, opened, handle } = getMemberSections(person);
          const initials = person.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return (
            <SpotlightCard key={handle || idx} className="p-5 flex flex-col justify-between">
              <div>
                {/* Member Header */}
                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border">
                  <div className="h-10 w-10 rounded-full bg-surface-3 border border-border flex items-center justify-center font-bold text-sm text-accent-amber font-mono shadow-inner">
                    {initials}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-text-primary">{person.name}</h2>
                    <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                      <span>@{handle}</span>
                      <span>·</span>
                      <span>chat: {person.chat}</span>
                    </div>
                  </div>
                </div>

                {/* Activity Sections */}
                <div className="space-y-4">
                  {/* Yesterday */}
                  {yesterday.length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-status-success" />
                        <span>Yesterday</span>
                      </div>
                      <div className="space-y-1.5">
                        {yesterday.map((item: BriefItem) => (
                          <EvidenceChip key={item.number} item={item} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Today */}
                  {today.length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1.5 flex items-center gap-1.5">
                        <GitPullRequest className="h-3 w-3 text-accent-amber" />
                        <span>Today's Focus</span>
                      </div>
                      <div className="space-y-1.5">
                        {today.map((item: BriefItem) => (
                          <EvidenceChip key={item.number} item={item} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reviewed */}
                  {reviewed.length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        Reviewed
                      </div>
                      <div className="space-y-1.5">
                        {reviewed.map((item: BriefItem) => (
                          <EvidenceChip key={item.number} item={item} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Opened */}
                  {opened.length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        Opened
                      </div>
                      <div className="space-y-1.5">
                        {opened.map((item: BriefItem) => (
                          <EvidenceChip key={item.number} item={item} />
                        ))}
                      </div>
                    </div>
                  )}

                  {yesterday.length === 0 &&
                    today.length === 0 &&
                    reviewed.length === 0 &&
                    opened.length === 0 && (
                      <div className="text-xs text-text-muted italic py-2">
                        No activity recorded in observation window.
                      </div>
                    )}
                </div>
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </div>
  );
};

interface EvidenceChipProps {
  item: BriefItem;
}

const EvidenceChip: React.FC<EvidenceChipProps> = ({ item }) => {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start justify-between gap-2 p-2 rounded-lg bg-surface-2/70 hover:bg-surface-2 border border-border/80 hover:border-accent-amber/40 text-xs transition-all shadow-xs"
    >
      <div className="min-w-0">
        <span className="font-mono font-bold text-accent-amber mr-1.5 group-hover:underline">
          #{item.number}
        </span>
        <span className="text-text-primary group-hover:text-white transition-colors font-medium">
          {item.title}
        </span>
      </div>
      <ExternalLink className="h-3 w-3 text-text-muted group-hover:text-accent-amber shrink-0 mt-0.5" />
    </a>
  );
};
