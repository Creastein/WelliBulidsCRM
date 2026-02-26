import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  MessageSquare,
  Reply,
  Handshake,
  DollarSign,
  Calendar,
  Clock,
  Activity,
  CheckCircle2,
  TrendingUp,
  ListTodo,
  RefreshCw,
  Pencil,
  Save,
  X,
} from 'lucide-react';
import { useLocalStorage, updateLastModified, getLastModified } from '../hooks/useLocalStorage';
import {
  DEFAULT_KPI,
  DEFAULT_LEADS,
  DEFAULT_PIPELINE,
  DEFAULT_PROGRESS,
  DEFAULT_SCHEDULE,
  STORAGE_KEYS,
  type KpiItem,
  type Lead,
  type ProgressData,
} from '../data/dataDefaults';

const ICON_MAP: Record<string, React.ElementType> = {
  MessageSquare,
  Reply,
  Handshake,
  DollarSign,
};

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [kpiData, setKpiData] = useLocalStorage<KpiItem[]>(STORAGE_KEYS.KPI, DEFAULT_KPI);
  const [leads] = useLocalStorage<Lead[]>(STORAGE_KEYS.LEADS, DEFAULT_LEADS);
  const [progressData, setProgressData] = useLocalStorage<ProgressData>(STORAGE_KEYS.PROGRESS, DEFAULT_PROGRESS);

  // Edit state for KPI
  const [editingKpi, setEditingKpi] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Edit state for revenue
  const [editingRevenue, setEditingRevenue] = useState(false);
  const [revenueInput, setRevenueInput] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-calculate pipeline from CRM leads
  const pipelineData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    leads.forEach((lead) => {
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
    });
    const total = leads.length || 1;

    return DEFAULT_PIPELINE.map((item) => ({
      ...item,
      count: statusCounts[item.statusKey] || 0,
      percentage: Math.round(((statusCounts[item.statusKey] || 0) / total) * 100),
    }));
  }, [leads]);

  // Auto-calculate days remaining
  const daysRemaining = useMemo(() => {
    const targetDate = new Date(progressData.targetDate);
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [progressData.targetDate, currentTime]);

  // Progress percentage
  const progressPercent = useMemo(() => {
    if (progressData.target <= 0) return 0;
    return Math.min(100, Math.round((progressData.current / progressData.target) * 100));
  }, [progressData.current, progressData.target]);

  // Clients needed
  const clientsNeeded = useMemo(() => {
    const remaining = progressData.target - progressData.current;
    if (remaining <= 0) return 0;
    return Math.ceil(remaining / progressData.avgDealValue);
  }, [progressData]);

  // Last modified display
  const lastModifiedText = useMemo(() => {
    const lm = getLastModified();
    if (!lm) return 'Belum ada update';
    const date = new Date(lm);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }, [kpiData, progressData, leads]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // KPI Edit handlers
  const startEditKpi = (kpi: KpiItem) => {
    setEditingKpi(kpi.key);
    setEditValue(String(kpi.value));
  };

  const saveKpi = () => {
    if (editingKpi === null) return;
    const numValue = Number(editValue);
    if (isNaN(numValue)) return;

    setKpiData(kpiData.map((kpi) => (kpi.key === editingKpi ? { ...kpi, value: numValue } : kpi)));

    // If editing revenue KPI, sync with progress
    if (editingKpi === 'revenue') {
      setProgressData({ ...progressData, current: numValue });
    }

    updateLastModified();
    setEditingKpi(null);
  };

  const cancelEditKpi = () => {
    setEditingKpi(null);
    setEditValue('');
  };

  // Revenue edit handlers
  const saveRevenue = () => {
    const numValue = Number(revenueInput);
    if (isNaN(numValue)) return;
    setProgressData({ ...progressData, current: numValue });
    // Sync revenue KPI
    setKpiData(kpiData.map((kpi) => (kpi.key === 'revenue' ? { ...kpi, value: numValue } : kpi)));
    updateLastModified();
    setEditingRevenue(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <header className="relative overflow-hidden rounded-2xl border border-[#3a2a1f]/50 bg-[#1a120b]/50 backdrop-blur-xl px-5 py-6 md:px-7 md:py-8">
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute -top-32 -left-20 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(244,207,144,0.45),rgba(244,207,144,0.0)_65%)] blur-[90px]"
            animate={{ x: [0, 40, -20, 0], y: [0, 20, 10, 0], scale: [1, 1.08, 0.98, 1] }}
            transition={{ duration: 48, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-28 right-[-10%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(220,170,120,0.35),rgba(220,170,120,0.0)_65%)] blur-[110px]"
            animate={{ x: [0, -30, 20, 0], y: [0, -10, 15, 0], scale: [1, 1.05, 1, 1] }}
            transition={{ duration: 56, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-10 right-10 h-[240px] w-[240px] rounded-full bg-[radial-gradient(circle,rgba(176,120,90,0.28),rgba(176,120,90,0.0)_65%)] blur-[80px] hidden md:block"
            animate={{ x: [0, -20, 10, 0], y: [0, 15, -10, 0], scale: [1, 1.06, 1, 1] }}
            transition={{ duration: 52, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 bg-[#1a120b]/60"></div>
        </div>

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-[#f5d9b5] bg-[#3a2416]/60 border border-[#5a3a24] px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
              <Target size={14} />
              Mission Control
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#fff4e6] mt-3">Project Dashboard</h1>
            <p className="text-[#e4c9a6] mt-2 text-sm flex items-center gap-2">
              <RefreshCw size={14} className="text-[#c99a6b]" />
              Last Update: {lastModifiedText}
            </p>
          </div>

          <div className="flex items-center gap-6 bg-[#1c120b]/80 p-4 rounded-xl border border-[#3a2a1f]">
            <div>
              <p className="text-xs text-[#caa984] uppercase tracking-wider font-semibold mb-1">Target Revenue</p>
              <p className="text-xl font-mono text-[#fff4e6]">{formatCurrency(progressData.target)}</p>
            </div>
            <div className="w-px h-10 bg-[#3a2a1f]"></div>
            <div>
              <p className="text-xs text-[#caa984] uppercase tracking-wider font-semibold mb-1">Days Remaining</p>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#f0b26b]" />
                <p className="text-xl font-mono text-[#fff4e6]">
                  {daysRemaining} <span className="text-sm text-[#caa984]">days</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* KPI Metrics */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-200">KPI Metrics</h2>
          <span className="text-xs font-mono text-gray-500 bg-[#111] px-2 py-1 rounded border border-[#222] ml-2">
            Klik angka untuk edit
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi) => {
            const IconComponent = ICON_MAP[kpi.iconName] || Target;
            const progress = kpi.target > 0 ? Math.min(100, (kpi.value / kpi.target) * 100) : 0;
            const isEditing = editingKpi === kpi.key;

            return (
              <div
                key={kpi.key}
                className="bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-xl p-5 relative overflow-hidden group hover:border-white/10 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-lg ${kpi.bg}`}>
                    <IconComponent size={24} className={kpi.color} />
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => startEditKpi(kpi)}
                      className="p-1.5 text-gray-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Edit value"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-400 font-medium mb-1">{kpi.title}</p>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveKpi();
                          if (e.key === 'Escape') cancelEditKpi();
                        }}
                        autoFocus
                        className="w-full bg-[#0a0a0a] border border-orange-500 rounded-lg px-3 py-1.5 text-2xl font-mono font-bold text-white focus:outline-none"
                      />
                      <button onClick={saveKpi} className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg">
                        <Save size={16} />
                      </button>
                      <button onClick={cancelEditKpi} className="p-1.5 text-gray-500 hover:bg-[#222] rounded-lg">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <p
                      className="text-3xl font-mono font-bold text-white mb-2 cursor-pointer hover:text-orange-400 transition-colors"
                      onClick={() => startEditKpi(kpi)}
                    >
                      {kpi.key === 'revenue' ? formatCurrency(kpi.value) : kpi.value}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-500">{kpi.targetLabel}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 h-1 bg-[#222] w-full">
                  <div
                    className={`h-full transition-all duration-700 ${kpi.color.replace('text-', 'bg-')}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline Status — auto-synced from CRM */}
        <section className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <ListTodo size={18} className="text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-200">Pipeline Status</h2>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 ml-2">
              Auto-sync dari CRM
            </span>
          </div>

          <div className="bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Jumlah Lead</th>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">% Total</th>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {pipelineData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        <span className="text-sm font-medium text-gray-200">{item.status}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-white font-medium">{item.count}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-gray-400 w-8">{item.percentage}%</span>
                          <div className="w-24 h-1.5 bg-[#222] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
                          {item.action}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Progress Menuju Rp 10 Juta */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-200">Progress Menuju Rp 10 Juta</h2>
          </div>

          <div className="bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-xl p-6 h-[calc(100%-2rem)]">
            {/* Donut Chart */}
            <div className="flex flex-col items-center justify-center mb-8 relative">
              <svg className="w-48 h-48" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#222" strokeWidth="12" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${progressPercent * 3.14} ${314 - progressPercent * 3.14}`}
                  strokeDashoffset="78.5"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-mono font-bold text-white mb-1">{progressPercent}%</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Tercapai</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#222]">
                <span className="text-sm text-gray-400">Target Total</span>
                <span className="font-mono text-white font-medium">{formatCurrency(progressData.target)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#222]">
                <span className="text-sm text-gray-400">Revenue Masuk</span>
                <div className="flex items-center gap-2">
                  {editingRevenue ? (
                    <>
                      <input
                        type="number"
                        value={revenueInput}
                        onChange={(e) => setRevenueInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRevenue();
                          if (e.key === 'Escape') setEditingRevenue(false);
                        }}
                        autoFocus
                        className="w-32 bg-[#0a0a0a] border border-orange-500 rounded px-2 py-1 text-sm font-mono text-white focus:outline-none"
                      />
                      <button onClick={saveRevenue} className="p-1 text-emerald-400">
                        <Save size={14} />
                      </button>
                      <button onClick={() => setEditingRevenue(false)} className="p-1 text-gray-500">
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <span
                      className="font-mono text-emerald-400 font-medium cursor-pointer hover:text-emerald-300 transition-colors"
                      onClick={() => {
                        setRevenueInput(String(progressData.current));
                        setEditingRevenue(true);
                      }}
                    >
                      {formatCurrency(progressData.current)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#222]">
                <span className="text-sm text-gray-400">Sisa Target</span>
                <span className="font-mono text-orange-400 font-medium">
                  {formatCurrency(progressData.target - progressData.current)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#222]">
                <span className="text-sm text-gray-400">Klien Dibutuhkan</span>
                <span className="font-mono text-white font-medium">
                  {clientsNeeded}{' '}
                  <span className="text-xs text-gray-500">(@ {formatCurrency(progressData.avgDealValue)})</span>
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Jadwal Harian */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Clock size={18} className="text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-200">Jadwal Harian — Protokol Wajib</h2>
        </div>

        <div className="relative pl-4 md:pl-8">
          <div className="absolute left-[23px] md:left-[39px] top-4 bottom-4 w-px bg-[#222]"></div>

          <div className="space-y-6">
            {DEFAULT_SCHEDULE.map((item, idx) => {
              const currentHour = currentTime.getHours();
              const currentMin = currentTime.getMinutes();
              const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;

              let isActive = false;
              if (item.time.includes('–')) {
                const [start, end] = item.time.split('–');
                isActive = currentTimeStr >= start && currentTimeStr < end;
              } else {
                isActive = currentTimeStr >= item.time;
              }

              return (
                <div key={idx} className="relative flex items-start gap-6 group">
                  <div
                    className={`relative z-10 w-3 h-3 mt-1.5 rounded-full border-2 bg-[#111] transition-colors ${isActive
                      ? 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]'
                      : 'border-[#444] group-hover:border-gray-400'
                      }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-20"></div>
                    )}
                  </div>

                  <div
                    className={`flex-1 rounded-xl border p-5 transition-all ${isActive
                      ? 'bg-[#1a1a1a] border-orange-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                      : 'bg-[#111] border-[#222] hover:border-[#333]'
                      }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`font-mono text-sm ${isActive ? 'text-orange-400 font-bold' : 'text-gray-400'}`}>
                            {item.time}
                          </span>
                          <span
                            className={`text-xs font-mono px-2 py-0.5 rounded border ${isActive
                              ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                              : 'bg-[#222] text-gray-500 border-[#333]'
                              }`}
                          >
                            {item.category}
                          </span>
                        </div>
                        <h3 className={`text-base md:text-lg font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                          {item.activity}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-gray-500 bg-[#0a0a0a]/50 px-3 py-1.5 rounded-lg border border-white/5 shrink-0">
                        <Clock size={14} />
                        <span className="font-mono text-xs">{item.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pt-3 border-t border-[#222]/50">
                      <CheckCircle2
                        size={16}
                        className={isActive ? 'text-orange-500 mt-0.5 shrink-0' : 'text-emerald-500/50 mt-0.5 shrink-0'}
                      />
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-0.5">
                          Output Wajib
                        </span>
                        <span className={`text-sm ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>{item.output}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
