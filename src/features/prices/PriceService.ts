import { createMMKV } from 'react-native-mmkv';
import { database } from '../../shared/db/database';

const priceStore = createMMKV({ id: 'catat_artha_price_cache' });

export interface PriceData {
  symbol: string;
  priceIdr: number;
  priceUsd: number;
  change24h: number;
  source: string;
  fetchedAt: number;
}

const TTL_MS = 5 * 60 * 1000;

const CRYPTO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  SOL: 'solana',
  XRP: 'ripple',
  USDT: 'tether',
  USDC: 'usd-coin',
};

const GOLD_SYMBOLS = ['XAU'];

export const PriceService = {
  getCachedPrice(symbol: string): PriceData | null {
    const raw = priceStore.getString(`price:${symbol}`);
    if (raw === undefined) return null;
    try {
      const data = JSON.parse(raw) as PriceData;
      if (Date.now() - data.fetchedAt > TTL_MS) return null;
      return data;
    } catch {
      return null;
    }
  },

  setCachedPrice(data: PriceData): void {
    priceStore.set(`price:${data.symbol}`, JSON.stringify(data));
  },

  async fetchCryptoPrice(symbol: string): Promise<PriceData | null> {
    const cached = PriceService.getCachedPrice(symbol);
    if (cached !== null) return cached;

    const coinId = CRYPTO_IDS[symbol];
    if (coinId === undefined) return null;

    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=idr,usd&include_24hr_change=true`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!resp.ok) return null;
      const json = (await resp.json()) as Record<
        string,
        { idr: number; usd: number; idr_24h_change: number }
      >;
      const raw = json[coinId];
      if (raw === undefined) return null;

      const data: PriceData = {
        symbol,
        priceIdr: raw.idr,
        priceUsd: raw.usd,
        change24h: raw.idr_24h_change,
        source: 'coingecko',
        fetchedAt: Date.now(),
      };
      PriceService.setCachedPrice(data);
      await PriceService.persistToDb(data);
      return data;
    } catch {
      return null;
    }
  },

  async fetchGoldPrice(): Promise<PriceData | null> {
    const cached = PriceService.getCachedPrice('XAU');
    if (cached !== null) return cached;

    try {
      const url = 'https://logam-mulia-api.vercel.app/prices/antam';
      const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!resp.ok) return null;
      const json = (await resp.json()) as { buy: number; sell: number };

      const data: PriceData = {
        symbol: 'XAU',
        priceIdr: json.buy,
        priceUsd: 0,
        change24h: 0,
        source: 'antam',
        fetchedAt: Date.now(),
      };
      PriceService.setCachedPrice(data);
      await PriceService.persistToDb(data);
      return data;
    } catch {
      return null;
    }
  },

  async fetchPrice(symbol: string): Promise<PriceData | null> {
    if (GOLD_SYMBOLS.includes(symbol)) return PriceService.fetchGoldPrice();
    if (symbol in CRYPTO_IDS) return PriceService.fetchCryptoPrice(symbol);
    return null;
  },

  async fetchMultiple(symbols: string[]): Promise<Map<string, PriceData>> {
    const results = new Map<string, PriceData>();
    await Promise.allSettled(
      symbols.map(async (s) => {
        const d = await PriceService.fetchPrice(s);
        if (d !== null) results.set(s, d);
      }),
    );
    return results;
  },

  async persistToDb(data: PriceData): Promise<void> {
    try {
      const table = database.get('price_cache');
      await database.write(async () => {
        await table.create((record) => {
          (record as unknown as { symbol: string; priceIdr: number; priceUsd: number; change24h: number; source: string; fetchedAt: number }).symbol = data.symbol;
          (record as unknown as { priceIdr: number }).priceIdr = data.priceIdr;
          (record as unknown as { priceUsd: number }).priceUsd = data.priceUsd;
          (record as unknown as { change24h: number }).change24h = data.change24h;
          (record as unknown as { source: string }).source = data.source;
          (record as unknown as { fetchedAt: number }).fetchedAt = data.fetchedAt;
        });
      });
    } catch {
    }
  },
};
