## Keputusan Arsitektur

### State Management
- React Context + useReducer (tidak ada Redux)
- AuthContext: status auth + CryptoKey di memori
- AppDataContext: semua data ter-dekripsi dari IndexedDB
- CalculatorContext: state kalkulator global (dibuka dari AppBar)

### Enkripsi
- AES-GCM 256-bit, PBKDF2 100k iterasi
- Kunci dari PIN atau device fingerprint (tanpa PIN)
- Biometrik WebAuthn hanya mengautentikasi identitas; kunci tetap berasal dari PIN atau device key
- IV unik per enkripsi, disimpan bersama blob

### Database (Dexie)
- Semua record sensitif disimpan sebagai EncryptedEnvelope (id, iv, blob terenkripsi)
- Field plaintext untuk indexing: walletId, type, date, categoryId, dll.
- price_cache: IndexedDB untuk caching harga live

### Font Stack (diputuskan pada sesi bug hunt)
- DM Sans: body, label, tombol, navigasi
- Instrument Serif: display/heading besar, angka saldo
- JetBrains Mono: nominal transaksi kecil, angka monospace

**Why:** Spec menetapkan kombinasi ini secara eksplisit; Sora+Space Grotesk adalah sisa font lama yang salah.

### exactOptionalPropertyTypes
- Gunakan conditional spread `{...(cond ? { prop: val } : {})}` untuk optional props
- Jangan langsung assign `undefined` ke optional prop

### TypeScript Strict
- noUncheckedIndexedAccess: selalu check `?? fallback` saat akses array/map
- useEffect harus return explicit `return undefined` jika salah satu branch tidak return cleanup

### APK / Build Release
- Bubblewrap CLI memerlukan Android SDK, tidak tersedia di Replit
- Solusi: dokumentasikan langkah manual di build-release/BUILD-INSTRUCTIONS.md
