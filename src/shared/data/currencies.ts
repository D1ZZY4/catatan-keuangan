export interface CurrencyInfo {
  code: string;
  name: string;
  flag: string;
  isCrypto?: boolean;
  isCommodity?: boolean;
}

export const PINNED_CURRENCIES: CurrencyInfo[] = [
  { code: "IDR", name: "Rupiah Indonesia", flag: "🇮🇩" },
  { code: "USD", name: "Dolar Amerika Serikat", flag: "🇺🇸" },
  { code: "SGD", name: "Dolar Singapura", flag: "🇸🇬" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "XAU", name: "Emas (per troy oz)", flag: "🥇", isCommodity: true },
  { code: "BTC", name: "Bitcoin", flag: "₿", isCrypto: true },
];

export const CRYPTO_CURRENCIES: CurrencyInfo[] = [
  { code: "BTC", name: "Bitcoin", flag: "₿", isCrypto: true },
  { code: "ETH", name: "Ethereum", flag: "⟠", isCrypto: true },
  { code: "XRP", name: "Ripple", flag: "✕", isCrypto: true },
  { code: "BNB", name: "BNB", flag: "🔶", isCrypto: true },
  { code: "SOL", name: "Solana", flag: "◎", isCrypto: true },
  { code: "XAU", name: "Emas (per troy oz)", flag: "🥇", isCommodity: true },
];

export const FIAT_CURRENCIES: CurrencyInfo[] = [
  { code: "IDR", name: "Rupiah Indonesia", flag: "🇮🇩" },
  { code: "USD", name: "Dolar Amerika Serikat", flag: "🇺🇸" },
  { code: "SGD", name: "Dolar Singapura", flag: "🇸🇬" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "Pound Sterling", flag: "🇬🇧" },
  { code: "JPY", name: "Yen Jepang", flag: "🇯🇵" },
  { code: "AUD", name: "Dolar Australia", flag: "🇦🇺" },
  { code: "CAD", name: "Dolar Kanada", flag: "🇨🇦" },
  { code: "CHF", name: "Franc Swiss", flag: "🇨🇭" },
  { code: "CNY", name: "Yuan Tiongkok", flag: "🇨🇳" },
  { code: "HKD", name: "Dolar Hong Kong", flag: "🇭🇰" },
  { code: "KRW", name: "Won Korea Selatan", flag: "🇰🇷" },
  { code: "MYR", name: "Ringgit Malaysia", flag: "🇲🇾" },
  { code: "THB", name: "Baht Thailand", flag: "🇹🇭" },
  { code: "PHP", name: "Peso Filipina", flag: "🇵🇭" },
  { code: "VND", name: "Dong Vietnam", flag: "🇻🇳" },
  { code: "TWD", name: "Dolar Taiwan Baru", flag: "🇹🇼" },
  { code: "INR", name: "Rupee India", flag: "🇮🇳" },
  { code: "PKR", name: "Rupee Pakistan", flag: "🇵🇰" },
  { code: "BDT", name: "Taka Bangladesh", flag: "🇧🇩" },
  { code: "SAR", name: "Riyal Arab Saudi", flag: "🇸🇦" },
  { code: "AED", name: "Dirham UEA", flag: "🇦🇪" },
  { code: "QAR", name: "Riyal Qatar", flag: "🇶🇦" },
  { code: "KWD", name: "Dinar Kuwait", flag: "🇰🇼" },
  { code: "BHD", name: "Dinar Bahrain", flag: "🇧🇭" },
  { code: "OMR", name: "Rial Oman", flag: "🇴🇲" },
  { code: "JOD", name: "Dinar Yordania", flag: "🇯🇴" },
  { code: "EGP", name: "Pound Mesir", flag: "🇪🇬" },
  { code: "ZAR", name: "Rand Afrika Selatan", flag: "🇿🇦" },
  { code: "NGN", name: "Naira Nigeria", flag: "🇳🇬" },
  { code: "KES", name: "Shilling Kenya", flag: "🇰🇪" },
  { code: "GHS", name: "Cedi Ghana", flag: "🇬🇭" },
  { code: "TZS", name: "Shilling Tanzania", flag: "🇹🇿" },
  { code: "ETB", name: "Birr Ethiopia", flag: "🇪🇹" },
  { code: "BRL", name: "Real Brasil", flag: "🇧🇷" },
  { code: "ARS", name: "Peso Argentina", flag: "🇦🇷" },
  { code: "CLP", name: "Peso Chili", flag: "🇨🇱" },
  { code: "COP", name: "Peso Kolombia", flag: "🇨🇴" },
  { code: "PEN", name: "Sol Peru", flag: "🇵🇪" },
  { code: "MXN", name: "Peso Meksiko", flag: "🇲🇽" },
  { code: "CRC", name: "Colon Kosta Rika", flag: "🇨🇷" },
  { code: "NZD", name: "Dolar Selandia Baru", flag: "🇳🇿" },
  { code: "NOK", name: "Krone Norwegia", flag: "🇳🇴" },
  { code: "SEK", name: "Krona Swedia", flag: "🇸🇪" },
  { code: "DKK", name: "Krone Denmark", flag: "🇩🇰" },
  { code: "PLN", name: "Zloty Polandia", flag: "🇵🇱" },
  { code: "CZK", name: "Koruna Czech", flag: "🇨🇿" },
  { code: "HUF", name: "Forint Hungaria", flag: "🇭🇺" },
  { code: "RON", name: "Leu Rumania", flag: "🇷🇴" },
  { code: "TRY", name: "Lira Turki", flag: "🇹🇷" },
  { code: "RUB", name: "Rubel Rusia", flag: "🇷🇺" },
  { code: "UAH", name: "Hryvnia Ukraina", flag: "🇺🇦" },
  { code: "ILS", name: "Shekel Israel", flag: "🇮🇱" },
  { code: "PKR", name: "Rupee Pakistan", flag: "🇵🇰" },
  { code: "LKR", name: "Rupee Sri Lanka", flag: "🇱🇰" },
  { code: "NPR", name: "Rupee Nepal", flag: "🇳🇵" },
  { code: "MMK", name: "Kyat Myanmar", flag: "🇲🇲" },
  { code: "KHR", name: "Riel Kamboja", flag: "🇰🇭" },
  { code: "LAK", name: "Kip Laos", flag: "🇱🇦" },
  { code: "MOP", name: "Pataca Makau", flag: "🇲🇴" },
  { code: "BND", name: "Dolar Brunei", flag: "🇧🇳" },
];

export const ALL_CURRENCIES: CurrencyInfo[] = [
  ...PINNED_CURRENCIES,
  ...CRYPTO_CURRENCIES.filter((c) => !PINNED_CURRENCIES.find((p) => p.code === c.code)),
  ...FIAT_CURRENCIES.filter(
    (c) =>
      !PINNED_CURRENCIES.find((p) => p.code === c.code) &&
      !CRYPTO_CURRENCIES.find((p) => p.code === c.code),
  ),
];

export function getCurrencyInfo(code: string): CurrencyInfo {
  return (
    ALL_CURRENCIES.find((c) => c.code === code) ?? {
      code,
      name: code,
      flag: "💱",
    }
  );
}

export const CRYPTO_CODES = new Set(["BTC", "ETH", "XRP", "BNB", "SOL", "XAU"]);
