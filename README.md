<div align="center">

# 🏗️ WelliBuilds

**Freelance Dashboard — Mission Control, CRM, & Finance**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)

</div>

---

## 📋 Deskripsi

**WelliBuilds** adalah dashboard personal untuk mengelola bisnis freelance secara terpusat. Aplikasi ini dirancang sebagai *command center* yang mencakup manajemen proyek, CRM, keuangan, dan pricing — semuanya dalam satu antarmuka yang modern dan responsif.

Dibangun dengan pendekatan **PWA (Progressive Web App)**, WelliBuilds dapat di-install di perangkat mobile maupun desktop layaknya aplikasi native.

---

## ✨ Fitur Utama

### 🎯 Mission Control
- Dashboard KPI real-time (revenue, leads, conversion rate)
- Daily schedule & task management
- Progress tracking mingguan
- Weekly review & retrospective

### 👥 CRM (Database Prospek)
- Manajemen database leads/prospek klien
- Pipeline tracking dengan status management
- Riwayat interaksi & follow-up

### 💰 Finance
- Revenue tracking & financial overview
- Income/expense monitoring
- Visualisasi data keuangan dengan charts

### 🏷️ Pricing
- Kalkulator harga jasa freelance
- Template pricing yang customizable

### 🎨 UX & Polish
- Cinematic loading animation
- 3D shader gradient background
- Keyboard shortcuts (`Ctrl+1-4` untuk navigasi, `Ctrl+N` untuk lead baru)
- Toast notifications
- Lazy loading untuk performa optimal

---

## 🛠️ Tech Stack

| Kategori | Teknologi | Versi |
|---|---|---|
| **Framework** | React | ^19.0.0 |
| **Build Tool** | Vite | ^6.2.0 |
| **Language** | TypeScript | ~5.8.2 |
| **Styling** | TailwindCSS v4 | ^4.1.14 |
| **Animation** | Framer Motion | ^12.34.3 |
| **3D / Shader** | Three.js + React Three Fiber + ShaderGradient | ^0.183.1 / ^9.5.0 / ^2.4.20 |
| **Backend / DB** | Supabase | ^2.98.0 |
| **Charts** | Recharts | ^3.7.0 |
| **Icons** | Lucide React | ^0.546.0 |
| **Notifications** | React Hot Toast | ^2.6.0 |
| **Date Utilities** | date-fns | ^4.1.0 |
| **PWA** | vite-plugin-pwa | ^1.2.0 |
| **AI Integration** | Gemini API | via environment variable |

---

## 🏗️ Arsitektur Project

```
WelliBuilds/
├── public/                  # Static assets (favicon, logo, icons)
├── src/
│   ├── App.tsx              # Root component + tab-based routing
│   ├── main.tsx             # Entry point
│   ├── index.css            # Global styles
│   ├── components/
│   │   ├── CinematicLoader.tsx     # Splash screen animation
│   │   ├── GradientBackground.tsx  # 3D shader background
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   ├── MissionControl.tsx      # Dashboard utama
│   │   ├── DatabaseProspek.tsx     # CRM module
│   │   ├── Finance.tsx             # Finance module
│   │   └── Pricing.tsx             # Pricing module
│   ├── data/
│   │   └── dataDefaults.ts         # Seed data & default values
│   ├── hooks/
│   │   ├── useKeyboardShortcuts.ts # Custom keyboard shortcuts
│   │   └── useLocalStorage.ts      # Persistent local state
│   ├── lib/
│   │   └── supabase.ts             # Supabase client config
│   └── services/
│       ├── kpiService.ts           # KPI data queries
│       ├── leadsService.ts         # Leads CRUD operations
│       ├── progressService.ts      # Progress tracking
│       └── weeklyReviewService.ts  # Weekly review data
├── index.html               # HTML entry point
├── vite.config.ts           # Vite + PWA + Tailwind config
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies & scripts
└── .env.example             # Environment variables template
```

### Key Patterns

- **Lazy Loading** — Semua komponen utama di-load dengan `React.lazy()` + `Suspense` untuk performa optimal
- **Service Layer** — Business logic dipisahkan ke folder `services/` untuk query Supabase
- **Custom Hooks** — State management via `useLocalStorage` dan `useKeyboardShortcuts`
- **PWA Ready** — Manifest, service worker, dan offline support via `vite-plugin-pwa`

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Supabase](https://supabase.com/) account (untuk database)
- [Gemini API Key](https://ai.google.dev/) (opsional, untuk fitur AI)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/your-username/wellibuilds.git
cd wellibuilds/WelliBulids

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local dan isi dengan API keys kamu
```

### Environment Variables

| Variable | Deskripsi | Required |
|---|---|---|
| `GEMINI_API_KEY` | API key untuk Gemini AI | Opsional |
| `APP_URL` | URL hosting aplikasi | Opsional |

> **Note:** Jika menggunakan Google AI Studio, variabel ini akan di-inject otomatis saat runtime.

### Development

```bash
# Jalankan development server
npm run dev
# App berjalan di http://localhost:3000

# Type checking
npm run lint

# Build untuk production
npm run build

# Preview production build
npm run preview
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Aksi |
|---|---|
| `Ctrl + 1` | Buka Mission Control |
| `Ctrl + 2` | Buka CRM |
| `Ctrl + 3` | Buka Finance |
| `Ctrl + 4` | Buka Pricing |
| `Ctrl + N` | Tambah lead baru (otomatis buka CRM) |
| `Escape` | Tutup modal/dialog aktif |

---

## 📄 License

Private project — All rights reserved.

---

<div align="center">

Built with ☕ by **Welli**

</div>
