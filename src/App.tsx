import React, { useState, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import MissionControl from './components/MissionControl';
import DatabaseProspek from './components/DatabaseProspek';
import Finance from './components/Finance';
import Pricing from './components/Pricing';
import { Toaster } from 'react-hot-toast';

const GradientBackground = lazy(() => import('./components/GradientBackground'));

export default function App() {
  const [activeTab, setActiveTab] = useState('mission-control');

  return (
    <div className="relative flex h-screen text-white font-sans selection:bg-orange-500/30 overflow-hidden">
      {/* ShaderGradient Background — lazy loaded */}
      <Suspense fallback={null}>
        <GradientBackground />
      </Suspense>

      {/* App Content — layered above gradient, transparent */}
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
