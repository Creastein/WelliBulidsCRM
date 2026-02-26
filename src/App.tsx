import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MissionControl from './components/MissionControl';
import CRM from './components/CRM';
import Finance from './components/Finance';
import Pricing from './components/Pricing';

export default function App() {
  const [activeTab, setActiveTab] = useState('mission-control');

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans selection:bg-orange-500/30 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'mission-control' && <MissionControl />}
        {activeTab === 'crm' && <CRM />}
        {activeTab === 'finance' && <Finance />}
        {activeTab === 'pricing' && <Pricing />}
      </main>
    </div>
  );
}
