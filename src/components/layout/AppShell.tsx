"use client";

import React, { useState, lazy, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import Sidebar from './Sidebar';
import CinematicLoader from '../crm/CinematicLoader';

const MissionControl = lazy(() => import('../crm/MissionControl'));
const DatabaseProspek = lazy(() => import('../crm/DatabaseProspek'));
const Finance = lazy(() => import('../crm/Finance'));
const Pricing = lazy(() => import('../crm/Pricing'));
const PipelineWorkspace = lazy(() => import('../pipeline/PipelineWorkspace'));
const LeadFlow = lazy(() => import('../crm/LeadFlow'));

// Three.js / shadergradient components must be disabled for SSR as they access browser APIs like canvas and window
const GradientBackground = dynamic(() => import('../crm/GradientBackground'), { ssr: false });

const FallbackLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
      <p className="text-sm font-mono text-gray-500 animate-pulse">Loading module...</p>
    </div>
  </div>
);

export default function AppShell() {
  const [activeTab, setActiveTab] = useState('mission-control');
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Keyboard Shortcuts Setup
  useKeyboardShortcuts({
    'Ctrl+1': () => setActiveTab('mission-control'),
    'Ctrl+2': () => setActiveTab('crm'),
    'Ctrl+3': () => setActiveTab('finance'),
    'Ctrl+4': () => setActiveTab('pricing'),
    'Ctrl+5': () => setActiveTab('pipeline'),
    'Ctrl+6': () => setActiveTab('lead-flow'),
    'Ctrl+N': () => {
      if (activeTab !== 'crm' && activeTab !== 'lead-flow') setActiveTab('crm');
      setTimeout(() => {
        if (activeTab === 'lead-flow') {
          window.dispatchEvent(new Event('wb:new-lead-flow'));
        } else {
          window.dispatchEvent(new Event('wb:new-lead'));
        }
      }, 50);
    },
    'Escape': () => {
      window.dispatchEvent(new Event('wb:escape'));
    }
  });

  return (
    <div className="relative flex h-screen text-white font-sans selection:bg-orange-500/30 overflow-hidden">
      {isInitialLoading && <CinematicLoader onComplete={() => setIsInitialLoading(false)} />}

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#111' } },
        }}
      />

      {/* Background Layer */}
      <Suspense fallback={null}>
        <GradientBackground />
      </Suspense>

      {/* App Content */}
      <motion.div
        className="relative z-10 flex w-full h-full"
        initial={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(8px)' }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, delay: 2.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <Suspense fallback={<div className="hidden lg:block w-[68px] lg:w-64 h-full bg-[#0a0a0a]/40 border-r border-white/5 animate-pulse" />}>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </Suspense>

        <main className="flex-1 overflow-y-auto w-full pb-16 lg:pb-0">
          <Suspense fallback={<FallbackLoader />}>
            {activeTab === 'mission-control' && <MissionControl />}
            {activeTab === 'crm' && <DatabaseProspek />}
            {activeTab === 'finance' && <Finance />}
            {activeTab === 'pricing' && <Pricing />}
            {activeTab === 'pipeline' && <PipelineWorkspace />}
            {activeTab === 'lead-flow' && <LeadFlow />}
          </Suspense>
        </main>
      </motion.div>
    </div>
  );
}
