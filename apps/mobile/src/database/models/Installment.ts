import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, relation, text } from '@nozbe/watermelondb/decorators';

import type { Account } from './Account';
import type { Transaction } from './Transaction';

export class Installment extends Model {
  static override table = 'installments';

  static override associations = {
    transactions: { type: 'belongs_to' as const, key: 'transaction_id' },
    accounts: { type: 'belongs_to' as const, key: 'account_id' },
  };

  @text('transaction_id') transactionId!: string;
  @text('account_id') accountId!: string;
  @field('installment_number') installmentNumber!: number;
  @field('total_installments') totalInstallments!: number;
  @field('amount') amount!: number;
  @field('due_year') dueYear!: number;
  @field('due_month') dueMonth!: number;
  @field('is_paid') isPaid!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('transactions', 'transaction_id') transaction!: Transaction;
  @relation('accounts', 'account_id') account!: Account;

  get label(): string {
    return `${this.installmentNumber}/${this.totalInstallments}`;
  }
}
