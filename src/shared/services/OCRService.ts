export interface OCRResult {
  total: number | null;
  date: number | null;
  time: string | null;
  merchant: string | null;
  paymentMethod: string | null;
  merchantCategory: string | null;
  rawText: string;
  confidence: number;
}

function parseTotal(text: string): number | null {
  const patterns = [
    /(?:GRAND\s*TOTAL|TOTAL\s*BAYAR|JUMLAH\s*BAYAR|TOTAL\s*TAGIHAN)[:\s=]+([Rp\s]*[\d.,]+)/gi,
    /(?:BAYAR|PEMBAYARAN|AMOUNT\s*DUE)[:\s=]+([Rp\s]*[\d.,]+)/gi,
    /(?:SUBTOTAL|SUB\s*TOTAL)[:\s=]+([Rp\s]*[\d.,]+)/gi,
    /TOTAL[:\s=]+([Rp\s]*[\d.,]+)/gi,
    /AMOUNT[:\s=]+([Rp\s]*[\d.,]+)/gi,
  ];
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    const match = pattern.exec(text);
    if (match) {
      const raw = (match[1] ?? "")
        .replace(/[Rp\s]/g, "")
        .replace(/\./g, "")
        .replace(/,/g, ".");
      const num = parseFloat(raw);
      if (!isNaN(num) && num > 0) return Math.round(num);
    }
  }
  return null;
}

function parseDate(text: string): number | null {
  const patterns = [
    /(\d{2})[\/\-](\d{2})[\/\-](\d{4})/,
    /(\d{4})[\/\-](\d{2})[\/\-](\d{2})/,
    /(\d{1,2})\s+(Jan(?:uari)?|Feb(?:ruari)?|Mar(?:et)?|Apr(?:il)?|Mei|Jun(?:i)?|Jul(?:i)?|Agu(?:stus)?|Sep(?:tember)?|Okt(?:ober)?|Nov(?:ember)?|Des(?:ember)?)\s+(\d{4})/i,
    /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i,
  ];
  const monthMap: Record<string, string> = {
    jan: "01", januari: "01", january: "01",
    feb: "02", februari: "02", february: "02",
    mar: "03", maret: "03", march: "03",
    apr: "04", april: "04",
    mei: "05", may: "05",
    jun: "06", juni: "06", june: "06",
    jul: "07", juli: "07", july: "07",
    agu: "08", agustus: "08", august: "08",
    sep: "09", september: "09",
    okt: "10", oktober: "10", october: "10",
    nov: "11", november: "11",
    des: "12", desember: "12", december: "12",
  };
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      try {
        const m1 = match[1] ?? "";
        const m2 = match[2] ?? "";
        const m3 = match[3] ?? "";
        let d: Date;
        if (m1.length === 4) {
          d = new Date(`${m1}-${m2.padStart(2, "0")}-${m3.padStart(2, "0")}`);
        } else if (/[a-z]/i.test(m2)) {
          const monthNum = monthMap[m2.toLowerCase().slice(0, 3)];
          if (!monthNum) continue;
          d = new Date(`${m3}-${monthNum}-${m1.padStart(2, "0")}`);
        } else if (parseInt(m1) > 12) {
          d = new Date(`${m3}-${m2.padStart(2, "0")}-${m1.padStart(2, "0")}`);
        } else {
          d = new Date(`${m3}-${m1.padStart(2, "0")}-${m2.padStart(2, "0")}`);
        }
        if (!isNaN(d.getTime())) return d.getTime();
      } catch {
        continue;
      }
    }
  }
  return null;
}

function parseTime(text: string): string | null {
  const pattern = /\b([0-1]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?\b/;
  const match = pattern.exec(text);
  if (match) {
    const h = (match[1] ?? "0").padStart(2, "0");
    const m = (match[2] ?? "0").padStart(2, "0");
    return `${h}:${m}`;
  }
  return null;
}

function parseMerchant(lines: string[]): string | null {
  const skipPatterns =
    /^[\d\s.,+\-*/:=()#@|\\]+$|^(receipt|faktur|struk|invoice|total|bayar|kasir|cashier|telp|tel|no\.?\s*hp|alamat|address|npwp|tax)/i;
  for (const line of lines.slice(0, 6)) {
    const trimmed = line.trim();
    if (trimmed.length > 3 && !skipPatterns.test(trimmed)) {
      return trimmed.slice(0, 60);
    }
  }
  return null;
}

function parsePaymentMethod(text: string): string | null {
  const upper = text.toUpperCase();
  const patterns: Array<[RegExp, string]> = [
    [/\bGOPAY\b|\bGO-PAY\b|\bGO\s+PAY\b/, "GoPay"],
    [/\bOVO\b/, "OVO"],
    [/\bDANA\b/, "Dana"],
    [/\bSHOPEEPAY\b|\bSHOPEE\s*PAY\b|\bSPAY\b/, "ShopeePay"],
    [/\bLINKAJA\b|\bLINK\s*AJA\b/, "LinkAja"],
    [/\bJENIUS\b/, "Jenius"],
    [/\bQRIS\b/, "QRIS"],
    [/\bBRIVA\b|\bBRI\s*VA\b/, "Transfer BRI"],
    [/\bBCA\b.*(?:TRANSFER|VIRTUAL|KLIK|M-BCA)|(?:TRANSFER|KLIK|M-BCA).*\bBCA\b/, "Transfer BCA"],
    [/\bBNI\b.*TRANSFER|TRANSFER.*\bBNI\b/, "Transfer BNI"],
    [/\bMANDIRI\b.*TRANSFER|TRANSFER.*\bMANDIRI\b|\bLIVIN\b/, "Transfer Mandiri"],
    [/\bBSI\b.*TRANSFER|TRANSFER.*\bBSI\b/, "Transfer BSI"],
    [/KARTU\s+KREDIT|CREDIT\s+CARD|VISA|MASTERCARD|AMEX/, "Kartu Kredit"],
    [/KARTU\s+DEBIT|DEBIT\s+CARD|KARTU\s+ATM|\bGPN\b/, "Kartu Debit"],
    [/\bTRANSFER\b|\bTF\b|\bTRF\b|\bEFT\b/, "Transfer Bank"],
    [/\bTUNAI\b|\bCASH\b/, "Tunai"],
    [/\bDEBIT\b/, "Kartu Debit"],
    [/\bKREDIT\b|\bCREDIT\b/, "Kartu Kredit"],
  ];
  for (const [pattern, label] of patterns) {
    if (pattern.test(upper)) return label;
  }
  return null;
}

function parseMerchantCategory(text: string): string | null {
  const upper = text.toUpperCase();
  const patterns: Array<[RegExp, string]> = [
    [/\b(?:MART|MARKET|SUPERMARKET|MINIMARKET|GROCERY|FRESH|HYPERMART|GIANT|CARREFOUR|LOTTEMART|HERO)\b/, "supermarket"],
    [/\b(?:RESTO(?:RAN)?|RESTAURANT|WARUNG|RUMAH\s+MAKAN|MAKAN|FOOD|BURGER|PIZZA|SUSHI|RAMEN|NOODLE|BAKSO|SOTO|NASI|CAFE|KAFE|COFFEE|BAKERY|BAKERI|ROTI|KFC|MCD|STARBUCKS|MCDONALD|PIZZA\s*HUT|CHATIME|KOPI|JAJAN)\b/, "food"],
    [/\b(?:APOTEK|APOTIK|PHARMACY|FARMASI|KLINIK|RUMAH\s+SAKIT|PUSKESMAS|HOSPITAL|CLINIC|MEDIC|DOKTER|OPTIK|LABORATORI)\b/, "health"],
    [/\b(?:BENGKEL|GARAG[EI]|AUTO|SPBU|PERTAMINA|SHELL|BP\b|PETRONAS|ALFAGAS|BENSIN|SOLAR|PARKIR)\b/, "transportation"],
    [/\b(?:SEKOLAH|SCHOOL|UNIVERSIT|KAMPUS|KURSUS|BIMBER|BIMBEL|PENDIDIKAN|BUKU|TOKO\s+BUKU|GRAMEDIA|LES\b|GURU)\b/, "education"],
    [/\b(?:HOTEL|VILLA|RESORT|PENGINAPAN|AIRBNB|HOMESTAY|HOSTEL|WISMA|LOSMEN)\b/, "accommodation"],
    [/\b(?:LISTRIK|PLN\b|PDAM\b|TELKOMSEL|INDOSAT|XL\b|AXIS\b|TELKOM|SPEEDY|MYREPUBLIK|FIRSTMEDIA|TOKEN|PULSA|PASCABAYAR|WIFI|INTERNET)\b/, "utilities"],
    [/\b(?:BIOSKOP|CINEMA|XXI\b|CGV\b|HIBURAN|ENTERTAINMENT|FUTSAL|GYM\b|FITNESS|RENANG|SPORT|OLAHRAGA|KOLAM\s+RENANG|BOWLING|KARAOKE|GAME)\b/, "entertainment"],
    [/\b(?:TOKO|STORE|FASHION|PAKAIAN|BAJU|SEPATU|TAS\b|BUTIK|BOUTIQUE|DISTRO|CELANA|KEMEJA|BATIK|ACCESSORIES)\b/, "shopping"],
    [/\b(?:SALON|SPA\b|BARBERSHOP|BARBER|PERAWATAN|KECANTIKAN|BEAUTY|NAIL|WAXING)\b/, "beauty"],
  ];
  for (const [pattern, category] of patterns) {
    if (pattern.test(upper)) return category;
  }
  return null;
}

const MERCHANT_CATEGORY_LABELS: Record<string, string> = {
  supermarket: "Supermarket & Minimarket",
  food: "Makanan & Minuman",
  health: "Kesehatan & Medis",
  transportation: "Transportasi & Kendaraan",
  education: "Pendidikan",
  accommodation: "Penginapan",
  utilities: "Tagihan & Utilitas",
  entertainment: "Hiburan & Olahraga",
  shopping: "Belanja Fashion",
  beauty: "Kecantikan & Perawatan",
};

export function getMerchantCategoryLabel(category: string | null): string | null {
  if (!category) return null;
  return MERCHANT_CATEGORY_LABELS[category] ?? null;
}

class OCRService {
  async recognize(imageSource: File | string): Promise<OCRResult> {
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker(["eng", "ind"]);
      const { data } = await worker.recognize(imageSource);
      await worker.terminate();

      const text = data.text ?? "";
      const lines = text.split("\n").filter((l) => l.trim());
      const merchantCategory = parseMerchantCategory(text);

      return {
        total: parseTotal(text),
        date: parseDate(text),
        time: parseTime(text),
        merchant: parseMerchant(lines),
        paymentMethod: parsePaymentMethod(text),
        merchantCategory,
        rawText: text,
        confidence: data.confidence ?? 0,
      };
    } catch {
      return {
        total: null,
        date: null,
        time: null,
        merchant: null,
        paymentMethod: null,
        merchantCategory: null,
        rawText: "",
        confidence: 0,
      };
    }
  }
}

export const ocrService = new OCRService();
