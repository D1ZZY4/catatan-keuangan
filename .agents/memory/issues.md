## Bug Aktif
(kosong)

## Technical Debt
- Biometrik unlock menggunakan device key, bukan PIN key — artinya jika pengguna punya PIN, data dienkripsi dengan PIN key, tapi biometrik membuka dengan device key yang berbeda. Ini bisa menyebabkan data tidak bisa dibaca setelah unlock biometrik. Butuh desain ulang: simpan kunci terenkripsi dengan biometrik, atau gunakan key wrapping.
- Animasi skeleton shimmer di HomePage tidak menggunakan `animate-shimmer` (class Tailwind) tapi `animate-shimmer skeleton-shimmer` gabungan — sudah benar, keduanya dibutuhkan.
- TransactionForm tidak auto-select kategori pertama saat type berubah — harus pilih manual.
