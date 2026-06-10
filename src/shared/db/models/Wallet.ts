import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class WalletModel extends Model {
  static table = 'wallets';

  @field('name') declare name: string;
  @field('icon') declare icon: string;
  @field('color') declare color: string;
  @field('currency') declare currency: string;
  @field('initial_balance') declare initialBalance: number;
  @field('is_archived') declare isArchived: boolean;
  @field('sort_order') declare sortOrder: number;
  @field('wallet_type') declare walletType: string;
  @field('show_in_dashboard') declare showInDashboard: boolean;
  @field('include_in_total') declare includeInTotal: boolean;
  @field('created_at') declare createdAt: number;
}
