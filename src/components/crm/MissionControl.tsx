"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Target,
  Calendar,
  Pencil,
  Save,
  X,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  Briefcase,
  Globe,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import CEODailyFocusPanel from './CEODailyFocusPanel';
import {
  fetchProjects,
  type CompletedProject,
  INITIAL_COMPLETED_PROJECTS
} from '@/services/projectsService';
import { fetchLeads } from '@/services/leadsService';
import { fetchProgress, saveProgress } from '@/services/progressService';
import {
  DEFAULT_LEADS,
  DEFAULT_PROGRESS,
  type Lead,
  type ProgressData,
} from '@/data/dataDefaults';

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [leads, setLeads] = useState<Lead[]>(DEFAULT_LEADS);
  const [projects, setProjects] = useState<CompletedProject[]>(INITIAL_COMPLETED_PROJECTS);
  const [progressData, setProgressData] = useState<ProgressData>(DEFAULT_PROGRESS);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Edit state for revenue (inline in header)
  const [editingRevenue, setEditingRevenue] = useState(false);
  const [revenueInput, setRevenueInput] = useState('');

  // Edit state for target settings modal
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [isSavingTarget, setIsSavingTarget] = useState(false);
  const [targetForm, setTargetForm] = useState({
    target: '',
    targetDate: '',
    avgDealValue: '',
  });

  // Fetch data from Supabase & services on mount
  useEffect(() => {
    fetchLeads().then(setLeads).catch(() => {/* silent */ });
    fetchProjects().then((projs) => {
      setProjects(projs);
      const rev = (projs || []).reduce((sum, p) => sum + (Number(p.price) || 0), 0);
      if (rev > 0) {
        setProgressData(prev => ({ ...prev, current: rev }));
      }
    }).catch(() => {/* silent */ });

    fetchProgress().then((p) => {
      if (p) {
        setProgressData(prev => ({
          ...p,
          // If projects already calculated revenue, retain that dynamic value
          current: prev.current > 0 ? prev.current : p.current,
        }));
      }
    }).catch(() => {/* silent */ });

    const handleProjectsUpdated = () => {
      fetchProjects().then((projs) => {
        setProjects(projs);
        const rev = (projs || []).reduce((sum, p) => sum + (Number(p.price) || 0), 0);
        if (rev > 0) {
          setProgressData(prev => ({ ...prev, current: rev }));
        }
      }).catch(() => {/* silent */ });
    };

    window.addEventListener('wb:projects-updated', handleProjectsUpdated);
    return () => window.removeEventListener('wb:projects-updated', handleProjectsUpdated);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-calculate days remaining
  const deadlineDiffDays = Math.ceil(
    (new Date(progressData.targetDate).getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24)
  );

  const daysRemaining = Math.max(0, deadlineDiffDays);

  const totalProjectsRevenue = useMemo(() => {
    return projects.reduce((acc, p) => acc + (Number(p.price) || 0), 0);
  }, [projects]);

  // Effective revenue: dynamically syncs with total deal values in Done Projects
  const effectiveRevenue = totalProjectsRevenue > 0 ? totalProjectsRevenue : progressData.current;

  // Progress percentage
  const progressPercent = progressData.target > 0
    ? Math.min(100, Math.round((effectiveRevenue / progressData.target) * 100))
    : 0;

  const isTargetAchieved = progressData.target > 0 && effectiveRevenue >= progressData.target;

  const surplus = Math.max(0, effectiveRevenue - progressData.target);

  // Clients needed
  const clientsNeeded = progressData.target > effectiveRevenue && progressData.avgDealValue > 0
    ? Math.ceil((progressData.target - effectiveRevenue) / progressData.avgDealValue)
    : 0;

  // Pipeline summary counts (for quick stats)
  const pipelineStats = useMemo(() => {
    const leadsDealCount = leads.filter(l => l.status === 'Deal').length;
    const dealCount = projects.length > 0 ? projects.length : leadsDealCount;
    const activeCount = leads.filter(l => ['Follow Up', 'Negosiasi', 'Dihubungi'].includes(l.status)).length;
    return { total: leads.length, deal: dealCount, active: activeCount };
  }, [leads, projects]);

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

  // Revenue edit handlers
  const saveRevenue = async () => {
    const numValue = Number(revenueInput);
    if (isNaN(numValue)) return;
    const updatedProgress = { ...progressData, current: numValue };
    const prevProgressData = progressData;
    setProgressData(updatedProgress);

    try {
      await saveProgress(updatedProgress);
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

  // SVG progress ring calculations
  const ringRadius = 44;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (progressPercent / 100) * ringCircumference;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 md:space-y-8">
      {/* ═══════════════════════════════════════════════════════════
          HERO HEADER — Revenue Progress + Revenue Masuk + Days
         ═══════════════════════════════════════════════════════════ */}
      <header className="relative overflow-hidden rounded-2xl border border-[#3a2a1f]/50 bg-[#1a120b]/50 backdrop-blur-xl">
        {/* Background animated orbs */}
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
          <div className="absolute inset-0 bg-[#1a120b]/60"></div>
        </div>

        <div className="relative px-5 py-6 md:px-7 md:py-8">
          {/* Title row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-[#f5d9b5] bg-[#3a2416]/60 border border-[#5a3a24] px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                <Target size={14} />
                Mission Control
              </div>
              <h1 className="text-2xl md:text-3xl font-display tracking-tight text-[#fff4e6] mt-2">Mission Control</h1>
              <p className="text-[#e4c9a6] mt-1 text-xs flex items-center gap-2">
                <RefreshCw size={12} className="text-[#c99a6b]" />
                Last Update: {lastModifiedText}
              </p>
            </div>
            <button
              type="button"
              onClick={openTargetModal}
              title="Edit target"
              className="p-2 rounded-xl text-[#caa984] hover:text-[#fff4e6] hover:bg-white/5 border border-[#3a2a1f] transition-colors"
            >
              <Pencil size={16} />
            </button>
          </div>

          {/* Main metrics grid */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_auto] gap-4 md:gap-0 items-center">
            {/* Revenue Masuk */}
            <div className="bg-[#1c120b]/80 md:bg-transparent rounded-xl md:rounded-none p-4 md:p-0">
              <p className="text-[10px] text-[#caa984] uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
                <DollarSign size={12} className="text-emerald-400" />
                Revenue Masuk
              </p>
              {editingRevenue ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={revenueInput}
                    onChange={(e) => setRevenueInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveRevenue();
                      if (e.key === 'Escape') setEditingRevenue(false);
                    }}
                    autoFocus
                    className="w-36 bg-[#0a0a0a] border border-orange-500 rounded-lg px-3 py-1.5 text-lg font-mono font-bold text-white focus:outline-none"
                  />
                  <button onClick={saveRevenue} className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg">
                    <Save size={16} />
                  </button>
                  <button onClick={() => setEditingRevenue(false)} className="p-1.5 text-gray-500 hover:bg-white/5 rounded-lg">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <p
                  className="text-xl md:text-2xl font-mono font-bold text-emerald-400 cursor-pointer hover:text-emerald-300 transition-colors"
                  onClick={() => {
                    setRevenueInput(String(effectiveRevenue));
                    setEditingRevenue(true);
                  }}
                >
                  {formatCurrency(effectiveRevenue)}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-12 bg-[#3a2a1f] mx-5"></div>

            {/* Target Revenue */}
            <div className="bg-[#1c120b]/80 md:bg-transparent rounded-xl md:rounded-none p-4 md:p-0">
              <p className="text-[10px] text-[#caa984] uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
                <Target size={12} className="text-[#f0b26b]" />
                Target Revenue
              </p>
              <p className="text-xl md:text-2xl font-mono font-bold text-[#fff4e6]">
                {formatCurrency(progressData.target)}
              </p>
              {isTargetAchieved && (
                <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                  <CheckCircle size={10} />
                  Target tercapai
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-12 bg-[#3a2a1f] mx-5"></div>

            {/* Days Remaining */}
            <div className="bg-[#1c120b]/80 md:bg-transparent rounded-xl md:rounded-none p-4 md:p-0">
              <p className="text-[10px] text-[#caa984] uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
                <Calendar size={12} className="text-[#f0b26b]" />
                Days Remaining
              </p>
              <p className="text-xl md:text-2xl font-mono font-bold text-[#fff4e6]">
                {daysRemaining} <span className="text-sm text-[#caa984]">days</span>
              </p>
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

            {/* Divider */}
            <div className="hidden md:block w-px h-12 bg-[#3a2a1f] mx-5"></div>

            {/* Progress Ring */}
            <div className="flex items-center justify-center bg-[#1c120b]/80 md:bg-transparent rounded-xl md:rounded-none p-4 md:p-0">
              <div className="relative w-24 h-24 md:w-[100px] md:h-[100px]">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r={ringRadius}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50" cy="50" r={ringRadius}
                    fill="none"
                    stroke={isTargetAchieved ? '#10b981' : 'url(#headerProgressGrad)'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="headerProgressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-mono font-bold text-white">{progressPercent}%</p>
                    <p className="text-[8px] text-[#caa984] uppercase tracking-wider font-semibold">
                      {isTargetAchieved ? 'Done' : 'Progress'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom detail bar */}
          <div className="mt-5 pt-4 border-t border-[#3a2a1f]/60 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-[#caa984]">
            <span className="flex items-center gap-1.5">
              <TrendingUp size={12} className="text-orange-400" />
              {isTargetAchieved ? 'Surplus' : 'Sisa'}: <span className={`font-semibold ${isTargetAchieved ? 'text-emerald-400' : 'text-orange-400'}`}>
                {formatCurrency(isTargetAchieved ? surplus : Math.max(0, progressData.target - effectiveRevenue))}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={12} className="text-blue-400" />
              Klien dibutuhkan: <span className="font-semibold text-white">{clientsNeeded}</span>
              <span className="text-[#8a7a6a]">(@ {formatCurrency(progressData.avgDealValue)})</span>
              {isTargetAchieved && <span className="text-emerald-400 font-semibold">DONE</span>}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} className="text-purple-400" />
              Pipeline: <span className="text-white font-semibold">{pipelineStats.active}</span> aktif · <span className="text-emerald-400 font-semibold">{pipelineStats.deal}</span> deal
            </span>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          CEO DAILY FOCUS (Compact)
         ═══════════════════════════════════════════════════════════ */}
      <CEODailyFocusPanel />

      {/* ═══════════════════════════════════════════════════════════
          DONE PROJECTS & PORTFOLIO HUB
         ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#0f0f14]/80 border border-white/[0.08] rounded-2xl p-4 md:p-5 backdrop-blur-xl shadow-xl space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Briefcase size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">Done Projects & Live Portfolio</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <ShieldCheck size={11} />
                  {projects.length}/{projects.length} Live
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Total akumulasi deal diserahterimakan: <span className="font-mono font-bold text-emerald-400">{formatCurrency(totalProjectsRevenue)}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('wb:switch-tab', { detail: 'projects' }));
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-semibold transition-all group self-start sm:self-center"
          >
            <span>Buka Tabel Done Projects ({projects.length})</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* 4 Featured Recent Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {projects.slice(0, 4).map((proj, idx) => (
            <div
              key={proj.id || idx}
              onClick={() => {
                window.dispatchEvent(new CustomEvent('wb:switch-tab', { detail: 'projects' }));
              }}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-orange-500/30 hover:bg-white/[0.04] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-gray-500">{proj.category}</span>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {formatCurrency(proj.price)}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors truncate">
                  {proj.name}
                </h4>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">{proj.clientName} · {proj.location}</p>
              </div>

              <div className="pt-2.5 mt-2 border-t border-white/[0.04] flex items-center justify-between">
                <a
                  href={proj.url || (proj.domain ? `https://${proj.domain}` : '#')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="font-mono text-[10px] text-orange-400/90 hover:text-orange-300 hover:underline flex items-center gap-1 truncate"
                >
                  <Globe size={10} />
                  {proj.domain}
                </a>
                <ExternalLink size={11} className="text-gray-500 group-hover:text-orange-400 transition-colors shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TARGET SETTINGS MODAL
         ═══════════════════════════════════════════════════════════ */}
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
