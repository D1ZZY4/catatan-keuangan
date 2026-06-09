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

## Spec Bug-Hunt §30–§31 (Sesi Terbaru)

- [x] KRITIS: Bundle 6.52 MB main chunk → manualChunks di vite.config.ts + maximumFileSizeToCacheInBytes:5MB; main index sekarang 19.98 kB gzipped
- [x] TX_TYPES filter chips (Semua/Pemasukan/Pengeluaran/Transfer) tidak dirender di TransactionPage header → ditambahkan sebagai Baris 2 chips; type filter dihapus dari FilterSheet (hanya Dompet)
- [x] activeFilterCount menghitung txType (tidak sesuai spec) → sekarang hanya menghitung walletId + tag
- [x] Dark schedule hanya dicek saat SettingsPage terbuka → global interval 60s ditambahkan di AppShell.tsx
- [x] AppShell loading skeleton pakai h-screen (bukan h-[100dvh]) → diperbaiki
- [x] OfflinePill component tidak diintegrasikan → sekarang dipakai di WalletPage.tsx (mengganti inline WifiOff indicator)
- [x] Dexie v4: tabel usage_patterns ditambahkan; SmartCacheService sekarang pakai db.usage_patterns bukan db.settings
- [x] Tag filter di TransactionPage: FilterState.tag, filter logic (tx.tags?.includes), allTags useMemo, chip UI di filter sheet
- [x] Default wallet seeding: Tunai/Bank/Tabungan sekarang menyertakan type/showInDashboard/includeInTotal

## Catatan
- build-release/BUILD-INSTRUCTIONS.md tersedia sebagai pengganti APK
- TypeScript: 0 error (verified post-§30 sesi)
- Production build: ✓ clean (30s), 4593 modules
- Bundle main index: 19.98 kB gzipped (batas spec 120 KB ✓✓)
- PWA: 42 entries precached, 7652 KB total
- §28/§29 audit clean: no console.log, no `any`, no `100vh`, no `#FFFFFF`
- BottomSheet: role="dialog" + aria-modal="true" + aria-labelledby + focus trap ✓
- All routes lazy-loaded ✓
- Fonts: DM Sans + Instrument Serif + JetBrains Mono, display=swap via Google Fonts ✓
- index.html: lang="id", viewport-fit=cover, theme-color, apple-mobile-web-app-capable ✓
- safe-area-inset: BottomNav, FAB, AppBar, OnboardingPage, styles.css ✓
- data-tour attributes: greeting, wallets, fab, navbar, budget, calculator ✓
- GuidedHomeTour: confetti on completion, focus restore ✓

## Verifikasi Loop (sesi terbaru)

- tsc --noEmit: bersih (0 error)
- vite build: clean (19.46s, 4593 modules, PWA 42 precache)
- Bundle main index: 20.43 kB gzipped (batas spec 120 KB ✓)
- vendor-iconsax: 688 KB gzipped — lazy-loaded chunk (hanya termuat bila ada nama ikon `isax:`)
- Dev server: port 8080, preview hidup, onboarding tampil sesuai harapan
- Tidak ada milestone tersisa; semua M0–M21 sudah ditandai selesai
- APK: BUILD-INSTRUCTIONS.md di build-release/ (Bubblewrap butuh Android SDK lokal)
