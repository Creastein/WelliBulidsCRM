"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Globe,
  ExternalLink,
  Search,
  Receipt,
  X,
  Copy,
  Check,
  Download,
  Building2,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  type CompletedProject,
} from '@/services/projectsService';

export default function CompletedProjects() {
  const [projects, setProjects] = useState<CompletedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProjectModal, setActiveProjectModal] = useState<CompletedProject | null>(null);
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);

  // Form / Add / Edit state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    url: '',
    clientName: '',
    clientContact: '',
    location: '',
    category: 'Villa',
    price: 2000000,
    invoiceDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    invoiceNumber: '',
    packageType: 'Paket Standar',
    description: '',
    featuresText: '',
    notes: '',
  });

  const categories = ['All', 'Villa', 'Tour & Activity', 'Resort & Bungalow', 'Homestay & Kos', 'Website Optimization'];

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();

    const handleProjectsUpdated = () => {
      loadProjects();
    };

    window.addEventListener('wb:projects-updated', handleProjectsUpdated);
    return () => window.removeEventListener('wb:projects-updated', handleProjectsUpdated);
  }, [loadProjects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        project.name.toLowerCase().includes(q) ||
        project.domain.toLowerCase().includes(q) ||
        project.clientName.toLowerCase().includes(q) ||
        project.location.toLowerCase().includes(q) ||
        project.packageType.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [projects, searchTerm, selectedCategory]);

  const totalRevenue = useMemo(() => {
    return projects.reduce((acc, p) => acc + p.price, 0);
  }, [projects]);

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const handleCopy = (domain: string) => {
    navigator.clipboard.writeText(domain);
    setCopiedDomain(domain);
    toast.success(`Domain ${domain} disalin!`);
    setTimeout(() => setCopiedDomain(null), 2000);
  };

  const handleExportCsv = () => {
    const headers = ['No', 'Proyek', 'Domain', 'Klien', 'Kontak', 'Lokasi', 'Kategori', 'Paket', 'Harga (IDR)', 'Tanggal Invoice', 'Nomor Invoice'];
    const rows = filteredProjects.map((p) => [
      `"${p.rowCode || ''}"`,
      `"${p.name}"`,
      `"${p.domain}"`,
      `"${p.clientName}"`,
      `"${p.clientContact || ''}"`,
      `"${p.location}"`,
      `"${p.category}"`,
      `"${p.packageType}"`,
      `"${p.price}"`,
      `"${p.invoiceDate || ''}"`,
      `"${p.invoiceNumber || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `WelliBuilds_Projects_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('File CSV berhasil didownload!');
  };

  const handleOpenAddModal = () => {
    const nextRowCode = String(projects.length + 1).padStart(2, '0');
    setEditingId(null);
    setFormData({
      name: '',
      domain: '',
      url: '',
      clientName: '',
      clientContact: '',
      location: 'Bali',
      category: 'Villa',
      price: 2000000,
      invoiceDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      invoiceNumber: `WLB/INV/${new Date().getFullYear()}/${nextRowCode}`,
      packageType: 'Paket Standar',
      description: '',
      featuresText: '1 Halaman Responsif\nDirect WhatsApp Booking\nDomain & Fast Hosting\nSEO Google Maps',
      notes: 'Lunas',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (p: CompletedProject) => {
    setEditingId(p.id);
    setFormData({
      name: p.name,
      domain: p.domain,
      url: p.url,
      clientName: p.clientName,
      clientContact: p.clientContact || '',
      location: p.location,
      category: p.category,
      price: p.price,
      invoiceDate: p.invoiceDate || '',
      invoiceNumber: p.invoiceNumber || '',
      packageType: p.packageType,
      description: p.description,
      featuresText: (p.features || []).join('\n'),
      notes: p.notes || '',
    });
    setActiveProjectModal(null);
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Nama proyek wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    const features = formData.featuresText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const cleanDomain = formData.domain.replace(/^https?:\/\//i, '').replace(/\/$/, '');
    const cleanUrl = formData.url.trim() || (cleanDomain ? `https://${cleanDomain}` : '');

    try {
      if (editingId) {
        await updateProject(editingId, {
          name: formData.name,
          domain: cleanDomain,
          url: cleanUrl,
          clientName: formData.clientName,
          clientContact: formData.clientContact,
          location: formData.location,
          category: formData.category,
          price: Number(formData.price) || 0,
          invoiceDate: formData.invoiceDate,
          invoiceNumber: formData.invoiceNumber,
          packageType: formData.packageType,
          description: formData.description,
          features,
          notes: formData.notes,
        });
        toast.success('Proyek berhasil diperbarui!');
      } else {
        const rowCode = String(projects.length + 1).padStart(2, '0');
        await createProject({
          rowCode,
          name: formData.name,
          domain: cleanDomain,
          url: cleanUrl,
          clientName: formData.clientName,
          clientContact: formData.clientContact,
          location: formData.location,
          category: formData.category,
          price: Number(formData.price) || 0,
          invoiceDate: formData.invoiceDate,
          invoiceNumber: formData.invoiceNumber,
          packageType: formData.packageType,
          description: formData.description,
          features,
          notes: formData.notes,
        });
        toast.success('Proyek selesai berhasil ditambahkan!');
      }

      setIsFormModalOpen(false);
      loadProjects();
    } catch (err: any) {
      toast.error(`Gagal menyimpan proyek: ${err.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus proyek "${name}"?`)) {
      try {
        await deleteProject(id);
        toast.success(`Proyek "${name}" berhasil dihapus.`);
        setActiveProjectModal(null);
        loadProjects();
      } catch (err: any) {
        toast.error(`Gagal menghapus: ${err.message}`);
      }
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 pb-20 text-white">
      {/* Top Simple Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Done Projects & Portfolio
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-normal">
              {projects.length} Proyek
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Daftar proyek website selesai, live link portofolio, dan rekap nilai deal invoice.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="text-right pr-2 border-r border-white/10 hidden sm:block">
            <span className="text-[10px] text-gray-500 uppercase font-mono block">Total Revenue</span>
            <span className="text-base md:text-lg font-mono font-bold text-emerald-400">
              {formatIDR(totalRevenue)}
            </span>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-semibold text-xs transition-colors shadow-lg shadow-orange-500/10"
          >
            <Plus size={14} />
            <span>Tambah Proyek</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-medium transition-colors"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={loadProjects}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-xs transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111116]/80 border border-white/[0.06] p-2.5 rounded-xl">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-black font-bold shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Cari proyek, domain, klien..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Excel-Style Matrix Table */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0e0e14]/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[860px]">
            <thead>
              <tr className="bg-[#14141c] border-b border-white/[0.08] text-[11px] font-mono text-gray-400">
                <th className="p-3 w-10 text-center border-r border-white/[0.06] text-gray-500">#</th>
                <th className="p-3 border-r border-white/[0.06] text-gray-300">PROYEK & DOMAIN</th>
                <th className="p-3 border-r border-white/[0.06] text-gray-300">KLIEN</th>
                <th className="p-3 border-r border-white/[0.06] text-gray-300">LOKASI</th>
                <th className="p-3 border-r border-white/[0.06] text-gray-300">KATEGORI</th>
                <th className="p-3 border-r border-white/[0.06] text-gray-300">PAKET LAYANAN</th>
                <th className="p-3 border-r border-white/[0.06] text-emerald-400 text-right">NILAI DEAL</th>
                <th className="p-3 border-r border-white/[0.06] text-gray-400 text-center">TGL</th>
                <th className="p-3 text-center text-gray-400">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {filteredProjects.map((p, idx) => (
                <tr
                  key={p.id}
                  onClick={() => setActiveProjectModal(p)}
                  className="hover:bg-white/[0.025] transition-colors cursor-pointer group"
                >
                  {/* # Index */}
                  <td className="p-3 text-center font-mono text-gray-500 border-r border-white/[0.06]">
                    {p.rowCode || String(idx + 1).padStart(2, '0')}
                  </td>

                  {/* Proyek & Domain */}
                  <td className="p-3 border-r border-white/[0.06]">
                    <div className="font-semibold text-white group-hover:text-orange-400 transition-colors">
                      {p.name}
                    </div>
                    {p.domain && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <a
                          href={p.url || `https://${p.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-[11px] text-orange-400/90 hover:text-orange-300 hover:underline flex items-center gap-1"
                        >
                          <Globe size={11} />
                          {p.domain}
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(p.domain);
                          }}
                          className="text-gray-500 hover:text-white"
                          title="Salin domain"
                        >
                          {copiedDomain === p.domain ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Klien */}
                  <td className="p-3 text-gray-300 border-r border-white/[0.06]">
                    <div>{p.clientName}</div>
                    {p.clientContact && <div className="text-[10px] text-gray-500 font-mono">{p.clientContact}</div>}
                  </td>

                  {/* Lokasi */}
                  <td className="p-3 text-gray-400 border-r border-white/[0.06]">
                    {p.location}
                  </td>

                  {/* Kategori */}
                  <td className="p-3 border-r border-white/[0.06]">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-gray-300 border border-white/5 whitespace-nowrap">
                      {p.category}
                    </span>
                  </td>

                  {/* Paket */}
                  <td className="p-3 text-gray-300 border-r border-white/[0.06]">
                    <span>{p.packageType}</span>
                  </td>

                  {/* Harga */}
                  <td className="p-3 font-mono font-semibold text-emerald-400 text-right border-r border-white/[0.06]">
                    {formatIDR(p.price)}
                  </td>

                  {/* Tanggal */}
                  <td className="p-3 font-mono text-[11px] text-gray-400 text-center border-r border-white/[0.06]">
                    {p.invoiceDate || '—'}
                  </td>

                  {/* Aksi */}
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveProjectModal(p)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                        title="Detail Invoice"
                      >
                        <Receipt size={13} />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-orange-400 transition-colors"
                        title="Edit Proyek"
                      >
                        <Edit2 size={13} />
                      </button>
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 transition-colors"
                          title="Buka Website"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Table Footer */}
            <tfoot>
              <tr className="bg-[#14141c] border-t border-white/[0.08] text-xs font-mono">
                <td className="p-3 text-center text-gray-500 border-r border-white/[0.06]">Σ</td>
                <td colSpan={5} className="p-3 font-bold text-white border-r border-white/[0.06]">
                  TOTAL {filteredProjects.length} PROYEK
                </td>
                <td className="p-3 text-right font-bold text-emerald-400 border-r border-white/[0.06]">
                  {formatIDR(totalRevenue)}
                </td>
                <td colSpan={2} className="p-3 text-center text-gray-500 text-[11px]">
                  100% Lunas & Live
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12 bg-[#111116] border border-white/5 rounded-xl">
          <Building2 size={32} className="mx-auto text-gray-600 mb-2" />
          <p className="text-xs text-gray-400">Tidak ada proyek yang sesuai dengan filter.</p>
        </div>
      )}

      {/* Invoice Details Modal */}
      <AnimatePresence>
        {activeProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#121218] border border-white/15 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{activeProjectModal.name}</h3>
                    {activeProjectModal.invoiceNumber && (
                      <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                        {activeProjectModal.invoiceNumber}
                      </span>
                    )}
                  </div>
                  {activeProjectModal.domain && (
                    <a
                      href={activeProjectModal.url || `https://${activeProjectModal.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-orange-400 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <Globe size={12} />
                      {activeProjectModal.domain}
                    </a>
                  )}
                </div>
                <button
                  onClick={() => setActiveProjectModal(null)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-3 text-xs text-gray-300">
                <div className="grid grid-cols-2 gap-2 bg-white/5 p-3 rounded-xl">
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono block">KLIEN</span>
                    <span className="font-semibold text-white">{activeProjectModal.clientName}</span>
                    {activeProjectModal.clientContact && (
                      <span className="text-[10px] text-gray-400 font-mono block">{activeProjectModal.clientContact}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono block">LOKASI & KATEGORI</span>
                    <span className="text-gray-300">{activeProjectModal.location} ({activeProjectModal.category})</span>
                  </div>
                </div>

                {activeProjectModal.description && (
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono block mb-1">PAKET & DESKRIPSI</span>
                    <p className="text-gray-300 leading-relaxed">{activeProjectModal.description}</p>
                  </div>
                )}

                {activeProjectModal.features && activeProjectModal.features.length > 0 && (
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono block mb-1.5">DELIVERABLES</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeProjectModal.features.map((feat, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-black/40 border border-white/5 text-[11px] text-gray-300">
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeProjectModal.addons && activeProjectModal.addons.length > 0 && (
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono block mb-1">ADD-ONS</span>
                    {activeProjectModal.addons.map((add, idx) => (
                      <div key={idx} className="flex justify-between text-xs py-1 border-b border-white/5">
                        <span>{add.name}</span>
                        <span className="font-mono text-white">{formatIDR(add.price)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeProjectModal.notes && (
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono block mb-1">CATATAN</span>
                    <p className="text-gray-400 text-[11px]">{activeProjectModal.notes}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-white/10 text-sm font-bold">
                  <span>TOTAL NILAI DEAL:</span>
                  <span className="text-emerald-400 font-mono text-base">{formatIDR(activeProjectModal.price)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <button
                  onClick={() => handleDelete(activeProjectModal.id, activeProjectModal.name)}
                  className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={13} />
                  <span>Hapus</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(activeProjectModal)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs flex items-center gap-1"
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                  {activeProjectModal.url && (
                    <a
                      href={activeProjectModal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <span>Buka Website</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Project Modal */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#121218] border border-white/15 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  {editingId ? 'Edit Proyek Selesai' : 'Tambah Proyek Selesai Baru'}
                </h3>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Nama Proyek *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Dea Haven Villas"
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Domain</label>
                    <input
                      type="text"
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      placeholder="deahavenvillas.com"
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Kategori</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="Villa">Villa</option>
                      <option value="Tour & Activity">Tour & Activity</option>
                      <option value="Resort & Bungalow">Resort & Bungalow</option>
                      <option value="Homestay & Kos">Homestay & Kos</option>
                      <option value="Website Optimization">Website Optimization</option>
                      <option value="Custom Project">Custom Project</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Nama Klien</label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="Bapak Andi / PT ..."
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Lokasi</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Bali / Yogyakarta / Lombok"
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Nilai Deal (IDR) *</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 font-mono text-emerald-400 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Paket Layanan</label>
                    <input
                      type="text"
                      value={formData.packageType}
                      onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                      placeholder="Paket Standar / Pro Booking"
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Nomor Invoice</label>
                    <input
                      type="text"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                      placeholder="WLB/INV/2026/0901"
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Tanggal Invoice</label>
                    <input
                      type="text"
                      value={formData.invoiceDate}
                      onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                      placeholder="15 Sep 2026"
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Deskripsi Proyek</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Penjelasan singkat lingkup website..."
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Deliverables / Fitur (1 per baris)</label>
                  <textarea
                    rows={3}
                    value={formData.featuresText}
                    onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                    placeholder="1 Halaman Responsif&#10;Direct WhatsApp Booking&#10;Domain & Hosting"
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-[11px] placeholder-gray-600 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>{editingId ? 'Simpan Perubahan' : 'Tambah Proyek'}</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
