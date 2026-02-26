import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, Info, Flame, Circle, CheckCircle2, ArrowRight, Users } from 'lucide-react';

const leadsData = [
  { id: 1, name: 'Asvara Villa Keliki', niche: 'Villa', location: 'Bali', priority: 'High', status: 'Belum Dihubungi', action: 'DM WA + Email', notes: 'Reviews terbanyak di Bali! Butuh website manajemen booking profesional' },
  { id: 2, name: 'La Bella Hotel Villa & Spa', niche: 'Villa', location: 'Gili T', priority: 'High', status: 'Follow Up', action: 'Sudah DM → Follow up', notes: '1.632 reviews! Villa + hotel + spa populer' },
  { id: 3, name: 'Villa Carmela Batu', niche: 'Villa', location: 'Batu', priority: 'Medium', status: 'Belum Dihubungi', action: 'WA owner langsung', notes: 'Villa keluarga paling populer di Batu Malang, 440 reviews' },
  { id: 4, name: 'Ratu Makeup & Beauty', niche: 'Salon', location: 'Mataram', priority: 'High', status: 'Belum Dihubungi', action: 'DM IG + WA', notes: 'Rating sempurna, tawarkan sistem galeri makeup premium' },
  { id: 5, name: 'Jelajah Coffee Kuta', niche: 'Cafe', location: 'Bali', priority: 'Medium', status: 'Follow Up', action: 'Follow up 7 hari', notes: 'Hanya pakai IG; info menu & lokasi tersebar, tidak ada landing page' },
  { id: 6, name: 'Casabelle Villa Uluwatu', niche: 'Villa', location: 'Bali', priority: 'High', status: 'Dihubungi', action: 'Tunggu balasan', notes: 'Klien ini tidak akan peduli dengan harga website Rp 1,5 juta. Komisi OTA (20%) itu sekitar Rp 1,7 Juta PER MALAM.' },
  { id: 7, name: 'Fitness Plus Epicentrum', niche: 'Gym', location: 'Mataram', priority: 'High', status: 'Belum Dihubungi', action: 'DM WA', notes: 'Tawarkan fitur tur virtual 360° untuk menjaring member baru' },
  { id: 8, name: 'Roemah Langko', niche: 'Restoran', location: 'Mataram', priority: 'High', status: 'Belum Dihubungi', action: 'Email + WA', notes: 'Restoran populer, website menu & reservasi, targetkan fitur turis' },
  { id: 9, name: 'Sugar Bloom Atelier', niche: 'Cafe', location: 'BSD', priority: 'Medium', status: 'Follow Up', action: 'WA', notes: 'Branding kuat tapi conversion bisa lebih baik' },
  { id: 10, name: 'Ubud Arindra Private Pool', niche: 'Villa', location: 'Bali', priority: 'High', status: 'Follow Up', action: 'Follow up WA', notes: 'Belum ada website, butuh honeymoon package + booking' },
];

export default function CRM() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLeads = leadsData.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.niche.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#222]">
        <div>
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <Users size={20} />
            <span className="font-mono text-sm tracking-wider uppercase font-semibold">Database</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            CRM & Leads
          </h1>
          <p className="text-gray-400 mt-2 font-mono text-sm">
            Gabungan Prospek Villa, Multi-Niche, dan Outreach Tracker
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Cari prospek..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#111] border border-[#333] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors w-64"
            />
          </div>
          <button className="flex items-center gap-2 bg-[#111] border border-[#333] hover:border-[#555] rounded-lg px-4 py-2 text-sm text-white transition-colors">
            <Filter size={16} />
            <span>Filter</span>
          </button>
        </div>
      </header>

      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222] bg-[#1a1a1a]">
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nama Bisnis</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Niche</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Prioritas</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#1a1a1a] transition-colors group">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-200">{lead.name}</p>
                      <p className="text-xs text-gray-500 font-mono mt-1">{lead.location}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-mono px-2 py-1 rounded bg-[#222] text-gray-400 border border-[#333]">
                      {lead.niche}
                    </span>
                  </td>
                  <td className="p-4">
                    {lead.priority === 'High' ? (
                      <div className="flex items-center gap-1.5 text-orange-500">
                        <Flame size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Tinggi</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-yellow-500">
                        <Circle size={12} fill="currentColor" />
                        <span className="text-xs font-bold uppercase tracking-wider">Sedang</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      lead.status === 'Follow Up' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      lead.status === 'Belum Dihubungi' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                      lead.status === 'Dihubungi' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
                      <ArrowRight size={14} className="text-orange-500" />
                      {lead.action}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="relative inline-block group/tooltip">
                      <button className="p-1.5 text-gray-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors">
                        <Info size={18} />
                      </button>
                      <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-[#222] border border-[#333] text-xs text-gray-300 rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10">
                        {lead.notes}
                        <div className="absolute -bottom-1 right-3 w-2 h-2 bg-[#222] border-b border-r border-[#333] rotate-45"></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
