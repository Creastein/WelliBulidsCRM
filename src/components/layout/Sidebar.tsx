"use client";

import React, { useMemo, useEffect } from 'react';
import { LayoutDashboard, Users, LineChart, Tag, GitMerge, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_PROGRESS, type ProgressData } from '@/data/dataDefaults';
import { fetchProgress } from '@/services/progressService';
import InstallPwaButton from './InstallPwaButton';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  const [progressData, setProgressData] = React.useState<ProgressData>(DEFAULT_PROGRESS);
  
  const loadProgress = async () => {
    try {
      const data = await fetchProgress();
      if (data) setProgressData(data);
    } catch (err) {
      console.error('Failed to sync sidebar progress:', err);
    }
  };

  useEffect(() => {
    loadProgress();
    
    // Listen for progress updates from MissionControl
    window.addEventListener('wb:progress-updated', loadProgress);
    return () => window.removeEventListener('wb:progress-updated', loadProgress);
  }, []);

  const progressPercent = useMemo(() => {
    if (progressData.target <= 0) return 0;
    return Math.min(100, Math.round((progressData.current / progressData.target) * 100));
  }, [progressData.current, progressData.target]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

  const navItems = [
    { id: 'mission-control', label: 'Mission Control', icon: LayoutDashboard, shortcut: 'Ctrl+1' },
    { id: 'crm', label: 'Database Prospek', icon: Users, shortcut: 'Ctrl+2' },
    { id: 'finance', label: 'Finance & Perf.', icon: LineChart, shortcut: 'Ctrl+3' },
    { id: 'pricing', label: 'Pricing Packages', icon: Tag, shortcut: 'Ctrl+4' },
    { id: 'pipeline', label: 'Pipeline Architect', icon: GitMerge, shortcut: 'Ctrl+5' },
  ];

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const handleChange = () => {
      if (media.matches) setIsOpen(false);
    };
    handleChange();
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  return (
    <aside
      className={`bg-[#0a0a0a]/90 backdrop-blur-xl shrink-0 transition-all duration-300 ease-in-out z-50
      fixed bottom-0 left-0 right-0 h-16 border-t border-white/5 flex flex-row
      md:bg-[#0a0a0a]/40 md:relative md:flex-col md:h-full md:border-t-0 md:border-r 
      ${isOpen ? 'md:w-64' : 'md:w-[68px]'}`}
    >
      {/* Branding */}
      <div className={`hidden md:block border-b border-white/5 ${isOpen ? 'p-5' : 'p-3'}`}>
        <div className={`flex items-center ${isOpen ? 'gap-3' : 'justify-center'}`}>
          <div className="relative shrink-0">
            <Image
              src="/logo.png"
              alt="WelliBuilds"
              width={56}
              height={56}
              className={`rounded-xl object-contain transition-all duration-300 ${isOpen ? 'w-14 h-14' : 'w-11 h-11'}`}
            />
            {/* Subtle glow behind logo */}
            <div className="absolute inset-0 rounded-xl bg-orange-500/20 blur-md -z-10" />
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
              >
                <h1 className="font-display text-white tracking-tight leading-tight text-[15px]">WelliBuilds</h1>
                <p className="text-[9px] font-mono text-orange-400/80 uppercase tracking-[0.2em]">Freelance Dashboard</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mini Progress Ring */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2.5 border border-white/5"
            >
              {/* SVG Ring */}
              <div className="relative w-9 h-9 shrink-0">
                <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="14" fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${progressPercent * 0.88} ${88 - progressPercent * 0.88}`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-white">
                  {progressPercent}%
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Target</p>
                <p className="text-xs font-mono text-white truncate">{formatCurrency(progressData.current)}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 flex flex-row items-center justify-around w-full p-2 md:flex-col md:justify-start md:space-y-1 ${isOpen ? 'md:p-3' : 'md:p-2'}`}>
        <AnimatePresence>
          {isOpen && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hidden md:block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3"
            >
              Menu
            </motion.p>
          )}
        </AnimatePresence>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <div key={item.id} className="relative group flex items-center justify-center">
              <button
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center justify-center rounded-lg transition-all duration-200 
                  w-12 h-12 md:w-full md:h-auto
                  ${isOpen ? 'md:justify-start md:gap-3 md:px-3 md:py-2.5' : 'md:justify-center md:px-2 md:py-2.5'} 
                  ${isActive
                    ? 'text-orange-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {/* Animated active background */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavBg"
                    className="absolute inset-0 bg-orange-500/10 border border-orange-500/20 rounded-lg shadow-[0_0_20px_rgba(249,115,22,0.08)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                {/* Animated active glow bar (Desktop only) */}
                {isActive && (
                  <motion.div
                    layoutId="activeGlowBar"
                    className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                {/* Animated active glow bar (Mobile only) */}
                {isActive && (
                  <motion.div
                    layoutId="activeGlowBarMobile"
                    className="md:hidden absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                <item.icon size={18} className={`relative z-10 transition-colors ${isActive ? 'text-orange-500' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hidden md:block relative z-10 font-medium text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Tooltip on hover */}
              <div className={`absolute pointer-events-none px-2.5 py-1.5 bg-[#1a1a1a]/90 backdrop-blur-sm border border-white/10 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50
                  bottom-full left-1/2 -translate-x-1/2 mb-2
                  md:bottom-auto md:left-full md:top-1/2 md:-translate-y-1/2 md:-translate-x-0 md:ml-2
                  ${isOpen ? 'md:hidden' : ''}
                `}>
                <span>{item.label}</span>
                <span className="hidden md:inline ml-2 text-[10px] font-mono text-gray-400">{item.shortcut}</span>

                {/* Arrow Mobile */}
                <div className="md:hidden absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-t-[5px] border-t-[#1a1a1a]/90 border-r-[5px] border-r-transparent" />

                {/* Arrow Desktop */}
                <div className="hidden md:block absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-r-[5px] border-r-[#1a1a1a]/90 border-b-[5px] border-b-transparent" />
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`hidden md:flex flex-col border-t border-white/5 ${isOpen ? 'p-3' : 'p-2'}`}>
        <InstallPwaButton isOpen={isOpen} />
        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className={`w-full flex items-center justify-center rounded-lg border border-white/5 bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-colors py-2`}
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </aside>
  );
}
