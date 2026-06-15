import { colors } from '../theme';
import type { Envelope, EnvelopeFilter, EnvelopeStatus, TransactionCategory } from '../types';

export type StatusColorKey =
  | 'healthy'
  | 'atRisk'
  | 'critical'
  | 'exhausted'
  | 'textGrey';

export function getEnvelopePercent(envelope: Envelope): number {
  if (envelope.monthlyLimit <= 0) {
    return 0;
  }

  return Math.min(
    Math.round((envelope.currentSpend / envelope.monthlyLimit) * 100),
    100,
  );
}

export function getEnvelopeStatus(envelope: Envelope): EnvelopeStatus {
  const percent = getEnvelopePercent(envelope);

  if (percent >= 100) {
    return 'exhausted';
  }

  if (percent >= 80) {
    return 'critical';
  }

  if (percent >= 60) {
    return 'atRisk';
  }

  return 'healthy';
}

export function getStatusLabel(status: EnvelopeStatus): string {
  const labels: Record<EnvelopeStatus, string> = {
    healthy: 'Healthy',
    atRisk: 'At Risk',
    critical: 'Critical',
    exhausted: 'Exhausted',
  };

  return labels[status];
}

export function getStatusColorKey(status: EnvelopeStatus): StatusColorKey {
  return status;
}

export function getStatusColor(status: EnvelopeStatus): string {
  const map: Record<EnvelopeStatus, string> = {
    healthy: colors.healthy,
    atRisk: colors.atRisk,
    critical: colors.critical,
    exhausted: colors.exhausted,
  };

  return map[status];
}

export function getRemainingBudget(envelope: Envelope): number {
  return Math.max(envelope.monthlyLimit - envelope.currentSpend, 0);
}

export function filterEnvelopes(
  envelopes: Envelope[],
  filter: EnvelopeFilter,
): Envelope[] {
  if (filter === 'All') {
    return envelopes;
  }

  const filterMap: Record<Exclude<EnvelopeFilter, 'All'>, EnvelopeStatus> = {
    Healthy: 'healthy',
    'At Risk': 'atRisk',
    Critical: 'critical',
    Exhausted: 'exhausted',
  };

  const targetStatus = filterMap[filter];
  return envelopes.filter((envelope) => getEnvelopeStatus(envelope) === targetStatus);
}

export function countByStatus(envelopes: Envelope[]): {
  healthy: number;
  atRisk: number;
  critical: number;
  exhausted: number;
} {
  return envelopes.reduce(
    (counts, envelope) => {
      const status = getEnvelopeStatus(envelope);
      counts[status] += 1;
      return counts;
    },
    { healthy: 0, atRisk: 0, critical: 0, exhausted: 0 },
  );
}

export function hasCategoryThisMonth(
  envelopes: Envelope[],
  category: TransactionCategory,
  month: number,
  year: number,
): boolean {
  return envelopes.some(
    (envelope) =>
      envelope.category === category &&
      envelope.month === month &&
      envelope.year === year,
  );
}

export function formatMonthYear(month: number, year: number): string {
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('en-GH', { month: 'long', year: 'numeric' });
}

export function getEmptyFilterMessage(filter: EnvelopeFilter): {
  title: string;
  subtitle: string;
} {
  if (filter === 'Healthy') {
    return {
      title: 'No Healthy envelopes',
      subtitle: 'All your envelopes are in good shape!',
    };
  }

  if (filter === 'At Risk') {
    return {
      title: 'No At Risk envelopes',
      subtitle: 'All your envelopes are in good shape!',
    };
  }

  if (filter === 'Critical') {
    return {
      title: 'No Critical envelopes',
      subtitle: 'All your envelopes are in good shape!',
    };
  }

  if (filter === 'Exhausted') {
    return {
      title: 'No Exhausted envelopes',
      subtitle: 'All your envelopes are in good shape!',
    };
  }

  return {
    title: 'No budget envelopes',
    subtitle: 'Tap the + button to set your first monthly spending limit',
  };
}
