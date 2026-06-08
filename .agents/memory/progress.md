## Status Milestone

- M0: Selesai — Skema Dexie, wrapper crypto AES-GCM, tipe TypeScript, formatter, seeder kategori, utils
- M1: Selesai — App shell, React Router v6, bottom nav, FAB, app bar, toggle dark mode, layout utama
- M2: Selesai — Onboarding carousel 5 slide + setup PIN/biometrik + animasi swipe
- M3: Selesai — LockScreen PIN pad + WebAuthn biometrik + cooldown + auto-lock
- M4: Selesai — Wallet CRUD + sparkline + multi-currency + konversi harga live
- M5: Selesai — Kategori CRUD + seeder default + icon/color picker
- M6: Selesai — Form transaksi 3 langkah (bottom sheet) + semua jenis transaksi
- M7: Selesai — Halaman transaksi + filter + search
- M8: Selesai — Dashboard beranda (net worth, budget preview, pengingat, transaksi terbaru)
- M9: Selesai — Anggaran per kategori + progress bar + notifikasi budget
- M10: Selesai — Statistik (pie chart, bar chart, area chart, tren, debt tab)
- M11: Selesai — Pengingat tagihan + NotificationService
- M12: Selesai — OCR scanner Tesseract.js + konfirmasi data
- M13: Selesai — Backup & restore file .catkeu terenkripsi
- M14: Selesai — Settings (profil, PIN, biometrik, dark mode, auto-lock, notifikasi, hapus data, tentang)
- M15: Selesai — PriceService (Frankfurter, CoinGecko, XAU)
- M16: Selesai — Multi-currency + pemilih mata uang 160+ fiat + kripto
- M17: Sebagian — PWA manifest + vite-plugin-pwa + ikon; APK Bubblewrap tidak bisa dibuild (tidak ada Android SDK di Replit); BUILD-INSTRUCTIONS.md tersedia
- M18: SELESAI — Bug hunt tuntas, TS clean, build clean
- M19: SELESAI — Audit penuh: CSS tokens lengkap, aksesibilitas, empty states, tablet sidebar
- M20: SELESAI — OfflinePill, HealthScoreWidget, GuidedHomeTour (5 langkah, auto-advance), LocalInsights (StatsPage), useKeyboardShortcuts (N/E/I + Esc), data-tour attributes, HealthScoreWidget + GuidedHomeTour di HomePage
- M21: SELESAI — CSV export (BackupPage, BOM, kompatibel Excel), share transaksi (navigator.share + clipboard fallback), tags input step 3 (max 5, chip UI, Enter/comma/Backspace), jadwal mode gelap otomatis (localStorage, interval 60s, UI jam mulai/selesai)

## Spec Gap Audit — Session (Batch 2)

- [x] Gap 1: TransactionForm single-page scrollable (spec §9) — type chips, CurrencyInput auto-focus, "Simpan"
- [x] Gap 2: Template Transaksi — Dexie version 2 `transaction_templates` table, chips di form header, save/apply/delete
- [x] Gap 3: Batch operations di TransactionListItem + TransactionPage — long press → select mode, select all, batch delete, batch move category
- [x] Gap 4: Import CSV Bank di BackupPage — parser BCA/Mandiri/BNI/BRI/generic, preview sheet dengan baris pilihan, wallet selector, konfirmasi
- [x] Gap 5: Transaksi Berulang Otomatis — Dexie version 3 `recurring_transactions` table, `useRecurringTransactions` hook, `RecurringDueSheet` (konfirmasi saat jatuh tempo), `RecurringPage` CRUD (tambah/toggle aktif/hapus), rute `/settings/recurring`, link di SettingsPage

## Catatan
- build-release/BUILD-INSTRUCTIONS.md tersedia sebagai pengganti APK
- TypeScript: 0 error (verified post-sesi)
- Production build: ✓ clean (26s)
- Bundle main: 114.94 KB gzipped (batas spec 120 KB ✓)
- PWA: 49 entries precached
- §28/§29 audit clean: no console.log, no `any`, no `100vh`, no `#FFFFFF`
- BottomSheet: role="dialog" + aria-modal="true" + aria-labelledby ✓
- All routes lazy-loaded ✓
- Fonts: DM Sans + Instrument Serif + JetBrains Mono, display=swap via Google Fonts ✓
- index.html: lang="id", viewport-fit=cover, theme-color, apple-mobile-web-app-capable ✓
