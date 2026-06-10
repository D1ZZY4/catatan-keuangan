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

## SDK 56 Upgrade (sesi ini)

- `npx expo install expo@latest` → expo@56.0.9 (dari 53.0)
- `npx expo install --fix` → 31 packages upgraded (RN 0.85.3, reanimated v4, expo-router v56, dll)
- `bun add -d @types/react@~19.2.14 typescript@~6.0.3` → TS 6.0 + types terbaru
- 6 TypeScript errors diperbaiki:
  1. `app.config.ts` — hapus `splash` (pindah ke expo-splash-screen plugin)
  2. `_layout.tsx` — ganti `BottomTabBarProps` import dengan custom `TabBarProps` + cast `as unknown`
  3. `backup.tsx` + `BackupService.ts` — ganti `documentDirectory/writeAsStringAsync/readAsStringAsync` ke `new File(Paths.document, name)` + `file.write()/file.text()` API
  4. `FAB.tsx` — ganti `StyleSheet.absoluteFillObject` (dihapus di RN 0.85) dengan explicit values
  5. `crypto/index.ts` — cast `ArrayBufferLike as ArrayBuffer` (TS 6 lebih ketat)
- `react-native-worklets@0.8.3` diinstall (required by reanimated v4)
- `@react-navigation/native` dihapus dari direct deps (expo-router v56 sudah include)
- Workflow command: `bun install && BROWSER=none npx expo start --web --port 5000`
- expo-doctor: 20/21 (satu warning `.expo/` gitignore sudah ditambahkan ke .gitignore)
- TypeScript 0 errors setelah semua fix

## Verifikasi Loop (sesi terbaru — Expo RN codebase)

- tsc --noEmit: bersih (0 error) ✓
- Tidak ada console.log / console.error / console.warn di kode kita ✓
- Semua @ts-expect-error hanya untuk WatermelonDB `created_at` pattern yang legitimate ✓
- Assets: src/assets/fonts/ (5 TTF), src/assets/icons/ (icon, splash, adaptive-icon) ✓
- app.config.ts: icon/splash paths benar, Android permissions lengkap ✓
- _layout.tsx: useFonts lewat @expo-google-fonts + JetBrainsMono lokal ✓
- 22 modals, 5 tabs, onboarding, auth, dompet/[id], transaksi/[id] semua ada ✓
- kurs.tsx: OfflinePill integrated ✓
- backup.tsx: WatermelonDB batch delete+create restore logic ✓
- eas.json: dev/preview/production profiles, EAS-BUILD.md tersedia ✓
- 83 accessibilityLabel di seluruh codebase ✓
- Semua M0–M21 selesai; siap EAS Build APK

## Audit Sesi Ini (Batch 4 — shadow fix + dompet detail enhancement)

- [x] shadows.ts → Platform.select: boxShadow untuk web, shadowColor/etc untuk native — hilangkan warning `shadow*`
- [x] Card.tsx → hapus shadowOpacity inline (tidak perlu di pressed state)
- [x] GuidedHomeTour.tsx + Toast.tsx → Platform.OS spread untuk shadow props
- [x] dompet/[id].tsx → tambah kebab menu (MoreVertical → Modal bottom sheet) dengan opsi Edit, Archive/Unarchive, Hapus — match old-code WalletDetail reference
- [x] dompet/[id].tsx → tx rows sekarang Pressable (navigasi ke transaksi/[id])
- [x] dompet/[id].tsx → balance card sekarang tampilkan currency, type, tx count, archived badge
- TypeScript: 0 error setelah semua fix ✓
- Browser console: bersih, tidak ada shadow* warning ✓

## Audit Sesi Ini (Batch 6 — Icon system + form rebuild)

- [x] IconPicker.tsx — rebuilt sebagai inline 3-tab (Lucide|Iconsax|Merek), 6-col grid, search, brand category chips — match old-code persis
- [x] DynamicIcon.tsx — string-based icon router (plain=Lucide, isax:=Iconsax, fab:=FontAwesome brand)
- [x] BrandIcons.ts — RN brand icons list (FontAwesomeIcon wrapper)
- [x] isaxIcons.ts — curated 78 iconsax icons map (Laptop dihapus, Diamonds bukan Diamond)
- [x] lucideIcons.ts — expanded ~130 icons dari old-code list (TreePine bukan Tree)
- [x] form-dompet.tsx + form-kategori.tsx — rebuilt 3-tab (Dasar|Ikon|Warna) match old-code WalletForm/CategoryForm
- [x] form-kategori.tsx — live preview card dengan DynamicIcon + name placeholder
- [x] WalletCard.tsx — migrated ke DynamicIcon (dari getLucideIcon)
- [x] form-transaksi.tsx — migrated ke DynamicIcon untuk wallet/category chips
- [x] CategoryType — tambah 'both' ke union type
- [x] TypeScript: 0 error setelah semua fix ✓

## Audit Sesi Ini (Batch 5 — dead code cleanup)

- [x] StatCharts.tsx dihapus (tidak diimport di mana pun; statistik.tsx pakai inline chart sendiri)
- [x] Unused `Dimensions` import dihapus dari onboarding/index.tsx
- [x] Cast `(w as {icon?: string}).icon` di form-transaksi.tsx dihapus — WalletModel.icon sudah typed
- TypeScript: 0 error setelah semua fix ✓

## Audit Sesi Ini (Batch 3 — old-code vs RN codebase)

- [x] TxRow di transaksi.tsx → pakai EnrichedTransaction, tampilkan categoryName/note sesuai old-code pola
- [x] useTransactionList.ts → export EnrichedTransaction type
- [x] `pointerEvents` deprecation → dipindah ke style object di FAB.tsx + Toast.tsx
- [x] Statistik tab ketiga "Hutang & Piutang" → import DebtTracker + debtEntries, tab ke-3 aktif
- [x] BudgetRow + RemindersRow → ditambahkan ke beranda.tsx (hidden jika kosong)
- [x] ReminderPeriod fix → 'bulanan' bukan 'monthly'
- [x] Beranda imports → useBudgets, useReminders, ProgressBar, Bell, Layers
- TypeScript: 0 error setelah semua fix ✓
