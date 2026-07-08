"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  TrendingUp,
  MessageSquare,
  Calendar,
  Users,
  Target,
  DollarSign,
  Filter,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  Bookmark,
  Sparkles,
  Clock,
  ArrowRight,
  Megaphone,
  Percent,
  Save,
  RefreshCw,
  FileText,
  ChevronRight,
  HelpCircle,
  Undo2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { DEFAULT_NICHES } from '@/data/dataDefaults';

// -------------------------------------------------------------
// TYPES & SCHEMAS
// -------------------------------------------------------------

export interface LeadFlowItem {
  id: string;
  date: string; // YYYY-MM-DD
  leadName: string;
  niche: string;
  sourceCampaign: string;
  adSet: string;
  adName: string;
  status: 'new' | 'contacted' | 'replied' | 'interested' | 'proposal_sent' | 'won' | 'lost' | 'archived';
  notes: string;
  nextFollowUp: string; // YYYY-MM-DDTHH:mm
  owner: string;
  dealValue: number;
  replyCount: number;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New Chat', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'contacted', label: 'Contacted', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { value: 'replied', label: 'Replied / Chatted', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { value: 'interested', label: 'Interested', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  { value: 'proposal_sent', label: 'Proposal Sent', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  { value: 'won', label: 'Won / Closing', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'lost', label: 'Lost / No Deal', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { value: 'archived', label: 'Archived', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
];

const REAL_LEADS: LeadFlowItem[] = [
  {
    id: 'lf-real-5',
    date: '2026-07-08',
    leadName: 'Client 5 - Iwan Batu Malang',
    niche: 'Villa',
    sourceCampaign: 'July_Meta_Ads',
    adSet: 'Malang_Audience',
    adName: 'Villa_Guesthouse_Ad',
    status: 'interested',
    notes: 'Sudah ada deal/meeting fix jam 2 siang besok. Prioritas follow-up sebelum meeting jam 2 besok supaya flow-nya lancar.',
    nextFollowUp: '2026-07-09T13:00',
    owner: 'Well',
    dealValue: 2500000,
    replyCount: 2,
    createdAt: '2026-07-08T10:30:00Z',
    updatedAt: '2026-07-08T10:30:00Z'
  },
  {
    id: 'lf-real-6',
    date: '2026-07-08',
    leadName: 'Client 6 - Auliya Urrohman',
    niche: 'Villa',
    sourceCampaign: 'July_Meta_Ads',
    adSet: 'Unknown_Audience',
    adName: 'Location_Ad',
    status: 'new',
    notes: 'Belum ketemu detail percakapan yang terkait di riwayat. Perlu identifikasi lanjut sebelum status dipastikan. Cek lagi nama/riwayat chat supaya bisa dipetakan dengan benar.',
    nextFollowUp: '2026-07-08T16:00',
    owner: 'Well',
    dealValue: 2500000,
    replyCount: 0,
    createdAt: '2026-07-08T10:30:00Z',
    updatedAt: '2026-07-08T10:30:00Z'
  },
  {
    id: 'lf-real-7',
    date: '2026-07-08',
    leadName: 'Client 7 - Christine Gili Trawangan',
    niche: 'Homestay / Guest House',
    sourceCampaign: 'July_Meta_Ads',
    adSet: 'Gili_Audience',
    adName: 'Villa_Guesthouse_Ad',
    status: 'contacted',
    notes: 'Nanya harga bikin website villa/guesthouse. Sudah dibalas minta lokasi properti dulu untuk arahkan paket yang paling pas. Follow up siang ini setelah lokasi properti diketahui.',
    nextFollowUp: '2026-07-08T14:00',
    owner: 'Well',
    dealValue: 2500000,
    replyCount: 1,
    createdAt: '2026-07-08T10:30:00Z',
    updatedAt: '2026-07-08T10:30:00Z'
  },
  {
    id: 'lf-real-1',
    date: '2026-07-07',
    leadName: 'Client 1 - Jogja',
    niche: 'Homestay / Guest House',
    sourceCampaign: 'July_Meta_Ads',
    adSet: 'Jogja_Audience',
    adName: 'Villa_Guesthouse_Ad',
    status: 'replied',
    notes: 'Villa / guesthouse di Jogja. Current booking masih lewat Booking.com dan Airbnb. Kebutuhan utama: website booking direct. Arah follow-up: tekankan manfaat booking direct (hemat komisi OTA), ajak ke Google Meet singkat, gunakan promo sebagai alasan.',
    nextFollowUp: '2026-07-08T10:00',
    owner: 'Well',
    dealValue: 2500000,
    replyCount: 3,
    createdAt: '2026-07-07T10:00:00Z',
    updatedAt: '2026-07-07T10:00:00Z'
  },
  {
    id: 'lf-real-2',
    date: '2026-07-07',
    leadName: 'Client 2 - Roby Canggu',
    niche: 'Villa',
    sourceCampaign: 'July_Meta_Ads',
    adSet: 'Canggu_Audience',
    adName: 'Villa_Pro_Booking',
    status: 'interested',
    notes: 'Nama: Roby. Status chat: sudah bilang "diskusi dulu dengan istri". Offer yang sudah disebut: Pro Booking Rp3.000.000. Arah follow-up: minta izin simpan kontak dengan sopan, jangan kasih bola 100% ke dia, ingatkan promo masih berlaku, tawarkan Google Meet jika ragu.',
    nextFollowUp: '2026-07-08T11:00',
    owner: 'Well',
    dealValue: 3000000,
    replyCount: 4,
    createdAt: '2026-07-07T11:00:00Z',
    updatedAt: '2026-07-07T11:00:00Z'
  },
  {
    id: 'lf-real-3',
    date: '2026-07-07',
    leadName: 'Client 3 - Madasari Pangandaran',
    niche: 'Homestay / Guest House',
    sourceCampaign: 'July_Meta_Ads',
    adSet: 'Pangandaran_Audience',
    adName: 'Bungalow_Direct_Booking',
    status: 'contacted',
    notes: 'Lokasi: Madasari, Pangandaran. Properti: 3 bungalow + 1 homestay milik sendiri. Clarification: hanya properti sendiri yang masuk web, bukan tetangga. Belum paham betul "website" yang dimaksud. Arah follow-up: jelaskan website booking direct (bukan profil, lihat foto, harga, booking/WA), jangan langsung lempar harga, tanya OTA/WA, Meet setelah paham.',
    nextFollowUp: '2026-07-09T10:00',
    owner: 'Well',
    dealValue: 2500000,
    replyCount: 1,
    createdAt: '2026-07-07T12:00:00Z',
    updatedAt: '2026-07-07T12:00:00Z'
  },
  {
    id: 'lf-real-4',
    date: '2026-07-07',
    leadName: 'Client 4 - Jember',
    niche: 'Villa',
    sourceCampaign: 'July_Meta_Ads',
    adSet: 'Jember_Audience',
    adName: 'Location_Ad',
    status: 'new',
    notes: 'Kondisi lead: terlalu awal. Masalah chat: opening awal terlalu mengarah ke villa padahal baru jawab lokasi. Arah follow-up: jangan asumsi jenis bisnis, tanya dulu bisnisnya apa, tanya apakah sudah punya website atau masih dari nol, tawarkan solusi yang cocok setelah jelas.',
    nextFollowUp: '2026-07-08T14:00',
    owner: 'Well',
    dealValue: 2500000,
    replyCount: 1,
    createdAt: '2026-07-07T13:00:00Z',
    updatedAt: '2026-07-07T13:00:00Z'
  }
];

export default function LeadFlow() {
  // -------------------------------------------------------------
  // STATES
  // -------------------------------------------------------------
  const [leads, setLeads] = useState<LeadFlowItem[]>([]);
  const [adIntel, setAdIntel] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Filtering/Searching
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [nicheFilter, setNicheFilter] = useState<string>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('2026-07');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadFlowItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    leadName: '',
    niche: DEFAULT_NICHES[0]?.label || '',
    sourceCampaign: '',
    adSet: '',
    adName: '',
    status: 'new' as LeadFlowItem['status'],
    notes: '',
    nextFollowUp: '',
    owner: 'Well',
    dealValue: 2500000,
    replyCount: 0
  });

  // -------------------------------------------------------------
  // INITIALIZATION / LOCAL STORAGE
  // -------------------------------------------------------------
  useEffect(() => {
    // Load leads
    const storedLeads = localStorage.getItem('wellibuilds_lead_flow_leads');
    let currentLeads: LeadFlowItem[] = [];
    if (storedLeads) {
      try {
        currentLeads = JSON.parse(storedLeads);
      } catch (e) {
        console.error('Failed to parse lead flow leads:', e);
      }
    }

    if (currentLeads.length === 0) {
      currentLeads = [...REAL_LEADS];
    } else {
      // Check if any of the REAL_LEADS is missing from currentLeads (by id)
      let updated = false;
      // We want to insert the new real leads at the correct chronological position (top) if missing
      REAL_LEADS.forEach((realLead) => {
        if (!currentLeads.some((l) => l.id === realLead.id)) {
          // If it is a new lead (like Client 5, 6, 7), prepend it
          if (['lf-real-5', 'lf-real-6', 'lf-real-7'].includes(realLead.id)) {
            currentLeads = [realLead, ...currentLeads];
          } else {
            currentLeads.push(realLead);
          }
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem('wellibuilds_lead_flow_leads', JSON.stringify(currentLeads));
      }
    }

    setLeads(currentLeads);

    // Load ad intelligence notes
    const storedIntel = localStorage.getItem('wellibuilds_lead_flow_intel');
    const oldDefaultIntel = `Working Angles for July 2026:
- Jogja: Sudah paham masalah, tinggal dorong promo + Meet.
- Canggu/Roby: Paling dekat closing, perlu follow-up halus + jaga momentum.
- Madasari: Butuh edukasi dulu, jangan jualan terlalu cepat.
- Jember: Lead paling awal, kualifikasi/gali dulu kebutuhan bisnisnya.`;

    const defaultIntel = `Working Angles for July 2026:
- Jogja: Sudah paham masalah, tinggal dorong promo + Meet.
- Canggu/Roby: Paling dekat closing, perlu follow-up halus + jaga momentum.
- Madasari: Butuh edukasi dulu, jangan jualan terlalu cepat.
- Jember: Lead paling awal, kualifikasi/gali dulu kebutuhan bisnisnya.
- Iwan Batu Malang: Meeting besok jam 2 siang. Kirim follow-up singkat sebelum jam meeting.
- Christine Gili Trawangan: Tanya harga web guesthouse, follow up siang ini setelah lokasi properti diketahui.
- Auliya Urrohman: Cek riwayat chat untuk identifikasi lebih lanjut.`;

    if (!storedIntel || storedIntel === 'Working Angles for July 2026:\n- ' || storedIntel === oldDefaultIntel) {
      setAdIntel(defaultIntel);
      localStorage.setItem('wellibuilds_lead_flow_intel', defaultIntel);
    } else {
      setAdIntel(storedIntel);
    }

    // Load last updated
    const updated = localStorage.getItem('wellibuilds_last_modified') || new Date().toISOString();
    setLastUpdated(updated);

    setIsLoading(false);
  }, []);

  // Dispatch events to keep other views (like sidebar, mission control) updated if needed
  const saveLeadsToStorage = (updatedLeads: LeadFlowItem[]) => {
    setLeads(updatedLeads);
    localStorage.setItem('wellibuilds_lead_flow_leads', JSON.stringify(updatedLeads));
    const nowIso = new Date().toISOString();
    localStorage.setItem('wellibuilds_last_modified', nowIso);
    setLastUpdated(nowIso);
    // trigger updates across CRM
    window.dispatchEvent(new Event('wb:progress-updated'));
  };

  const handleIntelChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setAdIntel(value);
    localStorage.setItem('wellibuilds_lead_flow_intel', value);
    const nowIso = new Date().toISOString();
    localStorage.setItem('wellibuilds_last_modified', nowIso);
    setLastUpdated(nowIso);
  };

  // -------------------------------------------------------------
  // COMPUTED PROPERTIES (KPIs, Insights)
  // -------------------------------------------------------------
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Month check
      const leadMonth = lead.date.substring(0, 7);
      if (monthFilter !== 'all' && leadMonth !== monthFilter) return false;

      // Status check
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false;

      // Niche check
      if (nicheFilter !== 'all' && lead.niche !== nicheFilter) return false;

      // Campaign check
      if (campaignFilter !== 'all' && lead.sourceCampaign !== campaignFilter) return false;

      // Search term check
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesName = lead.leadName.toLowerCase().includes(query);
        const matchesNotes = lead.notes.toLowerCase().includes(query);
        const matchesCampaign = lead.sourceCampaign.toLowerCase().includes(query);
        const matchesAdSet = lead.adSet.toLowerCase().includes(query);
        const matchesAdName = lead.adName.toLowerCase().includes(query);
        return matchesName || matchesNotes || matchesCampaign || matchesAdSet || matchesAdName;
      }

      return true;
    });
  }, [leads, searchTerm, statusFilter, nicheFilter, campaignFilter, monthFilter]);

  // List of campaigns for the filter dropdown
  const campaignOptions = useMemo(() => {
    const campaigns = new Set<string>();
    leads.forEach((l) => {
      if (l.sourceCampaign) campaigns.add(l.sourceCampaign);
    });
    return Array.from(campaigns);
  }, [leads]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const activeLeads = leads.filter((l) => {
      const leadMonth = l.date.substring(0, 7);
      return monthFilter === 'all' || leadMonth === monthFilter;
    });

    const total = activeLeads.length;
    const replied = activeLeads.filter((l) => l.replyCount > 0 || l.status !== 'new').length;
    const won = activeLeads.filter((l) => l.status === 'won').length;
    const lost = activeLeads.filter((l) => l.status === 'lost').length;
    const proposalSent = activeLeads.filter((l) => l.status === 'proposal_sent').length;
    const interested = activeLeads.filter((l) => l.status === 'interested').length;

    // Qualified defined as interested, proposal_sent, or won
    const qualified = activeLeads.filter((l) => ['interested', 'proposal_sent', 'won'].includes(l.status)).length;
    // Booked/Meeting Set defined as proposal_sent or won (progressed beyond interested)
    const booked = activeLeads.filter((l) => ['proposal_sent', 'won'].includes(l.status)).length;

    const replyRate = total > 0 ? Math.round((replied / total) * 100) : 0;
    const closeRate = total > 0 ? Math.round((won / total) * 100) : 0;

    return {
      total,
      replied,
      qualified,
      booked,
      won,
      lost,
      replyRate,
      closeRate
    };
  }, [leads, monthFilter]);

  // Dynamic Insights calculation
  const insights = useMemo(() => {
    const activeLeads = leads.filter((l) => {
      const leadMonth = l.date.substring(0, 7);
      return monthFilter === 'all' || leadMonth === monthFilter;
    });

    if (activeLeads.length === 0) {
      return {
        bestCampaign: 'No Data',
        bestNiche: 'No Data',
        objectionCount: 0,
        followUpTodayCount: 0,
        likelyToCloseCount: 0,
        objectionList: []
      };
    }

    // Best performing campaign (most won deals, then highest deal value)
    const campaignStats: Record<string, { won: number; total: number; value: number }> = {};
    activeLeads.forEach((l) => {
      if (!campaignStats[l.sourceCampaign]) {
        campaignStats[l.sourceCampaign] = { won: 0, total: 0, value: 0 };
      }
      campaignStats[l.sourceCampaign].total += 1;
      if (l.status === 'won') {
        campaignStats[l.sourceCampaign].won += 1;
        campaignStats[l.sourceCampaign].value += l.dealValue;
      }
    });

    let bestCamp = 'None';
    let maxWon = -1;
    let maxValue = -1;
    Object.entries(campaignStats).forEach(([camp, stat]) => {
      if (stat.won > maxWon || (stat.won === maxWon && stat.value > maxValue)) {
        bestCamp = camp;
        maxWon = stat.won;
        maxValue = stat.value;
      }
    });

    // Best converting niche
    const nicheStats: Record<string, { won: number; total: number }> = {};
    activeLeads.forEach((l) => {
      if (!nicheStats[l.niche]) {
        nicheStats[l.niche] = { won: 0, total: 0 };
      }
      nicheStats[l.niche].total += 1;
      if (l.status === 'won') {
        nicheStats[l.niche].won += 1;
      }
    });

    let bestNiche = 'None';
    let bestRate = -1;
    Object.entries(nicheStats).forEach(([niche, stat]) => {
      const rate = stat.total > 0 ? stat.won / stat.total : 0;
      if (rate > bestRate && stat.won > 0) {
        bestNiche = niche;
        bestRate = rate;
      }
    });

    // Today's date check for follow-ups
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const followUpToday = activeLeads.filter((l) => {
      if (!l.nextFollowUp) return false;
      const fuDate = l.nextFollowUp.split('T')[0];
      return fuDate === todayStr && !['won', 'lost', 'archived'].includes(l.status);
    });

    // Common objections tracker (word search in notes)
    const objectionWords = ['mahal', 'harga', 'budget', 'mahalan', 'tunda', 'belum butuh', 'trial', 'reject', 'cancel', 'batal'];
    const objections = activeLeads.filter((l) => {
      const notesLower = l.notes.toLowerCase();
      return objectionWords.some((word) => notesLower.includes(word));
    });

    const likelyToClose = activeLeads.filter((l) => ['interested', 'proposal_sent'].includes(l.status));

    return {
      bestCampaign: bestCamp !== 'None' ? `${bestCamp} (${maxWon} Deal)` : 'None closed yet',
      bestNiche: bestNiche !== 'None' ? `${bestNiche} (${Math.round(bestRate * 100)}% Win)` : 'None closed yet',
      objectionCount: objections.length,
      followUpTodayCount: followUpToday.length,
      likelyToCloseCount: likelyToClose.length,
      objectionList: objections.slice(0, 3)
    };
  }, [leads, monthFilter]);

  // Formatting currency
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Last update timestamp text
  const lastUpdatedText = useMemo(() => {
    if (!lastUpdated) return 'Syncing...';
    const date = new Date(lastUpdated);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [lastUpdated]);

  // -------------------------------------------------------------
  // ACTIONS / EVENT HANDLERS
  // -------------------------------------------------------------
  const handleOpenModal = (lead?: LeadFlowItem) => {
    if (lead) {
      setEditingLead(lead);
      setFormData({
        date: lead.date,
        leadName: lead.leadName,
        niche: lead.niche,
        sourceCampaign: lead.sourceCampaign,
        adSet: lead.adSet,
        adName: lead.adName,
        status: lead.status,
        notes: lead.notes,
        nextFollowUp: lead.nextFollowUp || '',
        owner: lead.owner,
        dealValue: lead.dealValue,
        replyCount: lead.replyCount
      });
    } else {
      setEditingLead(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        leadName: '',
        niche: DEFAULT_NICHES[0]?.label || 'Villa',
        sourceCampaign: '',
        adSet: '',
        adName: '',
        status: 'new',
        notes: '',
        nextFollowUp: '',
        owner: 'Well',
        dealValue: 2500000,
        replyCount: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLead(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.leadName.trim()) {
      toast.error('Lead / Client Name is required');
      return;
    }

    const nowStr = new Date().toISOString();
    if (editingLead) {
      // Edit
      const updated = leads.map((l) => {
        if (l.id === editingLead.id) {
          return {
            ...l,
            ...formData,
            closedAt: formData.status === 'won' || formData.status === 'lost' ? nowStr : null,
            updatedAt: nowStr
          };
        }
        return l;
      });
      saveLeadsToStorage(updated);
      toast.success('Lead updated successfully');
    } else {
      // Create
      const newLead: LeadFlowItem = {
        id: `lf-${Date.now()}`,
        ...formData,
        closedAt: formData.status === 'won' || formData.status === 'lost' ? nowStr : null,
        createdAt: nowStr,
        updatedAt: nowStr
      };
      saveLeadsToStorage([newLead, ...leads]);
      toast.success('New lead flow tracked');
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      const updated = leads.filter((l) => l.id !== id);
      saveLeadsToStorage(updated);
      toast.success('Lead deleted from log');
    }
  };

  // Keyboard shortcut listener to open modal
  useEffect(() => {
    const handleNewLeadFlow = () => handleOpenModal();
    window.addEventListener('wb:new-lead-flow', handleNewLeadFlow);
    return () => window.removeEventListener('wb:new-lead-flow', handleNewLeadFlow);
  }, [leads]);

  // -------------------------------------------------------------
  // SEED AND RESET DATA
  // -------------------------------------------------------------
  // Reset helpers removed

  const handleClearAll = () => {
    if (window.confirm('Delete ALL leads? This will leave the dashboard empty.')) {
      saveLeadsToStorage([]);
      toast.success('Cleared all leads');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 md:space-y-8">
      {/* ═══════════════════════════════════════════════════════════
          PAGE HEADER
         ═══════════════════════════════════════════════════════════ */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <MessageSquare size={20} className="animate-pulse" />
            <span className="font-mono text-sm tracking-wider uppercase font-semibold">Intelligence Hub</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display tracking-tight text-white">Lead Flow</h1>
          <p className="text-gray-400 mt-2 font-mono text-xs flex items-center gap-2">
            <RefreshCw size={12} className="text-orange-500" />
            July Meta Ads chat leads & lead intelligence · Last Update: {lastUpdatedText}
          </p>
        </div>

        {/* Date Filter & Control Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#111] border border-[#333] rounded-lg px-3 py-2">
            <Calendar size={14} className="text-orange-500" />
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="2026-07" className="bg-[#111]">July 2026</option>
              <option value="2026-06" className="bg-[#111]">June 2026</option>
              <option value="all" className="bg-[#111]">All Months</option>
            </select>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all shadow-[0_0_15px_rgba(249,115,22,0.25)] hover:scale-[1.02]"
          >
            <Plus size={16} />
            <span>Add Lead</span>
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          KPI SUMMARY CARDS GRID
         ═══════════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Total Leads */}
        <div className="bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-xl p-4 flex items-center gap-3.5 hover:border-orange-500/20 transition-colors">
          <div className="p-3 bg-orange-500/10 rounded-lg shrink-0">
            <Users size={20} className="text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">Total Leads</p>
            <p className="text-xl md:text-2xl font-mono font-bold text-white mt-0.5">{kpis.total}</p>
            <p className="text-[10px] text-gray-600 font-mono mt-0.5">chats initialized</p>
          </div>
        </div>

        {/* Card 2: Chatted / Replied */}
        <div className="bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-xl p-4 flex items-center gap-3.5 hover:border-blue-500/20 transition-colors">
          <div className="p-3 bg-blue-500/10 rounded-lg shrink-0">
            <MessageSquare size={20} className="text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">Chatted</p>
            <p className="text-xl md:text-2xl font-mono font-bold text-white mt-0.5">{kpis.replied}</p>
            <p className="text-[10px] text-blue-400/70 font-mono mt-0.5">Reply Rate: {kpis.replyRate}%</p>
          </div>
        </div>

        {/* Card 3: Qualified / Booked */}
        <div className="bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-xl p-4 flex items-center gap-3.5 hover:border-purple-500/20 transition-colors">
          <div className="p-3 bg-purple-500/10 rounded-lg shrink-0">
            <Target size={20} className="text-purple-400" />
          </div>
          <div>
            <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">Qualified / Booked</p>
            <p className="text-xl md:text-2xl font-mono font-bold text-white mt-0.5">
              {kpis.qualified} <span className="text-xs font-normal text-gray-500">/ {kpis.booked}</span>
            </p>
            <p className="text-[10px] text-purple-400/70 font-mono mt-0.5">Progressing leads</p>
          </div>
        </div>

        {/* Card 4: Won / Close Rate */}
        <div className="bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-xl p-4 flex items-center gap-3.5 hover:border-emerald-500/20 transition-colors">
          <div className="p-3 bg-emerald-500/10 rounded-lg shrink-0">
            <TrendingUp size={20} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">Won Deals</p>
            <p className="text-xl md:text-2xl font-mono font-bold text-white mt-0.5">{kpis.won}</p>
            <p className="text-[10px] text-emerald-400/70 font-mono mt-0.5">Close Rate: {kpis.closeRate}%</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          OPERATIONAL INSIGHTS & CREATIVE PANEL
         ═══════════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Marketing Analytics */}
        <div className="lg:col-span-2 bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Sparkles size={16} className="text-orange-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">July Meta Ads Insights</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#1c120b]/30 border border-[#3a2416]/50 rounded-lg p-3.5">
              <p className="text-[11px] font-mono text-orange-400/80 uppercase tracking-wider">Best Campaign</p>
              <p className="text-sm font-semibold text-white mt-1.5 flex items-center gap-2">
                <Megaphone size={14} className="text-orange-500 shrink-0" />
                {insights.bestCampaign}
              </p>
              <p className="text-[10px] text-gray-500 mt-1 font-mono">Driving most won conversions</p>
            </div>

            <div className="bg-[#131b17]/30 border border-[#1b2f24]/50 rounded-lg p-3.5">
              <p className="text-[11px] font-mono text-emerald-400/80 uppercase tracking-wider">Best Converting Niche</p>
              <p className="text-sm font-semibold text-white mt-1.5 flex items-center gap-2">
                <Target size={14} className="text-emerald-400 shrink-0" />
                {insights.bestNiche}
              </p>
              <p className="text-[10px] text-gray-500 mt-1 font-mono">Highest closing ratio</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Leads Likely to Close */}
            <div className="border border-white/5 bg-[#111]/30 rounded-lg p-3">
              <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Likely to Close</p>
              <p className="text-xl font-mono font-bold text-yellow-400 mt-1">{insights.likelyToCloseCount} leads</p>
              <p className="text-[9px] text-gray-500 mt-0.5">interested / proposal</p>
            </div>

            {/* Need Follow Up today */}
            <div className="border border-white/5 bg-[#111]/30 rounded-lg p-3">
              <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Follow Up Today</p>
              <p className="text-xl font-mono font-bold mt-1 text-orange-400">
                {insights.followUpTodayCount} leads
              </p>
              <p className="text-[9px] text-gray-500 mt-0.5">scheduled follow-ups</p>
            </div>

            {/* Objection Rate */}
            <div className="border border-white/5 bg-[#111]/30 rounded-lg p-3">
              <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Objection Flag</p>
              <p className="text-xl font-mono font-bold text-red-400 mt-1">{insights.objectionCount} leads</p>
              <p className="text-[9px] text-gray-500 mt-0.5">budget/price mentioned</p>
            </div>
          </div>

          {/* Objections List */}
          {insights.objectionList.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 space-y-2">
              <p className="text-[10px] font-mono text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={12} />
                Recent Objections & Flags:
              </p>
              <div className="divide-y divide-red-500/10">
                {insights.objectionList.map((l) => (
                  <div key={`obj-${l.id}`} className="py-1.5 text-xs text-gray-300 first:pt-0 last:pb-0">
                    <span className="font-semibold text-white">{l.leadName}</span>:{" "}
                    <span className="italic">"{l.notes.substring(0, 100)}..."</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ad Angle & Messaging Notes */}
        <div className="bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-xl p-5 flex flex-col h-full space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-orange-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Ad Angle & Creative Notes</h2>
            </div>
            <span className="text-[9px] font-mono text-orange-500/80 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
              Autosave
            </span>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            Record details about what ad copy, images, or hooks are generating high value chats for July performance evaluation.
          </p>

          <textarea
            value={adIntel}
            onChange={handleIntelChange}
            placeholder="Paste hook angles, copy variations, or general insights that seem to convert chatted leads into qualified leads..."
            className="flex-1 w-full bg-[#0a0a0a] border border-[#222] rounded-lg p-3 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 resize-none font-mono min-h-[160px] lg:min-h-0"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FILTERS & TOOLBAR
         ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#111]/30 border border-white/5 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, campaign, ad name, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0d0d0d] border border-white/5 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-orange-500/40 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status */}
          <div className="flex items-center gap-1.5 bg-[#0d0d0d] border border-white/5 rounded-lg px-2.5 py-1.5">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#111]">All Statuses</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#111]">{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Niche */}
          <div className="flex items-center gap-1.5 bg-[#0d0d0d] border border-white/5 rounded-lg px-2.5 py-1.5">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Niche:</span>
            <select
              value={nicheFilter}
              onChange={(e) => setNicheFilter(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer max-w-[140px]"
            >
              <option value="all" className="bg-[#111]">All Niches</option>
              {DEFAULT_NICHES.map((n) => (
                <option key={n.id} value={n.label} className="bg-[#111]">{n.label}</option>
              ))}
            </select>
          </div>

          {/* Campaign */}
          <div className="flex items-center gap-1.5 bg-[#0d0d0d] border border-white/5 rounded-lg px-2.5 py-1.5">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Campaign:</span>
            <select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer max-w-[140px]"
            >
              <option value="all" className="bg-[#111]">All Campaigns</option>
              {campaignOptions.map((c) => (
                <option key={c} value={c} className="bg-[#111]">{c}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(statusFilter !== 'all' || nicheFilter !== 'all' || campaignFilter !== 'all' || searchTerm !== '') && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setNicheFilter('all');
                setCampaignFilter('all');
                setSearchTerm('');
              }}
              className="text-xs text-orange-400 hover:text-orange-300 underline font-mono cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          LEAD BOARD / TABLE VIEW
         ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/5 text-[11px] text-gray-400 uppercase tracking-wider font-mono">
                <th className="p-4 pl-5">Date</th>
                <th className="p-4">Lead Name</th>
                <th className="p-4">Niche / Industry</th>
                <th className="p-4">Campaign Info</th>
                <th className="p-4 text-center">Replies</th>
                <th className="p-4">Pipeline Status</th>
                <th className="p-4">Deal Value</th>
                <th className="p-4">Notes & Objections</th>
                <th className="p-4 text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
                      <div className="p-4 bg-orange-500/5 rounded-full border border-orange-500/10 text-orange-500/50">
                        <MessageSquare size={36} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">No Lead Flow Logged</h3>
                        <p className="text-gray-500 mt-1 font-mono text-[11px] leading-relaxed">
                          This board stores leads from Meta Ads campaigns that started chatting on Messenger/Instagram DM. Track their pipeline conversion here for ad creative intelligence.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleOpenModal()}
                          className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-2 text-xs font-semibold transition-colors"
                        >
                          Create First Lead
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const statusOpt = STATUS_OPTIONS.find((s) => s.value === lead.status);
                  const isFollowUpToday = lead.nextFollowUp && lead.nextFollowUp.split('T')[0] === new Date().toISOString().split('T')[0] && !['won', 'lost', 'archived'].includes(lead.status);

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-white/5 transition-colors group ${
                        isFollowUpToday ? 'bg-orange-500/[0.02]' : ''
                      }`}
                    >
                      {/* Date */}
                      <td className="p-4 pl-5 font-mono text-gray-500">
                        {lead.date}
                      </td>

                      {/* Lead Name */}
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-white text-[13px]">{lead.leadName}</p>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">PIC: {lead.owner || 'Well'}</p>
                        </div>
                      </td>

                      {/* Niche */}
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5 text-[10px] font-mono">
                          {lead.niche}
                        </span>
                      </td>

                      {/* Campaign / Ad */}
                      <td className="p-4 max-w-[200px]">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-gray-300 truncate" title={lead.sourceCampaign}>
                            {lead.sourceCampaign}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate" title={`${lead.adSet} / ${lead.adName}`}>
                            {lead.adSet || 'Unknown Ad Set'} · <span className="italic text-gray-600">{lead.adName || 'Ad'}</span>
                          </p>
                        </div>
                      </td>

                      {/* Replies */}
                      <td className="p-4 text-center">
                        <span className="font-mono bg-white/5 border border-white/5 text-white font-bold rounded px-2 py-1">
                          {lead.replyCount}
                        </span>
                      </td>

                      {/* Pipeline Status */}
                      <td className="p-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusOpt?.color || ''}`}>
                          {statusOpt?.label || lead.status}
                        </span>
                      </td>

                      {/* Deal Value */}
                      <td className="p-4 font-mono font-semibold text-emerald-400">
                        {formatIDR(lead.dealValue)}
                      </td>

                      {/* Notes / Objection & Follow up */}
                      <td className="p-4 max-w-[300px]">
                        <div className="space-y-1.5">
                          <p className="text-gray-400 line-clamp-2" title={lead.notes}>
                            {lead.notes || 'No notes logged.'}
                          </p>
                          {lead.nextFollowUp && (
                            <p className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border ${
                              isFollowUpToday
                                ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 animate-pulse'
                                : 'bg-blue-500/5 text-blue-400 border-blue-500/10'
                            }`}>
                              <Clock size={10} />
                              Follow up: {lead.nextFollowUp.replace('T', ' ')}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right pr-5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenModal(lead)}
                            className="p-1.5 text-gray-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"
                            title="Edit Lead"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer database utils */}
        {leads.length > 0 && (
          <div className="p-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-500">
              Showing {filteredLeads.length} of {leads.length} leads logged
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClearAll}
                className="text-[10px] font-mono text-red-500/70 hover:text-red-400 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════
          ADD / EDIT LEAD FLOW MODAL DIALOG
         ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.35 }}
              className="relative w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02]">
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                    {editingLead ? 'Edit Lead Flow Details' : 'Track New Meta Lead'}
                  </h3>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                    Save data to calculate July ad and conversion intelligence
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Lead Name */}
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">
                      Lead / Client Name <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.leadName}
                      onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                      placeholder="e.g. Bali Eco Resort"
                      className="w-full bg-[#151515] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* Niche */}
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">
                      Niche / Industry
                    </label>
                    <select
                      value={formData.niche}
                      onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                      className="w-full bg-[#151515] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      {DEFAULT_NICHES.map((n) => (
                        <option key={n.id} value={n.label}>
                          {n.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Date */}
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">
                      Initial Chat Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-[#151515] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>

                  {/* Deal Value */}
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">
                      Potential Value (IDR)
                    </label>
                    <input
                      type="number"
                      value={formData.dealValue}
                      onChange={(e) => setFormData({ ...formData, dealValue: Number(e.target.value) })}
                      className="w-full bg-[#151515] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>

                  {/* PIC / Owner */}
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">
                      PIC / Owner
                    </label>
                    <input
                      type="text"
                      value={formData.owner}
                      onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                      className="w-full bg-[#151515] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <hr className="border-white/5" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Source Campaign */}
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">
                      Source Campaign
                    </label>
                    <input
                      type="text"
                      value={formData.sourceCampaign}
                      onChange={(e) => setFormData({ ...formData, sourceCampaign: e.target.value })}
                      placeholder="July_Bali_Villa_Promo"
                      className="w-full bg-[#151515] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>

                  {/* Ad Set */}
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">
                      Ad Set
                    </label>
                    <input
                      type="text"
                      value={formData.adSet}
                      onChange={(e) => setFormData({ ...formData, adSet: e.target.value })}
                      placeholder="Lookalike_Bali_Villas"
                      className="w-full bg-[#151515] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>

                  {/* Ad Name */}
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">
                      Ad Name
                    </label>
                    <input
                      type="text"
                      value={formData.adName}
                      onChange={(e) => setFormData({ ...formData, adName: e.target.value })}
                      placeholder="Video_Tour_Villa_Kayu"
                      className="w-full bg-[#151515] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                </div>

                <hr className="border-white/5" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Pipeline Status */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">
                      Pipeline Status
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, status: opt.value as LeadFlowItem['status'] })}
                          className={`px-2 py-1.5 text-[10px] font-semibold border rounded-lg transition-all ${
                            formData.status === opt.value
                              ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 ring-1 ring-orange-500/20'
                              : 'bg-transparent text-gray-500 border-white/5 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reply count */}
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">
                      Reply Count (Chats exchanged)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.replyCount}
                      onChange={(e) => setFormData({ ...formData, replyCount: Number(e.target.value) })}
                      className="w-full bg-[#151515] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                </div>

                {/* Next Follow Up */}
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">
                    Next Follow-up Reminder Schedule
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.nextFollowUp}
                    onChange={(e) => setFormData({ ...formData, nextFollowUp: e.target.value })}
                    className="w-full bg-[#151515] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                {/* Notes & Objections */}
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">
                    Notes, Objections, & Conversion Details
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Customer objected about pricing, budget Rp 1.5M. Follow up Tuesday."
                    className="w-full bg-[#151515] border border-white/5 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-white/5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-xs font-semibold text-white transition-colors"
                  >
                    {editingLead ? 'Save Changes' : 'Log Lead'}
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
