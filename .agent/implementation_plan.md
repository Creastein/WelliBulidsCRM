# Optimasi Dashboard Freelance CRM — WelliBuilds

Dashboard pribadi untuk tracking bisnis yang sudah/belum dihubungi, dan monitor target **Rp 10.000.000 dalam 2 bulan** dari freelance web development.

## Keputusan

- **Persistensi**: `localStorage` untuk sekarang, backend nanti
- **Cleanup**: Hapus `express`, `better-sqlite3`, `@google/genai`, `dotenv` (tidak terpakai)

## Fase 1: Data Persistence dengan localStorage

### [NEW] `src/hooks/useLocalStorage.ts`
- Custom hook `useLocalStorage<T>(key, defaultValue)` — auto save/load state ke `localStorage`

### [NEW] `src/data/dataDefaults.ts`
- Pindahkan semua data default (KPI, pipeline, leads, milestones, weekly reviews) ke satu file terpusat

---

## Fase 2: CRM Upgrade

### [MODIFY] `src/components/CRM.tsx`
- Ganti `useState` → `useLocalStorage` agar data leads persisten
- Tambah filter dropdown: Status, Prioritas, Niche
- Tambah sort: Nama, Prioritas, Status
- Tambah counter summary di atas tabel

---

## Fase 3: Dashboard Dinamis

### [MODIFY] `src/components/MissionControl.tsx`
- KPI cards → editable (klik untuk update value)
- Pipeline status → auto-hitung dari data CRM
- `daysRemaining` → auto-calculate dari tanggal target
- `Last Update` → otomatis
- Progress donut → animasi

### [MODIFY] `src/components/Finance.tsx`
- Weekly review → editable
- Milestones → auto-update status dari revenue
- Revenue input form

---

## Fase 4: Cleanup & Polish

### [MODIFY] `package.json`
- Hapus: `express`, `better-sqlite3`, `@google/genai`, `dotenv`, `@types/express`

### [MODIFY] `vite.config.ts`
- Hapus `process.env.GEMINI_API_KEY`

### [MODIFY] `src/components/Sidebar.tsx`
- Branding: "Vibe Coding" → "WelliBuilds"

---

## Verification

1. `npm run build` — tanpa error
2. Browser test: persistensi data, filter CRM, edit KPI, auto-countdown
