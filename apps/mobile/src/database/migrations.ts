import {
  schemaMigrations,
  createTable,
  addColumns,
  unsafeExecuteSql,
} from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 3,
      steps: [
        addColumns({
          table: 'installments',
          columns: [
            { name: 'description', type: 'string' },
          ],
        }),
        unsafeExecuteSql(
          `UPDATE installments SET description = (
            SELECT transactions.description FROM transactions
            WHERE transactions.id = installments.transaction_id
          ) WHERE description = '' AND transaction_id != '';`,
        ),
      ],
    },
    {
      toVersion: 2,
      steps: [
        createTable({
          name: 'recurring_transactions',
          columns: [
            { name: 'name', type: 'string' },
            { name: 'amount', type: 'number' },
            { name: 'category_id', type: 'string', isIndexed: true },
            { name: 'account_id', type: 'string', isIndexed: true },
            { name: 'frequency', type: 'string' },
            { name: 'day_of_month', type: 'number' },
            { name: 'is_active', type: 'boolean' },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        addColumns({
          table: 'transactions',
          columns: [
            {
              name: 'recurring_transaction_id',
              type: 'string',
              isOptional: true,
              isIndexed: true,
            },
          ],
        }),
      ],
    },
  ],
});
