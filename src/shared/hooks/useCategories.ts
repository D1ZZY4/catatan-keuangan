import { useCallback, useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { database, categories } from '../db/database';
import type { CategoryModel } from '../db/models/Category';
import type { Category } from '../types';

function modelToCategory(m: CategoryModel): Category {
  return {
    id: m.id,
    name: m.name,
    icon: m.icon,
    color: m.color,
    type: m.categoryType as Category['type'],
    isDefault: m.isDefault,
    createdAt: m.createdAt,
  };
}

export function useCategories(typeFilter?: 'income' | 'expense') {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      let query = categories.query(Q.sortBy('created_at', Q.asc));
      if (typeFilter !== undefined) {
        query = categories.query(
          Q.where('category_type', Q.oneOf([typeFilter, 'both'])),
          Q.sortBy('created_at', Q.asc),
        );
      }
      const result = await query.fetch();
      setData(result.map(modelToCategory));
    } catch (e) {
      console.error('[useCategories] load error', e);
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const createCategory = useCallback(
    async (c: Omit<Category, 'id' | 'createdAt' | 'isDefault'>) => {
      await database.write(async () => {
        await categories.create((record: CategoryModel) => {
          record.name = c.name;
          record.icon = c.icon;
          record.color = c.color;
          record.categoryType = c.type;
          record.isDefault = false;
          record.createdAt = Date.now();
        });
      });
      await load();
    },
    [load],
  );

  const updateCategory = useCallback(
    async (id: string, c: Partial<Omit<Category, 'id' | 'createdAt' | 'isDefault'>>) => {
      await database.write(async () => {
        const record = await categories.find(id);
        await record.update((r: CategoryModel) => {
          if (c.name !== undefined) r.name = c.name;
          if (c.icon !== undefined) r.icon = c.icon;
          if (c.color !== undefined) r.color = c.color;
          if (c.type !== undefined) r.categoryType = c.type;
        });
      });
      await load();
    },
    [load],
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      const record = await categories.find(id);
      if (record.isDefault) {
        throw new Error('Kategori default tidak dapat dihapus');
      }
      await database.write(async () => {
        await record.destroyPermanently();
      });
      await load();
    },
    [load],
  );

  return { data, loading, reload: load, createCategory, updateCategory, deleteCategory };
}
