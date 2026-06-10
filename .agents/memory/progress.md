---
name: Catat Artha Build Progress
description: Current build status, what is done, what is next for Catat Artha
---

# Build Progress — Catat Artha

## Status: TypeScript bersih — siap EAS build

## Selesai ✅
- **Foundation**: package.json, tsconfig.json, app.json, babel.config.js, metro.config.js, eas.json, tailwind.config.js
- **Theme Layer**: colors.ts (typed as AppColors interface), typography, shadows, spacing, animation, ThemeContext
- **Config**: labels.ts (AppLabels), periods.ts (AppConfig + PeriodKey)
- **Types**: types.ts (all domain interfaces)
- **Utils**: formatters, textEngine, finance, healthScore, misc, devFlags
- **DB Layer**: schema.ts, database.ts, seedData.ts + 7 models — Wallet, Transaction, Category, Budget, Reminder, RecurringTransaction, TransactionTemplate
- **Crypto**: deviceKey.ts, encryption.ts, pinStore.ts
- **Services**: settingsStore.ts, calculatorEngine.ts
- **Hooks**: useSettings.tsx, useAppLock.tsx, useCurrencyRates.ts, useTransactions.ts, useWallets.ts
- **Shared Components**: AppIcon, AppText, AppCard, AppButton, BalanceText, EmptyState, FAB, PinPad, BottomSheetWrapper, LoadingOverlay, TransactionTypeChip, Calculator, SparklineChart, OfflinePill
- **Routes**: _layout.tsx, (onboarding)/index.tsx, (auth)/lock.tsx + all 5 tabs + all 12 modals
- **Fonts**: @expo-google-fonts packages, paths in node_modules/...

## Kunci Keputusan Teknis
- WatermelonDB decorators: `import { field } from '@nozbe/watermelondb/decorators'`
- MMKV v3: pakai `createMMKV()` bukan `new MMKV()`
- Font paths: `require('../node_modules/@expo-google-fonts/...')`
- FAB prop: `onSelect(type: TransactionType)` bukan `onPress`
- TransactionTypeChip: `showLabel={false}` bukan `iconOnly`
- colors.ts typed as `AppColors` interface (avoid literal type errors)
- tsconfig: `experimentalDecorators: true`, excludes `old-code/`
- FileSystem API (SDK 54): cast with `unknown` to access `documentDirectory`

## Selanjutnya ⏳
- EAS Build: `bunx eas build --platform android --profile preview`
- Workflow Expo dev server
- Stub icon assets already in src/assets/ (1x1 PNG placeholders)
