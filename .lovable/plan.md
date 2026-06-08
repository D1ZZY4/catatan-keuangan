# Catatan Keuangan — Build Plan (revised)

Fully offline-first personal finance PWA for Android homescreen. Replace the current TanStack Start template with a fresh Vite + React 18 + TypeScript project matching the spec (React Router v6, Tailwind v3, vite-plugin-pwa, Dexie, Web Crypto, Tesseract.js, Recharts).

## Stack reset (M0)

- Delete TanStack Start files: `src/routes/`, `src/router.tsx`, `src/start.ts`, `src/server.ts`, `src/routeTree.gen.ts`, current `src/styles.css`, current `vite.config.ts`, `src/lib/*` template helpers.
- **Delete `src/components/ui/` entirely.** No shadcn primitives kept. No Radix-styled wrappers, no headlessui. Every UI primitive in M2 is built from scratch with plain React + Tailwind using our `--bg-card`, `--accent-primary` etc. tokens, so nothing carries shadcn's default styling fingerprint.
- Allowed exception: unstyled accessibility internals only where genuinely needed (e.g. `@radix-ui/react-focus-scope` or `@radix-ui/react-dismissable-layer` for focus trapping inside our custom `BottomSheet` / modals). No Radix styled components, no Radix `Dialog.Root` wrappers — only the headless primitives, and only if a hand-rolled implementation would be incorrect for a11y.
- New `package.json` per spec table: React 18.3, react-router-dom 6.24, Tailwind 3.4, Dexie 3.2, lucide-react, recharts, tesseract.js, mathjs, nanoid, vite-plugin-pwa; dev: postcss, autoprefixer, @vitejs/plugin-react, typescript 5.4.
- New strict `tsconfig.json` (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`, `@/*` alias).
- New `vite.config.ts` with React plugin + VitePWA config from §14.
- `tailwind.config.ts` with §1 color tokens (light + dark via `class`), Plus Jakarta Sans, radius scale 8/12/16/24.
- New `index.html` shell + Plus Jakarta Sans `<link>` + `theme-color` meta.
- Folder skeleton from §2 (`app/`, `features/*`, `shared/*`, `pwa/`).
- New entry: `src/main.tsx` → `<RouterProvider>` placeholder route so dev server boots green.

## Staged milestones (spec §20)

Each milestone ends with a working preview. I stop after each one for your review.

### M1 — Foundation
- Dexie schema (§15) v1, all tables.
- Crypto wrappers: PBKDF2 (100k iters, SHA-256, 16-byte salt), AES-GCM 256 encrypt/decrypt, envelope helpers, deterministic device-fingerprint fallback key.
- Mock data seeder behind a dev flag.
- `Intl`-based `id-ID` currency / date / number formatters.
- nanoid id helper, safe mathjs expression evaluator.

### M2 — Design system + shared components (§19)
Built from scratch, no shadcn, no styled Radix: `BottomSheet`, `AppBar`, `BottomNav`, `Card`, `FAB`, `ProgressBar`, `CurrencyInput`, `IconPicker`, `ColorPicker`, `DatePicker`, `SkeletonCard`, `Toast`, `EmptyState`, `TransactionListItem`, `WalletCard`. Tokens via Tailwind, dark mode via `class` strategy.

### M3 — App shell
`createBrowserRouter` with lazy routes, BottomNav (Beranda/Transaksi/Statistik/Dompet/Pengaturan), AppBar with calculator icon, dark mode toggle (only localStorage use allowed: `theme`).

### M4 — Onboarding (§3)
5-slide swipeable carousel, inline SVG illustrations, name input + optional PIN/biometric on slide 5, persisted via Dexie `settings` flag.

### M5 — Auth + lock screen (§4)
PIN → PBKDF2 key, WebAuthn registration with PIN-only fallback, auto-lock after configurable background timeout, 5-strike 30s cooldown.

### M6 — Categories (§7)
Default seed on first run, CRUD page, Lucide icon picker, protect defaults from deletion.

### M7 — Wallets (§5)
CRUD bottom sheet with icon/color/currency picker (160+ ISO + XAU/BTC/ETH/XRP/BNB/SOL, pinned IDR/USD/SGD/EUR/XAU/BTC), grid dashboard with sparkline, computed balances, animated net-worth counter, archive/duplicate/delete.

### M8 — Transactions (§6)
All 11 types, stepper bottom sheet, math expression amount input, compressed-JPEG attachments, edit mode, virtualized list when >100, FAB with radial speed dial.

### M9 — Budgets (§8)
CRUD, monthly/weekly, color-coded progress cards, threshold notifications.

### M10 — Statistics (§9)
Period + wallet filters, Recharts donut/bar/area, summary cards, debt/receivables tracker, html2canvas PNG export.

### M11 — Live prices (§10)
`PriceService` with Frankfurter/CoinGecko/Gold fallback chain, Dexie `price_cache` with TTLs, "Mode Offline" pill, converted balances on wallet cards.

### M12 — OCR scanner (§6)
Tesseract.js worker (`eng+ind`), camera/file input, TOTAL/date/merchant parser, confidence highlights, preview-confirm flow.

### M13 — Bill reminders (§12)
CRUD, due-date computation, dedup via `notifications_sent`, upcoming-3 strip on Beranda.

### M14 — Calculator (§13)
Persistent AppBar icon, draggable bottom sheet, history tape, "Gunakan nilai ini" pipes into open transaction form via context.

### M15 — Backup / restore (§11)
`.catkeu` format: header + AES-GCM ciphertext + SHA-256 checksum, export download, import with preview confirmation and schema validation.

### M16 — PWA finalization (§14)
Manifest, generated CK monogram icons (192/512/maskable), Workbox runtime caching for Frankfurter/CoinGecko/Google Fonts, `autoUpdate`.

### M17 — Polish
Empty-state SVGs, error/edge messages (§18), a11y pass (44px targets, color+icon+text, aria-labels), animation tightening, §16 perf verification.

## Technical notes

- **Encryption envelope**: `{ id, walletId?, date?, type?, createdAt, iv, blob }` — index fields duplicated outside the encrypted blob for Dexie queries; blob holds the full record. Reads decrypt through a `useDB` hook holding the AES key in memory.
- **Key lifecycle**: derived once on unlock, kept in `AuthContext` ref, never persisted, cleared on lock.
- **No localStorage for user data** — only `theme`.
- **Feature contexts** (`AuthContext`, `WalletsContext`, `TransactionsContext`, `CalculatorContext`) — no Redux.
- **Lazy routes** via `React.lazy` + `<Suspense fallback={<SkeletonCard />}>` to hit the <120 KB initial bundle target.
- **PWA preview caveat**: Service worker is disabled in the Lovable in-editor preview iframe; offline + SW install verifies only on the published URL.

## Out of scope
Cloud sync, multi-device, login, analytics, ads, paid APIs, iOS-specific install polish.

## Next pass
Approved already — first build pass executes **M0 (stack reset)** + **M1 (Dexie + crypto + utils)**, then I stop for your review before M2.
