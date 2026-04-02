import { Model } from '@nozbe/watermelondb';
import {
  children,
  field,
  date,
  readonly,
  relation,
  text,
} from '@nozbe/watermelondb/decorators';

import type { Account } from './Account';
import type { Category } from './Category';
import type { Installment } from './Installment';

export class Transaction extends Model {
  static override table = 'transactions';

  static override associations = {
    categories: { type: 'belongs_to' as const, key: 'category_id' },
    accounts: { type: 'belongs_to' as const, key: 'account_id' },
    installments: { type: 'has_many' as const, foreignKey: 'transaction_id' },
  };

  @field('total_amount') totalAmount!: number;
  @field('my_amount') myAmount!: number;
  @text('description') description!: string;
  @field('date') transactionDate!: number;
  @text('category_id') categoryId!: string;
  @text('account_id') accountId!: string;
  @field('total_installments') totalInstallments!: number;
  @field('is_subscription') isSubscription!: boolean;
  @text('note') note!: string | null;
  @text('recurring_transaction_id') recurringTransactionId!: string | null;
  @field('period_year') periodYear!: number;
  @field('period_month') periodMonth!: number;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('categories', 'category_id') category!: Category;
  @relation('accounts', 'account_id') account!: Account;
  @children('installments') installments!: Installment[];

  get isInstallment(): boolean {
    return this.totalInstallments > 1;
  }

  get isSplit(): boolean {
    return this.myAmount !== this.totalAmount;
  }
}
