"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Minus,
  Sparkles,
  Zap,
  Star,
  Crown,
  CheckCircle2,
  Table2,
  LayoutGrid,
  Calculator,
  Copy,
  Download,
  Search,
  Filter,
  Wrench,
  Plus,
  ArrowRight,
  Send,
  Sliders,
  DollarSign,
  ShieldCheck,
  CheckCheck,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

// --- TYPES & DATA DEFINITIONS ---

export interface PricingTier {
  id: string;
  colCode: string;
  name: string;
  badge?: string;
  priceRaw: number;
  priceDisplay: string;
  timeline: string;
  target: string;
  icon: React.ElementType;
  accentColor: string;
  bgAccent: string;
  borderAccent: string;
  popular?: boolean;
  desc: string;
}

export interface MatrixFeatureRow {
  id: string;
  rowCode: string;
  category: 'core' | 'content' | 'seo' | 'system' | 'sla';
  categoryLabel: string;
  featureName: string;
  description?: string;
  values: {
    starter: string | boolean;
    landing: string | boolean;
    katalog: string | boolean;
    pro: string | boolean;
    custom: string | boolean;
  };
}

export interface AddonItem {
  id: string;
  code: string;
  name: string;
  desc: string;
  priceRaw: number;
  priceDisplay: string;
  category: 'scope' | 'marketing' | 'tech';
}

export interface MaintenanceItem {
  id: string;
  name: string;
  priceRaw: number;
  priceDisplay: string;
  period: string;
  popular?: boolean;
  features: string[];
}

const TIERS: PricingTier[] = [
  {
    id: 'starter',
    colCode: 'B',
    name: 'Starter Online',
    badge: 'Fast Promo',
    priceRaw: 999000,
    priceDisplay: 'Rp 999.000',
    timeline: '2-3 hari kerja',
    target: 'Bisnis baru / promo DM / landing mini',
    icon: Star,
    accentColor: 'text-sky-400',
    bgAccent: 'bg-sky-500/10',
    borderAccent: 'border-sky-500/30',
    desc: 'Halaman instan dengan scope ringkas, materi wajib siap dari klien.'
  },
  {
    id: 'landing',
    colCode: 'C',
    name: 'Landing Page Simple',
    priceRaw: 1500000,
    priceDisplay: 'Rp 1.500.000',
    timeline: '3-5 hari kerja',
    target: 'Bisnis lokal / jasa yang butuh profile profesional',
    icon: Zap,
    accentColor: 'text-blue-400',
    bgAccent: 'bg-blue-500/10',
    borderAccent: 'border-blue-500/30',
    desc: 'Satu halaman panjang berstruktur konversi dengan copywriting rapi.'
  },
  {
    id: 'katalog',
    colCode: 'D',
    name: 'Website Katalog',
    badge: 'Paling Populer',
    popular: true,
    priceRaw: 2500000,
    priceDisplay: 'Rp 2.500.000',
    timeline: '5-7 hari kerja',
    target: 'Restoran, salon, klinik kecil, bengkel, tour & toko',
    icon: Sparkles,
    accentColor: 'text-orange-400',
    bgAccent: 'bg-orange-500/10',
    borderAccent: 'border-orange-500/40',
    desc: 'Showcase produk/menu dengan filter kategori dan direct WhatsApp order.'
  },
  {
    id: 'pro',
    colCode: 'E',
    name: 'Business Pro',
    badge: 'Multi-Page',
    priceRaw: 3500000,
    priceDisplay: 'Mulai Rp 3.500.000',
    timeline: '7-10 hari kerja',
    target: 'Klinik, corporate, jasa profesional, supplier, kursus',
    icon: Crown,
    accentColor: 'text-purple-400',
    bgAccent: 'bg-purple-500/10',
    borderAccent: 'border-purple-500/30',
    desc: 'Website lengkap 5-7 halaman dengan SEO setup & Google Analytics 4.'
  },
  {
    id: 'custom',
    colCode: 'F',
    name: 'Custom Web / App',
    badge: 'Enterprise',
    priceRaw: 6500000,
    priceDisplay: 'Mulai Rp 6.500.000+',
    timeline: '14-30 hari (Scope-based)',
    target: 'Sistem order, booking, CRM, dashboard admin & API custom',
    icon: CheckCircle2,
    accentColor: 'text-emerald-400',
    bgAccent: 'bg-emerald-500/10',
    borderAccent: 'border-emerald-500/30',
    desc: 'Aplikasi web tailored dengan database, sistem auth, dan alur bisnis khusus.'
  }
];

const MATRIX_ROWS: MatrixFeatureRow[] = [
  // --- CORE SPECIFICATION ---
  {
    id: 'pages',
    rowCode: '01',
    category: 'core',
    categoryLabel: 'Spesifikasi Inti (Core Specs)',
    featureName: 'Jumlah Halaman / Section',
    description: 'Batas arsitektur halaman dan section visual',
    values: {
      starter: '1 Hal (max 5 section)',
      landing: '1 Hal (hingga 7 section)',
      katalog: 'Multi-section / 3-5 Hal',
      pro: '5-7 Halaman Penuh',
      custom: 'Custom Arsitektur (Unlimited)'
    }
  },
  {
    id: 'delivery',
    rowCode: '02',
    category: 'core',
    categoryLabel: 'Spesifikasi Inti (Core Specs)',
    featureName: 'Estimasi Pengerjaan',
    description: 'Waktu produksi dari materi siap hingga live',
    values: {
      starter: '2-3 hari kerja',
      landing: '3-5 hari kerja',
      katalog: '5-7 hari kerja',
      pro: '7-10 hari kerja',
      custom: '14-30 hari (Discovery)'
    }
  },
  {
    id: 'tech_stack',
    rowCode: '03',
    category: 'core',
    categoryLabel: 'Spesifikasi Inti (Core Specs)',
    featureName: 'Modern Frontend & PWA Ready',
    description: 'Next.js / Tailwind / Fast Responsive Engine',
    values: {
      starter: true,
      landing: true,
      katalog: true,
      pro: true,
      custom: true
    }
  },
  {
    id: 'mobile_perf',
    rowCode: '04',
    category: 'core',
    categoryLabel: 'Spesifikasi Inti (Core Specs)',
    featureName: 'Mobile Speed Optimization',
    description: 'Optimasi aset gambar dan kecepatan loading',
    values: {
      starter: 'Standard',
      landing: 'High (Score 85+)',
      katalog: 'High (Score 90+)',
      pro: 'Ultra (Score 95+)',
      custom: 'Enterprise CDN Tier'
    }
  },

  // --- CONTENT & COPYWRITING ---
  {
    id: 'copywriting',
    rowCode: '05',
    category: 'content',
    categoryLabel: 'Konten & Copywriting',
    featureName: 'Struktur Copywriting & Headline',
    description: 'Penyusunan penawaran agar calon pembeli tertarik',
    values: {
      starter: 'Dari Klien (Siap)',
      landing: 'Struktur Ringan & Rapi',
      katalog: 'Struktur per Kategori',
      pro: 'Full Value Proposition',
      custom: 'Dedicated UX Writing'
    }
  },
  {
    id: 'catalog_items',
    rowCode: '06',
    category: 'content',
    categoryLabel: 'Konten & Copywriting',
    featureName: 'Katalog Produk / Menu / Jasa',
    description: 'Setup awal item katalog produk atau layanan',
    values: {
      starter: false,
      landing: 'Showcase Grid (3-5)',
      katalog: '10-20 Item Awal',
      pro: '20-40 Item + Filter',
      custom: 'Database Unlimited'
    }
  },
  {
    id: 'wa_routing',
    rowCode: '07',
    category: 'content',
    categoryLabel: 'Konten & Copywriting',
    featureName: 'Integrasi WhatsApp CTA & Maps',
    description: 'Tombol pesan instan dan lokasi Google Maps interaktif',
    values: {
      starter: 'Direct Button',
      landing: 'Custom Message CTA',
      katalog: 'Multi-item Order WA',
      pro: 'Multi-Admin / CS Routing',
      custom: 'Automated CRM Webhook'
    }
  },
  {
    id: 'contact_form',
    rowCode: '08',
    category: 'content',
    categoryLabel: 'Konten & Copywriting',
    featureName: 'Form Kontak / Reservasi',
    description: 'Formulir leads interaktif',
    values: {
      starter: false,
      landing: 'Simple Form',
      katalog: 'Form + WhatsApp Sync',
      pro: 'Lead Capture + Email Notif',
      custom: 'Custom Multi-step Form'
    }
  },

  // --- SEO & DATA ANALYTICS ---
  {
    id: 'basic_seo',
    rowCode: '09',
    category: 'seo',
    categoryLabel: 'SEO & Data Analytics',
    featureName: 'On-Page SEO & Meta Tags',
    description: 'Optimasi judul, deskripsi, dan Open Graph media sosial',
    values: {
      starter: 'Basic Meta',
      landing: 'On-Page SEO',
      katalog: 'SEO + Schema Markup',
      pro: 'Full Schema & Keyword Meta',
      custom: 'Dynamic SSR/SSG SEO'
    }
  },
  {
    id: 'gsc',
    rowCode: '10',
    category: 'seo',
    categoryLabel: 'SEO & Data Analytics',
    featureName: 'Google Search Console & Sitemap',
    description: 'Pendaftaran sitemap agar cepat terindeks di Google',
    values: {
      starter: false,
      landing: false,
      katalog: 'Submit Sitemap',
      pro: 'Full Indexing & Setup',
      custom: 'Full Indexing & API'
    }
  },
  {
    id: 'ga4',
    rowCode: '11',
    category: 'seo',
    categoryLabel: 'SEO & Data Analytics',
    featureName: 'Google Analytics 4 (GA4)',
    description: 'Pelacakan trafik pengunjung website',
    values: {
      starter: false,
      landing: false,
      katalog: 'Setup Standar',
      pro: 'Event Tracking Setup',
      custom: 'Custom Telemetry / Funnel'
    }
  },

  // --- SYSTEM & ADVANCED FEATURES ---
  {
    id: 'cms_admin',
    rowCode: '12',
    category: 'system',
    categoryLabel: 'Sistem & Fitur Lanjutan',
    featureName: 'CMS / Dashboard Kelola Konten',
    description: 'Kemudahan update teks/foto tanpa coding',
    values: {
      starter: false,
      landing: false,
      katalog: 'Add-on Ready',
      pro: 'Add-on Ready',
      custom: 'Custom Dashboard Admin'
    }
  },
  {
    id: 'auth_users',
    rowCode: '13',
    category: 'system',
    categoryLabel: 'Sistem & Fitur Lanjutan',
    featureName: 'User Login & Role Access',
    description: 'Sistem hak akses anggota / multi-level user',
    values: {
      starter: false,
      landing: false,
      katalog: false,
      pro: false,
      custom: 'Auth + Role Permissions'
    }
  },
  {
    id: 'payment_gateway',
    rowCode: '14',
    category: 'system',
    categoryLabel: 'Sistem & Fitur Lanjutan',
    featureName: 'Payment Gateway (Midtrans/Xendit)',
    description: 'Pembayaran otomatis QRIS, Virtual Account, & Kartu',
    values: {
      starter: false,
      landing: false,
      katalog: 'Add-on Ready',
      pro: 'Add-on Ready',
      custom: 'Full Direct Integration'
    }
  },

  // --- SLA & GARANSI ---
  {
    id: 'revisions',
    rowCode: '15',
    category: 'sla',
    categoryLabel: 'Garansi & SLA Support',
    featureName: 'Batas Revisi Desain',
    description: 'Penyesuaian layout sebelum final delivery',
    values: {
      starter: '1x Revisi',
      landing: '2x Revisi',
      katalog: '2x Revisi',
      pro: '3x Revisi',
      custom: 'Milestone Approval'
    }
  },
  {
    id: 'warranty',
    rowCode: '16',
    category: 'sla',
    categoryLabel: 'Garansi & SLA Support',
    featureName: 'Garansi Bug Pasca Live',
    description: 'Perbaikan gratis jika ada kendala teknis',
    values: {
      starter: '7 Hari',
      landing: '14 Hari',
      katalog: '14 Hari',
      pro: '30 Hari',
      custom: '60 Hari Dedicated SLA'
    }
  },
  {
    id: 'maintenance_ready',
    rowCode: '17',
    category: 'sla',
    categoryLabel: 'Garansi & SLA Support',
    featureName: 'Dukungan Paket Maintenance',
    description: 'Kemudahan langganan backup & monitoring bulanan',
    values: {
      starter: 'Basic Ready',
      landing: 'Basic / Standard',
      katalog: 'Disarankan Standard',
      pro: 'Disarankan Priority',
      custom: 'Dedicated SLA'
    }
  }
];

const ADDONS: AddonItem[] = [
  { id: 'add-page', code: 'A01', name: 'Tambah Halaman Standar', desc: 'Per 1 halaman konten tambahan', priceRaw: 350000, priceDisplay: 'Rp 350.000', category: 'scope' },
  { id: 'add-items', code: 'A02', name: 'Tambah 10 Item Katalog', desc: 'Input deskripsi, harga, & foto produk', priceRaw: 150000, priceDisplay: 'Rp 150.000', category: 'scope' },
  { id: 'add-copy', code: 'A03', name: 'Copywriting Lengkap & Pitch', desc: 'Riset narasi & copywriting persuasi', priceRaw: 750000, priceDisplay: 'Rp 750.000', category: 'marketing' },
  { id: 'add-gmb', code: 'A04', name: 'Setup Google Bisnis Profil', desc: 'Optimasi Maps, jam buka, & verifikasi', priceRaw: 450000, priceDisplay: 'Rp 450.000', category: 'marketing' },
  { id: 'add-seo', code: 'A05', name: 'Advanced SEO & Speed 95+', desc: 'Audit keyword kompetitor & Core Web Vitals', priceRaw: 850000, priceDisplay: 'Rp 850.000', category: 'marketing' },
  { id: 'add-payment', code: 'A06', name: 'Payment Gateway Integration', desc: 'Midtrans / Xendit QRIS & Virtual Account', priceRaw: 2500000, priceDisplay: 'Rp 2.500.000', category: 'tech' },
  { id: 'add-cms', code: 'A07', name: 'CMS / Admin Content Editor', desc: 'Panel admin mandiri tanpa sentuh kode', priceRaw: 2500000, priceDisplay: 'Rp 2.500.000', category: 'tech' },
  { id: 'add-wa-crm', code: 'A08', name: 'WhatsApp Webhook Automation', desc: 'Notifikasi otomatis order ke HP admin', priceRaw: 600000, priceDisplay: 'Rp 600.000', category: 'tech' }
];

const MAINTENANCE_PACKAGES: MaintenanceItem[] = [
  {
    id: 'maint-basic',
    name: 'Basic Care',
    priceRaw: 250000,
    priceDisplay: 'Rp 250.000',
    period: '/ bln',
    features: [
      'Update konten ringan maks 3x/bulan',
      'Monitoring uptime 24/7',
      'Backup database bulanan',
      'Security patch dasar'
    ]
  },
  {
    id: 'maint-standard',
    name: 'Standard Pro',
    popular: true,
    priceRaw: 500000,
    priceDisplay: 'Rp 500.000',
    period: '/ bln',
    features: [
      'Semua fitur Basic Care',
      'Update minor & tambah section baru',
      'Backup berkala mingguan',
      'Laporan performa & traffic bulanan',
      'Respons support maks 12 jam kerja'
    ]
  },
  {
    id: 'maint-priority',
    name: 'Priority VIP',
    priceRaw: 1000000,
    priceDisplay: 'Rp 1.000.000',
    period: '/ bln',
    features: [
      'Semua fitur Standard Pro',
      'SLA Response kilat maks 4 jam',
      'Revisi konten bebas (fair use)',
      'Konsultasi SEO & CRO 1x/bulan',
      'Emergency restore instant'
    ]
  }
];

const SCOPE_NOTES = [
  'Harga pembuatan website belum termasuk domain (.com / .id) dan server hosting tahunan kecuali disepakati di awal proposal.',
  'Paket Starter Online ditujukan untuk fast delivery promo sederhana dan materi teks/foto harus sudah disiapkan klien.',
  'Website Katalog mencakup input awal 10-20 item produk/layanan; penambahan item dalam jumlah besar menggunakan add-on katalog.',
  'Integrasi payment gateway, sistem login pengguna, role permissions, dan webhook database masuk ke paket Custom Website atau Add-on.',
  'SEO yang disertakan adalah On-Page Technical SEO & pendaftaran Google Search Console (bukan jaminan ranking ranking 1 instan).',
  'Skema termin pembayaran standar: Pembayaran DP 50% di awal kontrak, dan pelunasan 50% setelah website selesai di-review dan siap live.'
];

export default function Pricing() {
  // View states: 'matrix' (Excel Pro Spreadsheet), 'cards' (Bento Grid), 'simulator' (Proposal Calculator)
  const [viewMode, setViewMode] = useState<'matrix' | 'cards' | 'simulator'>('matrix');

  // Matrix interactive state
  const [selectedCell, setSelectedCell] = useState<{ row: string; col: string; title: string; val: string } | null>({
    row: '01',
    col: 'D',
    title: 'Website Katalog > Spesifikasi',
    val: 'Multi-section / 3-5 Hal (Rp 2.500.000)'
  });
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Simulator state
  const [clientName, setClientName] = useState<string>('');
  const [clientBusinessType, setClientBusinessType] = useState<string>('Bisnis / Usaha Lokal');
  const [selectedTierId, setSelectedTierId] = useState<string>('katalog');
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(['add-copy', 'add-gmb']);
  const [selectedMaintId, setSelectedMaintId] = useState<string>('maint-standard');
  const [copiedProposal, setCopiedProposal] = useState<boolean>(false);

  // Filtered rows for matrix
  const filteredRows = useMemo(() => {
    return MATRIX_ROWS.filter((row) => {
      const matchCategory = filterCategory === 'all' || row.category === filterCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        row.featureName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Object.values(row.values).some((v) => String(v).toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [filterCategory, searchQuery]);

  // Selected tier data
  const activeTier = useMemo(() => {
    return TIERS.find((t) => t.id === selectedTierId) || TIERS[2];
  }, [selectedTierId]);

  // Selected addons data
  const activeAddons = useMemo(() => {
    return ADDONS.filter((a) => selectedAddonIds.includes(a.id));
  }, [selectedAddonIds]);

  // Selected maintenance data
  const activeMaint = useMemo(() => {
    return MAINTENANCE_PACKAGES.find((m) => m.id === selectedMaintId) || null;
  }, [selectedMaintId]);

  // Calculations
  const subtotalWeb = useMemo(() => activeTier.priceRaw, [activeTier]);
  const subtotalAddons = useMemo(() => activeAddons.reduce((acc, curr) => acc + curr.priceRaw, 0), [activeAddons]);
  const totalProjectPrice = useMemo(() => subtotalWeb + subtotalAddons, [subtotalWeb, subtotalAddons]);
  const downPayment = useMemo(() => Math.round(totalProjectPrice * 0.5), [totalProjectPrice]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  // Toggle addon
  const toggleAddon = (addonId: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  // WhatsApp Proposal Text Generator
  const generateWhatsAppProposal = () => {
    const nameGreeting = clientName.trim() ? `Halo Bapak/Ibu ${clientName.trim()}` : 'Halo Bapak/Ibu';
    const addonListText = activeAddons.length > 0
      ? activeAddons.map((a) => `  • ${a.name} (${a.priceDisplay})`).join('\n')
      : '  • (Tidak ada add-on tambahan)';

    const maintText = activeMaint
      ? `\n🛠️ *PAKET MAINTENANCE:* ${activeMaint.name} (${activeMaint.priceDisplay}${activeMaint.period})\n${activeMaint.features.slice(0, 3).map((f) => `  • ${f}`).join('\n')}`
      : '';

    return `*PROPOSAL & REKOMENDASI PAKET WEBSITE WELLIBUILDS*
--------------------------------------------------
${nameGreeting}, berikut estimasi investasi pembuatan website profesional untuk *${clientBusinessType}*:

📦 *PAKET UTAMA:* ${activeTier.name}
💰 *Investasi Dasar:* ${activeTier.priceDisplay}
⏱️ *Estimasi Waktu:* ${activeTier.timeline}
🎯 *Deskripsi:* ${activeTier.desc}

➕ *ADD-ON TAMBAHAN:*
${addonListText}
${maintText}

📊 *RINGKASAN INVESTASI:*
• Biaya Pembuatan Website: ${formatCurrency(subtotalWeb)}
• Tambahan Add-on: ${formatCurrency(subtotalAddons)}
• *TOTAL INVESTASI PROYEK:* *${formatCurrency(totalProjectPrice)}*
• *Skema DP (50%):* *${formatCurrency(downPayment)}* (Pelunasan 50% setelah website live)

✨ *KEUNGGULAN WELLIBUILDS:*
✓ Modern Next.js Engine (Loading super cepat di HP)
✓ Tampilan estetik, elegan, & siap konversi
✓ Bebas pusing teknis, dibantu setup hingga live

Ada waktu luang untuk kita diskusikan detail fiturnya? Terima kasih! 🙏`;
  };

  const handleCopyProposal = () => {
    const text = generateWhatsAppProposal();
    navigator.clipboard.writeText(text);
    setCopiedProposal(true);
    toast.success('Format penawaran WhatsApp berhasil disalin ke clipboard!', {
      icon: '📋',
      duration: 3500
    });
    setTimeout(() => setCopiedProposal(false), 3000);
  };

  const handleExportCsv = () => {
    const headers = ['Kode', 'Kategori', 'Fitur/Spesifikasi', 'Starter Online (B)', 'Landing Page (C)', 'Website Katalog (D)', 'Business Pro (E)', 'Custom Web (F)'];
    const rows = MATRIX_ROWS.map((row) => [
      `"${row.rowCode}"`,
      `"${row.categoryLabel}"`,
      `"${row.featureName}"`,
      `"${String(row.values.starter)}"`,
      `"${String(row.values.landing)}"`,
      `"${String(row.values.katalog)}"`,
      `"${String(row.values.pro)}"`,
      `"${String(row.values.custom)}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `WelliBuilds_Pricing_Matrix_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Matrix perbandingan harga berhasil di-export ke CSV!');
  };

  // Helper cell render
  const renderCellValue = (val: string | boolean, isPopularCol: boolean) => {
    if (typeof val === 'boolean') {
      return val ? (
        <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
          <Check size={14} strokeWidth={2.5} />
        </div>
      ) : (
        <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-white/[0.03] text-gray-600">
          <Minus size={13} />
        </div>
      );
    }

    return (
      <span
        className={`text-xs leading-relaxed font-medium ${
          isPopularCol ? 'text-white font-semibold' : 'text-gray-300'
        }`}
      >
        {val}
      </span>
    );
  };

  return (
    <div className="px-3 py-4 md:px-6 md:py-8 max-w-[1440px] mx-auto space-y-6">
      {/* --- TOP BRANDING & CONTROLS HEADER --- */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-[#0d0d12]/80 backdrop-blur-xl border border-white/[0.08] p-4 md:p-5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      >
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium tracking-wide bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              WB_PRICING_ENGINE_v3.2
            </span>
            <span className="text-[11px] font-mono text-gray-400">| Standardized Freelance Rate Card</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-white flex items-center gap-2.5">
            Paket Harga & Matrix Layanan
          </h1>
          <p className="text-xs md:text-sm text-gray-400 max-w-2xl">
            Tabel perbandingan spesifikasi teknis, add-on modular, dan kalkulator penawaran proposal klien.
          </p>
        </div>

        {/* View Switcher & Action Tools */}
        <div className="flex flex-wrap items-center gap-2.5 self-start xl:self-center">
          {/* View Mode Buttons */}
          <div className="bg-[#14141c] p-1 rounded-xl border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'matrix'
                  ? 'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.35)] font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Table2 size={14} />
              <span>Spreadsheet Matrix</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'cards'
                  ? 'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.35)] font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutGrid size={14} />
              <span>Bento Cards</span>
            </button>
            <button
              onClick={() => setViewMode('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'simulator'
                  ? 'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.35)] font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calculator size={14} />
              <span>Quote Simulator</span>
            </button>
          </div>

          {/* Export CSV & Copy Proposal Buttons */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white border border-white/10 text-xs font-medium transition-all"
            title="Download CSV Matrix"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={handleCopyProposal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all shadow-[0_0_16px_rgba(16,185,129,0.15)]"
          >
            {copiedProposal ? <CheckCheck size={14} /> : <Copy size={14} />}
            <span>{copiedProposal ? 'Tersalin!' : 'Salin WA Pitch'}</span>
          </button>
        </div>
      </motion.header>

      {/* --- EXCEL FORMULA BAR & ACTIVE CELL INSPECTOR --- */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0b0b10] border border-white/[0.08] rounded-xl p-2.5 flex flex-col md:flex-row items-start md:items-center gap-2.5 shadow-inner"
      >
        {/* Cell Coordinate Box */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-2.5 py-1 rounded bg-[#161622] border border-white/10 font-mono text-[11px] font-bold text-orange-400 flex items-center gap-1.5">
            <span className="text-gray-500">CELL</span>
            <span>[{selectedCell ? `${selectedCell.col}${selectedCell.row}` : 'D01'}]</span>
          </div>
          <div className="px-2 py-1 rounded bg-white/[0.04] font-mono text-[11px] font-bold text-gray-400">
            fx
          </div>
        </div>

        {/* Dynamic Formula Display */}
        <div className="flex-1 w-full bg-[#12121a] border border-white/5 rounded-lg px-3 py-1.5 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="font-mono text-xs text-gray-300 flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-blue-400 font-semibold">=CALCULATE_QUOTE</span>
            <span className="text-gray-500">(</span>
            <span className="text-orange-300">Package</span>
            <span className="text-gray-500">=</span>
            <span className="text-emerald-300">&quot;{activeTier.name}&quot;</span>
            <span className="text-gray-500">, </span>
            <span className="text-orange-300">Addons</span>
            <span className="text-gray-500">=</span>
            <span className="text-purple-300">[{activeAddons.map((a) => `"${a.code}"`).join(', ') || 'NONE'}]</span>
            <span className="text-gray-500">, </span>
            <span className="text-orange-300">Maint</span>
            <span className="text-gray-500">=</span>
            <span className="text-sky-300">&quot;{activeMaint ? activeMaint.name : 'NONE'}&quot;</span>
            <span className="text-gray-500">)</span>
          </div>

          <div className="shrink-0 flex items-center gap-2 text-xs font-mono font-bold">
            <span className="text-gray-500">TOTAL:</span>
            <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              {formatCurrency(totalProjectPrice)}
            </span>
            {activeMaint && (
              <span className="text-purple-300 text-[11px]">
                + {activeMaint.priceDisplay}/bln
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* MODE 1: SPREADSHEET MATRIX (EXCEL PRO EDITION) */}
      {/* ========================================================================= */}
      {viewMode === 'matrix' && (
        <motion.div
          key="matrix-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-4"
        >
          {/* Matrix Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d0d12]/50 p-2.5 rounded-xl border border-white/[0.06]">
            {/* Category Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-mono text-gray-500 flex items-center gap-1 pl-1 pr-2">
                <Filter size={12} /> Filter:
              </span>
              {[
                { id: 'all', label: 'Semua Baris (17)' },
                { id: 'core', label: 'Core Specs' },
                { id: 'content', label: 'Konten & Copy' },
                { id: 'seo', label: 'SEO & Data' },
                { id: 'system', label: 'Sistem Lanjutan' },
                { id: 'sla', label: 'SLA & Garansi' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    filterCategory === cat.id
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 font-semibold'
                      : 'text-gray-400 hover:text-gray-200 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <div className="relative min-w-[200px] sm:w-64">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Cari fitur (mis. SEO, CMS, Revisi)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#12121a] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* MAIN SPREADSHEET TABLE CONTAINER */}
          <div className="rounded-2xl border border-white/[0.1] bg-[#0c0c12]/95 backdrop-blur-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[960px]">
                {/* EXCEL COLUMN HEADERS [A, B, C, D, E, F] */}
                <thead>
                  <tr className="bg-[#12121c] border-b border-white/[0.08] text-[11px] font-mono text-gray-400">
                    <th className="p-3 w-12 text-center border-r border-white/[0.08] bg-[#161622] text-gray-500 select-none">
                      #
                    </th>
                    <th className="p-3.5 w-72 border-r border-white/[0.08] text-gray-300">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">[A] FITUR & SPESIFIKASI</span>
                        <span className="text-[10px] text-gray-500 font-mono">17 Rows</span>
                      </div>
                    </th>
                    {TIERS.map((tier) => {
                      const isPopular = tier.popular;
                      const isSelected = selectedTierId === tier.id;
                      const isColHovered = hoveredCol === tier.colCode;

                      return (
                        <th
                          key={tier.id}
                          onMouseEnter={() => setHoveredCol(tier.colCode)}
                          onMouseLeave={() => setHoveredCol(null)}
                          onClick={() => {
                            setSelectedTierId(tier.id);
                            toast.success(`Paket aktif: ${tier.name}`);
                          }}
                          className={`p-3.5 border-r border-white/[0.08] cursor-pointer transition-all duration-150 ${
                            isPopular
                              ? 'bg-orange-950/20 border-t-2 border-t-orange-500'
                              : isSelected
                              ? 'bg-blue-950/20'
                              : isColHovered
                              ? 'bg-white/[0.03]'
                              : 'bg-[#12121c]'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] text-gray-500">[{tier.colCode}]</span>
                              {tier.badge && (
                                <span
                                  className={`text-[9px] font-semibold px-2 py-0.5 rounded-full font-sans uppercase tracking-wider ${
                                    isPopular
                                      ? 'bg-orange-500 text-white shadow-[0_0_8px_rgba(249,115,22,0.4)]'
                                      : 'bg-white/10 text-gray-300'
                                  }`}
                                >
                                  {tier.badge}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-lg ${tier.bgAccent} ${tier.accentColor}`}>
                                <tier.icon size={15} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white tracking-tight">{tier.name}</p>
                                <p className={`text-xs font-mono font-bold ${isPopular ? 'text-orange-400' : 'text-gray-300'}`}>
                                  {tier.priceDisplay}
                                </p>
                              </div>
                            </div>
                            <div className="pt-1 flex items-center justify-between text-[10px] text-gray-400">
                              <span>⏱️ {tier.timeline}</span>
                              <span
                                className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${
                                  isSelected ? 'bg-orange-500/20 text-orange-400 font-bold' : 'text-gray-500'
                                }`}
                              >
                                {isSelected ? '● SELECTED' : 'Click to select'}
                              </span>
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                {/* SPREADSHEET BODY ROWS */}
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredRows.map((row, idx) => {
                    const isRowHovered = hoveredRow === row.rowCode;

                    return (
                      <React.Fragment key={row.id}>
                        {/* Section Header Row if category changed */}
                        {(idx === 0 || filteredRows[idx - 1].category !== row.category) && (
                          <tr className="bg-[#101018] border-y border-white/[0.08]">
                            <td className="p-2 text-center font-mono text-[10px] text-orange-400/80 bg-[#141420] border-r border-white/[0.08]">
                              §
                            </td>
                            <td
                              colSpan={6}
                              className="px-4 py-2 text-[11px] font-mono uppercase tracking-widest text-orange-400 font-bold bg-gradient-to-r from-orange-500/10 via-transparent to-transparent"
                            >
                              <div className="flex items-center gap-2">
                                <Layers size={12} />
                                <span>{row.categoryLabel}</span>
                              </div>
                            </td>
                          </tr>
                        )}

                        {/* Individual Matrix Row */}
                        <tr
                          onMouseEnter={() => setHoveredRow(row.rowCode)}
                          onMouseLeave={() => setHoveredRow(null)}
                          className={`transition-colors ${
                            isRowHovered ? 'bg-white/[0.03]' : 'hover:bg-white/[0.015]'
                          }`}
                        >
                          {/* Row Number (Excel style) */}
                          <td className="p-3 text-center font-mono text-xs text-gray-500 bg-[#11111a] border-r border-white/[0.08] select-none font-semibold">
                            {row.rowCode}
                          </td>

                          {/* Column A: Feature Name & Description */}
                          <td className="p-3.5 border-r border-white/[0.08] bg-[#0e0e16]/80">
                            <div>
                              <p className="text-xs font-semibold text-white tracking-tight">{row.featureName}</p>
                              {row.description && (
                                <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{row.description}</p>
                              )}
                            </div>
                          </td>

                          {/* Columns B - F: Tier Values */}
                          {TIERS.map((tier) => {
                            const tierKey = tier.id as keyof typeof row.values;
                            const val = row.values[tierKey];
                            const isColHovered = hoveredCol === tier.colCode;
                            const isPopularCol = tier.popular || false;
                            const isCellSelected =
                              selectedCell?.row === row.rowCode && selectedCell?.col === tier.colCode;

                            return (
                              <td
                                key={tier.id}
                                onClick={() => {
                                  setSelectedCell({
                                    row: row.rowCode,
                                    col: tier.colCode,
                                    title: `${tier.name} > ${row.featureName}`,
                                    val: String(val)
                                  });
                                  setSelectedTierId(tier.id);
                                }}
                                className={`p-3.5 border-r border-white/[0.06] cursor-pointer transition-all ${
                                  isPopularCol ? 'bg-orange-500/[0.02]' : ''
                                } ${isColHovered || isRowHovered ? 'bg-white/[0.02]' : ''} ${
                                  isCellSelected
                                    ? 'ring-1 ring-orange-500 bg-orange-500/10 shadow-[0_0_12px_rgba(249,115,22,0.15)]'
                                    : ''
                                }`}
                              >
                                <div className="flex items-center justify-start">
                                  {renderCellValue(val, isPopularCol)}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>

                {/* TABLE FOOTER SUMMARY / SELECTION ACTION */}
                <tfoot>
                  <tr className="bg-[#12121c] border-t-2 border-white/[0.1] text-xs">
                    <td className="p-3 text-center font-mono text-[10px] text-gray-500 bg-[#161622] border-r border-white/[0.08]">
                      Σ
                    </td>
                    <td className="p-3.5 font-semibold text-white border-r border-white/[0.08]">
                      Aksi & Estimasi Penawaran
                    </td>
                    {TIERS.map((tier) => {
                      const isSelected = selectedTierId === tier.id;
                      const isPopular = tier.popular;

                      return (
                        <td
                          key={tier.id}
                          className={`p-3.5 border-r border-white/[0.08] ${
                            isPopular ? 'bg-orange-950/20' : ''
                          }`}
                        >
                          <button
                            onClick={() => {
                              setSelectedTierId(tier.id);
                              setViewMode('simulator');
                              toast.success(`Paket ${tier.name} dipilih untuk simulasi proposal!`);
                            }}
                            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                              isSelected
                                ? 'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                                : 'bg-white/[0.06] hover:bg-white/[0.12] text-gray-300 hover:text-white border border-white/10'
                            }`}
                          >
                            <span>{isSelected ? '✓ Terpilih' : 'Pilih Paket'}</span>
                            <ArrowRight size={12} />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* SPREADSHEET ADDONS & MAINTENANCE SUB-GRIDS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            {/* ADD-ONS SPREADSHEET SUB-GRID */}
            <div className="bg-[#0c0c12]/95 border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                    <Plus size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">Add-on Modular (Opsional)</h3>
                    <p className="text-[11px] text-gray-400">Centang untuk simulasi harga penawaran klien</p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-gray-500">[TABLE_ADDONS]</span>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                {ADDONS.map((addon) => {
                  const isChecked = selectedAddonIds.includes(addon.id);

                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'bg-blue-500/10 border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                          : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-all ${
                            isChecked ? 'bg-blue-500 border-blue-400 text-white' : 'border-white/20 bg-black/40'
                          }`}
                        >
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-gray-500">[{addon.code}]</span>
                            <h4 className="text-xs font-semibold text-white">{addon.name}</h4>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">{addon.desc}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-xs font-bold text-blue-400">{addon.priceDisplay}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MAINTENANCE SPREADSHEET SUB-GRID */}
            <div className="bg-[#0c0c12]/95 border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Wrench size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">Paket Maintenance (Retainer)</h3>
                    <p className="text-[11px] text-gray-400">Layanan berkala pasca website live</p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-gray-500">[TABLE_MAINT]</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {MAINTENANCE_PACKAGES.map((pkg) => {
                  const isSelected = selectedMaintId === pkg.id;

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedMaintId(isSelected ? '' : pkg.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                          : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                              isSelected
                                ? 'bg-emerald-500 border-emerald-400 text-white'
                                : 'border-white/20 bg-black/40'
                            }`}
                          >
                            {isSelected && <Check size={10} strokeWidth={3} />}
                          </div>
                          <span className="text-xs font-bold text-white">{pkg.name}</span>
                          {pkg.popular && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                              Disarankan
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          {pkg.priceDisplay}
                          <span className="text-[10px] text-gray-500 font-normal">{pkg.period}</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 pl-6">
                        {pkg.features.map((f, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                            <span className="w-1 h-1 rounded-full bg-emerald-500/60" />
                            <span className="truncate">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: BENTO CARDS (VISUAL EXECUTIVE VIEW) */}
      {/* ========================================================================= */}
      {viewMode === 'cards' && (
        <motion.div
          key="cards-view"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="space-y-8"
        >
          {/* Main Tier Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {TIERS.map((pkg) => {
              const isSelected = selectedTierId === pkg.id;
              const isPopular = pkg.popular;

              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedTierId(pkg.id)}
                  className={`relative rounded-2xl p-5 border backdrop-blur-xl transition-all flex flex-col justify-between cursor-pointer ${
                    isPopular
                      ? 'bg-[#14101a] border-orange-500/40 shadow-[0_0_24px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/30'
                      : isSelected
                      ? 'bg-[#101420] border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                      : 'bg-[#0e0e16]/80 border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.4)]">
                      Paling Populer
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-xl ${pkg.bgAccent} ${pkg.accentColor}`}>
                        <pkg.icon size={20} />
                      </div>
                      <span className="font-mono text-[10px] text-gray-500">[{pkg.colCode}]</span>
                    </div>

                    <h3 className="text-base font-bold text-white">{pkg.name}</h3>
                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 min-h-[32px]">{pkg.desc}</p>

                    <div className="my-4 pt-3 border-t border-white/[0.08]">
                      <p className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Investasi</p>
                      <p className={`text-xl font-bold font-mono tracking-tight ${isPopular ? 'text-orange-400' : 'text-white'}`}>
                        {pkg.priceDisplay}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">⏱️ {pkg.timeline}</p>
                    </div>

                    <div className="space-y-2 text-xs text-gray-300">
                      <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
                        <p className="text-[10px] uppercase font-mono text-gray-500">Cocok Untuk:</p>
                        <p className="text-[11px] text-gray-300 mt-0.5">{pkg.target}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTierId(pkg.id);
                      setViewMode('simulator');
                    }}
                    className={`mt-6 w-full py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                        : 'bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10'
                    }`}
                  >
                    <span>{isSelected ? '✓ Dipilih (Simulasi)' : 'Pilih & Buat Proposal'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: QUOTE SIMULATOR & CLIENT PROPOSAL BUILDER */}
      {/* ========================================================================= */}
      {viewMode === 'simulator' && (
        <motion.div
          key="simulator-view"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* LEFT: SIMULATOR INPUTS & SELECTORS (7 COLS) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Client Details Card */}
            <div className="bg-[#0c0c12]/95 border border-white/[0.08] rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
                <Sliders size={16} className="text-orange-400" />
                <h3 className="text-sm font-bold text-white">1. Identitas Klien & Tipe Usaha</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-gray-400 block mb-1">NAMA KLIEN / CONTACT</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pak Budi / Green Paddy"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-[#141420] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-gray-400 block mb-1">JENIS / BIDANG USAHA</label>
                  <input
                    type="text"
                    placeholder="Contoh: Hostel Ubud / Klinik Gigi"
                    value={clientBusinessType}
                    onChange={(e) => setClientBusinessType(e.target.value)}
                    className="w-full bg-[#141420] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/50"
                  />
                </div>
              </div>
            </div>

            {/* 2. Package Selection Grid */}
            <div className="bg-[#0c0c12]/95 border border-white/[0.08] rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-orange-400" />
                  <h3 className="text-sm font-bold text-white">2. Pilih Paket Utama</h3>
                </div>
                <span className="text-xs font-mono text-orange-400">{activeTier.name} ({activeTier.priceDisplay})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TIERS.map((tier) => {
                  const isSelected = selectedTierId === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTierId(tier.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-orange-500/10 border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.2)]'
                          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{tier.name}</span>
                          {tier.popular && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-semibold">
                              Populer
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">{tier.timeline}</p>
                      </div>
                      <span className="font-mono text-xs font-bold text-orange-400">{tier.priceDisplay}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Add-on Checkbox Matrix */}
            <div className="bg-[#0c0c12]/95 border border-white/[0.08] rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <Plus size={16} className="text-blue-400" />
                  <h3 className="text-sm font-bold text-white">3. Pilih Add-On (Opsional)</h3>
                </div>
                <span className="text-xs font-mono text-blue-400">
                  {activeAddons.length} Dipilih (+{formatCurrency(subtotalAddons)})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ADDONS.map((addon) => {
                  const isChecked = selectedAddonIds.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'bg-blue-500/10 border-blue-500/40 text-white'
                          : 'bg-white/[0.02] border-white/[0.05] text-gray-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isChecked ? 'bg-blue-500 border-blue-400 text-white' : 'border-white/20 bg-black/40'
                          }`}
                        >
                          {isChecked && <Check size={10} strokeWidth={3} />}
                        </div>
                        <div>
                          <p className="text-xs font-semibold">{addon.name}</p>
                          <p className="text-[10px] text-gray-500">{addon.desc}</p>
                        </div>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-blue-400 shrink-0 pl-2">
                        {addon.priceDisplay}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: PROPOSAL BREAKDOWN & LIVE WHATSAPP PREVIEW (5 COLS) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Live Price Calculator Summary */}
            <div className="bg-[#0c0c12]/95 border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <Calculator size={16} className="text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Ringkasan Investasi</h3>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  LIVE CALC
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between text-gray-300">
                  <span>Paket: {activeTier.name}</span>
                  <span className="font-semibold text-white">{formatCurrency(subtotalWeb)}</span>
                </div>

                {activeAddons.length > 0 && (
                  <div className="space-y-1 pl-3 border-l border-blue-500/30 text-gray-400 text-[11px]">
                    {activeAddons.map((addon) => (
                      <div key={addon.id} className="flex justify-between">
                        <span>+ {addon.name}</span>
                        <span>{formatCurrency(addon.priceRaw)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-white/[0.08] flex justify-between text-sm font-bold text-white">
                  <span className="font-sans">TOTAL INVESTASI PROYEK</span>
                  <span className="text-emerald-400 text-base">{formatCurrency(totalProjectPrice)}</span>
                </div>

                <div className="flex justify-between text-xs text-orange-400 bg-orange-500/10 p-2.5 rounded-xl border border-orange-500/20">
                  <span>Skema DP (50% Dimuka):</span>
                  <span className="font-bold">{formatCurrency(downPayment)}</span>
                </div>

                {activeMaint && (
                  <div className="flex justify-between text-xs text-purple-300 bg-purple-500/10 p-2.5 rounded-xl border border-purple-500/20">
                    <span>Maintenance ({activeMaint.name}):</span>
                    <span className="font-bold">{activeMaint.priceDisplay}/bln</span>
                  </div>
                )}
              </div>
            </div>

            {/* WhatsApp Pitch Draft Preview */}
            <div className="bg-[#0c0c12]/95 border border-white/[0.08] rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <Send size={15} className="text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Preview Draft WhatsApp</h3>
                </div>
                <button
                  onClick={handleCopyProposal}
                  className="px-3 py-1 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-all flex items-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                >
                  {copiedProposal ? <CheckCheck size={12} /> : <Copy size={12} />}
                  <span>{copiedProposal ? 'Disalin!' : 'Salin Text'}</span>
                </button>
              </div>

              <div className="bg-[#12121a] border border-white/5 rounded-xl p-3 text-[11px] font-mono text-gray-300 whitespace-pre-wrap leading-relaxed max-h-[260px] overflow-y-auto custom-scrollbar">
                {generateWhatsAppProposal()}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* --- FOOTER SCOPE & TERMS ACCORDION --- */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-[#0b0b10] border border-white/[0.08] rounded-2xl p-5 md:p-6 space-y-3"
      >
        <div className="flex items-center gap-2 text-orange-400">
          <ShieldCheck size={16} />
          <h3 className="text-xs font-bold uppercase font-mono tracking-wider">
            Standard Scope of Work & Payment Agreement
          </h3>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-400 leading-relaxed">
          {SCOPE_NOTES.map((note, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-white/[0.015] p-2.5 rounded-xl border border-white/[0.04]">
              <span className="font-mono text-orange-400 font-bold text-[11px]">0{idx + 1}.</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </motion.section>
    </div>
  );
}
