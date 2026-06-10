---
name: Catat Artha Build Progress
description: Current build status, what is done, what is next for Catat Artha
---

# Build Progress — Catat Artha

## Status: TypeScript BERSIH (0 errors) — Siap EAS Build

## Selesai ✅
- **Foundation**: package.json, tsconfig.json, app.json, babel.config.js, metro.config.js, eas.json, tailwind.config.js
- **app.config.ts**: package ID benar `id.catartha.app`, minSdkVersion 21, targetSdkVersion 35 via `as ExpoConfig['android'] & {...}` cast
- **Theme Layer**: colors.ts, typography, shadows, spacing, animation, ThemeContext
- **Config**: labels.ts (AppLabels), periods.ts (AppConfig + PeriodKey)
- **Types**: types.ts (all domain interfaces)
- **Utils**: formatters, textEngine, finance, healthScore, misc, devFlags, pickerBridge
- **DB Layer**: schema.ts, database.ts, seedData.ts + 7 models — Wallet, Transaction, Category, Budget, Reminder, RecurringTransaction, TransactionTemplate
- **Crypto**: deviceKey.ts, encryption.ts, pinStore.ts
- **Services**: settingsStore.ts, calculatorEngine.ts
- **Hooks**: useSettings.tsx, useAppLock.tsx, useCurrencyRates.ts, useTransactions.ts, useWallets.ts, **useBudgets.ts**, **useReminders.ts**, **useCategories.ts**
- **Shared Components**: AppIcon, AppText, AppCard, AppButton, BalanceText, EmptyState, FAB, PinPad, BottomSheetWrapper, LoadingOverlay, TransactionTypeChip, Calculator, SparklineChart, OfflinePill, GuidedHomeTour, DatePickerWrapper, WalletCard, CurrencyInput, AppBar, SkeletonCard, TransactionListItem, Badge, ChipGroup, ColorPicker, Divider, HapticButton, IconPicker, ProgressBar, SearchBar, Toast
- **Routes (5 Tabs)**: index (home — Budget row, Reminders row, Health Score widget, Hide balance), transactions, stats, wallets, settings (keamanan/tampilan/pengelolaan/notifikasi/data/tentang sections)
- **Routes (Modals)**: transaction-form, transaction-detail, wallet-form (**edit support**), calculator, backup, profile-edit, security-settings, category-picker, wallet-picker, filter, about, delete-all-confirm, **budget-form** (create+edit), **reminder-form** (create+edit), **category-form** (create+edit, IconPicker+ColorPicker tabs)
- **Routes (Dev)**: **(dev)/ui-check.tsx** — semua komponen, typography, colors, icons, navigation (dev-only guard)
- **Routes (Auth+Onboarding)**: (auth)/lock.tsx, (onboarding)/index.tsx
- **Image Assets**: icon.png (1024x1024), splash.png, adaptive-icon.png, notification-icon.png

## Kunci Keputusan Teknis
- WatermelonDB decorators: `import { field } from '@nozbe/watermelondb/decorators'`
- MMKV v3: pakai `createMMKV()` bukan `new MMKV()`
- Font paths: `require('../node_modules/@expo-google-fonts/...')`
- FAB prop: `onSelect(type: TransactionType)` bukan `onPress`
- TransactionTypeChip: `showLabel={false}` bukan `iconOnly`
- colors.ts typed as `AppColors` interface (avoid literal type errors)
- tsconfig: `experimentalDecorators: true`, excludes `old-code/`
- FileSystem API (SDK 54): cast with `unknown` to access `documentDirectory`
- expo dev server TIDAK bisa jalan di Replit (freeport-async port scan 11000-65535 blocked)
- Workflow diset ke `bunx tsc --noEmit --watch --pretty` (bukan expo start)
- PickerBridge pattern: module-level singleton callback untuk picker-to-form communication
- stats.tsx: menggunakan custom SimplePieChart/SimpleBarChart/SimpleAreaChart (react-native-svg)
- GuidedHomeTour: `accessibilityViewIsModal` bukan `accessibilityRole="dialog"`
- DatePickerWrapper: `formatDate(value.getTime())` bukan `formatDate(value)` (expects number)
- expo-doctor warnings tentang versi BISA DIABAIKAN — kita terkunci di SDK 54
- transactions.tsx pakai `useTransactions(activePeriod)` dengan search/filter benar
- app.config.ts minSdkVersion/targetSdkVersion: pakai `as ExpoConfig['android'] & { minSdkVersion: number; targetSdkVersion: number }` karena field tidak ada di ExpoConfig typedefs
- Badge prop: `variant` ('default'|'success'|'warning'|'danger'|'info') bukan `color`
- ChipGroup prop: `items` bukan `chips`
- GuidedHomeTour prop: hanya `onComplete`, tidak ada `onSkip`
- IconPicker props: `value` + `onChange` (bukan `selectedIcon`/`onSelect`)
- ColorPicker props: `value` + `onChange` (bukan `selectedColor`/`onSelect`)

## Selanjutnya ⏳
- EAS Build: `bunx eas build --platform android --profile preview`
- Untuk build, perlu: `bunx eas login` dan account Expo terlebih dahulu
