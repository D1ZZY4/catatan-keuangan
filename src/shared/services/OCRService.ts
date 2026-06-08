export interface OCRResult {
  total: number | null;
  date: number | null;
  merchant: string | null;
  rawText: string;
  confidence: number;
}

function parseTotal(text: string): number | null {
  const patterns = [
    /(?:GRAND\s*TOTAL|TOTAL\s*BAYAR|JUMLAH\s*BAYAR|TOTAL)[:\s=]+([Rp\s]*[\d.,]+)/gi,
    /(?:BAYAR|PEMBAYARAN)[:\s=]+([Rp\s]*[\d.,]+)/gi,
    /(?:AMOUNT|TOTAL)[:\s=]+([Rp\s]*[\d.,]+)/gi,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      const raw = (match[1] ?? "").replace(/[Rp\s]/g, "").replace(/\./g, "").replace(/,/g, ".");
      const num = parseFloat(raw);
      if (!isNaN(num) && num > 0) return num;
    }
  }
  return null;
}

function parseDate(text: string): number | null {
  const patterns = [
    /(\d{2})[\/\-](\d{2})[\/\-](\d{4})/,
    /(\d{4})[\/\-](\d{2})[\/\-](\d{2})/,
    /(\d{2})\s+(\w+)\s+(\d{4})/,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      try {
        const m1 = match[1] ?? "";
        const m2 = match[2] ?? "";
        const m3 = match[3] ?? "";
        let d: Date;
        if (m1.length === 4) {
          d = new Date(`${m1}-${m2}-${m3}`);
        } else if (parseInt(m1) > 12) {
          d = new Date(`${m3}-${m2}-${m1}`);
        } else {
          d = new Date(`${m3}-${m1}-${m2}`);
        }
        if (!isNaN(d.getTime())) return d.getTime();
      } catch {
        continue;
      }
    }
  }
  return null;
}

function parseMerchant(lines: string[]): string | null {
  const skipPatterns = /^[\d\s.,+\-*/:=()#@|\\]+$|receipt|faktur|struk|invoice|total|bayar|kasir|cashier/i;
  for (const line of lines.slice(0, 5)) {
    const trimmed = line.trim();
    if (trimmed.length > 2 && !skipPatterns.test(trimmed)) {
      return trimmed.slice(0, 60);
    }
  }
  return null;
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

      return {
        total: parseTotal(text),
        date: parseDate(text),
        merchant: parseMerchant(lines),
        rawText: text,
        confidence: data.confidence ?? 0,
      };
    } catch {
      return {
        total: null,
        date: null,
        merchant: null,
        rawText: "",
        confidence: 0,
      };
    }
  }

  async captureFromCamera(): Promise<string | null> {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment";
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) ?? null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      };
      input.click();
    });
  }
}

export const ocrService = new OCRService();
