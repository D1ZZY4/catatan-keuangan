import { useMemo } from "react";
import type { Category } from "@/shared/types";

interface KeywordRule {
  keywords: string[];
  categoryName: string;
}

const EXPENSE_RULES: KeywordRule[] = [
  { keywords: ["indomaret","alfamart","lawson","circle k","superindo","hypermart","carrefour","lottemart","giant","hero","ranch market","yogya","borma"], categoryName: "Belanja" },
  { keywords: ["grab food","grabfood","gofood","go-food","shopeefood","shopee food","mc donald","mcdonald","kfc","pizza hut","hokben","hokkaido","starbucks","kopi","coffee","bakery","warung","warteg","mie ayam","soto","nasi","makan siang","makan malam","sarapan","restoran","cafe","kantin","catering","bubble tea","boba","jus","minuman"], categoryName: "Makanan & Minuman" },
  { keywords: ["grab","gojek","ojek","angkot","bus transjakarta","commuter","lrt","mrt","toll","tol","parkir","bensin","pertalite","pertamax","shell","spbu","pom bensin","taxi","uber","bluebird","bajaj","gocar","grab car","maxim","indriver"], categoryName: "Transportasi" },
  { keywords: ["listrik","pln","air pdam","pdam","telpon","telepon","internet","wifi","indihome","telkom","firstmedia","biznet","myrepublic","xl axiata","xl","telkomsel","axis","im3","smartfren","xl home","pulsa","token listrik","tagihan"], categoryName: "Tagihan & Utilitas" },
  { keywords: ["rumah sakit","rs ","klinik","puskesmas","dokter","dr.","apotik","apotek","kimia farma","k24","guardian","century","obat","vitamin","suplemen","konsultasi","bpjs","asuransi kesehatan"], categoryName: "Kesehatan" },
  { keywords: ["netflix","spotify","disney","youtube premium","viu","iflix","mola","vidio","bioskop","cgv","cinemaxx","xxi","film","konser","tiket","game","steam","playstation","xbox","nintendo"], categoryName: "Hiburan" },
  { keywords: ["spp","uang sekolah","les","kursus","bimbel","buku","alat tulis","stationery","gramedia","toga mas","kampus","universitas","kuliah","tutor"], categoryName: "Pendidikan" },
  { keywords: ["baju","celana","kemeja","kaos","jaket","sepatu","tas","sandal","pakaian","fashion","h&m","zara","uniqlo","matahari","timezone","sorabel","zalora","shopee","tokopedia"], categoryName: "Pakaian" },
  { keywords: ["salon","potong rambut","barbershop","creambath","spa","pijat","gym","fitness","zumba","yoga","kosmetik","skincare","wardah","indomaret beauty","watson"], categoryName: "Kecantikan & Perawatan Diri" },
  { keywords: ["cat dinding","renovasi","tukang","perbaikan","servis ac","ac","galon aqua","galon","aqua","material bangunan","listrik rumah","kunci","gembok","cleaning service","pembantu","asisten rumah"], categoryName: "Perawatan Rumah" },
  { keywords: ["kado","hadiah","sumbangan","donasi","infaq","sedekah","zakat","yayasan","panti asuhan","arisan"], categoryName: "Hadiah & Donasi" },
];

const INCOME_RULES: KeywordRule[] = [
  { keywords: ["gaji","salary","payroll","upah","honor","honorarium","thr","bonus akhir tahun"], categoryName: "Gaji" },
  { keywords: ["freelance","proyek","project","klien","client","invoice","fee","jasa","komissi","komisi","reseller"], categoryName: "Freelance & Sampingan" },
  { keywords: ["dividen","return","bunga","deposito","rdp","reksa dana","saham","trading","profit"], categoryName: "Investasi" },
  { keywords: ["cashback","refund","pengembalian","reimburse","reimbursement","klaim"], categoryName: "Pengembalian Dana" },
  { keywords: ["bonus","thr","intensif","insentif","reward","achievement"], categoryName: "Bonus" },
  { keywords: ["hadiah uang","angpao","transferan","kiriman"], categoryName: "Hadiah Uang" },
];

function matchKeywords(note: string, rules: KeywordRule[]): string | undefined {
  const lower = note.toLowerCase();
  for (const rule of rules) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        return rule.categoryName;
      }
    }
  }
  return undefined;
}

export function useAutoCategory(
  note: string,
  type: "income" | "expense",
  categories: Category[],
): Category | undefined {
  return useMemo(() => {
    if (!note.trim()) return undefined;
    const rules = type === "income" ? INCOME_RULES : EXPENSE_RULES;
    const matchedName = matchKeywords(note, rules);
    if (!matchedName) return undefined;
    return categories.find(
      (c) =>
        (c.type === type || c.type === "both") &&
        c.name.toLowerCase().includes(matchedName.toLowerCase()),
    );
  }, [note, type, categories]);
}
