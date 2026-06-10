import { useCallback, useEffect, useState } from 'react';
import { createMMKV } from 'react-native-mmkv';
import { AppConfig } from '../config/periods';
import { formatDate } from '../utils/formatters';

const store = createMMKV({ id: 'currency-rates' });
const RATES_KEY = 'exchange_rates_v1';
const TIMESTAMP_KEY = 'exchange_rates_ts_v1';

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  lastUpdated: number;
}

const FALLBACK_RATES: Record<string, number> = {
  IDR: 1,
  USD: 16500,
  EUR: 18200,
  SGD: 12400,
  MYR: 3600,
  JPY: 110,
  GBP: 21000,
  AUD: 10800,
};

async function fetchRates(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/IDR', {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      result: string;
      rates: Record<string, number>;
    };
    if (data.result !== 'success') return null;
    const normalised: Record<string, number> = {};
    for (const [k, v] of Object.entries(data.rates)) {
      normalised[k] = v === 0 ? 0 : 1 / v;
    }
    return normalised;
  } catch {
    return null;
  }
}

export function useCurrencyRates(): {
  rates: ExchangeRates;
  isOffline: boolean;
  offlineDate: string;
  refresh: () => Promise<void>;
} {
  const [rates, setRates] = useState<ExchangeRates>(() => {
    const raw = store.getString(RATES_KEY);
    const ts = store.getNumber(TIMESTAMP_KEY) ?? 0;
    const parsed =
      raw !== undefined ? (JSON.parse(raw) as Record<string, number>) : null;
    return {
      base: 'IDR',
      rates: parsed ?? FALLBACK_RATES,
      lastUpdated: ts,
    };
  });

  const [isOffline, setIsOffline] = useState(false);

  const refresh = useCallback(async () => {
    const lastTs = store.getNumber(TIMESTAMP_KEY) ?? 0;
    const elapsed = Date.now() - lastTs;
    if (elapsed < AppConfig.defaults.priceRefreshIntervalMs.fiat) return;

    const fetched = await fetchRates();
    if (fetched === null) {
      setIsOffline(true);
      return;
    }
    setIsOffline(false);
    const updated: ExchangeRates = {
      base: 'IDR',
      rates: fetched,
      lastUpdated: Date.now(),
    };
    store.set(RATES_KEY, JSON.stringify(fetched));
    store.set(TIMESTAMP_KEY, Date.now());
    setRates(updated);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const offlineDate = formatDate(rates.lastUpdated || Date.now(), 'short');

  return { rates, isOffline, offlineDate, refresh };
}

export function convertAmount(
  amount: number,
  from: string,
  to: string,
  rates: ExchangeRates,
): number {
  if (from === to) return amount;
  const fromRate = rates.rates[from] ?? FALLBACK_RATES[from] ?? 1;
  const toRate = rates.rates[to] ?? FALLBACK_RATES[to] ?? 1;
  return (amount / fromRate) * toRate;
}
