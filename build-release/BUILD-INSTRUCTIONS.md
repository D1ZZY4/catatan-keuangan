# Cara Build APK Catatan Keuangan

Ada 3 cara mendapatkan APK. Pilih yang paling mudah bagimu.

---

## Cara 1 — GitHub Actions (PALING MUDAH, otomatis)

APK dibangun otomatis di cloud tanpa perlu install apapun di komputermu.

### Langkah:

1. **Push kode ke GitHub**
   ```bash
   git init
   git add .
   git commit -m "Catatan Keuangan"
   git remote add origin https://github.com/USERNAME/catatan-keuangan.git
   git push -u origin main
   ```

2. **Buka tab Actions di GitHub**
   → Klik workflow **"Build Android APK"** yang sedang berjalan

3. **Tunggu ~5 menit** sampai selesai (tanda centang hijau ✓)

4. **Download APK**
   Scroll ke bawah di halaman run → Klik **"catatan-keuangan-debug"** → Extract ZIP → install `app-debug.apk`

5. **Install di HP Android**
   - Kirim file APK ke HP (WhatsApp, kabel USB, Google Drive, dll)
   - Tap file APK → Izinkan "Install dari sumber tidak dikenal"
   - Buka **Catatan Keuangan** 🎉

> File workflow sudah ada di `.github/workflows/build-apk.yml` — tidak perlu konfigurasi tambahan.

---

## Cara 2 — Android Studio (Lokal)

### Prasyarat:
- [Android Studio](https://developer.android.com/studio) terinstall
- Node.js >= 18 + Bun

### Langkah:

```bash
# 1. Install dependencies
bun install

# 2. Build web app
bun run build

# 3. Sync ke Android project
bunx cap sync android

# 4. Buka di Android Studio
bunx cap open android
```

Di Android Studio:
- Tunggu Gradle sync selesai (pertama kali ~5 menit)
- Menu: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- APK ada di: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Cara 3 — Command Line (Lokal, tanpa Android Studio)

### Prasyarat:
- JDK 17+: `java -version`
- Android SDK (ANDROID_HOME harus di-set)
- Bun + Node.js >= 18

```bash
# Build web app
bun run build

# Sync Capacitor
bunx cap sync android

# Build APK
cd android
chmod +x gradlew
./gradlew assembleDebug

# APK ada di:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Release APK (Signed, untuk distribusi / Play Store)

```bash
# 1. Buat keystore (sekali saja)
keytool -genkeypair -v \
  -keystore release-key.keystore \
  -alias catatan-keuangan \
  -keyalg RSA -keysize 2048 -validity 10000

# 2. Build release APK
cd android
./gradlew assembleRelease \
  -Pandroid.injected.signing.store.file=../release-key.keystore \
  -Pandroid.injected.signing.store.password=YOUR_STORE_PASS \
  -Pandroid.injected.signing.key.alias=catatan-keuangan \
  -Pandroid.injected.signing.key.password=YOUR_KEY_PASS
```

---

## Update APK setelah ubah kode

```bash
bun run build           # Rebuild web app
bunx cap sync android   # Sync ke Android project
# Lalu build ulang via Android Studio atau ./gradlew
```

---

## Info Aplikasi

| Properti | Nilai |
|---|---|
| App ID | `id.catatankeuangan.app` |
| App Name | `Catatan Keuangan` |
| Min Android | API 24 (Android 7.0) |
| Target Android | API 35 (Android 15) |
| Capacitor | v7 |
| Framework | Capacitor (web assets bundled dalam APK) |

> APK Capacitor menyertakan seluruh kode web di dalam APK — tidak memerlukan koneksi internet setelah install.
