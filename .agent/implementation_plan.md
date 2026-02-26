# WelliBuilds Dashboard — Upgrade Plan

## Status Saat Ini ✅
- ShaderGradient + Glassmorphism
- Sidebar (animasi, progress ring, tooltip, logo)
- MissionControl (action items, CRM integration)
- Finance (framer-motion, milestones, progress bars)
- Font (Bungee Spice + Medula One)
- Default leads dikosongkan

---

## Phase 1: Polish & UX (Prioritas Tinggi)

### 1.1 Database Prospek — Framer Motion & UX
**File:** `src/components/DatabaseProspek.tsx`

- [ ] Tambah stagger animation saat load (seperti Finance)
- [ ] Animated card transitions saat filter/tab berubah
- [ ] Improve form "Tambah Prospek" → modal animated dengan field yang lebih jelas
- [ ] Hover effects premium pada lead cards
- [ ] Tambah konfirmasi delete dengan animasi

### 1.2 Pricing Page — Visual Polish
**File:** `src/components/Pricing.tsx`

- [ ] Hover effect 3D tilt pada pricing cards
- [ ] "Popular" badge animated pulse
- [ ] Micro-interactions pada feature checklist (stagger check icons)
- [ ] Konsistensi glassmorphism borders

### 1.3 Favicon Fix
**File:** `index.html`, `public/favicon.ico`

- [ ] Generate favicon dari `public/logo.png`
- [ ] Tambahkan `<link rel="icon">` di index.html

### 1.4 Toast Notifications
**File:** `src/App.tsx` + komponen yang pakai save

- [ ] Setup `<Toaster />` dari `react-hot-toast` (sudah installed)
- [ ] Tambah toast saat: save KPI, tambah lead, catat revenue, edit weekly review
- [ ] Style toast sesuai dark theme

---

## Phase 2: Data & Visualisasi

### 2.1 Charts di Finance
**File:** `src/components/Finance.tsx`
**Dependency:** `recharts` (perlu install)

- [ ] Line chart: tren DM per minggu
- [ ] Bar chart: Reply & Closing per minggu
- [ ] Area chart: Revenue kumulatif
- [ ] Responsive + dark themed

### 2.2 Export Data ke CSV
**File:** `src/components/DatabaseProspek.tsx`, `src/components/Finance.tsx`

- [ ] Tombol "Export CSV" di Database Prospek
- [ ] Tombol "Export CSV" di Weekly Review
- [ ] Format: nama, niche, status, action, notes

---

## Phase 3: Power Features

### 3.1 Keyboard Shortcuts
**File:** Baru `src/hooks/useKeyboardShortcuts.ts`

- [ ] `Ctrl+N` → Tambah lead baru
- [ ] `Ctrl+1-4` → Navigasi sidebar
- [ ] `Esc` → Tutup modal
- [ ] Shortcut hint di tooltip

### 3.2 Mobile Responsive Audit
**File:** Semua komponen

- [ ] Test & fix sidebar collapse di mobile
- [ ] Fix table overflow di weekly review
- [ ] Fix card grid di pricing
- [ ] Fix action items layout di MissionControl

### 3.3 PWA (Progressive Web App)
**File:** `vite.config.ts`, `public/manifest.json`
**Dependency:** `vite-plugin-pwa`

- [ ] Generate manifest.json
- [ ] Setup service worker
- [ ] Installable di HP sebagai app

---

## Phase 4: Performance

### 4.1 Code Splitting
**File:** `src/App.tsx`

- [ ] Lazy load semua halaman dengan `React.lazy()`
- [ ] Suspense fallback dengan skeleton/loading
- [ ] Reduce main chunk dari 422KB

---

## Urutan Kerja yang Disarankan
1. Phase 1 dulu (langsung terasa dampaknya)
2. Phase 2 kalau mau data lebih informatif
3. Phase 3 untuk power users
4. Phase 4 kalau performance jadi concern
