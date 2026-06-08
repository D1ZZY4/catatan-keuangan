## Riwayat Build APK

### Catatan Lingkungan
Android SDK tidak tersedia di lingkungan Replit. Build APK via Bubblewrap CLI memerlukan:
- JDK 17+
- Android SDK (Build Tools, Platform Tools)
- Node.js 18+
- Bubblewrap CLI

Lihat build-release/BUILD-INSTRUCTIONS.md untuk langkah lengkap.

### Build PWA (dist/)
- Setiap `bun run build` menghasilkan dist/ yang valid
- Service worker via vite-plugin-pwa + Workbox
- Manifest PWA sudah dikonfigurasi di vite.config.ts
