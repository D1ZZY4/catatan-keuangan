import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class PriceCacheModel extends Model {
  static table = 'price_cache';

  @field('symbol') declare symbol: string;
  @field('price_idr') declare priceIdr: number;
  @field('price_usd') declare priceUsd: number;
  @field('change_24h') declare change24h: number;
  @field('source') declare source: string;
  @field('fetched_at') declare fetchedAt: number;
}
