import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class TransactionModel extends Model {
  static table = 'transactions';

  @field('tx_type') declare txType: string;
  @field('amount') declare amount: number;
  @field('currency') declare currency: string;
  @field('wallet_id') declare walletId: string;
  @field('to_wallet_id') declare toWalletId: string;
  @field('category_id') declare categoryId: string;
  @field('date') declare date: number;
  @field('note') declare note: string;
  @field('attachment_base64') declare attachmentBase64: string;
  @field('linked_person_name') declare linkedPersonName: string;
  @field('linked_person_phone') declare linkedPersonPhone: string;
  @field('is_split_of') declare isSplitOf: string;
  @field('tags') declare tags: string;
  @field('created_at') declare createdAt: number;
  @field('updated_at') declare updatedAt: number;
}
