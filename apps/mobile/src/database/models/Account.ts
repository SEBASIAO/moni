import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators';

export type AccountType = 'cash' | 'bank' | 'credit_card' | 'savings';

export class Account extends Model {
  static override table = 'accounts';

  @text('name') name!: string;
  @text('type') type!: AccountType;
  @field('cut_off_day') cutOffDay!: number | null;
  @field('payment_day') paymentDay!: number | null;
  @text('icon') icon!: string | null;
  @field('is_active') isActive!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  get isCreditCard(): boolean {
    return this.type === 'credit_card';
  }

  get isSavings(): boolean {
    return this.type === 'savings';
  }
}
