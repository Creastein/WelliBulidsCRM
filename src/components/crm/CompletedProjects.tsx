"use client";

import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Globe,
  ExternalLink,
  Search,
  Receipt,
  X,
  Copy,
  Check,
  Download,
  Building2
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface CompletedProject {
  id: string;
  rowCode: string;
  name: string;
  domain: string;
  url: string;
  clientName: string;
  clientContact?: string;
  location: string;
  category: 'Villa' | 'Tour & Activity' | 'Resort & Bungalow' | 'Homestay & Kos' | 'Website Optimization';
  price: number;
  invoiceDate?: string;
  invoiceNumber?: string;
  packageType: string;
  description: string;
  features: string[];
  addons?: { name: string; price: number }[];
  notes?: string;
}

export const COMPLETED_PROJECTS: CompletedProject[] = [
  {
    id: 'proj-1',
    rowCode: '01',
    name: 'Dea Haven Villas',
    domain: 'deahavenvillas.com',
    url: 'https://deahavenvillas.com',
    clientName: 'Bapak Andi Irfan Jaya',
    location: 'Bali',
    category: 'Villa',
    price: 2000000,
    invoiceDate: '6 Sep 2026',
    packageType: 'Paket Standar (Promo)',
    description: 'Website villa 1 halaman dengan direct booking WhatsApp, performa cepat, dan bilingual ID + EN.',
    features: ['1 Halaman Responsif', 'Direct Booking WA', 'Domain & Hosting', 'SEO Dasar', 'Bilingual ID + EN'],
    notes: 'Total Rp 2.000.000 (Lunas).'
  },
  {
    id: 'proj-2',
    rowCode: '02',
    name: 'Jumbo Gerupuk Surf Lessons',
    domain: 'surfjumbo.com',
    url: 'https://surfjumbo.com',
    clientName: 'Pak Jumbo',
    location: 'Gerupuk, Lombok',
    category: 'Tour & Activity',
    price: 2000000,
    invoiceDate: '25 Agu 2026',
    invoiceNumber: 'WLB/INV/2026/0825-JG',
    packageType: 'Website Surfing (Wisman)',
    description: 'Landing page full English untuk instruktur surfing lokal dengan katalog surf lesson, boat ride, & rental.',
    features: ['Landing Page Full English', 'Katalog Layanan', 'Domain .com', 'Hosting', 'Google Business Profile'],
    notes: 'Total deal Rp 2.000.000 (Lunas).'
  },
  {
    id: 'proj-3',
    rowCode: '03',
    name: 'Homy Home Bali Tour',
    domain: 'homyhomebalitour.com',
    url: 'https://homyhomebalitour.com',
    clientName: 'Ibu Erna',
    location: 'Bali',
    category: 'Tour & Activity',
    price: 2000000,
    invoiceDate: 'Agu 2026',
    packageType: 'Paket Standar (Promo)',
    description: 'Landing page tour & travel Bali dengan katalog rute wisata favorit dan reservasi WhatsApp.',
    features: ['Landing Page Tour Bali', 'WhatsApp Booking', 'Domain & Hosting', 'Basic SEO', 'Bilingual ID + EN'],
    notes: 'Total deal Rp 2.000.000 (Lunas).'
  },
  {
    id: 'proj-4',
    rowCode: '04',
    name: 'The Subahu Villa',
    domain: 'thesubahuvilla.com',
    url: 'https://thesubahuvilla.com',
    clientName: 'Pak Subahu Das',
    location: 'Sanur, Bali',
    category: 'Villa',
    price: 2800000,
    invoiceDate: '23 Jul 2026',
    invoiceNumber: 'WB-2026-003',
    packageType: 'Website + CMS + Calendar Sync',
    description: 'Website villa multi-section di Sanur dengan galeri foto resolusi tinggi dan integrasi kalender kamar.',
    features: ['Multi-Section Layout', 'Galeri Foto HD', 'WA Booking', 'Vercel Hosting', 'Google Calendar Availability'],
    addons: [{ name: 'Calendar Availability Embed', price: 300000 }],
    notes: 'Paket dasar Rp 2.500.000 + Addon Rp 300.000 = Rp 2.800.000 (Lunas).'
  },
  {
    id: 'proj-5',
    rowCode: '05',
    name: 'Homebase Lombok',
    domain: 'homebaselombok.com',
    url: 'https://homebaselombok.com',
    clientName: 'Pak Yoyo',
    location: 'Lombok',
    category: 'Villa',
    price: 2200000,
    invoiceDate: 'Jul 2026',
    packageType: 'Multi-Villa Availability Sync',
    description: 'Sistem integrasi kalender ketersediaan 3 unit villa dengan sinkronisasi ke Airbnb & Booking.com.',
    features: ['3 Unit Sync Kalender', 'Airbnb & Booking.com Sync', 'Special Offer Button', 'Bugfix Audit'],
    addons: [
      { name: 'Sync 2 Replikasi Unit', price: 700000 },
      { name: 'Special Offer Button', price: 100000 }
    ],
    notes: 'Total Rp 2.200.000 (Lunas).'
  },
  {
    id: 'proj-6',
    rowCode: '06',
    name: 'Danu House Ubud Tour',
    domain: 'danuhouseubudtour.com',
    url: 'https://danuhouseubudtour.com',
    clientName: 'Kak Mita Sugiarti',
    location: 'Ubud, Bali',
    category: 'Tour & Activity',
    price: 2000000,
    invoiceDate: '1 Agu 2026',
    packageType: 'Paket Tour & Guide',
    description: 'Website sewa mobil privat & pemandu wisata lokal Ubud dengan rute kustom dan direct WA booking.',
    features: ['Showcase Tour Ubud', 'Galeri Destinasi', 'Direct WA Booking', 'Domain & Hosting', 'Bilingual ID + EN'],
    notes: 'Total Rp 2.000.000 (Lunas).'
  },
  {
    id: 'proj-7',
    rowCode: '07',
    name: 'DATOYA Guest House',
    domain: 'datoyahouse.com',
    url: 'https://datoyahouse.com',
    clientName: 'Ibu Izha & Bpk Listiyono',
    location: 'Semarang, Jawa Tengah',
    category: 'Homestay & Kos',
    price: 1550000,
    invoiceDate: '9 Jul 2026',
    packageType: 'Paket Standard Promo',
    description: 'Website profil guest house dengan showcase kamar, fasilitas, Google Maps, dan reservasi WA.',
    features: ['Landing Page Modern', 'Galeri Foto Kamar', 'Tombol WhatsApp', 'Domain & Hosting', 'Google Maps'],
    notes: 'Total Rp 1.550.000 (Lunas).'
  },
  {
    id: 'proj-8',
    rowCode: '08',
    name: 'Grha Vege Jawi Syariah',
    domain: 'grhavegejawi.com',
    url: 'https://grhavegejawi.com',
    clientName: 'Ibu Agnes',
    location: 'Yogyakarta',
    category: 'Homestay & Kos',
    price: 2000000,
    invoiceDate: '4 Sep 2026',
    invoiceNumber: 'WB/2026/09-AGNESIA',
    packageType: 'Paket Kos Eksklusif',
    description: 'Website kos eksklusif syariah 6 kamar AC di Jogja dengan galeri fasilitas dan kontak WA pengelola.',
    features: ['Website 1 Halaman', 'Galeri Foto Fasilitas', 'WhatsApp Booking', 'Domain & Hosting', 'Google Maps'],
    notes: 'Total Rp 2.000.000 (Lunas).'
  },
  {
    id: 'proj-9',
    rowCode: '09',
    name: 'Floating Paradise Karimunjawa',
    domain: 'floatingparadise.id',
    url: 'https://floatingparadise.id',
    clientName: 'Management Floating Paradise',
    location: 'Karimunjawa, Jateng',
    category: 'Resort & Bungalow',
    price: 5750000,
    invoiceDate: '2026',
    packageType: 'Next.js + Sanity Headless CMS',
    description: 'Migrasi WordPress ke Next.js modern, Sanity CMS 6 halaman, dan integrasi engine Tripla booking.',
    features: ['Next.js + Sanity CMS', '6 Halaman Arsitektur', 'Kelola Konten Mandiri', 'Tripla Booking Engine', 'Advanced SEO'],
    notes: 'Total Rp 5.750.000 (Lunas).'
  },
  {
    id: 'proj-10',
    rowCode: '10',
    name: 'The Secret Karimunjawa',
    domain: 'thesecretkarimunjawa.com',
    url: 'https://thesecretkarimunjawa.com',
    clientName: 'The Secret Team',
    location: 'Karimunjawa, Jateng',
    category: 'Villa',
    price: 4250000,
    invoiceDate: '19 Mar 2026',
    invoiceNumber: 'INV-2026-002',
    packageType: 'Custom 11 Section + 4 Bahasa',
    description: 'Website villa overwater sunset di Karimunjawa dengan desain custom, Google Analytics 4, dan 4 bahasa.',
    features: ['Custom 11 Section', 'Hosting Vercel & Domain', 'Direct Booking WA', 'Google Analytics 4', '4 Bahasa Ekstra'],
    addons: [
      { name: 'Addon 4 Bahasa Internasional', price: 600000 },
      { name: 'Setup GA4 Sitewide', price: 150000 }
    ],
    notes: 'Total Rp 4.250.000 (Lunas).'
  },
  {
    id: 'proj-11',
    rowCode: '11',
    name: 'Green Paddy Hostel Ubud',
    domain: 'greenpaddyhostelubud.com',
    url: 'https://www.greenpaddyhostelubud.com',
    clientName: 'Green Paddy Hostel',
    location: 'Ubud, Bali',
    category: 'Website Optimization',
    price: 350000,
    invoiceDate: '23 Agu 2026',
    invoiceNumber: 'WB/2026/08-GREENPADDY',
    packageType: 'PageSpeed & CWV Optimization',
    description: 'Optimasi performa WordPress Green Paddy Hostel Ubud untuk skor Core Web Vitals dan loading kilat.',
    features: ['Caching Server', 'Optimasi WebP', 'CSS/JS Defer Minify', 'Skor Desktop 90+'],
    notes: 'Total Rp 350.000 (Lunas).'
  }
];

export default function CompletedProjects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProjectModal, setActiveProjectModal] = useState<CompletedProject | null>(null);
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);

  const categories = ['All', 'Villa', 'Tour & Activity', 'Resort & Bungalow', 'Homestay & Kos', 'Website Optimization'];

  const filteredProjects = useMemo(() => {
    return COMPLETED_PROJECTS.filter((project) => {
      const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        project.name.toLowerCase().includes(q) ||
        project.domain.toLowerCase().includes(q) ||
        project.clientName.toLowerCase().includes(q) ||
        project.location.toLowerCase().includes(q) ||
        project.packageType.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const totalRevenue = useMemo(() => {
    return filteredProjects.reduce((acc, p) => acc + p.price, 0);
  }, [filteredProjects]);

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const handleCopy = (domain: string) => {
    navigator.clipboard.writeText(domain);
    setCopiedDomain(domain);
    toast.success(`Domain ${domain} disalin!`);
    setTimeout(() => setCopiedDomain(null), 2000);
  };

  const handleExportCsv = () => {
    const headers = ['No', 'Proyek', 'Domain', 'Klien', 'Lokasi', 'Kategori', 'Paket', 'Harga (IDR)', 'Tanggal'];
    const rows = filteredProjects.map((p) => [
      `"${p.rowCode}"`,
      `"${p.name}"`,
      `"${p.domain}"`,
      `"${p.clientName}"`,
      `"${p.location}"`,
      `"${p.category}"`,
      `"${p.packageType}"`,
      `"${p.price}"`,
      `"${p.invoiceDate || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `WelliBuilds_Projects_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('File CSV berhasil didownload!');
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 pb-20 text-white">
      {/* Top Simple Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Done Projects
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-normal">
              {filteredProjects.length} Proyek
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Daftar proyek website selesai dan telah live diserahterimakan ke klien.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-gray-500 uppercase font-mono block">Total Nilai Deal</span>
            <span className="text-base md:text-lg font-mono font-bold text-emerald-400">
              {formatIDR(totalRevenue)}
            </span>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-medium transition-colors"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111116]/80 border border-white/[0.06] p-2.5 rounded-xl">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white font-semibold shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Cari proyek, domain, klien..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Simple, Clean Excel-Style Data Table */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0e0e14]/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[860px]">
            <thead>
              <tr className="bg-[#14141c] border-b border-white/[0.08] text-[11px] font-mono text-gray-400">
                <th className="p-3 w-10 text-center border-r border-white/[0.06] text-gray-500">#</th>
                <th className="p-3 border-r border-white/[0.06] text-gray-300">PROYEK & DOMAIN</th>
                <th className="p-3 border-r border-white/[0.06] text-gray-300">KLIEN</th>
                <th className="p-3 border-r border-white/[0.06] text-gray-300">LOKASI</th>
                <th className="p-3 border-r border-white/[0.06] text-gray-300">KATEGORI</th>
                <th className="p-3 border-r border-white/[0.06] text-gray-300">PAKET LAYANAN</th>
                <th className="p-3 border-r border-white/[0.06] text-emerald-400 text-right">NILAI DEAL</th>
                <th className="p-3 border-r border-white/[0.06] text-gray-400 text-center">TGL</th>
                <th className="p-3 text-center text-gray-400">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {filteredProjects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setActiveProjectModal(p)}
                  className="hover:bg-white/[0.025] transition-colors cursor-pointer group"
                >
                  {/* # Index */}
                  <td className="p-3 text-center font-mono text-gray-500 border-r border-white/[0.06]">
                    {p.rowCode}
                  </td>

                  {/* Proyek & Domain */}
                  <td className="p-3 border-r border-white/[0.06]">
                    <div className="font-semibold text-white group-hover:text-orange-400 transition-colors">
                      {p.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono text-[11px] text-orange-400/90 hover:text-orange-300 hover:underline flex items-center gap-1"
                      >
                        <Globe size={11} />
                        {p.domain}
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(p.domain);
                        }}
                        className="text-gray-500 hover:text-white"
                        title="Salin domain"
                      >
                        {copiedDomain === p.domain ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      </button>
                    </div>
                  </td>

                  {/* Klien */}
                  <td className="p-3 text-gray-300 border-r border-white/[0.06]">
                    {p.clientName}
                  </td>

                  {/* Lokasi */}
                  <td className="p-3 text-gray-400 border-r border-white/[0.06]">
                    {p.location}
                  </td>

                  {/* Kategori */}
                  <td className="p-3 border-r border-white/[0.06]">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-gray-300 border border-white/5 whitespace-nowrap">
                      {p.category}
                    </span>
                  </td>

                  {/* Paket */}
                  <td className="p-3 text-gray-300 border-r border-white/[0.06]">
                    <span>{p.packageType}</span>
                  </td>

                  {/* Harga */}
                  <td className="p-3 font-mono font-semibold text-emerald-400 text-right border-r border-white/[0.06]">
                    {formatIDR(p.price)}
                  </td>

                  {/* Tanggal */}
                  <td className="p-3 font-mono text-[11px] text-gray-400 text-center border-r border-white/[0.06]">
                    {p.invoiceDate || '—'}
                  </td>

                  {/* Aksi */}
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProjectModal(p);
                        }}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                        title="Detail Invoice"
                      >
                        <Receipt size={13} />
                      </button>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 transition-colors"
                        title="Buka Website"
                      >
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Table Footer */}
            <tfoot>
              <tr className="bg-[#14141c] border-t border-white/[0.08] text-xs font-mono">
                <td className="p-3 text-center text-gray-500 border-r border-white/[0.06]">Σ</td>
                <td colSpan={5} className="p-3 font-bold text-white border-r border-white/[0.06]">
                  TOTAL {filteredProjects.length} PROYEK
                </td>
                <td className="p-3 text-right font-bold text-emerald-400 border-r border-white/[0.06]">
                  {formatIDR(totalRevenue)}
                </td>
                <td colSpan={2} className="p-3 text-center text-gray-500 text-[11px]">
                  100% Lunas
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12 bg-[#111116] border border-white/5 rounded-xl">
          <Building2 size={32} className="mx-auto text-gray-600 mb-2" />
          <p className="text-xs text-gray-400">Tidak ada proyek yang sesuai dengan pencarian.</p>
        </div>
      )}

      {/* Simple Invoice Modal */}
      <AnimatePresence>
        {activeProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#121218] border border-white/15 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">{activeProjectModal.name}</h3>
                  <a
                    href={activeProjectModal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-orange-400 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <Globe size={12} />
                    {activeProjectModal.domain}
                  </a>
                </div>
                <button
                  onClick={() => setActiveProjectModal(null)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-3 text-xs text-gray-300">
                <div className="grid grid-cols-2 gap-2 bg-white/5 p-3 rounded-xl">
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono block">KLIEN</span>
                    <span className="font-semibold text-white">{activeProjectModal.clientName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono block">LOKASI & KATEGORI</span>
                    <span className="text-gray-300">{activeProjectModal.location} ({activeProjectModal.category})</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-gray-500 font-mono block mb-1">PAKET & DESKRIPSI</span>
                  <p className="text-gray-300 leading-relaxed">{activeProjectModal.description}</p>
                </div>

                <div>
                  <span className="text-[10px] text-gray-500 font-mono block mb-1.5">DELIVERABLES</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeProjectModal.features.map((feat, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-black/40 border border-white/5 text-[11px] text-gray-300">
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {activeProjectModal.addons && (
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono block mb-1">ADD-ONS</span>
                    {activeProjectModal.addons.map((add, idx) => (
                      <div key={idx} className="flex justify-between text-xs py-1 border-b border-white/5">
                        <span>{add.name}</span>
                        <span className="font-mono text-white">{formatIDR(add.price)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-white/10 text-sm font-bold">
                  <span>TOTAL BIAYA:</span>
                  <span className="text-emerald-400 font-mono text-base">{formatIDR(activeProjectModal.price)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setActiveProjectModal(null)}
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs"
                >
                  Tutup
                </button>
                <a
                  href={activeProjectModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <span>Buka Website</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
