import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class CategoryModel extends Model {
  static table = 'categories';

  @field('name') declare name: string;
  @field('icon') declare icon: string;
  @field('color') declare color: string;
  @field('category_type') declare categoryType: string;
  @field('is_default') declare isDefault: boolean;
  @field('created_at') declare createdAt: number;
}
