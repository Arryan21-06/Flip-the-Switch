import { describe, it, expect } from 'vitest';
import {
  getApproveCommand,
  getSkipCommand,
  getSnoozeCommand,
  getRuleSetCommand,
} from '../data/source';

describe('Chat Command Generators', () => {
  it('generates approve commands for single and multiple indices', () => {
    expect(getApproveCommand([1])).toBe('approve 1');
    expect(getApproveCommand([1, 2, 5])).toBe('approve 1 2 5');
  });

  it('filters out null, undefined, and non-positive numbers from approve', () => {
    expect(getApproveCommand([1, null, 3, undefined, 0])).toBe('approve 1 3');
  });

  it('generates skip command', () => {
    expect(getSkipCommand([2])).toBe('skip 2');
    expect(getSkipCommand([2, 4])).toBe('skip 2 4');
  });

  it('generates snooze command with default and specified durations', () => {
    expect(getSnoozeCommand(3)).toBe('snooze 3 2d');
    expect(getSnoozeCommand(3, '1d')).toBe('snooze 3 1d');
    expect(getSnoozeCommand(3, '1w')).toBe('snooze 3 1w');
  });

  it('generates rules set commands', () => {
    expect(getRuleSetCommand('early_warning.grace_hours', 0)).toBe(
      'rules set early_warning.grace_hours 0'
    );
    expect(getRuleSetCommand('limits.max_warning_proposals', 1)).toBe(
      'rules set limits.max_warning_proposals 1'
    );
    expect(getRuleSetCommand('stuck.review_sla_hours', 12)).toBe(
      'rules set stuck.review_sla_hours 12'
    );
  });
});
