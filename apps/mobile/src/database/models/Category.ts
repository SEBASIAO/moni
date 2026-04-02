import { Model } from '@nozbe/watermelondb';
import { children, field, date, readonly, text } from '@nozbe/watermelondb/decorators';

import type { Transaction } from './Transaction';

export type CategoryType = 'fixed' | 'variable' | 'savings' | 'debt';

export class Category extends Model {
  static override table = 'categories';

  static override associations = {
    transactions: { type: 'has_many' as const, foreignKey: 'category_id' },
  };

  @text('name') name!: string;
  @text('type') type!: CategoryType;
  @field('monthly_budget') monthlyBudget!: number;
  @text('icon') icon!: string | null;
  @text('color') color!: string | null;
  @field('sort_order') sortOrder!: number;
  @field('is_active') isActive!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('transactions') transactions!: Transaction[];
}
