import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators';

export type IncomeFrequency = 'monthly' | 'biweekly' | 'one_time';

export class Income extends Model {
  static override table = 'incomes';

  @text('name') name!: string;
  @field('expected_amount') expectedAmount!: number;
  @field('actual_amount') actualAmount!: number | null;
  @field('expected_date') expectedDate!: number;
  @field('is_recurring') isRecurring!: boolean;
  @text('frequency') frequency!: IncomeFrequency;
  @field('period_year') periodYear!: number;
  @field('period_month') periodMonth!: number;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  get effectiveAmount(): number {
    return this.actualAmount ?? this.expectedAmount;
  }
}
