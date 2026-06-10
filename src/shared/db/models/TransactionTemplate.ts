import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class TransactionTemplateModel extends Model {
  static table = 'transaction_templates';

  @field('name') declare name: string;
  @field('tx_type') declare txType: string;
  @field('category_id') declare categoryId: string;
  @field('wallet_id') declare walletId: string;
  @field('amount') declare amount: number;
  @field('note') declare note: string;
  @field('created_at') declare createdAt: number;
}
