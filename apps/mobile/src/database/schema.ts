import { appSchema, tableSchema } from '@nozbe/watermelondb';

/**
 * Moni database schema v2.
 *
 * Tables:
 * - accounts: Payment methods (cash, debit, credit cards)
 * - incomes: Monthly income sources
 * - categories: Spending categories with budgets
 * - transactions: Every expense/purchase
 * - installments: Individual cuotas generated from transactions with cuotas > 1
 * - fixed_payments: Recurring monthly payments (rent, car, ICETEX, etc.)
 * - monthly_periods: Month-level aggregation and state
 * - recurring_transactions: Templates for auto-generated subscription transactions
 */
export const moniSchema = appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: 'accounts',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'type', type: 'string' }, // 'cash' | 'bank' | 'credit_card'
        { name: 'cut_off_day', type: 'number', isOptional: true }, // TC only
        { name: 'payment_day', type: 'number', isOptional: true }, // TC only
        { name: 'icon', type: 'string', isOptional: true },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'incomes',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'expected_amount', type: 'number' },
        { name: 'actual_amount', type: 'number', isOptional: true },
        { name: 'expected_date', type: 'number' },
        { name: 'is_recurring', type: 'boolean' },
        { name: 'frequency', type: 'string' }, // 'monthly' | 'biweekly' | 'one_time'
        { name: 'period_year', type: 'number' },
        { name: 'period_month', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'categories',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'type', type: 'string' }, // 'fixed' | 'variable' | 'savings' | 'debt'
        { name: 'monthly_budget', type: 'number' },
        { name: 'icon', type: 'string', isOptional: true },
        { name: 'color', type: 'string', isOptional: true },
        { name: 'sort_order', type: 'number' },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'transactions',
      columns: [
        { name: 'total_amount', type: 'number' }, // Full purchase amount
        { name: 'my_amount', type: 'number' }, // What I actually pay (for splits/lent card)
        { name: 'description', type: 'string' },
        { name: 'date', type: 'number' },
        { name: 'category_id', type: 'string', isIndexed: true },
        { name: 'account_id', type: 'string', isIndexed: true },
        { name: 'total_installments', type: 'number' }, // 1 = contado, 3/6/12 = cuotas
        { name: 'is_subscription', type: 'boolean' },
        { name: 'note', type: 'string', isOptional: true }, // "prestado a Danna"
        { name: 'recurring_transaction_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'period_year', type: 'number', isIndexed: true },
        { name: 'period_month', type: 'number', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'installments',
      columns: [
        { name: 'transaction_id', type: 'string', isIndexed: true },
        { name: 'account_id', type: 'string', isIndexed: true },
        { name: 'installment_number', type: 'number' }, // 1, 2, 3...
        { name: 'total_installments', type: 'number' }, // total cuotas
        { name: 'amount', type: 'number' }, // amount per cuota
        { name: 'due_year', type: 'number', isIndexed: true },
        { name: 'due_month', type: 'number', isIndexed: true },
        { name: 'is_paid', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'fixed_payments',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'budgeted_amount', type: 'number' },
        { name: 'actual_amount', type: 'number', isOptional: true },
        { name: 'payment_day', type: 'number' }, // day of month
        { name: 'is_recurring', type: 'boolean' },
        { name: 'is_paid', type: 'boolean' },
        { name: 'period_year', type: 'number', isIndexed: true },
        { name: 'period_month', type: 'number', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'monthly_periods',
      columns: [
        { name: 'year', type: 'number' },
        { name: 'month', type: 'number' },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'recurring_transactions',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'amount', type: 'number' },
        { name: 'category_id', type: 'string', isIndexed: true },
        { name: 'account_id', type: 'string', isIndexed: true },
        { name: 'frequency', type: 'string' }, // 'monthly'
        { name: 'day_of_month', type: 'number' },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
