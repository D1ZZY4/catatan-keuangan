export interface CsvRow {
  date: string;
  description: string;
  debit: number;
  credit: number;
  selected: boolean;
}

type BankFormat = "bca" | "mandiri" | "bni" | "bri" | "generic";

function detectBankFormat(lines: string[]): BankFormat {
  const allText = lines.slice(0, 8).join(" ").toLowerCase();
  if (allText.includes("klikbca") || allText.includes("bca")) return "bca";
  if (allText.includes("mandiri") || allText.includes("livin")) return "mandiri";
  if (allText.includes("bni") || allText.includes("bni46")) return "bni";
  if (allText.includes("bri") || allText.includes("brimo")) return "bri";
  return "generic";
}

function parseAmount(raw: string): number {
  if (!raw) return 0;
  const clean = raw.replace(/[^0-9,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const val = parseFloat(clean);
  return isNaN(val) ? 0 : Math.abs(val);
}

function parseDateStr(raw: string): number {
  if (!raw) return Date.now();
  const parts = raw.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const p0 = parseInt(parts[0] ?? "0");
    const p1 = parseInt(parts[1] ?? "0");
    const p2 = parseInt(parts[2] ?? "0");
    if ((parts[2]?.length ?? 0) === 4) {
      const d = new Date(p2, p1 - 1, p0);
      if (!isNaN(d.getTime())) return d.getTime();
    } else if ((parts[0]?.length ?? 0) === 4) {
      const d = new Date(p0, p1 - 1, p2);
      if (!isNaN(d.getTime())) return d.getTime();
    }
  }
  const d = new Date(raw);
  return isNaN(d.getTime()) ? Date.now() : d.getTime();
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (ch === "," && !inQuote) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch ?? "";
    }
  }
  result.push(current.trim());
  return result;
}

export function parseCsvBank(text: string): CsvRow[] {
  const raw = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = raw.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const format = detectBankFormat(lines);

  let dataStartIdx = 0;
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const lower = (lines[i] ?? "").toLowerCase();
    if (
      lower.includes("tanggal") ||
      lower.includes("date") ||
      lower.includes("tgl") ||
      lower.includes("transaction date")
    ) {
      dataStartIdx = i;
      break;
    }
  }

  const headerLine = lines[dataStartIdx] ?? "";
  const headerCols = splitCsvLine(headerLine).map((c) =>
    c.toLowerCase().trim().replace(/"/g, ""),
  );

  const findCol = (keywords: string[]): number =>
    headerCols.findIndex((h) => keywords.some((kw) => h.includes(kw)));

  const dateCol = findCol(["tanggal", "date", "tgl", "transaction date"]);
  const descCol = findCol([
    "keterangan",
    "description",
    "uraian",
    "deskripsi",
    "remark",
    "narasi",
  ]);
  const debitCol = findCol(["debet", "debit", "db", "pengeluaran", "keluar"]);
  const creditCol = findCol(["kredit", "credit", "cr", "pemasukan", "masuk"]);
  const mutCol = findCol(["mutasi", "mutation", "nominal", "jumlah", "amount"]);

  const rows: CsvRow[] = [];

  for (let i = dataStartIdx + 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i] ?? "");
    if (cols.length < 2) continue;

    const dateRaw = dateCol >= 0 ? (cols[dateCol] ?? "") : (cols[0] ?? "");
    const desc = descCol >= 0 ? (cols[descCol] ?? "") : (cols[1] ?? "");
    const descLower = desc.toLowerCase();

    if (
      descLower.includes("total") ||
      descLower.includes("saldo awal") ||
      descLower.includes("saldo akhir")
    )
      continue;

    let debit = 0;
    let credit = 0;

    if (debitCol >= 0 && creditCol >= 0) {
      debit = parseAmount(cols[debitCol] ?? "");
      credit = parseAmount(cols[creditCol] ?? "");
    } else if (mutCol >= 0) {
      const typeColIdx = findCol(["jenis", "type", "db/cr", "cr/db", "kode"]);
      const typeVal =
        typeColIdx >= 0 ? (cols[typeColIdx] ?? "").toUpperCase() : "";
      const amount = parseAmount(cols[mutCol] ?? "");
      if (
        typeVal.includes("K") ||
        typeVal.includes("CR") ||
        typeVal.includes("C")
      ) {
        credit = amount;
      } else if (typeVal.includes("D") || typeVal.includes("DB")) {
        debit = amount;
      } else {
        if (format === "bca") {
          credit = amount;
        } else {
          debit = amount;
        }
      }
    } else if (cols.length >= 3) {
      debit = parseAmount(cols[2] ?? "");
      credit = cols.length >= 4 ? parseAmount(cols[3] ?? "") : 0;
    }

    if (debit === 0 && credit === 0) continue;
    if (!dateRaw.match(/\d/)) continue;

    const dateTs = parseDateStr(dateRaw.replace(/"/g, "").trim());
    const cleanDesc = desc.replace(/"/g, "").trim();

    rows.push({
      date: new Date(dateTs).toLocaleDateString("id-ID"),
      description: cleanDesc || "(tanpa keterangan)",
      debit,
      credit,
      selected: true,
    });
  }

  return rows;
}
