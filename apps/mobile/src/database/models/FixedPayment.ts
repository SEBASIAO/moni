import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators';

export class FixedPayment extends Model {
  static override table = 'fixed_payments';

  @text('name') name!: string;
  @field('budgeted_amount') budgetedAmount!: number;
  @field('actual_amount') actualAmount!: number | null;
  @field('payment_day') paymentDay!: number;
  @field('is_recurring') isRecurring!: boolean;
  @field('is_paid') isPaid!: boolean;
  @field('period_year') periodYear!: number;
  @field('period_month') periodMonth!: number;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  get effectiveAmount(): number {
    return this.actualAmount ?? this.budgetedAmount;
  }

  get difference(): number {
    if (this.actualAmount == null) return 0;
    return this.budgetedAmount - this.actualAmount;
  }
}
