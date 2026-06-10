# UI Audit — Catat Artha

## Status: Audit old-code/ selesai, implementasi RN belum dimulai

## Halaman yang Ditemukan di old-code/

### Beranda (HomePage)
- NetWorthHero: greeting dinamis berdasarkan waktu + konteks tanggal, saldo net worth besar (40px bold serif), toggle sembunyikan saldo, income/expense card bulan ini
- WalletCardWithSparkline: horizontal scroll dompet dengan sparkline 7 hari
- QuickActions: grid aksi cepat (custom dari FAB speed dial context)
- HealthScoreWidget: skor keuangan expandable
- BudgetRow: horizontal scroll progress budget per kategori
- RemindersRow: pengingat tagihan mendatang
- Recent Transactions: 6 transaksi terakhir dengan list item

### Transaksi (TransactionPage)
- Filter chips: period (hari ini, 7 hari, bulan ini, dll)
- Filter type: semua, pemasukan, pengeluaran, transfer
- Search bar
- Grouped by date: section header tanggal
- TransactionListItem: swipe kiri → hapus, swipe kanan → duplikat, long press → batch select
- Batch select mode: checkbox + bulk delete
- FAB untuk tambah transaksi

### Form Transaksi (TransactionForm — BottomSheet fullHeight)
- Template chips di atas
- Type switcher: horizontal chips semua 11 tipe transaksi
- CurrencyInput: input nominal dengan evaluasi ekspresi (mathjs)
- WalletSelector: horizontal chips dompet aktif
- CategoryGrid: 4 kolom kategori berikon
- DatePicker: tanggal + jam
- Note input
- Tags input (maks 5, Enter/koma untuk tambah)
- LinkedPerson (untuk debt types)
- Simpan sebagai template + Split Bill shortcuts
- Save button (disabled saat loading/amount=0)

### Statistik (StatsPage)
- Tab: Overview, Hutang/Piutang, Tags
- Period filter: bulan ini (default), kustom range
- Overview: pie chart pengeluaran per kategori, bar chart perbandingan
- Hutang/Piutang: list hutang aktif, total outstanding
- Tags: statistik per tag

### Dompet (WalletPage)
- Net worth total di atas
- Grid/list dompet dengan WalletCard
- Drag-to-reorder
- Long press → action sheet (edit, arsip, duplikat, hapus)
- Tombol tambah dompet

### Pengaturan (SettingsPage)
- Profil: nama pengguna
- Keamanan: PIN, biometrik, auto-lock
- Tampilan: dark mode, jadwal, teks size, mata uang dasar
- Notifikasi: toggle dan waktu
- Backup: export .artha, import, export CSV
- Tentang: versi app, developer, lisensi

### Onboarding (OnboardingPage)
- 4 slide ilustrasi SVG + 1 slide setup
- Swipe gestur kiri/kanan
- Dot indicator dengan progress bar untuk active
- Slide 5: nama + toggle PIN + PIN input + konfirmasi
- Biometric step setelah PIN setup

### Lock Screen (LockScreen)
- 6 dot PIN indicator
- Custom numpad 3x4
- Shake animation pada error
- Biometric auto-prompt
- Cooldown 30s setelah 5x salah

## Komponen Shared yang Ditemukan

| Komponen | Fungsi | Migrasi |
|---|---|---|
| WalletCard | Card dompet + sparkline SVG | RN + react-native-svg |
| TransactionListItem | List item swipeable | RN + Swipeable (RNGH) |
| BottomSheet | Swipe-to-dismiss drawer | @gorhom/bottom-sheet |
| FAB | Speed dial floating button | RN Animated + Pressable |
| GuidedHomeTour | Spotlight tour overlay | RN Modal + measure() |
| DynamicIcon | Universal icon resolver | AppIcon.tsx (static map) |
| SkeletonCard | Shimmer loading | RN Reanimated |
| EmptyState | Empty state dengan ilustrasi | RN + react-native-svg |
| Toast | Snackbar notification | RN + Reanimated |
| ProgressBar | Budget progress | RN View dengan StyleSheet |
| OfflinePill | Status offline | RN View fixed position |
| ColorPicker | Pilih warna dompet/kategori | RN FlatList grid |
| IconPicker | Pilih ikon dompet/kategori | RN FlatList grid |
| DatePicker | Tanggal + jam picker | @react-native-community/datetimepicker |
| CurrencyInput | Input nominal dengan mathjs | RN TextInput + mathjs |
| Calculator | Kalkulator standalone | RN + mathjs |

## Animasi yang Ditemukan di old-code/

| Animasi | Source | RN Implementation |
|---|---|---|
| Card masuk stagger | CSS transition + delay | Reanimated withDelay + withSpring |
| FAB speed dial stagger | CSS transition | Reanimated withDelay + withSpring |
| Sheet slide dari bawah | CSS transform | @gorhom/bottom-sheet |
| Shimmer skeleton | CSS animation | Reanimated shimmer loop |
| Tour spotlight pulse | CSS animation | Reanimated withSequence |
| Press scale | CSS scale transition | Reanimated usePressScale |
| Swipe gesture | CSS transform | RNGH Swipeable |
| Confetti | react-confetti-explosion | react-native-confetti-cannon |
| PIN shake error | CSS animate-shake | Reanimated withSequence translateX |
| Dot indicator active | CSS width transition | Reanimated withSpring width |

## Fitur Ditemukan (Bisa Ditambahkan Tanpa Risiko Regresi)

1. **Smart greeting konteksual** — sudah di old-code/, migrasi ke RN sama persis
2. **Category suggestion otomatis** — rule-based dari keywords catatan (textEngine.suggestCategory)
3. **Template transaksi** — save transaksi sebagai template, ada di old-code/
4. **HealthScore auto-expand** — detail breakdown skor finansial
5. **Offline pill** — muncul otomatis saat price data stale
