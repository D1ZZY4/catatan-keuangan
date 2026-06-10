import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class ReminderModel extends Model {
  static table = 'reminders';

  @field('name') declare name: string;
  @field('amount') declare amount: number;
  @field('currency') declare currency: string;
  @field('due_day') declare dueDay: number;
  @field('period') declare period: string;
  @field('category') declare category: string;
  @field('notify_days_before') declare notifyDaysBefore: number;
  @field('is_active') declare isActive: boolean;
  @field('created_at') declare createdAt: number;
}
