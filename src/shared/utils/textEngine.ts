import { AppLabels } from '../config/labels';
import type { PeriodKey } from '../config/periods';
import type { TransactionType } from '../types';
import { formatCurrency } from './formatters';

const _cache = new Map<string, string>();

function cached(key: string, fn: () => string): string {
  const hit = _cache.get(key);
  if (hit !== undefined) return hit;
  const result = fn();
  _cache.set(key, result);
  return result;
}

export const textEngine = {
  joinList(items: string[], conjunction: 'dan' | 'atau' = 'dan'): string {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0] ?? '';
    if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
    const allButLast = items.slice(0, -1).join(', ');
    return `${allButLast}, ${conjunction} ${items[items.length - 1]}`;
  },

  quantityLabel(count: number, noun: string, overflow = false): string {
    const key = `qty:${count}:${noun}:${String(overflow)}`;
    return cached(key, () => {
      if (count === 0) return `Tidak ada ${noun}`;
      const countStr = overflow && count >= 100 ? `${count}+` : `${count}`;
      return `${countStr} ${noun}`;
    });
  },

  periodDescription(key: PeriodKey, customRange?: { from: Date; to: Date }): string {
    const cacheKey = `period:${key}:${customRange?.from.getTime().toString() ?? ''}`;
    return cached(cacheKey, () => {
      const map: Record<PeriodKey, string> = {
        today: 'hari ini',
        last7days: '7 hari terakhir',
        thisMonth: 'bulan ini',
        last3months: '3 bulan terakhir',
        last6months: '6 bulan terakhir',
        thisYear: 'tahun ini',
        all: 'semua waktu',
        custom:
          customRange !== undefined
            ? formatCustomPeriod(customRange.from, customRange.to)
            : 'rentang kustom',
      };
      return map[key];
    });
  },

  filterSummary(filter: { period: PeriodKey; types: TransactionType[] }): string {
    const key = `filter:${filter.period}:${filter.types.join(',')}`;
    return cached(key, () => {
      const typeLabels = filter.types.map(
        (t) => AppLabels.transactionType[t] ?? t,
      );
      const typePart =
        typeLabels.length === 0
          ? AppLabels.filterType.all
          : textEngine.joinList(typeLabels);
      const periodPart = textEngine.periodDescription(filter.period);
      return `${typePart} · ${periodPart}`;
    });
  },

  walletDeleteWarning(transactionCount: number): string {
    if (transactionCount === 0) return 'Hapus dompet ini secara permanen?';
    return `Dompet ini memiliki ${transactionCount} transaksi. Sebaiknya arsipkan agar data tetap aman?`;
  },

  summaryLabel(type: TransactionType, amount: number, currency: string): string {
    const typeLabel = AppLabels.transactionType[type] ?? type;
    const amountLabel = formatCurrency(Math.abs(amount), currency);
    return `${typeLabel} · ${amountLabel}`;
  },

  suggestCategory(note: string): string | null {
    const lower = note.toLowerCase();
    const rules: Array<{ keywords: string[]; category: string }> = [
      {
        keywords: ['indomaret', 'alfamart', 'lawson', 'minimarket'],
        category: 'shopping',
      },
      {
        keywords: ['grab', 'gojek', 'maxim', 'ojol', 'bensin', 'parkir'],
        category: 'transport',
      },
      {
        keywords: ['makan', 'minum', 'warung', 'resto', 'kafe', 'cafe'],
        category: 'food',
      },
      {
        keywords: ['listrik', 'pln', 'air', 'pdam', 'internet', 'wifi'],
        category: 'bills',
      },
      {
        keywords: ['dokter', 'apotek', 'obat', 'rumah sakit', 'klinik'],
        category: 'health',
      },
      {
        keywords: ['netflix', 'spotify', 'game', 'bioskop', 'hiburan'],
        category: 'entertainment',
      },
      {
        keywords: ['sekolah', 'kuliah', 'les', 'kursus', 'buku'],
        category: 'education',
      },
      {
        keywords: ['gaji', 'salary', 'thr', 'upah'],
        category: 'salary',
      },
      {
        keywords: ['freelance', 'proyek', 'klien', 'invoice'],
        category: 'freelance',
      },
    ];
    for (const rule of rules) {
      if (rule.keywords.some((kw) => lower.includes(kw))) return rule.category;
    }
    return null;
  },

  clearCache(): void {
    _cache.clear();
  },
};

function formatCustomPeriod(from: Date, to: Date): string {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(d);
  const sameMonth =
    from.getMonth() === to.getMonth() &&
    from.getFullYear() === to.getFullYear();
  if (sameMonth) return `${from.getDate().toString()}–${fmt(to)} ${to.getFullYear().toString()}`;
  return `${fmt(from)} – ${fmt(to)} ${to.getFullYear().toString()}`;
}
