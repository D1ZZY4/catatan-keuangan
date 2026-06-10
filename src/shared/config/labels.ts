import type { TransactionType } from '../types';

export const AppLabels = {
  app: {
    name: 'Catat Artha',
    tagline: 'Keuangan keluarga, dalam satu tempat.',
  },

  transactionType: {
    expense: 'Pengeluaran',
    income: 'Pemasukan',
    transfer_internal: 'Transfer',
    transfer_external: 'Kirim Uang',
    debt_given: 'Piutang',
    debt_received: 'Hutang',
    debt_repay: 'Pelunasan',
    savings_deposit: 'Tabungan',
    savings_withdraw: 'Tarik Tabungan',
    invest_buy: 'Beli Investasi',
    invest_sell: 'Jual Investasi',
  } as Record<TransactionType, string>,

  periodLabels: {
    today: 'Hari Ini',
    last7days: '7 Hari',
    thisMonth: 'Bulan Ini',
    last3months: '3 Bulan',
    last6months: '6 Bulan',
    thisYear: 'Tahun Ini',
    custom: 'Kustom',
    all: 'Semua',
  },

  filterType: {
    all: 'Semua',
    income: 'Pemasukan',
    expense: 'Pengeluaran',
    transfer: 'Transfer',
  },

  transactionForm: {
    amountPlaceholder: '0',
    notePlaceholder: 'Catatan (opsional)',
    personNamePlaceholder: 'Nama',
    personPhonePlaceholder: 'Nomor HP (opsional)',
    saveButton: 'Simpan',
    cancelButton: 'Batal',
    editTitle: (type: string) =>
      `Edit ${AppLabels.transactionType[type as TransactionType] ?? type}`,
    addTitle: (type: string) =>
      AppLabels.transactionType[type as TransactionType] ?? type,
  },

  walletDefaults: { cash: 'Tunai', bank: 'Bank', savings: 'Tabungan' },
  walletType: {
    cash: 'Tunai',
    bank: 'Rekening Bank',
    'e-wallet': 'Dompet Digital',
    investment: 'Investasi',
    savings: 'Tabungan',
    credit: 'Kartu Kredit',
    crypto: 'Kripto',
    other: 'Lainnya',
  },

  categories: {
    expense: {
      food: 'Makanan & Minuman',
      transport: 'Transportasi',
      shopping: 'Belanja',
      bills: 'Tagihan & Utilitas',
      health: 'Kesehatan',
      entertainment: 'Hiburan',
      education: 'Pendidikan',
      household: 'Perawatan Rumah',
      clothing: 'Pakaian',
      beauty: 'Kecantikan & Perawatan Diri',
      charity: 'Hadiah & Donasi',
      other: 'Lainnya',
    },
    income: {
      salary: 'Gaji',
      freelance: 'Freelance & Sampingan',
      business: 'Bisnis',
      investment: 'Investasi',
      gift: 'Hadiah Uang',
      bonus: 'Bonus',
      refund: 'Pengembalian Dana',
      other: 'Lainnya',
    },
  },

  tabs: {
    home: 'Beranda',
    transaction: 'Transaksi',
    stats: 'Statistik',
    wallet: 'Dompet',
    settings: 'Pengaturan',
  },

  actions: {
    add: 'Tambah',
    edit: 'Ubah',
    delete: 'Hapus',
    archive: 'Arsipkan',
    restore: 'Pulihkan',
    share: 'Bagikan',
    duplicate: 'Duplikat',
    markDone: 'Tandai Lunas',
    scanReceipt: 'Scan Struk',
    useValue: 'Gunakan Nilai Ini',
    skipTour: 'Lewati Tur',
    startApp: 'Mulai',
    skip: 'Lewati',
    confirm: 'Konfirmasi',
    cancel: 'Batal',
  },

  emptyState: {
    transactions: {
      title: 'Belum Ada Transaksi',
      body: 'Catat transaksi pertama Anda dengan tombol di bawah.',
    },
    wallets: {
      title: 'Belum Ada Dompet',
      body: 'Buat dompet pertama Anda untuk mulai mencatat.',
    },
    budgets: {
      title: 'Belum Ada Anggaran',
      body: 'Atur anggaran per kategori untuk kontrol pengeluaran.',
    },
    reminders: {
      title: 'Belum Ada Pengingat',
      body: 'Tambahkan pengingat untuk tagihan rutin Anda.',
    },
    stats: {
      title: 'Belum Ada Data',
      body: 'Mulai mencatat transaksi untuk melihat statistik.',
    },
    search: {
      title: 'Tidak Ditemukan',
      body: 'Tidak ada transaksi yang cocok dengan pencarian Anda.',
    },
    templates: {
      title: 'Belum Ada Template',
      body: 'Simpan transaksi sebagai template untuk entri lebih cepat.',
    },
    debts: {
      title: 'Tidak Ada Hutang atau Piutang',
      body: 'Semua hutang dan piutang sudah lunas.',
    },
  },

  errors: {
    storageFull:
      'Penyimpanan perangkat hampir penuh. Hapus data lama atau bersihkan cache aplikasi.',
    ocrFailed:
      'Struk tidak dapat dibaca. Coba foto dengan pencahayaan yang lebih baik.',
    importFailed:
      'File tidak dapat dibuka. Pastikan PIN Anda benar dan file tidak rusak.',
    saveFailed: 'Gagal menyimpan. Coba lagi.',
    noWallet:
      'Buat dompet terlebih dahulu sebelum mencatat transaksi.',
    invalidPin: 'PIN tidak cocok',
    pinTooShort: 'PIN minimal 4 digit',
    nameRequired: 'Nama tidak boleh kosong',
    amountRequired: 'Jumlah tidak boleh nol',
    walletRequired: 'Pilih dompet terlebih dahulu',
    toWalletRequired: 'Pilih dompet tujuan',
  },

  offlinePill: {
    label: (date: string) => `Mode Luring · Kurs per ${date}`,
    currency: (code: string) => `Kurs ${code} tidak tersedia`,
  },

  settings: {
    profile: 'Profil',
    security: 'Keamanan',
    appearance: 'Tampilan',
    notification: 'Notifikasi',
    backup: 'Cadangan & Pemulihan',
    deleteAll: 'Hapus Semua Data',
    about: 'Tentang Aplikasi',
    appName: 'Catat Artha',
    developer: 'Aby Abdillah',
    license: 'MIT',
  },

  onboarding: {
    slide1: {
      title: 'Semua keuangan keluarga,\ndalam satu tempat.',
      subtitle: 'Pantau dompet, tabungan, dan investasi keluarga dengan mudah.',
    },
    slide2: {
      title: 'Banyak dompet,\nsatu pandangan.',
      subtitle: 'Kelola kas tunai, rekening bank, dan e-wallet sekaligus.',
    },
    slide3: {
      title: 'Semua jenis transaksi\ntercatat rapi.',
      subtitle:
        'Pemasukan, pengeluaran, transfer, piutang, dan investasi. Semuanya ada.',
    },
    slide4: {
      title: 'Data kamu,\ntidak kemana-mana.',
      subtitle:
        'Semua data tersimpan di HP kamu sendiri, tidak dikirim ke server manapun.',
    },
    slide5: {
      title: 'Hampir siap!',
      subtitle: 'Masukkan nama dan buat PIN untuk mengamankan data Anda.',
    },
  },

  tour: {
    step1: { title: 'Selamat datang!', body: 'Ini adalah dasbor keuangan Anda.' },
    step2: { title: 'Dompet Anda', body: 'Tiga dompet sudah siap untuk Anda.' },
    step3: {
      title: 'Catat Transaksi',
      body: 'Tombol ini untuk mencatat transaksi baru.',
    },
    step4: {
      title: 'Navigasi Utama',
      body: 'Transaksi, Statistik, Dompet, dan Pengaturan.',
    },
    step5: {
      title: 'Anggaran Bulanan',
      body: 'Kelola anggaran bulanan Anda di sini.',
    },
    step6: {
      title: 'Kalkulator Bawaan',
      body: 'Bisa langsung mengisi form nominal.',
    },
    done: { title: 'Semua Siap!', body: 'Selamat mencatat keuangan.' },
  },

  lock: {
    title: 'Masukkan PIN',
    biometricPrompt: 'Buka dengan sidik jari atau wajah',
    wrongPin: 'PIN salah',
    cooldown: (seconds: number) => `Coba lagi dalam ${seconds} detik`,
    attemptsLeft: (n: number) => `${n} percobaan tersisa`,
  },

  currency: {
    idr: 'Rupiah Indonesia',
    usd: 'Dolar AS',
    eur: 'Euro',
    sgd: 'Dolar Singapura',
    myr: 'Ringgit Malaysia',
    jpy: 'Yen Jepang',
    gbp: 'Poundsterling',
    aud: 'Dolar Australia',
    btc: 'Bitcoin',
    eth: 'Ethereum',
    xau: 'Emas (per gram)',
  },
} as const;
