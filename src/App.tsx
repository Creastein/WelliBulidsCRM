import React, { useState, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import MissionControl from './components/MissionControl';
import DatabaseProspek from './components/DatabaseProspek';
import Finance from './components/Finance';
import Pricing from './components/Pricing';
import { Toaster } from 'react-hot-toast';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const GradientBackground = lazy(() => import('./components/GradientBackground'));

export default function App() {
  const [activeTab, setActiveTab] = useState('mission-control');

  // Keyboard Shortcuts Setup
  useKeyboardShortcuts({
    'Ctrl+1': () => setActiveTab('mission-control'),
    'Ctrl+2': () => setActiveTab('crm'),
    'Ctrl+3': () => setActiveTab('finance'),
    'Ctrl+4': () => setActiveTab('pricing'),
    'Ctrl+N': () => {
      if (activeTab !== 'crm') setActiveTab('crm');
      setTimeout(() => window.dispatchEvent(new Event('wb:new-lead')), 50);
    },
    'Escape': () => {
      window.dispatchEvent(new Event('wb:escape'));
    }
  });

  return (
    <div className="relative flex h-screen text-white font-sans selection:bg-orange-500/30 overflow-hidden">
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
      <div className="relative z-10 flex w-full h-full">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'mission-control' && <MissionControl />}
          {activeTab === 'crm' && <DatabaseProspek />}
          {activeTab === 'finance' && <Finance />}
          {activeTab === 'pricing' && <Pricing />}
          <Toaster position="bottom-right" toastOptions={{ style: { background: '#222', color: '#fff', border: '1px solid #333', fontSize: '14px' } }} />
        </main>
      </div>
    </div>
  );
}
