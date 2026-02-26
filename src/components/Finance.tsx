import React, { useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle, Target, Calendar, LineChart, Pencil, Save, X, Plus, DollarSign } from 'lucide-react';
import { useLocalStorage, updateLastModified } from '../hooks/useLocalStorage';
import {
  DEFAULT_WEEKLY_REVIEWS,
  DEFAULT_MILESTONES,
  DEFAULT_PROGRESS,
  STORAGE_KEYS,
  type WeeklyReview,
  type ProgressData,
} from '../data/dataDefaults';

export default function Finance() {
  const [weeklyReviews, setWeeklyReviews] = useLocalStorage<WeeklyReview[]>(
    STORAGE_KEYS.WEEKLY_REVIEWS,
    DEFAULT_WEEKLY_REVIEWS
  );
  const [progressData, setProgressData] = useLocalStorage<ProgressData>(STORAGE_KEYS.PROGRESS, DEFAULT_PROGRESS);

  // Editing state for weekly review
  const [editingWeek, setEditingWeek] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<WeeklyReview | null>(null);

  // Revenue input modal
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [revenueAmount, setRevenueAmount] = useState('');
  const [revenueNote, setRevenueNote] = useState('');

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

  // Auto-calculate milestone status from current revenue
  const milestones = useMemo(() => {
    return DEFAULT_MILESTONES.map((ms) => ({
      ...ms,
      status: progressData.current >= ms.target ? 'achieved' : progressData.current > 0 && progressData.current >= ms.target * 0.5 ? 'in-progress' : 'pending',
    }));
  }, [progressData.current]);

  // Totals from weekly reviews
  const totals = useMemo(() => {
    return weeklyReviews.reduce(
      (acc, w) => ({
        dm: acc.dm + w.dm,
        reply: acc.reply + w.reply,
        closing: acc.closing + w.closing,
        revenue: acc.revenue + w.revenue,
      }),
      { dm: 0, reply: 0, closing: 0, revenue: 0 }
    );
  }, [weeklyReviews]);

  const startEditWeek = (week: WeeklyReview) => {
    setEditingWeek(week.week);
    setEditForm({ ...week });
  };

  const saveWeek = () => {
    if (!editForm) return;
    setWeeklyReviews(weeklyReviews.map((w) => (w.week === editingWeek ? editForm : w)));
    updateLastModified();
    setEditingWeek(null);
    setEditForm(null);
  };

  const cancelEditWeek = () => {
    setEditingWeek(null);
    setEditForm(null);
  };

  const addRevenue = () => {
    const amount = Number(revenueAmount);
    if (isNaN(amount) || amount <= 0) return;
    setProgressData({ ...progressData, current: progressData.current + amount });
    updateLastModified();
    setRevenueAmount('');
    setRevenueNote('');
    setShowRevenueModal(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#222]">
        <div>
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <LineChart size={20} />
            <span className="font-mono text-sm tracking-wider uppercase font-semibold">Performance</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Finance & Review</h1>
          <p className="text-gray-400 mt-2 font-mono text-sm">Monitor Cashflow & Sistem Koreksi Mingguan</p>
        </div>

        <button
          onClick={() => setShowRevenueModal(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        >
          <Plus size={18} />
          <span>Catat Revenue</span>
        </button>
      </header>

      {/* Current Revenue Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Revenue Saat Ini</p>
          <p className="text-2xl font-mono font-bold text-emerald-400">{formatCurrency(progressData.current)}</p>
          <p className="text-xs text-gray-500 mt-1">dari target {formatCurrency(progressData.target)}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Total DM</p>
          <p className="text-2xl font-mono font-bold text-blue-400">{totals.dm}</p>
          <p className="text-xs text-gray-500 mt-1">semua minggu</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Total Reply</p>
          <p className="text-2xl font-mono font-bold text-purple-400">{totals.reply}</p>
          <p className="text-xs text-gray-500 mt-1">
            rate: {totals.dm > 0 ? ((totals.reply / totals.dm) * 100).toFixed(1) : '0'}%
          </p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Total Closing</p>
          <p className="text-2xl font-mono font-bold text-orange-400">{totals.closing}</p>
          <p className="text-xs text-gray-500 mt-1">klien deal</p>
        </div>
      </div>

      {/* Milestones */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} className="text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-200">Milestone Targets</h2>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 ml-2">
            Auto-update dari revenue
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {milestones.map((ms) => (
            <div
              key={ms.id}
              className={`bg-[#111] border rounded-xl p-5 relative overflow-hidden group transition-colors ${ms.status === 'achieved'
                ? 'border-emerald-500/30'
                : ms.status === 'in-progress'
                  ? 'border-orange-500/30'
                  : 'border-[#222] hover:border-[#444]'
                }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-[#222] text-gray-400">
                  <span className="font-mono text-xs font-bold uppercase">{ms.title}</span>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${ms.status === 'achieved' ? 'bg-emerald-500' : ms.status === 'in-progress' ? 'bg-orange-500 animate-pulse' : 'bg-[#333]'
                    }`}
                ></div>
              </div>

              <div>
                <p className="text-2xl font-mono font-bold text-white mb-2">{ms.targetLabel}</p>
                <p className="text-sm text-gray-400 mb-4">{ms.condition}</p>
                <div className="pt-4 border-t border-[#222]">
                  <p className="text-xs font-mono text-orange-400 uppercase tracking-wider mb-1">Next Action</p>
                  <p className="text-sm text-gray-300">{ms.action}</p>
                </div>
              </div>

              {ms.status === 'achieved' && (
                <div className="absolute top-2 right-2">
                  <CheckCircle size={20} className="text-emerald-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Review — Editable */}
        <section className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-200">Weekly Review</h2>
            <span className="text-xs font-mono text-gray-500 bg-[#111] px-2 py-1 rounded border border-[#222] ml-2">
              Klik baris untuk edit
            </span>
          </div>

          <div className="bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Periode</th>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">DM</th>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Reply</th>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Closing</th>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Revenue</th>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Catatan</th>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {weeklyReviews.map((week) => {
                    const isEditing = editingWeek === week.week;
                    return (
                      <tr key={week.week} className="hover:bg-white/5 transition-colors group">
                        <td className="p-4">
                          <span className="font-mono text-sm text-gray-200 font-bold">Minggu {week.week}</span>
                        </td>
                        {isEditing && editForm ? (
                          <>
                            <td className="p-4 text-center">
                              <input
                                type="number"
                                value={editForm.dm}
                                onChange={(e) => setEditForm({ ...editForm, dm: Number(e.target.value) || 0 })}
                                className="w-16 bg-[#0a0a0a] border border-orange-500 rounded px-2 py-1 text-center text-sm font-mono text-white focus:outline-none"
                              />
                            </td>
                            <td className="p-4 text-center">
                              <input
                                type="number"
                                value={editForm.reply}
                                onChange={(e) => setEditForm({ ...editForm, reply: Number(e.target.value) || 0 })}
                                className="w-16 bg-[#0a0a0a] border border-orange-500 rounded px-2 py-1 text-center text-sm font-mono text-white focus:outline-none"
                              />
                            </td>
                            <td className="p-4 text-center">
                              <input
                                type="number"
                                value={editForm.closing}
                                onChange={(e) => setEditForm({ ...editForm, closing: Number(e.target.value) || 0 })}
                                className="w-16 bg-[#0a0a0a] border border-orange-500 rounded px-2 py-1 text-center text-sm font-mono text-white focus:outline-none"
                              />
                            </td>
                            <td className="p-4 text-center">
                              <input
                                type="number"
                                value={editForm.revenue}
                                onChange={(e) => setEditForm({ ...editForm, revenue: Number(e.target.value) || 0 })}
                                className="w-24 bg-[#0a0a0a] border border-orange-500 rounded px-2 py-1 text-center text-sm font-mono text-white focus:outline-none"
                              />
                            </td>
                            <td className="p-4">
                              <input
                                type="text"
                                value={editForm.notes}
                                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-orange-500 rounded px-2 py-1 text-sm text-white focus:outline-none"
                              />
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                <button onClick={saveWeek} className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded">
                                  <Save size={14} />
                                </button>
                                <button onClick={cancelEditWeek} className="p-1 text-gray-500 hover:bg-[#222] rounded">
                                  <X size={14} />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-4 text-center">
                              <span className="font-mono text-white">{week.dm}</span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="font-mono text-white">{week.reply}</span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="font-mono text-white">{week.closing}</span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="font-mono text-emerald-400 text-xs">{formatCurrency(week.revenue)}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-gray-400">{week.notes}</span>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => startEditWeek(week)}
                                className="p-1.5 text-gray-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Pencil size={14} />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                  {/* Totals row */}
                  <tr className="bg-white/5 border-t border-white/10">
                    <td className="p-4">
                      <span className="font-mono text-sm text-orange-400 font-bold">TOTAL</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-mono text-white font-bold">{totals.dm}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-mono text-white font-bold">{totals.reply}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-mono text-white font-bold">{totals.closing}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-mono text-emerald-400 font-bold text-xs">{formatCurrency(totals.revenue)}</span>
                    </td>
                    <td className="p-4" colSpan={2}></td>
                  </tr>
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

          <div className="bg-[#111]/50 backdrop-blur-xl border border-orange-500/20 rounded-xl p-6 space-y-4">
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

      {/* Revenue Modal */}
      {showRevenueModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111]/60 backdrop-blur-xl border border-white/10 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[#222]">
              <div className="flex items-center gap-2">
                <DollarSign size={20} className="text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Catat Revenue Baru</h2>
              </div>
              <button
                onClick={() => setShowRevenueModal(false)}
                className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-[#222]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">
                  Jumlah (Rupiah)
                </label>
                <input
                  type="number"
                  value={revenueAmount}
                  onChange={(e) => setRevenueAmount(e.target.value)}
                  placeholder="Contoh: 2500000"
                  autoFocus
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">
                  Catatan (opsional)
                </label>
                <input
                  type="text"
                  value={revenueNote}
                  onChange={(e) => setRevenueNote(e.target.value)}
                  placeholder="Contoh: DP 50% Villa Asvara"
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
                <p className="text-xs font-mono text-gray-500 mb-1">Revenue saat ini</p>
                <p className="font-mono text-emerald-400">{formatCurrency(progressData.current)}</p>
                {revenueAmount && (
                  <>
                    <p className="text-xs font-mono text-gray-500 mt-2 mb-1">Setelah dicatat</p>
                    <p className="font-mono text-white font-bold">
                      {formatCurrency(progressData.current + (Number(revenueAmount) || 0))}
                    </p>
                  </>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#222]">
                <button
                  onClick={() => setShowRevenueModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={addRevenue}
                  className="px-5 py-2.5 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                >
                  Simpan Revenue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
