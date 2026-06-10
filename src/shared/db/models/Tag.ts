import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class TagModel extends Model {
  static table = 'tags';

  @field('name') declare name: string;
  @field('color') declare color: string;
  @field('use_count') declare useCount: number;
  @field('created_at') declare createdAt: number;
}
