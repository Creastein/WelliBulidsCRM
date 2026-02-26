import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Star, Crown, RefreshCw, Tag, CheckCircle2 } from 'lucide-react';

const packages = [
  {
    name: 'Landing Page Simple',
    price: 'Rp 1.500.000',
    icon: Star,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-500/30',
    target: 'Bengkel, Klinik kecil, Toko kecil',
    time: '3-5 hari',
    features: ['Info bisnis lengkap', 'Kontak & lokasi terintegrasi', 'Jam buka & galeri foto', 'Tombol WA CTA', 'Mobile responsive']
  },
  {
    name: 'Website Katalog',
    price: 'Rp 2.500.000',
    icon: Zap,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-500/30',
    target: 'Restoran, Toko Furniture, Salon',
    time: '5-7 hari',
    features: ['Semua fitur Landing Page', 'Katalog produk/layanan', 'Galeri foto lebih banyak', 'Form kontak + WhatsApp', 'Basic SEO'],
    popular: true
  },
  {
    name: 'Website Premium',
    price: 'Rp 3.500.000',
    icon: Crown,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-500/30',
    target: 'Gym, Restoran besar, Klinik',
    time: '10-14 hari',
    features: ['Semua fitur Katalog', 'Sistem booking online', 'Multi-language (ID+EN)', 'SEO optimization lanjutan', 'Integrasi Instagram']
  },
  {
    name: 'Website Villa Pro',
    price: 'Rp 5.000.000+',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-500/30',
    target: 'Villa resort, Hotel, Spa besar',
    time: '14-21 hari',
    features: ['Semua fitur Premium', 'Kalender booking real-time', 'Virtual tour foto 360°', 'Payment gateway', 'Dashboard admin']
  }
];

const containerVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

export default function Pricing() {
  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-[1240px] mx-auto space-y-10">
      <motion.header
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants}>
          <div className="inline-flex items-center gap-2 text-orange-400/90 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
            <Tag size={14} />
            Pricing Strategy
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mt-3">
            Paket Harga & Layanan
          </h1>
          <p className="text-sm text-gray-400 mt-2 max-w-xl">
            Mulai dari paket ringan untuk mudah closing, lalu upsell setelah deal.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-white/5 bg-[#0f0f0f]/50 backdrop-blur-xl px-4 py-3 max-w-md"
        >
          <div className="flex items-start gap-3">
            <Zap size={18} className="text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-100">Strategi Pricing</p>
              <p className="text-xs text-gray-400 leading-relaxed mt-1">
                Tawarkan Katalog (Rp 1,5–3 jt) untuk mudah closing. Target 4 klien = Rp 6–8 juta. Tambah 1 Villa Pro = done.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.header>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {packages.map((pkg, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className={`relative bg-[#0f0f0f]/50 backdrop-blur-xl rounded-2xl border ${pkg.popular ? 'border-white/20' : 'border-white/5'} p-6 flex flex-col gap-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]`}
          >
            {pkg.popular && (
              <div className="absolute top-4 right-4 bg-white/10 text-white text-[10px] font-semibold uppercase tracking-wider py-1 px-2 rounded-full">
                Most Popular
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className={`w-10 h-10 rounded-xl ${pkg.bg} flex items-center justify-center`}>
                  <pkg.icon size={20} className={pkg.color} />
                </div>
                <h3 className="text-lg font-semibold text-white mt-3">{pkg.name}</h3>
                <p className="text-xl font-semibold text-white mt-2">{pkg.price}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wider text-gray-500">Durasi</p>
                <p className="text-sm text-gray-300 mt-1">{pkg.time}</p>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-3">
              <p className="text-[11px] uppercase tracking-wider text-gray-500">Target Bisnis</p>
              <p className="text-sm text-gray-300 mt-1">{pkg.target}</p>
            </div>

            <div className="pt-2">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-3">Fitur Termasuk</p>
              <ul className="space-y-2">
                {pkg.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${pkg.popular
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'
                }`}
            >
              Pilih Paket
            </button>
          </motion.div>
        ))}
      </motion.div>

      <motion.section
        className="mt-12"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={itemVariants}
          className="bg-[#0f0f0f]/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <RefreshCw size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Maintenance Bulanan</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-xl">
                Layanan berkelanjutan untuk menjaga website tetap aman, cepat, dan up-to-date.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check size={16} className="text-blue-400" /> Update konten rutin
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check size={16} className="text-blue-400" /> Backup bulanan
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check size={16} className="text-blue-400" /> Security check
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check size={16} className="text-blue-400" /> Support teknis via WA
                </li>
              </ul>
            </div>
          </div>

          <div className="shrink-0 text-center md:text-right w-full md:w-auto border-t md:border-t-0 md:border-l border-[#1f1f1f] pt-6 md:pt-0 md:pl-8">
            <p className="text-[11px] uppercase tracking-wider text-gray-500">Mulai Dari</p>
            <p className="text-3xl font-semibold text-white mt-1">Rp 200rb</p>
            <p className="text-sm text-gray-400">/ bulan</p>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}
