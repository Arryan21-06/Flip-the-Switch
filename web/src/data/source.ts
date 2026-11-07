import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DaybreakDataset, DataSourceMode } from '../types/daybreak';
import { DEMO_DATASET } from './mockData';

// Fetch helper for Live API mode
async function fetchLiveData(): Promise<DaybreakDataset> {
  const [analysisRes, briefRes, rulesRes, ledgerRes, metricsRes, doctorRes] = await Promise.all([
    fetch('/api/proposals'),
    fetch('/api/brief'),
    fetch('/api/rules'),
    fetch('/api/ledger'),
    fetch('/api/metrics'),
    fetch('/api/doctor'),
  ]);

  if (!analysisRes.ok) {
    throw new Error(`Failed to fetch proposals: ${analysisRes.statusText}`);
  }

  const analysis = await analysisRes.json();
  const brief = briefRes.ok ? await briefRes.json() : DEMO_DATASET.brief;
  const rules = rulesRes.ok ? await rulesRes.json() : DEMO_DATASET.rules;
  const ledger = ledgerRes.ok ? await ledgerRes.json() : DEMO_DATASET.ledger;
  const metrics = metricsRes.ok ? await metricsRes.json() : DEMO_DATASET.metrics;
  const doctor = doctorRes.ok ? await doctorRes.json() : DEMO_DATASET.doctor;

  return {
    mode: 'live',
    analysis,
    brief,
    rules,
    ledger,
    metrics,
    doctor,
    lastUpdated: new Date().toISOString(),
  };
}

// Check if live API server is accessible
export async function checkLiveHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/health', { method: 'GET', signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch {
    return false;
  }
}

export function useDaybreakData() {
  const [mode, setMode] = useState<DataSourceMode>('demo');
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [detectedLive, setDetectedLive] = useState<boolean>(false);

  // Auto-detect live API server on mount
  useEffect(() => {
    checkLiveHealth().then((isAvailable) => {
      if (isAvailable) {
        setDetectedLive(true);
        setMode('live');
      }
    });
  }, []);

  const query = useQuery<DaybreakDataset, Error>({
    queryKey: ['daybreak-dataset', mode],
    queryFn: async () => {
      if (mode === 'demo') {
        return DEMO_DATASET;
      }
      return fetchLiveData();
    },
    refetchInterval: isPolling && mode === 'live' ? 10000 : false,
    staleTime: 5000,
  });

  return {
    data: query.data || DEMO_DATASET,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    mode,
    setMode,
    isPolling,
    setIsPolling,
    detectedLive,
    refetch: query.refetch,
    lastUpdated: query.data?.lastUpdated || new Date().toISOString(),
  };
}

// Copy command string generators
export function getApproveCommand(indices: (number | null | undefined)[]): string {
  const valid = indices.filter((i): i is number => typeof i === 'number' && i > 0);
  return `approve ${valid.join(' ')}`;
}

export function getSkipCommand(indices: (number | null | undefined)[]): string {
  const valid = indices.filter((i): i is number => typeof i === 'number' && i > 0);
  return `skip ${valid.join(' ')}`;
}

export function getSnoozeCommand(
  index: number | null | undefined,
  duration: '1d' | '2d' | '1w' = '2d'
): string {
  return `snooze ${index ?? 1} ${duration}`;
}

export function getRuleSetCommand(key: string, value: string | number): string {
  return `rules set ${key} ${value}`;
}
