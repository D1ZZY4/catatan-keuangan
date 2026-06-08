import { useCallback, useEffect, useRef, useState } from "react";
import { priceService } from "@/shared/services/PriceService";

export interface PriceMap {
  [currency: string]: number | null;
}

export interface UsePricesResult {
  prices: PriceMap;
  loading: boolean;
  stale: boolean;
  lastUpdated: number | null;
  refresh: () => Promise<void>;
}

export function usePrices(currencies: string[], baseCurrency = "IDR"): UsePricesResult {
  const [prices, setPrices] = useState<PriceMap>({});
  const [loading, setLoading] = useState(false);
  const [stale, setStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const key = currencies.slice().sort().join(",") + ":" + baseCurrency;
  const prevKey = useRef<string>("");

  const refresh = useCallback(async () => {
    const uniqueNonBase = [...new Set(currencies.filter((c) => c !== baseCurrency))];
    if (uniqueNonBase.length === 0) {
      setPrices({});
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result: PriceMap = {};
      await Promise.all(
        uniqueNonBase.map(async (currency) => {
          try {
            result[currency] = await priceService.getPrice(currency, baseCurrency);
          } catch {
            result[currency] = null;
          }
        }),
      );
      setPrices(result);
      setLastUpdated(Date.now());
      setStale(false);
    } catch {
      setStale(true);
    } finally {
      setLoading(false);
    }
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (prevKey.current === key) return;
    prevKey.current = key;
    void refresh();
  }, [key, refresh]);

  return { prices, loading, stale, lastUpdated, refresh };
}
