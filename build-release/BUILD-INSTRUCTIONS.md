# Instruksi Build APK — Catatan Keuangan

Aplikasi ini adalah PWA (Progressive Web App) yang dapat dibungkus menjadi APK distribusi mandiri
menggunakan **Bubblewrap CLI** (Trusted Web Activity / TWA).

## Prasyarat

| Komponen | Versi |
|---|---|
| Node.js | 18+ |
| JDK | 17+ |
| Android SDK Build Tools | 34+ |
| Bubblewrap CLI | latest |

## Langkah 1 — Build PWA

```bash
bun run build
# Output: dist/
```

Deploy `dist/` ke hosting statis dengan HTTPS (wajib untuk TWA).
Contoh: Replit Deployments, Vercel, Netlify, GitHub Pages.

## Langkah 2 — Install Bubblewrap

```bash
npm install -g @bubblewrap/cli
```

## Langkah 3 — Inisialisasi TWA Project

```bash
mkdir catatan-keuangan-apk && cd catatan-keuangan-apk
bubblewrap init --manifest https://YOUR_DOMAIN/manifest.webmanifest
```

Isi saat diminta:
- **Package ID**: `id.catatankeuangan.app`
- **App Name**: `Catatan Keuangan`
- **Short Name**: `CatatKeu`
- **Host**: domain HTTPS kamu
- **Start URL**: `/`
- **Display**: `standalone`
- **Status Bar Color**: `#FFF9D2`
- **Background Color**: `#FFF9D2`
- **Icon**: path ke `icon-512.png`

## Langkah 4 — Generate Keystore (hanya pertama kali)

```bash
keytool -genkeypair \
  -alias catatkeu-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 9125 \
  -keystore catatkeu-release.keystore
```

Simpan keystore dan password dengan aman — dibutuhkan untuk setiap update.

## Langkah 5 — Build APK

```bash
bubblewrap build
# Output: app-release-signed.apk
```

## Langkah 6 — Verifikasi Digital Asset Links

Tambahkan file berikut di server HTTPS kamu:

**`https://YOUR_DOMAIN/.well-known/assetlinks.json`**
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "id.catatankeuangan.app",
    "sha256_cert_fingerprints": ["FINGERPRINT_DARI_KEYSTORE"]
  }
}]
```

Dapatkan fingerprint:
```bash
keytool -list -v -keystore catatkeu-release.keystore -alias catatkeu-release
```

## Distribusi

APK dapat didistribusikan langsung ke pengguna tanpa Play Store:
- Kirim file APK via WhatsApp / Telegram / Google Drive
- Pengguna perlu mengaktifkan "Instal dari sumber tidak dikenal" di pengaturan HP

## Ukuran APK

APK TWA sangat ringan (biasanya 1-3 MB) karena hanya berisi wrapper;
semua kode aplikasi diambil dari PWA yang di-deploy.

---

*Dibuat otomatis oleh Catatan Keuangan build system.*
