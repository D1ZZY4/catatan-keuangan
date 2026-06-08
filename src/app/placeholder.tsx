import { Wallet } from "lucide-react";

export function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-accent-primary text-white shadow-fab">
        <Wallet size={28} />
      </div>
      <h1 className="text-2xl font-semibold">Catatan Keuangan</h1>
      <p className="max-w-sm text-sm text-text-muted">
        Fondasi proyek siap. Komponen UI, onboarding, dompet, dan transaksi akan dibangun di
        milestone berikutnya.
      </p>
      <span className="rounded-sm bg-bg-card px-3 py-1 text-xs font-medium text-text-muted">
        M0 + M1 selesai · Menunggu review untuk lanjut M2
      </span>
    </main>
  );
}
