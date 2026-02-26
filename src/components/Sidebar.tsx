import React from 'react';
import { LayoutDashboard, Users, LineChart, Tag, LogOut, Code2 } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: 'mission-control', label: 'Mission Control', icon: LayoutDashboard },
    { id: 'crm', label: 'CRM & Leads', icon: Users },
    { id: 'finance', label: 'Finance & Perf.', icon: LineChart },
    { id: 'pricing', label: 'Pricing Packages', icon: Tag },
  ];

  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-[#222] flex flex-col h-full shrink-0">
      <div className="p-6 border-b border-[#222]">
        <div className="flex items-center gap-3 text-orange-500">
          <div className="bg-orange-500/10 p-2 rounded-lg border border-orange-500/20">
            <Code2 size={24} />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight leading-tight">Vibe Coding</h1>
            <p className="text-[10px] font-mono text-orange-400 uppercase tracking-widest">Workspace</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">Main Menu</p>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                  : 'text-gray-400 hover:text-white hover:bg-[#111] border border-transparent'
              }`}
            >
              <item.icon size={18} className={isActive ? 'text-orange-500' : 'text-gray-500'} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#222]">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:text-white hover:bg-[#111] transition-colors">
          <LogOut size={18} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
