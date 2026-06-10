import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class UsagePatternModel extends Model {
  static table = 'usage_patterns';

  @field('event_type') declare eventType: string;
  @field('payload') declare payload: string;
  @field('ts') declare ts: number;
}
