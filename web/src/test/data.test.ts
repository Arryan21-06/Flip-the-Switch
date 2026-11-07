import { describe, it, expect } from 'vitest';
import { DEMO_DATASET } from '../data/mockData';

describe('Demo Dataset & Invariants', () => {
  it('has valid structure with all required top-level sections', () => {
    expect(DEMO_DATASET.mode).toBe('demo');
    expect(DEMO_DATASET.analysis).toBeDefined();
    expect(DEMO_DATASET.brief).toBeDefined();
    expect(DEMO_DATASET.rules).toBeDefined();
    expect(DEMO_DATASET.ledger).toBeDefined();
    expect(DEMO_DATASET.metrics).toBeDefined();
    expect(DEMO_DATASET.doctor).toBeDefined();
  });

  it('proposals have strictly valid targets and urls', () => {
    const proposals = DEMO_DATASET.analysis.proposals;
    expect(proposals.length).toBeGreaterThan(0);
    proposals.forEach((p) => {
      expect(p.target.url).toMatch(/^https:\/\/github\.com\//);
      expect(p.target.number).toBeGreaterThan(0);
      expect(['pr', 'issue']).toContain(p.target.kind);
      expect(['stuck', 'warning']).toContain(p.severity);
      expect(p.actions.length).toBeGreaterThan(0);
    });
  });

  it('early-warning flags have points as numbers, not percentages', () => {
    const warnings = DEMO_DATASET.analysis.proposals.filter(
      (p) => p.severity === 'warning'
    );
    warnings.forEach((w) => {
      expect(typeof w.points).toBe('number');
      expect(w.points).toBeGreaterThan(0);
      expect(['Watch', 'At risk', 'High']).toContain(w.tier);
    });
  });

  it('brief members all have evidence-linked activity or honest empty state', () => {
    const people = DEMO_DATASET.brief.people;
    expect(people.length).toBeGreaterThan(0);
    people.forEach((person) => {
      expect(person.name).toBeTruthy();
      expect(person.chat).toBeTruthy();
    });
  });

  it('ledger contains valid SHA-256 digests of 64 hex characters', () => {
    const decisions = DEMO_DATASET.ledger.decisions;
    expect(decisions.length).toBeGreaterThan(0);
    decisions.forEach((d) => {
      expect(d.digest).toMatch(/^[0-9a-f]{64}$/);
      expect(['approve', 'skip', 'snooze']).toContain(d.action);
    });
  });
});

