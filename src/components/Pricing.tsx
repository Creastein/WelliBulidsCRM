import React from 'react';
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

export default function Pricing() {
  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#222]">
        <div>
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <Tag size={20} />
            <span className="font-mono text-sm tracking-wider uppercase font-semibold">Pricing Strategy</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Paket Harga & Layanan
          </h1>
          <p className="text-gray-400 mt-2 font-mono text-sm">
            Mulai rendah untuk mudah closing, upsell saat sudah deal.
          </p>
        </div>
        
        <div className="bg-orange-500/10 border border-orange-500/20 px-4 py-3 rounded-xl max-w-md">
          <div className="flex items-start gap-3">
            <Zap size={20} className="text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-400 mb-1">Strategi Pricing</p>
              <p className="text-xs text-gray-300 leading-relaxed">
                Mulai tawarkan Katalog (Rp 1,5–3 jt) untuk mudah closing. Target 4 klien = Rp 6–8 juta. Tambah 1 Villa Pro = Done.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg, idx) => (
          <div 
            key={idx} 
            className={`relative bg-[#111] rounded-2xl border ${pkg.border} p-6 flex flex-col hover:border-gray-400 transition-colors group overflow-hidden`}
          >
            {pkg.popular && (
              <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-bl-lg">
                Most Popular
              </div>
            )}
            
            <div className="mb-6">
              <div className={`w-12 h-12 rounded-xl ${pkg.bg} flex items-center justify-center mb-4`}>
                <pkg.icon size={24} className={pkg.color} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-mono font-bold text-white">{pkg.price}</span>
              </div>
            </div>
            
            <div className="space-y-4 mb-8 flex-1">
              <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#222]">
                <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">Target Bisnis</p>
                <p className="text-sm text-gray-300">{pkg.target}</p>
              </div>
              
              <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#222]">
                <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">Waktu Pengerjaan</p>
                <p className="text-sm text-gray-300">{pkg.time}</p>
              </div>
              
              <div className="pt-4 border-t border-[#222]">
                <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3">Fitur Termasuk</p>
                <ul className="space-y-2">
                  {pkg.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-sm text-gray-300">
                      <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <button className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
              pkg.popular 
                ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                : 'bg-[#222] hover:bg-[#333] text-white border border-[#333]'
            }`}>
              Pilih Paket
            </button>
          </div>
        ))}
      </div>
      
      {/* Maintenance Section */}
      <section className="mt-12">
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <RefreshCw size={24} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Maintenance Bulanan</h3>
              <p className="text-sm text-gray-400 mb-4 max-w-xl">
                Layanan berkelanjutan untuk memastikan website klien tetap aman, cepat, dan up-to-date. Cocok untuk semua jenis bisnis.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check size={16} className="text-blue-500" /> Update konten rutin
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check size={16} className="text-blue-500" /> Backup bulanan
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check size={16} className="text-blue-500" /> Security check
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check size={16} className="text-blue-500" /> Support teknis via WA
                </li>
              </ul>
            </div>
          </div>
          
          <div className="shrink-0 text-center md:text-right w-full md:w-auto border-t md:border-t-0 md:border-l border-[#222] pt-6 md:pt-0 md:pl-8">
            <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">Mulai Dari</p>
            <p className="text-3xl font-mono font-bold text-white mb-1">Rp 200rb</p>
            <p className="text-sm text-gray-400">/ bulan</p>
          </div>
        </div>
      </section>
    </div>
  );
}
