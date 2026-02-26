import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Target, DollarSign, BarChart2, Calendar, LineChart } from 'lucide-react';

const milestones = [
  { id: 1, title: 'Milestone 1', target: 'Rp 2.500.000', condition: 'Klien pertama closing', action: 'Validasi sistem outreach', status: 'pending' },
  { id: 2, title: 'Milestone 2', target: 'Rp 5.000.000', condition: '2 klien closing', action: "Mulai buat konten TikTok 'first client'", status: 'pending' },
  { id: 3, title: 'Milestone 3', target: 'Rp 7.500.000', condition: '3 klien closing', action: 'Naikkan harga paket 20%', status: 'pending' },
  { id: 4, title: 'Milestone 4', target: 'Rp 10.000.000', condition: 'TARGET TERCAPAI 🎯', action: 'Evaluate & scale up sistem', status: 'pending' },
];

const weeklyReviews = [
  { week: 1, dm: 37, reply: 2, closing: 0, revenue: 0, notes: 'Target: 200 DM, 1 reply per 15 DM' },
  { week: 2, dm: 0, reply: 0, closing: 0, revenue: 0, notes: 'Target: follow up semua yang reply' },
  { week: 3, dm: 0, reply: 0, closing: 0, revenue: 0, notes: 'Target: minimal 1 closing' },
  { week: 4, dm: 0, reply: 0, closing: 0, revenue: 0, notes: 'Target: 2 closing total' },
];

export default function Finance() {
  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#222]">
        <div>
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <LineChart size={20} />
            <span className="font-mono text-sm tracking-wider uppercase font-semibold">Performance</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Finance & Review
          </h1>
          <p className="text-gray-400 mt-2 font-mono text-sm">
            Monitor Cashflow & Sistem Koreksi Mingguan
          </p>
        </div>
      </header>

      {/* Milestones */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} className="text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-200">Milestone Targets</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {milestones.map((ms) => (
            <div key={ms.id} className="bg-[#111] border border-[#222] rounded-xl p-5 relative overflow-hidden group hover:border-[#444] transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-[#222] text-gray-400">
                  <span className="font-mono text-xs font-bold uppercase">{ms.title}</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#333]"></div>
              </div>
              
              <div>
                <p className="text-2xl font-mono font-bold text-white mb-2">{ms.target}</p>
                <p className="text-sm text-gray-400 mb-4">{ms.condition}</p>
                <div className="pt-4 border-t border-[#222]">
                  <p className="text-xs font-mono text-orange-400 uppercase tracking-wider mb-1">Next Action</p>
                  <p className="text-sm text-gray-300">{ms.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Review */}
        <section className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-200">Weekly Review</h2>
          </div>
          
          <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#222] bg-[#1a1a1a]">
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Periode</th>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">DM Terkirim</th>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Reply</th>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Closing</th>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Catatan / Perbaikan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {weeklyReviews.map((week) => (
                    <tr key={week.week} className="hover:bg-[#1a1a1a] transition-colors group">
                      <td className="p-4">
                        <span className="font-mono text-sm text-gray-200 font-bold">Minggu {week.week}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-mono text-white">{week.dm}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-mono text-white">{week.reply}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-mono text-white">{week.closing}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-400">{week.notes}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Rules & Alerts */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-200">Aturan Review Wajib</h2>
          </div>
          
          <div className="bg-[#111] border border-orange-500/20 rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">Jika DM terkirim &lt; 200/minggu → Identifikasi bottleneck: waktu atau motivasi?</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">Jika reply rate &lt; 5% → Ganti script DM, bukan nambah volume dulu.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">Jika negosiasi tapi tidak closing → Evaluasi pricing atau value proposition.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">Jika ada deal tapi klien ghosting → Minta DP minimal 50% sebelum mulai kerja.</p>
            </div>
            <div className="pt-4 border-t border-orange-500/20 space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">Jika menghabiskan &gt; 30 menit/hari cek saham → Itu distraksi. Stop.</p>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">Jika konten TikTok &gt; 1 jam/hari → ROI rendah untuk sekarang. Kurangi.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
