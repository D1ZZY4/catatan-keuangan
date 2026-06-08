import { db } from "@/shared/db/db";

interface FrankfurterResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

interface CoinGeckoResponse {
  bitcoin?: { idr?: number; usd?: number };
  ethereum?: { idr?: number; usd?: number };
  ripple?: { idr?: number; usd?: number };
  binancecoin?: { idr?: number; usd?: number };
  solana?: { idr?: number; usd?: number };
}

const COIN_ID_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  XRP: "ripple",
  BNB: "binancecoin",
  SOL: "solana",
};

const TROY_OZ_TO_GRAM = 31.1035;

async function getCachedValue<T>(key: string, maxAgeMs: number): Promise<T | null> {
  const row = await db.price_cache.get(key);
  if (!row) return null;
  if (Date.now() - row.fetchedAt > maxAgeMs) return null;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return null;
  }
}

async function setCachedValue(key: string, value: unknown): Promise<void> {
  await db.price_cache.put({ key, value: JSON.stringify(value), fetchedAt: Date.now() });
}

export interface PriceStatus {
  stale: boolean;
  lastUpdated: number | null;
}

class PriceService {
  async getExchangeRates(base: string): Promise<Record<string, number>> {
    const cacheKey = `fx:${base}`;
    const cached = await getCachedValue<Record<string, number>>(cacheKey, 4 * 3600 * 1000);
    if (cached) return cached;

    try {
      const res = await fetch(`https://api.frankfurter.app/latest?from=${base}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = (await res.json()) as FrankfurterResponse;
      await setCachedValue(cacheKey, data.rates);
      return data.rates;
    } catch {
      const stale = await db.price_cache.get(cacheKey);
      if (stale) return JSON.parse(stale.value) as Record<string, number>;
      return {};
    }
  }

  async getCryptoPrices(): Promise<Record<string, number>> {
    const cacheKey = "crypto:idr";
    const cached = await getCachedValue<Record<string, number>>(cacheKey, 15 * 60 * 1000);
    if (cached) return cached;

    try {
      const ids = Object.values(COIN_ID_MAP).join(",");
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=idr,usd`,
      );
      if (!res.ok) throw new Error("fetch failed");
      const data = (await res.json()) as CoinGeckoResponse;
      const prices: Record<string, number> = {};
      for (const [code, coinId] of Object.entries(COIN_ID_MAP)) {
        const entry = data[coinId as keyof CoinGeckoResponse];
        if (entry?.idr !== undefined) prices[code] = entry.idr;
      }
      await setCachedValue(cacheKey, prices);
      return prices;
    } catch {
      const stale = await db.price_cache.get(cacheKey);
      if (stale) return JSON.parse(stale.value) as Record<string, number>;
      return {};
    }
  }

  async getGoldPriceIDR(): Promise<number | null> {
    const cacheKey = "gold:idr";
    const cached = await getCachedValue<number>(cacheKey, 3600 * 1000);
    if (cached !== null) return cached;

    try {
      const rates = await this.getExchangeRates("USD");
      const idrPerUsd = rates["IDR"];
      if (idrPerUsd === undefined) return null;
      const xauRates = await this.getExchangeRates("XAU");
      const usdPerOz = xauRates["USD"] !== undefined ? 1 / xauRates["USD"] : null;
      if (usdPerOz === null) return null;
      const idrPerOz = usdPerOz * idrPerUsd;
      const idrPerGram = idrPerOz / TROY_OZ_TO_GRAM;
      await setCachedValue(cacheKey, idrPerGram);
      return idrPerGram;
    } catch {
      const stale = await db.price_cache.get(cacheKey);
      if (stale) return JSON.parse(stale.value) as number;
      return null;
    }
  }

  async getPrice(currency: string, baseCurrency: string): Promise<number | null> {
    if (currency === baseCurrency) return 1;

    const cryptoCodes = new Set(Object.keys(COIN_ID_MAP));

    if (cryptoCodes.has(currency)) {
      const prices = await this.getCryptoPrices();
      const priceInIDR = prices[currency];
      if (priceInIDR === undefined) return null;
      if (baseCurrency === "IDR") return priceInIDR;
      const fxRates = await this.getExchangeRates("IDR");
      const rate = fxRates[baseCurrency];
      return rate !== undefined ? priceInIDR * rate : null;
    }

    if (currency === "XAU") {
      const idrPerGram = await this.getGoldPriceIDR();
      if (idrPerGram === null) return null;
      if (baseCurrency === "IDR") return idrPerGram;
      const fxRates = await this.getExchangeRates("IDR");
      const rate = fxRates[baseCurrency];
      return rate !== undefined ? idrPerGram * rate : null;
    }

    const rates = await this.getExchangeRates(currency);
    return rates[baseCurrency] ?? null;
  }

  async getLastUpdated(key: string): Promise<number | null> {
    const row = await db.price_cache.get(key);
    return row?.fetchedAt ?? null;
  }
}

export const priceService = new PriceService();
