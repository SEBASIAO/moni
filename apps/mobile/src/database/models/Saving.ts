import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, relation, text } from '@nozbe/watermelondb/decorators';

import type { Account } from './Account';
import type { Category } from './Category';

export class Saving extends Model {
  static override table = 'savings';

  static override associations = {
    categories: { type: 'belongs_to' as const, key: 'linked_category_id' },
    accounts: { type: 'belongs_to' as const, key: 'linked_account_id' },
  };

  @text('name') name!: string;
  @field('target_amount') targetAmount!: number | null;
  @field('current_amount') currentAmount!: number;
  @text('icon') icon!: string | null;
  @text('color') color!: string | null;
  @text('linked_category_id') linkedCategoryId!: string;
  @text('linked_account_id') linkedAccountId!: string;
  @field('is_active') isActive!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('categories', 'linked_category_id') category!: Category;
  @relation('accounts', 'linked_account_id') account!: Account;

  get hasTarget(): boolean {
    return this.targetAmount != null;
  }
}
