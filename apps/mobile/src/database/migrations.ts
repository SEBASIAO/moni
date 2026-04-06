import {
  schemaMigrations,
  createTable,
  addColumns,
  unsafeExecuteSql,
} from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 5,
      steps: [
        // Reset stale current_amount values — balance is now computed from transactions
        unsafeExecuteSql('UPDATE savings SET current_amount = 0;'),
      ],
    },
    {
      toVersion: 4,
      steps: [
        createTable({
          name: 'savings',
          columns: [
            { name: 'name', type: 'string' },
            { name: 'target_amount', type: 'number', isOptional: true },
            { name: 'current_amount', type: 'number' },
            { name: 'icon', type: 'string', isOptional: true },
            { name: 'color', type: 'string', isOptional: true },
            { name: 'linked_category_id', type: 'string', isIndexed: true },
            { name: 'linked_account_id', type: 'string', isIndexed: true },
            { name: 'is_active', type: 'boolean' },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
      ],
    },
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
