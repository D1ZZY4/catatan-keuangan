const CRYPTO_CURRENCIES = new Set(['BTC', 'ETH', 'XRP', 'BNB', 'SOL', 'USDT', 'USDC']);

export function formatCurrency(amount: number, currency = 'IDR'): string {
  if (CRYPTO_CURRENCIES.has(currency)) {
    return `${amount.toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    })} ${currency}`;
  }

  if (currency === 'XAU') {
    return `${amount.toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })} gr Au`;
  }

  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('id-ID')}`;
  }
}

export function formatCurrencyCompact(amount: number, currency = 'IDR'): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 1_000_000_000) {
    return `${sign}${formatCurrency(abs / 1_000_000_000, currency).replace(/\d[\d.,]+/, (n) => parseFloat(n.replace(/[.,]/g, '')).toFixed(1))} M`;
  }
  if (abs >= 1_000_000) {
    const val = abs / 1_000_000;
    return `${sign}Rp ${val.toFixed(val < 10 ? 1 : 0)} jt`;
  }
  if (abs >= 1_000 && currency === 'IDR') {
    return `${sign}Rp ${(abs / 1_000).toFixed(0)} rb`;
  }
  return formatCurrency(amount, currency);
}

export function formatDate(
  timestamp: number,
  format: 'id' | 'us' | 'iso' | 'short' | 'relative' = 'id',
): string {
  const date = new Date(timestamp);

  if (format === 'relative') {
    return formatRelativeDate(date);
  }
  if (format === 'short') {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  }
  if (format === 'id') {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }
  if (format === 'us') {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }
  return date.toISOString().split('T')[0] ?? '';
}

export function formatDateTime(timestamp: number): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (todayStart.getTime() - dateStart.getTime()) / 86400000,
  );

  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  return formatDate(date.getTime(), 'short');
}

export function formatNumber(n: number): string {
  return n.toLocaleString('id-ID');
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^0-9.,]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}
