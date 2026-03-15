import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Star, Crown, RefreshCw, Tag, CheckCircle2, Plus, Wrench, Info } from 'lucide-react';

const packages = [
  {
    name: 'Landing Page Simple',
    price: 'Rp 1.500.000',
    icon: Star,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-500/30',
    target: 'Bengkel, Klinik kecil, UMKM, Toko kecil',
    time: '3–5 hari kerja',
    features: ['Info bisnis lengkap', 'Jam operasional & galeri foto', 'Tombol WhatsApp CTA', 'Kontak & embed Google Maps', 'Mobile responsive']
  },
  {
    name: 'Website Katalog',
    price: 'Rp 2.500.000',
    icon: Zap,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-500/30',
    target: 'Restoran, Salon, Tour & Activity, Toko Online',
    time: '5–7 hari kerja',
    features: ['Semua fitur Landing Page Simple', 'Katalog produk / layanan', 'Galeri foto lebih banyak (hingga 20)', 'Form kontak + integrasi WhatsApp', 'Basic SEO', 'Halaman multi-section'],
    popular: true
  },
  {
    name: 'Website Premium',
    price: 'Rp 4.000.000',
    icon: Crown,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-500/30',
    target: 'Villa butik, Resort kecil, Spa, Tour operator premium',
    time: '10–14 hari kerja',
    features: ['Semua fitur Website Katalog', 'Multi-language (ID + EN)', 'SEO lanjutan (Schema, dll)', 'Setup GA4 + Search Console', 'Integrasi Instagram feed', 'Optimasi performa (PageSpeed 90+)', 'Custom domain & DNS']
  },
  {
    name: 'Website Villa Pro',
    price: 'Rp 6.500.000+',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-500/30',
    target: 'Villa resort, Hotel, Spa besar, Hospitality premium',
    time: '14–21 hari kerja',
    features: ['Semua fitur Website Premium', 'Kalender booking real-time', 'Virtual tour foto 360°', 'Payment gateway (Midtrans/Xendit)', 'Dashboard admin', 'Laporan performa (1 bln pertama)', 'Prioritas support 30 hari']
  }
];

const addons = [
  { name: 'Multi-language EN+ID', price: 'Rp 400.000' },
  { name: 'Setup SEO lengkap', desc: 'GA4 + GSC + Schema', price: 'Rp 300.000' },
  { name: 'Integrasi Instagram feed', price: 'Rp 200.000' },
  { name: 'Speed optimization', desc: 'PageSpeed 90+', price: 'Rp 300.000' },
  { name: 'Virtual tour foto 360°', price: 'Rp 750.000' },
  { name: 'Sistem booking online', desc: 'Real-time', price: 'Rp 1.500.000' },
  { name: 'Payment gateway', desc: 'Midtrans/Xendit', price: 'Rp 1.000.000' },
  { name: 'Logo design', desc: '3 konsep', price: 'Rp 350.000' },
  { name: 'Copywriting halaman', desc: 'Per halaman', price: 'Rp 250.000' },
  { name: 'Domain + Hosting setup', desc: '1 tahun', price: 'Rp 600.000' }
];

const maintenancePackages = [
  {
    name: 'Basic',
    price: 'Rp 250.000',
    period: '/ bln',
    features: ['Update konten ringan (maks. 3x/bulan)', 'Monitoring uptime website', 'Backup bulanan']
  },
  {
    name: 'Standard',
    price: 'Rp 500.000',
    period: '/ bln',
    features: ['Semua fitur Basic', 'Update fitur minor (tambah section/layout)', 'Backup mingguan', 'Laporan performa bulanan'],
    popular: true
  },
  {
    name: 'Priority',
    price: 'Rp 1.000.000',
    period: '/ bln',
    features: ['Semua fitur Standard', 'Respons prioritas (maks. 24 jam kerja)', 'Update konten tidak terbatas', 'Konsultasi SEO & konten (1x/bulan)']
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
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }
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
          <h1 className="text-3xl md:text-4xl font-display tracking-tight text-white mt-3">
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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {packages.map((pkg, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className={`relative bg-[#0f0f0f]/50 backdrop-blur-xl rounded-2xl border ${
              pkg.popular ? 'border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)]' : 'border-white/5'
            } p-6 flex flex-col gap-6 transition-colors group`}
          >
            <div className="flex flex-col gap-5 h-full">
              {/* Header: Icon and Label */}
              <div className="flex items-start justify-between gap-2">
                <div className={`w-12 h-12 rounded-2xl ${pkg.bg} flex items-center justify-center shrink-0`}>
                  <pkg.icon size={24} className={pkg.color} />
                </div>
                {pkg.popular && (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-semibold uppercase tracking-wider py-1.5 px-3 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.2)] whitespace-nowrap"
                  >
                    Most Popular
                  </motion.div>
                )}
              </div>
              
              {/* Content body that grows */}
              <div className="flex flex-col flex-1 mt-2">
                <div className="min-h-[56px] mb-4">
                  <h3 className="text-xl font-bold text-white line-clamp-2">{pkg.name}</h3>
                </div>
                
                <div className="flex flex-col gap-1 mb-6">
                  <p className="text-[11px] uppercase tracking-wider text-gray-500">Mulai dari</p>
                  <p className="text-3xl font-bold text-white tracking-tight whitespace-nowrap">{pkg.price}</p>
                </div>

                <div className="pt-4 border-t border-white/5 pb-4">
                   <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500">Estimasi Durasi</p>
                      <p className="text-sm text-gray-300 font-medium mt-1">{pkg.time}</p>
                   </div>
                </div>

                <div className="rounded-xl border border-white/5 bg-[#0f0f0f]/50 px-4 py-3 mt-auto">
                  <p className="text-[11px] uppercase tracking-wider text-gray-500">Target Bisnis</p>
                  <p className="text-sm text-gray-300 mt-1">{pkg.target}</p>
                </div>
              </div>
            </div>

            {/* Features section decoupled from h-full top container */}
            <div className="pt-2">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-3">Fitur Termasuk</p>
              <ul className="space-y-2">
                {pkg.features.map((feature, fIdx) => (
                  <motion.li
                    key={fIdx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: fIdx * 0.1, duration: 0.3 }}
                    className="flex items-start gap-2 text-sm text-gray-300"
                  >
                    <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <button
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                pkg.popular
                  ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/10'
              }`}
            >
              Pilih Paket
            </button>
          </motion.div>
        ))}
      </motion.div>

      <motion.section
        className="mt-20"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wide mb-3">
            <Plus size={14} />
            Add-on (Opsional)
          </div>
          <h2 className="text-2xl font-semibold text-white">Lengkapi Website Anda</h2>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {addons.map((addon, idx) => (
            <div key={idx} className="bg-[#0f0f0f]/50 backdrop-blur-xl border border-white/5 rounded-xl p-4 flex flex-col justify-between group hover:border-white/10 transition-colors">
              <div>
                <h4 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{addon.name}</h4>
                {addon.desc && <p className="text-[11px] text-gray-500 mt-0.5">{addon.desc}</p>}
              </div>
              <p className="text-sm font-semibold text-blue-400 mt-3">{addon.price}</p>
            </div>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        className="mt-20"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wide mb-3">
            <Wrench size={14} />
            Paket Maintenance
          </div>
          <h2 className="text-2xl font-semibold text-white">Setelah Website Live</h2>
          <p className="text-sm text-gray-400 mt-2 max-w-xl mx-auto">
            Bisnis tetap butuh perawatan. Maintenance memastikan website tetap cepat, aman, dan relevan.
            <br />
            <span className="text-xs text-gray-500 italic">*Belum termasuk biaya perpanjangan domain & hosting tahunan.</span>
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          variants={containerVariants}
        >
          {maintenancePackages.map((pkg, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className={`bg-[#0f0f0f]/50 backdrop-blur-xl border ${pkg.popular ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-white/5'} rounded-2xl p-6 md:p-8 flex flex-col`}
            >
              <h3 className="text-xl font-semibold text-white">{pkg.name}</h3>
              <div className="mt-2 mb-6 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">{pkg.price}</span>
                <span className="text-sm text-gray-500">{pkg.period}</span>
              </div>
              
              <ul className="space-y-3 mt-auto">
                {pkg.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        className="mt-16 mb-8 max-w-3xl mx-auto"
        variants={itemVariants}
      >
        <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info size={18} className="text-orange-400" />
            <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider">Catatan Penting</h3>
          </div>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-gray-400">
              <span className="text-orange-500/50 mt-1">•</span>
              <span>Harga belum termasuk domain & hosting (jika belum ada) — estimasi <strong>Rp 600.000/tahun</strong></span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-400">
              <span className="text-orange-500/50 mt-1">•</span>
              <span>Revisi desain: <strong>2x gratis</strong>, revisi ke-3 dst dikenakan Rp 100.000/sesi</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-400">
              <span className="text-orange-500/50 mt-1">•</span>
              <span>Pembayaran: <strong>50% di awal, 50% setelah approval final</strong></span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-400">
              <span className="text-orange-500/50 mt-1">•</span>
              <span>Proyek dimulai setelah DP diterima dan brief lengkap diserahkan</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-400">
              <span className="text-orange-500/50 mt-1">•</span>
              <span>Harga berlaku hingga portofolio diperbarui — subject to change</span>
            </li>
          </ul>
        </div>
      </motion.section>
    </div>
  );
}
