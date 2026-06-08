## Temuan Audit UI

### Diperbaiki
- [x] Font stack salah (Sora/Space Grotesk) → diganti dengan DM Sans + Instrument Serif + JetBrains Mono
- [x] Tidak ada iOS PWA meta tags → ditambahkan apple-mobile-web-app-capable, status-bar-style, title
- [x] favicon.svg tidak ada → dibuat di public/favicon.svg
- [x] `hasWebAuthn` undefined di OnboardingPage → diganti `supportsWebAuthn`
- [x] Cell key menggunakan index array di StatsPage → diganti dengan entry.name
- [x] `void formatRelative` dead code di HomePage → dihapus
- [x] `placeholder.tsx` dead file → dihapus

### Terbuka
- Navbar pill styling sudah cukup baik (floating, backdrop-blur) tapi border-radius 16px, bukan 28px seperti spec; bisa diperketat jika perlu
- Onboarding SVG slide bisa lebih elaborate (sudah ada 4 slide, slide 5 adalah setup)
- Dark mode: beberapa elemen mungkin kurang kontras (belum screenshot semua halaman)
