# Build Log — Catat Artha

## Audit old-code/ — 2026-06-10

### Halaman yang ditemukan
- HomePage: greeting dinamis, net worth hero, wallet cards+sparkline, quick actions, health score, budget row, reminders row, recent transactions
- TransactionPage: filter chips + search + grouped list + swipe gestures + batch select
- TransactionForm: fullHeight bottom sheet, 11 tipe, template chips, category grid, date+time, tags, debt fields
- StatsPage: 3 tabs (Overview, Hutang, Tags), period filter, pie+bar+line charts
- WalletPage: grid cards, drag-reorder, action sheet, net worth header
- SettingsPage: profil, keamanan (PIN+biometrik), tampilan, notifikasi, backup, tentang
- OnboardingPage: 4 slide SVG + setup slide (nama+PIN+biometrik step)
- LockScreen: custom numpad, 6-dot PIN, shake error, biometric prompt
- Calculator: standalone + bisa inject ke form
- OCRScanner: kamera + ML Kit text recognition
- BackupPage: export .artha, import, export CSV
- CategoryPage: CRUD kategori + icon picker + color picker
- BudgetPage: CRUD anggaran per kategori
- ReminderPage: CRUD pengingat tagihan
- RecurringPage: CRUD transaksi berulang

### Komponen shared yang ditemukan
- WalletCard, TransactionListItem, BottomSheet, FAB (speed dial), GuidedHomeTour
- DynamicIcon, SkeletonCard, EmptyState, Toast, ProgressBar, OfflinePill
- ColorPicker, IconPicker, DatePicker, CurrencyInput, Calculator
- AppBar, BottomNav (custom floating pill), SideNav (tablet)

### Logika bisnis yang perlu dimigrasi
- computeWalletBalance: walletId + transactions → balance — src/shared/utils/finance.ts
- getSmartGreeting: waktu + konteks tanggal → greeting string — src/shared/utils/greetings.ts
- healthScore: 4 komponen skor → 0-100 — src/shared/utils/healthScore.ts
- format.ts: formatCurrency (Intl.NumberFormat id-ID), formatDate, formatRelative
- textEngine: joinList, quantityLabel, periodDescription, filterSummary, suggestCategory
- crypto: PBKDF2 key derivation + AES-GCM encrypt/decrypt (→ expo-crypto)
- seed: default categories + wallets (seeded flag)
- PriceService: exchange rates + crypto + emas (→ CCXT)
- SmartCacheService: adaptive TTL berdasarkan usage patterns
- useAutoCategory: rule-based category suggestion dari catatan
- useRecurringTransactions: proses due recurring transactions

### Animasi dan micro-interaction yang ditemukan
- Card stagger entry (60ms delay per item)
- FAB speed dial (stagger 60ms ke atas, scale 0→1)
- Sheet masuk dari bawah (spring smooth)
- Shimmer skeleton (translateX loop 1200ms)
- Tour spotlight pulse (scale + opacity withSequence)
- Press scale 0.97 (semua card + tombol)
- Swipe gesture reveal (hapus merah kiri, duplikat biru kanan)
- Confetti burst setelah tour selesai
- PIN shake animation (translateX withSequence ±6px)
- Dot indicator expand (active dot jadi pill width 24px)

### Hal yang TIDAK perlu dimigrasi (web-only)
- Dexie IndexedDB → WatermelonDB
- Web Crypto API → expo-crypto
- Web Navigator.credentials (WebAuthn) → expo-local-authentication
- React Router → Expo Router
- CSS variables + Tailwind web → NativeWind + AppColors
- `100dvh`, CSS safe area → useSafeAreaInsets()
- Tesseract.js OCR → @react-native-ml-kit/text-recognition
- Web Notification API → expo-notifications
- window.location, document → tidak dipakai
- react-confetti-explosion → react-native-confetti-cannon
- pointer events (web) → react-native-gesture-handler

## Build History
- [Belum ada build]
