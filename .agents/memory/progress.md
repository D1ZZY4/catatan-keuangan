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

## Semua Spec Gap Ditutup

- [x] Versi auto-inject dari package.json (VITE_APP_VERSION, VITE_BUILD_DATE)
- [x] 3 dompet default di-seed saat completeOnboarding
- [x] Welcome screen pasca-onboarding (confetti + wallet preview)
- [x] SmartCacheService (adaptive TTL, eviksi, preload pattern)
- [x] Tablet sidebar (SideNav md+, BottomNav md:hidden)
- [x] CSS token lengkap sesuai spec (--bg-input, --accent-warm, --text-placeholder, --border, --shadow-sm/md/inset)
- [x] --bg-surface tidak lagi putih murni (#EDE8B8)
- [x] ReminderEmptyIllustration + aria-label pada icon buttons
- [x] WelcomeScreen warna wallet pakai CSS vars (theme-aware)
- [x] Optimistic updates di AppDataContext — semua 15 mutasi (5 entitas × add/update/remove) instan + rollback on error
- [x] Swipe kiri → hapus (reveal zone merah) + swipe kanan → duplikat di TransactionListItem
- [x] MIT License modal di Settings (klik "Lisensi")
- [x] Hapus baris "Kredit" di Settings (spec §22 melarang)
- [x] Developer: Aby Abdillah ditampilkan di Tentang Aplikasi
- [x] Toggle knob bg-white → bg-bg-page (tidak ada #FFFFFF di UI)

## Catatan
- build-release/BUILD-INSTRUCTIONS.md tersedia sebagai pengganti APK
- TypeScript: 0 error
- Production build: ✓ clean (26s)
- Bundle main: 114.94 KB gzipped (batas spec 120 KB ✓)
- PWA: 49 entries precached
