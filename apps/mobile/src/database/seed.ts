import type { Collection, Model } from '@nozbe/watermelondb';

import { database } from './index';
import type { Category } from './models/Category';

export const DEFAULT_CATEGORY_ID = '__otros__';

function setRaw(record: Model, values: Record<string, unknown>): void {
  Object.assign(record._raw, values);
}

/**
 * Ensures the default "Otros" category always exists.
 * Safe to call multiple times — skips if already present.
 */
export async function seedDefaults(): Promise<void> {
  const collection = database.get<Category>('categories') as Collection<Category>;

  try {
    await collection.find(DEFAULT_CATEGORY_ID);
    // Already exists
  } catch {
    // Not found — create it
    await database.write(async () => {
      await collection.create((record) => {
        setRaw(record, {
          id: DEFAULT_CATEGORY_ID,
          name: 'Otros',
          type: 'variable',
          monthly_budget: 0,
          icon: null,
          color: null,
          sort_order: 9999,
          is_active: true,
        });
      });
    });
  }
}
