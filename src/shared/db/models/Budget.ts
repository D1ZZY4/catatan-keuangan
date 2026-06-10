import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class BudgetModel extends Model {
  static table = 'budgets';

  @field('category_id') declare categoryId: string;
  @field('amount') declare amount: number;
  @field('currency') declare currency: string;
  @field('period') declare period: string;
  @field('month') declare month: number;
  @field('year') declare year: number;
  @field('notify_at') declare notifyAt: number;
  @field('created_at') declare createdAt: number;
}
