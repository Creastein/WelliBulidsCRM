"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Target,
  Calendar,
  LineChart,
  Pencil,
  Save,
  X,
  Plus,
  DollarSign,
  TrendingUp,
  Users,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { fetchLeads } from '@/services/leadsService';
import { fetchWeeklyReviews, upsertWeeklyReview } from '@/services/weeklyReviewService';
import { fetchProgress, saveProgress } from '@/services/progressService';
import {
  DEFAULT_WEEKLY_REVIEWS,
  DEFAULT_MILESTONES,
  DEFAULT_PROGRESS,
  DEFAULT_LEADS,
  type WeeklyReview,
  type ProgressData,
  type Lead,
} from '@/data/dataDefaults';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export default function Finance() {
  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyReview[]>(DEFAULT_WEEKLY_REVIEWS);
  const [progressData, setProgressData] = useState<ProgressData>(DEFAULT_PROGRESS);
  const [leads, setLeads] = useState<Lead[]>(DEFAULT_LEADS);

  // Fetch semua data dari Supabase saat mount
  useEffect(() => {
    fetchWeeklyReviews().then((data) => {
      if (data.length > 0) setWeeklyReviews(data);
    }).catch(() => {/* silent, pakai default */ });

    fetchProgress().then((p) => { if (p) setProgressData(p); }).catch(() => { });
    fetchLeads().then(setLeads).catch(() => { });
  }, []);

  // Editing state for weekly review
  const [editingWeek, setEditingWeek] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<WeeklyReview | null>(null);

  // Revenue input modal
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [revenueAmount, setRevenueAmount] = useState('');
  const [revenueNote, setRevenueNote] = useState('');

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

  const buildCsvValue = (value: string | number) => {
    const normalized = String(value ?? '').replace(/"/g, '""');
    return `"${normalized}"`;
  };

  const handleExportWeeklyCsv = () => {
    const headers = ['week', 'dm', 'reply', 'closing', 'revenue', 'notes'];
    const rows = weeklyReviews.map((week) => [
      buildCsvValue(week.week),
      buildCsvValue(week.dm),
      buildCsvValue(week.reply),
      buildCsvValue(week.closing),
      buildCsvValue(week.revenue),
      buildCsvValue(week.notes),
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wellibuilds_weekly_review_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Milestones with live progress
  const baseTarget = DEFAULT_PROGRESS.target;
  const scale = baseTarget > 0 ? progressData.target / baseTarget : 1;

  const milestones = DEFAULT_MILESTONES.map((m) => {
    const scaledTarget = Math.max(1, Math.round(m.target * scale));
    return {
      ...m,
      target: scaledTarget,
      targetLabel: formatCurrency(scaledTarget),
      status:
        progressData.current >= scaledTarget
          ? ('achieved' as const)
          : progressData.current > 0 && progressData.current >= scaledTarget * 0.5
            ? ('in-progress' as const)
            : ('pending' as const),
      progress: Math.min(100, Math.round((progressData.current / scaledTarget) * 100)),
    };
  });

  // Deal count from CRM
  const dealCount = useMemo(() => leads.filter((l) => l.status === 'Deal').length, [leads]);

  // Progress percentage
  const progressPercent = progressData.target > 0
    ? Math.min(100, Math.round((progressData.current / progressData.target) * 100))
    : 0;

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

  // Prepare chart data
  const chartData = useMemo(() => {
    const sortedWeeks = [...weeklyReviews].sort((a, b) => a.week - b.week);
    let cumulative = 0;
    const result = [];
    for (const w of sortedWeeks) {
      cumulative += w.revenue;
      result.push({
        ...w,
        name: `Week ${w.week}`,
        cumulativeRevenue: cumulative,
      });
    }
    return result;
  }, [weeklyReviews]);

  const startEditWeek = (week: WeeklyReview) => {
    setEditingWeek(week.week);
    setEditForm({ ...week });
  };

  const saveWeek = async () => {
    if (!editForm) return;
    try {
      await upsertWeeklyReview(editForm);
      setWeeklyReviews(weeklyReviews.map((w) => (w.week === editingWeek ? editForm : w)));
      toast.success('Review mingguan disimpan!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan review');
    }
    setEditingWeek(null);
    setEditForm(null);
  };

  const cancelEditWeek = () => {
    setEditingWeek(null);
    setEditForm(null);
  };

  const addRevenue = async () => {
    const amount = Number(revenueAmount);
    if (isNaN(amount) || amount <= 0) return;
    const prevProgress = progressData;
    const updatedProgress = { ...progressData, current: progressData.current + amount };
    setProgressData(updatedProgress);
    try {
      await saveProgress(updatedProgress);
      window.dispatchEvent(new Event('wb:progress-updated'));
      toast.success(`Revenue Rp ${amount.toLocaleString('id-ID')} dicatat!`);
      setRevenueAmount('');
      setRevenueNote('');
      setShowRevenueModal(false);
    } catch (err: unknown) {
      setProgressData(prevProgress);
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan revenue');
    }
  };

  useEffect(() => {
    const handleEscape = () => {
      if (showRevenueModal) setShowRevenueModal(false);
    };
    window.addEventListener('wb:escape', handleEscape as EventListener);
    return () => window.removeEventListener('wb:escape', handleEscape as EventListener);
  }, [showRevenueModal]);

  const summaryCards = [
    { label: 'Revenue Saat Ini', value: formatCurrency(progressData.current), sub: `dari target ${formatCurrency(progressData.target)}`, color: 'text-emerald-400' },
    { label: 'Total DM', value: totals.dm, sub: 'semua minggu', color: 'text-blue-400' },
    { label: 'Total Reply', value: totals.reply, sub: `rate: ${totals.dm > 0 ? ((totals.reply / totals.dm) * 100).toFixed(1) : '0'}%`, color: 'text-purple-400' },
    { label: 'Total Closing', value: totals.closing, sub: 'klien deal', color: 'text-orange-400' },
  ];

  return (
    <motion.div
      className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 md:space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <LineChart size={20} />
            <span className="font-mono text-sm tracking-wider uppercase font-semibold">Performance</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display tracking-tight text-white">Finance &amp; Review</h1>
          <p className="text-gray-400 mt-2 font-mono text-sm">Monitor Cashflow &amp; Sistem Koreksi Mingguan</p>

          {/* Progress bar toward target */}
          <div className="mt-4 max-w-md">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-gray-500">Progress menuju {formatCurrency(progressData.target)}</span>
              <span className="text-orange-400 font-medium">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowRevenueModal(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        >
          <Plus size={18} />
          <span>Catat Revenue</span>
        </button>
      </motion.header>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -2 }}
            className="bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors"
          >
            <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">{card.label}</p>
            <p className={`text-lg sm:text-2xl font-mono font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CRM Deal Info */}
      {dealCount > 0 && (
        <motion.div variants={itemVariants} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2.5">
          <Users size={16} className="text-emerald-400" />
          <span className="text-sm text-emerald-400 font-medium">{dealCount} klien sudah Deal di Database Prospek</span>
        </motion.div>
      )}

      {/* Milestones */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} className="text-gray-400" />
          <h2 className="text-lg font-heading text-gray-200">Milestone Targets</h2>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 ml-2">
            Auto-update dari revenue
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {milestones.map((ms, idx) => (
            <motion.div
              key={ms.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              whileHover={{ y: -3 }}
              className={`bg-[#111]/50 backdrop-blur-xl border rounded-xl p-5 relative overflow-hidden group transition-colors ${ms.status === 'achieved'
                ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.08)]'
                : ms.status === 'in-progress'
                  ? 'border-orange-500/30'
                  : 'border-white/5 hover:border-white/10'
                }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-white/5 text-gray-400">
                  <span className="font-mono text-xs font-bold uppercase">{ms.title}</span>
                </div>
                {ms.status === 'achieved' ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <CheckCircle size={20} className="text-emerald-500" />
                  </motion.div>
                ) : (
                  <div className={`w-3 h-3 rounded-full ${ms.status === 'in-progress' ? 'bg-orange-500 animate-pulse' : 'bg-white/10'}`} />
                )}
              </div>

              <div>
                <p className="text-2xl font-mono font-bold text-white mb-2">{ms.targetLabel}</p>
                <p className="text-sm text-gray-400 mb-4">{ms.condition}</p>

                {/* Progress bar per milestone */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className="text-gray-500">{ms.progress}%</span>
                    <span className="text-gray-500">{formatCurrency(progressData.current)}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${ms.status === 'achieved' ? 'bg-emerald-500' : 'bg-orange-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${ms.progress}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5">
                  <p className="text-xs font-mono text-orange-400 uppercase tracking-wider mb-1">Next Action</p>
                  <p className="text-sm text-gray-300">{ms.action}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Charts Section */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Growth Chart (Area) */}
        <div className="bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-emerald-400" />
            <h2 className="text-lg font-heading text-gray-200">Tren Pertumbuhan Revenue</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#666"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#10B981' }}
                  formatter={(value: number) => [formatCurrency(value), 'Kumulatif']}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeRevenue"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Funnel Chart (Bar) */}
        <div className="bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-6">
            <Users size={18} className="text-blue-400" />
            <h2 className="text-lg font-heading text-gray-200">Funnel Aksi Mingguan</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="dm" name="Total DM" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reply" name="Total Reply" fill="#A855F7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="closing" name="Deal/Closing" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.section>

      {/* Weekly Review Table */}
      <motion.section variants={itemVariants}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-400" />
            <h2 className="text-lg font-heading text-gray-200">Weekly Review</h2>
            <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/5 ml-2">
              Klik baris untuk edit
            </span>
          </div>
          <button
            onClick={handleExportWeeklyCsv}
            className="flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-wider text-gray-300 hover:text-white bg-[#111] hover:bg-[#222] border border-white/5 rounded-lg transition-colors"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>

        <div className="bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left border-collapse">
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
              <tbody className="divide-y divide-white/5">
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
                              <button onClick={cancelEditWeek} className="p-1 text-gray-500 hover:bg-white/5 rounded">
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
      </motion.section>

      {/* Revenue Modal */}
      {showRevenueModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-[#111]/60 backdrop-blur-xl border border-white/10 rounded-xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <div className="flex items-center gap-2">
                <DollarSign size={20} className="text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Catat Revenue Baru</h2>
              </div>
              <button
                onClick={() => setShowRevenueModal(false)}
                className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
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
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
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
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div className="bg-white/5 border border-white/5 rounded-lg p-4">
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

              <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
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
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
