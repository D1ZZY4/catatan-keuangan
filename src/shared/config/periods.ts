import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
} from 'date-fns';
import { AppLabels } from './labels';

export type PeriodKey =
  | 'today'
  | 'last7days'
  | 'thisMonth'
  | 'last3months'
  | 'last6months'
  | 'thisYear'
  | 'custom'
  | 'all';

export interface PeriodDefinition {
  key: PeriodKey;
  label: string;
  getRange: () => { from: Date; to: Date } | null;
}

export const AppConfig = {
  periods: [
    {
      key: 'today' as const,
      label: AppLabels.periodLabels.today,
      getRange: () => ({
        from: startOfDay(new Date()),
        to: endOfDay(new Date()),
      }),
    },
    {
      key: 'last7days' as const,
      label: AppLabels.periodLabels.last7days,
      getRange: () => ({ from: subDays(new Date(), 7), to: new Date() }),
    },
    {
      key: 'thisMonth' as const,
      label: AppLabels.periodLabels.thisMonth,
      getRange: () => ({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      }),
    },
    {
      key: 'last3months' as const,
      label: AppLabels.periodLabels.last3months,
      getRange: () => ({ from: subMonths(new Date(), 3), to: new Date() }),
    },
    {
      key: 'last6months' as const,
      label: AppLabels.periodLabels.last6months,
      getRange: () => ({ from: subMonths(new Date(), 6), to: new Date() }),
    },
    {
      key: 'thisYear' as const,
      label: AppLabels.periodLabels.thisYear,
      getRange: () => ({
        from: startOfYear(new Date()),
        to: endOfYear(new Date()),
      }),
    },
    {
      key: 'custom' as const,
      label: AppLabels.periodLabels.custom,
      getRange: () => null,
    },
    {
      key: 'all' as const,
      label: AppLabels.periodLabels.all,
      getRange: () => null,
    },
  ] satisfies PeriodDefinition[],

  defaults: {
    notifyDaysBefore: 3,
    budgetNotifyAt: 80,
    lockAfterSeconds: 60,
    pinCooldownSeconds: 30,
    maxPinAttempts: 5,
    calculatorHistoryCount: 5,
    priceRefreshIntervalMs: {
      fiat: 4 * 60 * 60 * 1000,
      crypto: 15 * 60 * 1000,
      gold: 60 * 60 * 1000,
    },
    searchDebounceMs: 150,
    tourAutoAdvanceMs: 4000,
    listWindowSize: 10,
    listMaxToRenderPerBatch: 10,
    listInitialNumToRender: 15,
  },
} as const;
