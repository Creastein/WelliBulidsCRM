import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Target,
  MessageSquare,
  Reply,
  Handshake,
  DollarSign,
  Calendar,
  Clock,
  Activity,
  TrendingUp,
  AlertCircle,
  Pencil,
  Save,
  X,
  ArrowRight,
  Phone,
  Mail,
  RefreshCw,
  Flame,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchLeads } from '../services/leadsService';
import { fetchKpi } from '../services/kpiService';
import { fetchProgress, saveProgress } from '../services/progressService';
import {
  DEFAULT_KPI,
  DEFAULT_LEADS,
  DEFAULT_PROGRESS,
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: React.ElementType }> = {
  'Belum Dihubungi': { label: 'Belum Dihubungi', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20', icon: AlertCircle },
  'Follow Up': { label: 'Perlu Follow Up', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20', icon: Flame },
  'Negosiasi': { label: 'Sedang Negosiasi', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20', icon: Handshake },
  'Dihubungi': { label: 'Sudah Dihubungi', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20', icon: Phone },
  'Deal': { label: 'Deal / Closing', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', icon: Handshake },
};

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [kpiData, setKpiData] = useState<KpiItem[]>(DEFAULT_KPI);
  const [leads, setLeads] = useState<Lead[]>(DEFAULT_LEADS);
  const [progressData, setProgressData] = useState<ProgressData>(DEFAULT_PROGRESS);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Edit state for KPI
  const [editingKpi, setEditingKpi] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Active tab for Action Items
  const [activeStatusTab, setActiveStatusTab] = useState<string>('Semua');

  // Edit state for revenue
  const [editingRevenue, setEditingRevenue] = useState(false);
  const [revenueInput, setRevenueInput] = useState('');

  // Edit state for target settings (target, deadline, avg deal value)
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [isSavingTarget, setIsSavingTarget] = useState(false);
  const [targetForm, setTargetForm] = useState({
    target: '',
    targetDate: '',
    avgDealValue: '',
  });

  // Computed KPI data based on leads
  const computedKpiData = useMemo(() => {
    // Total DM Terkirim = semua prospek di database (setiap lead = 1 DM terkirim)
    const dmCount = leads.length;
    // Total Reply = leads yang sudah merespon (Follow Up, Negosiasi, Deal, Ditolak)
    const replyStatuses = ['Follow Up', 'Negosiasi', 'Deal', 'Ditolak'];
    const replyCount = leads.filter(l => replyStatuses.includes(l.status)).length;
    // Closing = leads yang sudah deal
    const closingCount = leads.filter(l => l.status === 'Deal').length;

    return kpiData.map(kpi => {
      if (kpi.key === 'dm_sent') return { ...kpi, value: dmCount };
      if (kpi.key === 'total_reply') return { ...kpi, value: replyCount };
      if (kpi.key === 'closing') return { ...kpi, value: closingCount };
      if (kpi.key === 'revenue') return { ...kpi, value: progressData.current, target: progressData.target };
      return kpi;
    });
  }, [kpiData, leads, progressData.current, progressData.target]);

  // Fetch data dari Supabase saat mount
  useEffect(() => {
    fetchKpi().then((rows) => {
      if (rows.length > 0) {
        setKpiData((prev) =>
          prev.map((k) => {
            const found = rows.find((r: { key: string; value: number; target: number }) => r.key === k.key);
            return found ? { ...k, value: Number(found.value), target: Number(found.target) } : k;
          })
        );
      }
    }).catch(() => {/* silent, pakai default */ });

    fetchLeads().then(setLeads).catch(() => {/* silent */ });
    fetchProgress().then((p) => { if (p) setProgressData(p); }).catch(() => {/* silent */ });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Actionable leads grouped by status (only statuses that need action)
  const actionableLeads = useMemo(() => {
    const groups: Record<string, Lead[]> = {};
    const actionStatuses = ['Follow Up', 'Negosiasi', 'Belum Dihubungi', 'Dihubungi', 'Deal'];

    actionStatuses.forEach((status) => {
      const filtered = leads.filter((l) => l.status === status);
      if (filtered.length > 0) {
        groups[status] = filtered
          .sort((a, b) => {
            const priorityOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
            return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
          })
          .slice(0, 5); // Show max 5 per group
      }
    });

    return groups;
  }, [leads]);

  // Pipeline summary counts
  const pipelineSummary = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    leads.forEach((l) => {
      statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
    });
    return statusCounts;
  }, [leads]);

  // Auto-calculate days remaining
  const deadlineDiffDays = useMemo(() => {
    const targetDate = new Date(progressData.targetDate);
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [progressData.targetDate, currentTime]);

  const daysRemaining = useMemo(() => Math.max(0, deadlineDiffDays), [deadlineDiffDays]);

  // Progress percentage
  const progressPercent = useMemo(() => {
    if (progressData.target <= 0) return 0;
    return Math.min(100, Math.round((progressData.current / progressData.target) * 100));
  }, [progressData.current, progressData.target]);

  const isTargetAchieved = useMemo(() => {
    if (progressData.target <= 0) return false;
    return progressData.current >= progressData.target;
  }, [progressData.current, progressData.target]);

  const surplus = useMemo(() => Math.max(0, progressData.current - progressData.target), [progressData.current, progressData.target]);

  // Clients needed
  const clientsNeeded = useMemo(() => {
    const remaining = progressData.target - progressData.current;
    if (remaining <= 0) return 0;
    return Math.ceil(remaining / progressData.avgDealValue);
  }, [progressData]);

  // Last modified display
  const lastModifiedText = useMemo(() => {
    if (!lastSaved) return 'Belum ada update';
    const date = new Date(lastSaved);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }, [lastSaved]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getDateInputValue = (value: string): string => {
    const match = value?.match(/\d{4}-\d{2}-\d{2}/);
    return match ? match[0] : '';
  };

  const getLocalTimezoneOffset = (): string => {
    const minutes = -new Date().getTimezoneOffset();
    const sign = minutes >= 0 ? '+' : '-';
    const abs = Math.abs(minutes);
    const hh = String(Math.floor(abs / 60)).padStart(2, '0');
    const mm = String(abs % 60).padStart(2, '0');
    return `${sign}${hh}:${mm}`;
  };

  const openTargetModal = () => {
    setTargetForm({
      target: String(progressData.target),
      targetDate: getDateInputValue(progressData.targetDate),
      avgDealValue: String(progressData.avgDealValue),
    });
    setShowTargetModal(true);
  };

  // KPI Edit handlers
  const startEditKpi = (kpi: KpiItem) => {
    if (kpi.key !== 'revenue') return;
    setEditingKpi(kpi.key);
    setEditValue(String(kpi.value));
  };

  const saveKpi = async () => {
    if (editingKpi === null) return;
    const numValue = Number(editValue);
    if (isNaN(numValue)) return;

    // Single source of truth: revenue value lives in `progress.current` (not in KPI table).
    if (editingKpi !== 'revenue') {
      setEditingKpi(null);
      return;
    }

    const prevProgressData = progressData;
    const updatedProgress: ProgressData = { ...progressData, current: numValue };
    setProgressData(updatedProgress);

    try {
      await saveProgress(updatedProgress);
      window.dispatchEvent(new Event('wb:progress-updated'));
      setLastSaved(new Date().toISOString());
      toast.success('Revenue diperbarui!');
      setEditingKpi(null);
    } catch (err: unknown) {
      setProgressData(prevProgressData);
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan revenue');
    }
  };

  const cancelEditKpi = () => {
    setEditingKpi(null);
    setEditValue('');
  };

  // Revenue edit handlers
  const saveRevenue = async () => {
    const numValue = Number(revenueInput);
    if (isNaN(numValue)) return;
    const updatedProgress = { ...progressData, current: numValue };
    const prevProgressData = progressData;
    setProgressData(updatedProgress);

    try {
      await saveProgress(updatedProgress);
      // Dispatch event to sync Sidebar immediately
      window.dispatchEvent(new Event('wb:progress-updated'));
      setLastSaved(new Date().toISOString());
      toast.success('Revenue diperbarui!');
      setEditingRevenue(false);
    } catch (err: unknown) {
      setProgressData(prevProgressData);
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan revenue');
    }
  };

  const saveTargetSettings = async () => {
    const target = Number(targetForm.target);
    const avgDealValue = Number(targetForm.avgDealValue);
    const targetDateOnly = targetForm.targetDate;

    if (!Number.isFinite(target) || target <= 0) {
      toast.error('Target revenue tidak valid');
      return;
    }
    if (!targetDateOnly) {
      toast.error('Target date wajib diisi');
      return;
    }
    if (!Number.isFinite(avgDealValue) || avgDealValue <= 0) {
      toast.error('Avg deal value tidak valid');
      return;
    }

    const targetDate = `${targetDateOnly}T00:00:00${getLocalTimezoneOffset()}`;
    const remaining = target - progressData.current;
    const computedClientsNeeded = remaining > 0 ? Math.ceil(remaining / avgDealValue) : 0;

    const updatedProgress: ProgressData = {
      ...progressData,
      target,
      targetDate,
      avgDealValue,
      clientsNeeded: computedClientsNeeded,
    };
    const prevProgressData = progressData;
    setProgressData(updatedProgress);

    try {
      setIsSavingTarget(true);
      await saveProgress(updatedProgress);
      window.dispatchEvent(new Event('wb:progress-updated'));
      setLastSaved(new Date().toISOString());
      toast.success('Target diperbarui!');
      setShowTargetModal(false);
    } catch (err: unknown) {
      setProgressData(prevProgressData);
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan target');
    } finally {
      setIsSavingTarget(false);
    }
  };

  const priorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      High: 'bg-red-500/10 text-red-400 border-red-500/20',
      Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      Low: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };
    return colors[priority] || colors.Low;
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
            <h1 className="text-3xl md:text-4xl font-display tracking-tight text-[#fff4e6] mt-3">Mission Control</h1>
            <p className="text-[#e4c9a6] mt-2 text-sm flex items-center gap-2">
              <RefreshCw size={14} className="text-[#c99a6b]" />
              Last Update: {lastModifiedText}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-auto bg-[#1c120b]/80 p-4 rounded-xl border border-[#3a2a1f]">
            <div className="flex items-start gap-3">
              <div>
                <p className="text-xs text-[#caa984] uppercase tracking-wider font-semibold mb-1">Target Revenue</p>
                <p className="text-xl font-mono text-[#fff4e6]">{formatCurrency(progressData.target)}</p>
                {isTargetAchieved && (
                  <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                    <CheckCircle size={12} />
                    Target tercapai
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={openTargetModal}
                title="Edit target"
                className="mt-0.5 p-1.5 rounded-lg text-[#caa984] hover:text-[#fff4e6] hover:bg-white/5 transition-colors"
              >
                <Pencil size={14} />
              </button>
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
              {isTargetAchieved && (
                <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                  {deadlineDiffDays > 0
                    ? `Tercapai ${deadlineDiffDays} hari lebih cepat`
                    : deadlineDiffDays === 0
                      ? 'Tercapai tepat waktu'
                      : `Tercapai ${Math.abs(deadlineDiffDays)} hari setelah deadline`}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* KPI Metrics */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-gray-400" />
          <h2 className="text-lg font-heading text-gray-200">KPI Metrics</h2>
          <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/5 ml-2">
            Klik angka revenue untuk edit
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {computedKpiData.map((kpi) => {
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
                  {!isEditing && kpi.key === 'revenue' && (
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
                      <button onClick={cancelEditKpi} className="p-1.5 text-gray-500 hover:bg-white/5 rounded-lg">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <p
                      className={`text-3xl font-mono font-bold text-white mb-2 transition-colors ${kpi.key === 'revenue' ? 'cursor-pointer hover:text-orange-400' : ''}`}
                      onClick={() => startEditKpi(kpi)}
                    >
                      {kpi.key === 'revenue' ? formatCurrency(kpi.value) : kpi.value}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-500">
                      {kpi.key === 'revenue' ? `Target: ${formatCurrency(kpi.target)}` : kpi.targetLabel}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full">
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
        {/* Actionable Leads — integrated from Database Prospek */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-orange-400" />
            <h2 className="text-lg font-heading text-gray-200">Action Items</h2>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 ml-2">
              Live dari Database Prospek
            </span>
          </div>

          {/* Summary pills as tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveStatusTab('Semua')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors ${
                activeStatusTab === 'Semua' 
                  ? 'bg-white/10 text-white border-white/20' 
                  : 'bg-transparent text-gray-500 border-white/5 hover:bg-white/5'
              }`}
            >
              Semua
            </button>
            {Object.entries(pipelineSummary).map(([status, count]) => {
              const config = STATUS_CONFIG[status];
              if (!config) return null;
              
              // Only render tabs for actionable statuses 
              const actionStatuses = ['Follow Up', 'Negosiasi', 'Belum Dihubungi', 'Dihubungi', 'Deal'];
              if (!actionStatuses.includes(status)) return null;

              const isActive = activeStatusTab === status;

              return (
                <button 
                  key={status} 
                  onClick={() => setActiveStatusTab(status)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors ${
                    isActive 
                      ? `${config.bgColor} ${config.color} ${config.borderColor} ring-1 ring-${config.color.replace('text-', '')}/50` 
                      : `bg-transparent ${config.color} border-${config.color.replace('text-', '')}/20 opacity-70 hover:opacity-100 hover:${config.bgColor}`
                  }`}
                >
                  <config.icon size={12} />
                  {status}: {count}
                </button>
              );
            })}
          </div>

          {/* Actionable lead cards by status */}
          {Object.entries(actionableLeads).map(([status, statusLeads]) => {
            if (activeStatusTab !== 'Semua' && activeStatusTab !== status) return null;
            
            const config = STATUS_CONFIG[status];
            if (!config) return null;

            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <config.icon size={16} className={config.color} />
                  <h3 className={`text-sm font-semibold ${config.color}`}>{config.label}</h3>
                  <span className="text-xs font-mono text-gray-500">({statusLeads.length})</span>
                </div>

                <div className="space-y-2">
                  {statusLeads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-[#111]/50 backdrop-blur-xl border ${config.borderColor} rounded-xl p-4 hover:bg-white/5 transition-colors group`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-white text-sm truncate">{lead.name}</p>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${priorityBadge(lead.priority)}`}>
                              {lead.priority}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span>{lead.niche}</span>
                            <span>•</span>
                            <span>{lead.location}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto sm:justify-end mt-2 sm:mt-0">
                          <div className={`px-2.5 py-1 rounded-lg text-xs font-medium ${config.bgColor} ${config.color} flex items-center gap-1.5`}>
                            <ArrowRight size={12} />
                            {lead.action}
                          </div>
                        </div>
                      </div>

                      {lead.notes && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-1 italic">"{lead.notes}"</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}

          {Object.keys(actionableLeads).length === 0 && (
            <div className="bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-xl p-8 text-center">
              <p className="text-gray-500 text-sm">Belum ada lead yang perlu action. Tambahkan di Database Prospek!</p>
            </div>
          )}
        </section>

        {/* Progress Menuju Target */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-gray-400" />
            <h2 className="text-lg font-heading text-gray-200">Progress Menuju {formatCurrency(progressData.target)}</h2>
          </div>

          <div className="bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-xl p-6 h-[calc(100%-2rem)]">
            {isTargetAchieved && (
              <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 text-emerald-400">
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-300">Target tercapai</p>
                    <p className="text-xs text-emerald-200/80 mt-0.5 font-mono">
                      {surplus > 0 ? `Surplus ${formatCurrency(surplus)}.` : 'Tepat di target.'}{' '}
                      {deadlineDiffDays > 0
                        ? `${deadlineDiffDays} hari lebih cepat.`
                        : deadlineDiffDays === 0
                          ? 'Tepat waktu.'
                          : `${Math.abs(deadlineDiffDays)} hari setelah deadline.`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={openTargetModal}
                  className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                >
                  Set target baru
                </button>
              </div>
            )}

            {/* Donut Chart */}
            <div className="flex flex-col items-center justify-center mb-8 relative">
              <svg className="w-48 h-48" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={isTargetAchieved ? '#10b981' : '#f97316'}
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
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    {isTargetAchieved ? 'Target Tercapai' : 'Tercapai'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-sm text-gray-400">Target Total</span>
                <span className="font-mono text-white font-medium">{formatCurrency(progressData.target)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
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
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-sm text-gray-400">{isTargetAchieved ? 'Surplus' : 'Sisa Target'}</span>
                <span className={`font-mono font-medium ${isTargetAchieved ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {formatCurrency(
                    isTargetAchieved
                      ? Math.max(0, progressData.current - progressData.target)
                      : Math.max(0, progressData.target - progressData.current)
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-sm text-gray-400">Klien Dibutuhkan</span>
                <span className="font-mono text-white font-medium">
                  {clientsNeeded}{' '}
                  <span className="text-xs text-gray-500">(@ {formatCurrency(progressData.avgDealValue)})</span>
                  {isTargetAchieved && <span className="ml-2 text-xs font-semibold text-emerald-400">DONE</span>}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Target Settings Modal */}
      {showTargetModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowTargetModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-[#111]/60 backdrop-blur-xl border border-white/10 rounded-xl w-full max-w-md overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-orange-400" />
                <h2 className="text-xl font-bold text-white">Update Target</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowTargetModal(false)}
                className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">
                  Target Revenue (Rupiah)
                </label>
                <input
                  type="number"
                  value={targetForm.target}
                  onChange={(e) => setTargetForm((prev) => ({ ...prev, target: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveTargetSettings();
                    if (e.key === 'Escape') setShowTargetModal(false);
                  }}
                  placeholder="Contoh: 20000000"
                  autoFocus
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">
                  Deadline (Target Date)
                </label>
                <input
                  type="date"
                  value={targetForm.targetDate}
                  onChange={(e) => setTargetForm((prev) => ({ ...prev, targetDate: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveTargetSettings();
                    if (e.key === 'Escape') setShowTargetModal(false);
                  }}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">
                  Avg Deal Value (Rupiah)
                </label>
                <input
                  type="number"
                  value={targetForm.avgDealValue}
                  onChange={(e) => setTargetForm((prev) => ({ ...prev, avgDealValue: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveTargetSettings();
                    if (e.key === 'Escape') setShowTargetModal(false);
                  }}
                  placeholder="Contoh: 2500000"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div className="bg-white/5 border border-white/5 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                  <span>Revenue saat ini</span>
                  <span className="text-emerald-400">{formatCurrency(progressData.current)}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                  <span>Estimasi sisa target</span>
                  <span className="text-orange-300">
                    {formatCurrency(Math.max(0, (Number(targetForm.target) || 0) - progressData.current))}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                  <span>Estimasi klien dibutuhkan</span>
                  <span className="text-white">
                    {(() => {
                      const target = Number(targetForm.target) || 0;
                      const avg = Number(targetForm.avgDealValue) || 0;
                      const remaining = Math.max(0, target - progressData.current);
                      return avg > 0 ? Math.ceil(remaining / avg) : 0;
                    })()}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowTargetModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={saveTargetSettings}
                  disabled={isSavingTarget}
                  className="px-5 py-2.5 text-sm font-medium bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:hover:bg-orange-500 text-white rounded-lg transition-colors"
                >
                  {isSavingTarget ? 'Menyimpan...' : 'Simpan Target'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
