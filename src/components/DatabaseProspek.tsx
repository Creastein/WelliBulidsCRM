import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Info,
  Flame,
  Circle,
  ArrowRight,
  Database,
  Plus,
  Edit2,
  Trash2,
  X,
  ArrowUpDown,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Building2,
  CarFront,
  Scissors,
  UtensilsCrossed,
  Dumbbell,
  Shirt,
  Stethoscope,
  Tent,
  Gem,
  Store,
  Sparkles,
  Plane,
  Download,
  Upload,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useLocalStorage, updateLastModified } from '../hooks/useLocalStorage';
import { DEFAULT_LEADS, DEFAULT_NICHES, STORAGE_KEYS, type Lead, type NicheCategory } from '../data/dataDefaults';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

const NICHE_ICONS: Record<string, React.ElementType> = {
  Building2,
  CarFront,
  Scissors,
  UtensilsCrossed,
  Dumbbell,
  Shirt,
  Stethoscope,
  Tent,
  Gem,
  Store,
  Sparkles,
  Plane,
};

type SortField = 'name' | 'priority' | 'status';
type SortDirection = 'asc' | 'desc';

const PRIORITY_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
const STATUS_ORDER: Record<string, number> = {
  'Belum Dihubungi': 0,
  'Follow Up': 1,
  Dihubungi: 2,
  Negosiasi: 3,
  Deal: 4,
  Ditolak: 5,
};

const STATUS_COLORS: Record<string, string> = {
  'Belum Dihubungi': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Dihubungi: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Follow Up': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Negosiasi: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Deal: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Ditolak: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function DatabaseProspek() {
  const [leads, setLeads] = useLocalStorage<Lead[]>(STORAGE_KEYS.LEADS, DEFAULT_LEADS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ringkasan');
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    niche: DEFAULT_NICHES[0]?.label || '',
    location: '',
    priority: 'High' as Lead['priority'],
    status: 'Belum Dihubungi' as Lead['status'],
    action: '',
    notes: '',
  });

  // Export / Import
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(leads, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wellibuilds_crm_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Database berhasil diexport!');
  };

  const buildCsvValue = (value: string | number) => {
    const normalized = String(value ?? '').replace(/"/g, '""');
    return `"${normalized}"`;
  };

  const handleExportCsv = () => {
    const headers = ['nama', 'niche', 'status', 'action', 'notes'];
    const rows = leads.map((lead) => [
      buildCsvValue(lead.name),
      buildCsvValue(lead.niche),
      buildCsvValue(lead.status),
      buildCsvValue(lead.action),
      buildCsvValue(lead.notes),
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wellibuilds_crm_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV berhasil diexport!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedData)) {
          setLeads(importedData);
          updateLastModified();
          toast.success(`Berhasil import ${importedData.length} prospek!`);
        } else {
          toast.error('Format file tidak valid!');
        }
      } catch (err) {
        toast.error('Gagal membaca file JSON!');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Tab scroll
  const tabContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabContainerRef.current) {
      const scrollAmount = 200;
      tabContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Niche stats for Ringkasan
  const nicheStats = useMemo(() => {
    const stats: Record<string, { total: number; contacted: number; notContacted: number; followUp: number; deal: number; ditolak: number }> = {};
    DEFAULT_NICHES.forEach((niche) => {
      stats[niche.label] = { total: 0, contacted: 0, notContacted: 0, followUp: 0, deal: 0, ditolak: 0 };
    });
    // Also track uncategorized
    leads.forEach((lead) => {
      if (!stats[lead.niche]) {
        stats[lead.niche] = { total: 0, contacted: 0, notContacted: 0, followUp: 0, deal: 0, ditolak: 0 };
      }
      stats[lead.niche].total++;
      if (lead.status === 'Belum Dihubungi') stats[lead.niche].notContacted++;
      else if (lead.status === 'Ditolak') stats[lead.niche].ditolak++;
      else if (lead.status === 'Deal') stats[lead.niche].deal++;
      else if (lead.status === 'Follow Up') stats[lead.niche].followUp++;
      else stats[lead.niche].contacted++;
    });
    return stats;
  }, [leads]);

  // Filtered leads based on active tab
  const filteredByTab = useMemo(() => {
    if (activeTab === 'ringkasan') return leads;
    const niche = DEFAULT_NICHES.find((n) => n.id === activeTab);
    if (!niche) return leads;
    return leads.filter((l) => l.niche === niche.label);
  }, [leads, activeTab]);

  // Search + sort
  const processedLeads = useMemo(() => {
    let result = filteredByTab.filter(
      (lead) =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.action.toLowerCase().includes(searchTerm.toLowerCase())
    );

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'priority':
          cmp = (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99);
          break;
        case 'status':
          cmp = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
          break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [filteredByTab, searchTerm, sortField, sortDirection]);

  // Tab counters
  const tabCounters = useMemo(() => {
    const counts: Record<string, number> = { ringkasan: leads.length };
    DEFAULT_NICHES.forEach((niche) => {
      counts[niche.id] = leads.filter((l) => l.niche === niche.label).length;
    });
    return counts;
  }, [leads]);

  const handleOpenModal = (lead?: Lead) => {
    if (lead) {
      setEditingId(lead.id);
      setFormData({
        name: lead.name,
        niche: lead.niche,
        location: lead.location,
        priority: lead.priority,
        status: lead.status,
        action: lead.action,
        notes: lead.notes,
      });
    } else {
      setEditingId(null);
      const activeNiche = DEFAULT_NICHES.find((n) => n.id === activeTab);
      setFormData({
        name: '',
        niche: activeNiche?.label || DEFAULT_NICHES[0]?.label || '',
        location: '',
        priority: 'High',
        status: 'Belum Dihubungi',
        action: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  useEffect(() => {
    const handleNewLead = () => handleOpenModal();
    const handleEscape = () => {
      if (isModalOpen) handleCloseModal();
    };

    window.addEventListener('wb:new-lead', handleNewLead);
    window.addEventListener('wb:escape', handleEscape);

    return () => {
      window.removeEventListener('wb:new-lead', handleNewLead);
      window.removeEventListener('wb:escape', handleEscape);
    };
  }, [isModalOpen, handleOpenModal, handleCloseModal]);

  useEffect(() => {
    const handleNewLead = () => handleOpenModal();
    const handleEscape = () => {
      if (isModalOpen) handleCloseModal();
    };

    window.addEventListener('wb:new-lead', handleNewLead as EventListener);
    window.addEventListener('wb:escape', handleEscape as EventListener);
    return () => {
      window.removeEventListener('wb:new-lead', handleNewLead as EventListener);
      window.removeEventListener('wb:escape', handleEscape as EventListener);
    };
  }, [isModalOpen, activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setLeads(leads.map((l) => (l.id === editingId ? { ...formData, id: editingId } : l)));
      toast.success('Perubahan berhasil disimpan');
    } else {
      const newId = leads.length > 0 ? Math.max(...leads.map((l) => l.id)) + 1 : 1;
      setLeads([{ ...formData, id: newId }, ...leads]);
      toast.success('Prospek baru ditambahkan');
    }
    updateLastModified();
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Hapus prospek ini dari database?')) {
      setLeads(leads.filter((l) => l.id !== id));
      updateLastModified();
      toast.error('Prospek dihapus');
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const activeNicheLabel = activeTab === 'ringkasan'
    ? null
    : DEFAULT_NICHES.find((n) => n.id === activeTab)?.label;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <Database size={20} />
            <span className="font-mono text-sm tracking-wider uppercase font-semibold">Tracking</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display tracking-tight text-white">Database Prospek</h1>
          <p className="text-gray-400 mt-2 font-mono text-sm">
            {leads.length} total prospek · {leads.filter((l) => l.status === 'Belum Dihubungi').length} belum dihubungi
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Cari prospek..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-[#111] border border-[#333] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors shadow-[0_0_15px_rgba(249,115,22,0.2)]"
          >
            <Plus size={18} />
            <span>Tambah Prospek</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-gray-300 hover:text-white bg-[#111] hover:bg-[#222] border border-[#333] rounded-lg transition-colors"
              title="Export CSV"
            >
              CSV
            </button>
            <button
              onClick={handleExport}
              className="p-2 text-gray-400 hover:text-white bg-[#111] hover:bg-[#222] border border-[#333] rounded-lg transition-colors"
              title="Export JSON"
            >
              <Download size={18} />
            </button>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleImport}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-white bg-[#111] hover:bg-[#222] border border-[#333] rounded-lg transition-colors"
              title="Import JSON"
            >
              <Upload size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Horizontal Niche Tabs */}
      <div className="relative">
        <button
          onClick={() => scrollTabs('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-[#0a0a0a]/90 border border-[#333] rounded-md text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        <div
          ref={tabContainerRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-8 py-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Ringkasan tab */}
          <button
            onClick={() => setActiveTab('ringkasan')}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'ringkasan'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.1)]'
              : 'text-gray-400 hover:text-white hover:bg-[#111] border border-transparent'
              }`}
          >
            <BarChart3 size={16} />
            <span>Ringkasan</span>
            <span className="text-[10px] font-mono bg-[#222] px-1.5 py-0.5 rounded">{tabCounters.ringkasan}</span>
          </button>

          {DEFAULT_NICHES.map((niche) => {
            const IconComponent = NICHE_ICONS[niche.iconName] || Database;
            return (
              <button
                key={niche.id}
                onClick={() => setActiveTab(niche.id)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === niche.id
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.1)]'
                  : 'text-gray-400 hover:text-white hover:bg-[#111] border border-transparent'
                  }`}
              >
                <IconComponent size={16} />
                <span>{niche.label}</span>
                {tabCounters[niche.id] > 0 && (
                  <span className="text-[10px] font-mono bg-[#222] px-1.5 py-0.5 rounded">{tabCounters[niche.id]}</span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => scrollTabs('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-[#0a0a0a]/90 border border-[#333] rounded-md text-gray-400 hover:text-white transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* RINGKASAN VIEW */}
        {activeTab === 'ringkasan' && (
          <motion.div
            key="ringkasan"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Niche Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {DEFAULT_NICHES.map((niche) => {
                const stat = nicheStats[niche.label];
                if (!stat || stat.total === 0) return null; // Sembunyikan card kosong

                const IconComponent = NICHE_ICONS[niche.iconName] || Database;
                return (
                  <motion.div
                    key={niche.id}
                    variants={itemVariants}
                    onClick={() => setActiveTab(niche.id)}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="bg-[#111]/50 backdrop-blur-xl border border-white/5 hover:border-orange-500/30 rounded-xl p-5 cursor-pointer group transition-all shadow-lg hover:shadow-orange-500/10"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/5 rounded-lg text-gray-400 group-hover:text-orange-400 group-hover:bg-orange-500/10 transition-colors">
                          <IconComponent size={24} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors">
                            {niche.label}
                          </h3>
                          <p className="text-xs font-mono text-gray-500">{stat.total} prospek</p>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-gray-600 group-hover:text-orange-500 transition-colors" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Belum dihubungi</span>
                        <span className="font-mono text-orange-400">{stat.notContacted}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Sudah dihubungi</span>
                        <span className="font-mono text-emerald-400">{stat.contacted + stat.followUp}</span>
                      </div>
                      {stat.deal > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Deal</span>
                          <span className="font-mono text-emerald-400 font-bold">{stat.deal}</span>
                        </div>
                      )}
                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden mt-2">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${((stat.contacted + stat.followUp + stat.deal) / stat.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Global summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <motion.div variants={itemVariants} className="bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-xl p-4 text-center hover:bg-white/5 transition-colors">
                <p className="text-3xl font-mono font-bold text-white">{leads.length}</p>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mt-1">Total Prospek</p>
              </motion.div>
              <motion.div variants={itemVariants} className="bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-xl p-4 text-center hover:bg-white/5 transition-colors">
                <p className="text-3xl font-mono font-bold text-orange-400">
                  {leads.filter((l) => l.status === 'Belum Dihubungi').length}
                </p>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mt-1">Belum Dihubungi</p>
              </motion.div>
              <motion.div variants={itemVariants} className="bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-xl p-4 text-center hover:bg-white/5 transition-colors">
                <p className="text-3xl font-mono font-bold text-blue-400">
                  {leads.filter((l) => ['Dihubungi', 'Follow Up', 'Negosiasi'].includes(l.status)).length}
                </p>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mt-1">Dalam Proses</p>
              </motion.div>
              <motion.div variants={itemVariants} className="bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-xl p-4 text-center hover:bg-white/5 transition-colors">
                <p className="text-3xl font-mono font-bold text-emerald-400">{leads.filter((l) => l.status === 'Deal').length}</p>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mt-1">Deal / Closing</p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* NICHE TAB VIEW — shows table for specific niche */}
        {activeTab !== 'ringkasan' && (
          <motion.div
            key="nicheTab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Niche summary bar */}
            {activeNicheLabel && nicheStats[activeNicheLabel] && (() => {
              const ActiveIcon = NICHE_ICONS[DEFAULT_NICHES.find((n) => n.id === activeTab)?.iconName || ''] || Database;
              return (
                <div className="flex flex-wrap items-center gap-3 bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-xl p-4">
                  <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                    <ActiveIcon size={24} />
                  </div>
                  <div className="mr-4">
                    <h3 className="text-sm font-bold text-white">{activeNicheLabel}</h3>
                    <p className="text-xs font-mono text-gray-500">{nicheStats[activeNicheLabel].total} prospek</p>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <span className="text-xs font-mono text-orange-400">{nicheStats[activeNicheLabel].notContacted}</span>
                    <span className="text-[10px] text-gray-500">Belum</span>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <span className="text-xs font-mono text-purple-400">{nicheStats[activeNicheLabel].contacted}</span>
                    <span className="text-[10px] text-gray-500">Dihubungi</span>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <span className="text-xs font-mono text-blue-400">{nicheStats[activeNicheLabel].followUp}</span>
                    <span className="text-[10px] text-gray-500">Follow Up</span>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <span className="text-xs font-mono text-emerald-400">{nicheStats[activeNicheLabel].deal}</span>
                    <span className="text-[10px] text-gray-500">Deal</span>
                  </div>
                  <span className="text-xs font-mono text-gray-500 ml-auto">
                    {processedLeads.length} prospek ditampilkan
                  </span>
                </div>
              );
            })()}

            {/* Table */}
            <div className="bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th
                        className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                        onClick={() => toggleSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          Nama Bisnis
                          {sortField === 'name' && <ArrowUpDown size={12} className="text-orange-500" />}
                        </div>
                      </th>
                      <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Lokasi</th>
                      <th
                        className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                        onClick={() => toggleSort('priority')}
                      >
                        <div className="flex items-center gap-1">
                          Prioritas
                          {sortField === 'priority' && <ArrowUpDown size={12} className="text-orange-500" />}
                        </div>
                      </th>
                      <th
                        className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                        onClick={() => toggleSort('status')}
                      >
                        <div className="flex items-center gap-1">
                          Status
                          {sortField === 'status' && <ArrowUpDown size={12} className="text-orange-500" />}
                        </div>
                      </th>
                      <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Next Action</th>
                      <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Kelola</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="divide-y divide-[#222]"
                  >
                    {processedLeads.length === 0 ? (
                      <motion.tr variants={itemVariants}>
                        <td colSpan={6} className="p-12 text-center">
                          <div className="flex justify-center mb-4">
                            {(() => {
                              const EmptyIcon = NICHE_ICONS[DEFAULT_NICHES.find((n) => n.id === activeTab)?.iconName || ''] || Database;
                              return <EmptyIcon size={48} className="text-gray-600" />;
                            })()}
                          </div>
                          <p className="text-gray-500 font-mono text-sm mb-3">Belum ada prospek di kategori ini</p>
                          <button
                            onClick={() => handleOpenModal()}
                            className="text-xs text-orange-400 hover:text-orange-300 font-mono transition-colors"
                          >
                            + Tambah prospek pertama
                          </button>
                        </td>
                      </motion.tr>
                    ) : (
                      processedLeads.map((lead) => (
                        <motion.tr variants={itemVariants} key={lead.id} className="hover:bg-white/5 transition-colors group">
                          <td className="p-4">
                            <p className="font-medium text-gray-200">{lead.name}</p>
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-mono text-gray-400">{lead.location}</span>
                          </td>
                          <td className="p-4">
                            {lead.priority === 'High' ? (
                              <div className="flex items-center gap-1.5 text-orange-500">
                                <Flame size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Tinggi</span>
                              </div>
                            ) : lead.priority === 'Medium' ? (
                              <div className="flex items-center gap-1.5 text-yellow-500">
                                <Circle size={12} fill="currentColor" />
                                <span className="text-xs font-bold uppercase tracking-wider">Sedang</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-gray-500">
                                <Circle size={12} />
                                <span className="text-xs font-bold uppercase tracking-wider">Rendah</span>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[lead.status] || ''}`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
                              <ArrowRight size={14} className="text-orange-500" />
                              {lead.action}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="relative inline-block group/tooltip">
                                <button className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                                  <Info size={16} />
                                </button>
                                <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-[#222] border border-[#333] text-xs text-gray-300 rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10">
                                  {lead.notes || 'Tidak ada catatan.'}
                                  <div className="absolute -bottom-1 right-3 w-2 h-2 bg-[#222] border-b border-r border-[#333] rotate-45"></div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleOpenModal(lead)}
                                className="p-1.5 text-gray-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(lead.id)}
                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Hapus"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </motion.tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal CRUD */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111] border border-[#333] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-[#222]">
                <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Prospek' : 'Tambah Prospek Baru'}</h2>
                <button onClick={handleCloseModal} className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-[#222]">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Nama Bisnis</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="Contoh: Villa Asvara"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Kategori Bisnis</label>
                    <select
                      value={formData.niche}
                      onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none"
                    >
                      {DEFAULT_NICHES.map((niche) => (
                        <option key={niche.id} value={niche.label}>
                          {niche.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Lokasi</label>
                    <input
                      required
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="Contoh: Bali, Jakarta"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Prioritas</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as Lead['priority'] })}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none"
                    >
                      <option value="High">Tinggi (High)</option>
                      <option value="Medium">Sedang (Medium)</option>
                      <option value="Low">Rendah (Low)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Lead['status'] })}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none"
                    >
                      <option value="Belum Dihubungi">Belum Dihubungi</option>
                      <option value="Dihubungi">Dihubungi</option>
                      <option value="Follow Up">Follow Up</option>
                      <option value="Negosiasi">Negosiasi</option>
                      <option value="Deal">Deal / Closing</option>
                      <option value="Ditolak">Ditolak</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Next Action</label>
                    <input
                      required
                      type="text"
                      value={formData.action}
                      onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="Contoh: DM IG, Kirim Proposal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Catatan Strategis</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors resize-none"
                    placeholder="Pain points klien, angle penawaran, atau info kontak..."
                  ></textarea>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-[#222]">
                  <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                  >
                    {editingId ? 'Simpan Perubahan' : 'Tambah Prospek'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
