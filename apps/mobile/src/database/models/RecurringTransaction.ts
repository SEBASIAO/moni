import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, text, relation } from '@nozbe/watermelondb/decorators';

import type { Account } from './Account';
import type { Category } from './Category';

export type RecurringFrequency = 'monthly';

export class RecurringTransaction extends Model {
  static override table = 'recurring_transactions';

  static override associations = {
    categories: { type: 'belongs_to' as const, key: 'category_id' },
    accounts: { type: 'belongs_to' as const, key: 'account_id' },
  };

  @text('name') name!: string;
  @field('amount') amount!: number;
  @text('category_id') categoryId!: string;
  @text('account_id') accountId!: string;
  @text('frequency') frequency!: RecurringFrequency;
  @field('day_of_month') dayOfMonth!: number;
  @field('is_active') isActive!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('categories', 'category_id') category!: Category;
  @relation('accounts', 'account_id') account!: Account;
}
