import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const dbSchema = appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: 'wallets',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'icon', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'currency', type: 'string' },
        { name: 'balance', type: 'number' },
        { name: 'initial_balance', type: 'number' },
        { name: 'type', type: 'string' },
        { name: 'is_archived', type: 'boolean' },
        { name: 'show_in_dashboard', type: 'boolean' },
        { name: 'include_in_total', type: 'boolean' },
        { name: 'sort_order', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'transactions',
      columns: [
        { name: 'type', type: 'string' },
        { name: 'wallet_id', type: 'string', isIndexed: true },
        { name: 'to_wallet_id', type: 'string', isOptional: true },
        { name: 'category_id', type: 'string', isIndexed: true },
        { name: 'amount', type: 'number' },
        { name: 'currency', type: 'string' },
        { name: 'note', type: 'string', isOptional: true },
        { name: 'person_name', type: 'string', isOptional: true },
        { name: 'person_phone', type: 'string', isOptional: true },
        { name: 'date', type: 'number', isIndexed: true },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'categories',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'icon', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'is_default', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'budgets',
      columns: [
        { name: 'category_id', type: 'string', isIndexed: true },
        { name: 'amount', type: 'number' },
        { name: 'currency', type: 'string' },
        { name: 'period', type: 'string' },
        { name: 'month', type: 'number', isOptional: true },
        { name: 'year', type: 'number', isOptional: true },
        { name: 'notify_at', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'reminders',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'amount', type: 'number', isOptional: true },
        { name: 'currency', type: 'string' },
        { name: 'due_day', type: 'number' },
        { name: 'period', type: 'string' },
        { name: 'category', type: 'string' },
        { name: 'notify_days_before', type: 'number' },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'transaction_templates',
      columns: [
        { name: 'type', type: 'string' },
        { name: 'category_id', type: 'string' },
        { name: 'label', type: 'string' },
        { name: 'template_data', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'tags',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'transaction_tags',
      columns: [
        { name: 'transaction_id', type: 'string', isIndexed: true },
        { name: 'tag_id', type: 'string', isIndexed: true },
      ],
    }),
    tableSchema({
      name: 'price_cache',
      columns: [
        { name: 'key', type: 'string' },
        { name: 'value', type: 'string' },
        { name: 'fetched_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'settings',
      columns: [
        { name: 'key', type: 'string' },
        { name: 'value', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'usage_patterns',
      columns: [
        { name: 'key', type: 'string' },
        { name: 'value', type: 'string' },
      ],
    }),
  ],
});
