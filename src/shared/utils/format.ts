/**
 * Locale formatters — Bahasa Indonesia first.
 */

const KNOWN_FIAT_FRACTION_DIGITS: Record<string, number> = {
  IDR: 0,
  JPY: 0,
  KRW: 0,
  VND: 0,
};

const CRYPTO_CURRENCIES = new Set(["BTC", "ETH", "XRP", "BNB", "SOL", "XAU"]);

export function formatCurrency(amount: number, currency = "IDR"): string {
  if (CRYPTO_CURRENCIES.has(currency)) {
    const digits = currency === "BTC" || currency === "ETH" ? 6 : 4;
    return `${formatNumber(amount, digits)} ${currency}`;
  }
  const fractionDigits = KNOWN_FIAT_FRACTION_DIGITS[currency] ?? 2;
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount);
  } catch {
    return `${formatNumber(amount, fractionDigits)} ${currency}`;
  }
}

export function formatNumber(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatDate(timestampMs: number): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
    new Date(timestampMs),
  );
}

export function formatDateTime(timestampMs: number): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestampMs));
}

export function formatRelative(timestampMs: number, now = Date.now()): string {
  const diff = Math.round((timestampMs - now) / 1000);
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat("id-ID", { numeric: "auto" });
  if (abs < 60) return rtf.format(diff, "second");
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), "day");
  if (abs < 86400 * 365) return rtf.format(Math.round(diff / (86400 * 30)), "month");
  return rtf.format(Math.round(diff / (86400 * 365)), "year");
}
