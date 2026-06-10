import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class RecurringTransactionModel extends Model {
  static table = 'recurring_transactions';

  @field('name') declare name: string;
  @field('tx_type') declare txType: string;
  @field('amount') declare amount: number;
  @field('currency') declare currency: string;
  @field('category_id') declare categoryId: string;
  @field('wallet_id') declare walletId: string;
  @field('note') declare note: string;
  @field('frequency') declare frequency: string;
  @field('next_due_date') declare nextDueDate: number;
  @field('is_active') declare isActive: boolean;
  @field('created_at') declare createdAt: number;
}
