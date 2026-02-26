import React, { useState } from 'react';
import { Search, Filter, Info, Flame, Circle, ArrowRight, Users, Plus, Edit2, Trash2, X } from 'lucide-react';

const initialLeadsData = [
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
  const [leads, setLeads] = useState(initialLeadsData);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    niche: '',
    location: '',
    priority: 'High',
    status: 'Belum Dihubungi',
    action: '',
    notes: ''
  });

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.niche.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (lead?: typeof initialLeadsData[0]) => {
    if (lead) {
      setEditingId(lead.id);
      setFormData({
        name: lead.name,
        niche: lead.niche,
        location: lead.location,
        priority: lead.priority,
        status: lead.status,
        action: lead.action,
        notes: lead.notes
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        niche: '',
        location: '',
        priority: 'High',
        status: 'Belum Dihubungi',
        action: '',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      // Update existing
      setLeads(leads.map(l => l.id === editingId ? { ...formData, id: editingId } : l));
    } else {
      // Create new
      const newId = leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 1;
      setLeads([{ ...formData, id: newId }, ...leads]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Hapus prospek ini dari database?')) {
      setLeads(leads.filter(l => l.id !== id));
    }
  };

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
            Kelola prospek Anda. Jangan cuma didata, tapi dieksekusi.
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
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 font-mono text-sm">
                    Tidak ada prospek ditemukan.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
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
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        lead.status === 'Follow Up' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        lead.status === 'Belum Dihubungi' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        lead.status === 'Dihubungi' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        lead.status === 'Deal' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-[#333] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-[#222]">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Edit Prospek' : 'Tambah Prospek Baru'}
              </h2>
              <button 
                onClick={handleCloseModal} 
                className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-[#222]"
              >
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
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors" 
                    placeholder="Contoh: Villa Asvara"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Niche</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.niche} 
                    onChange={e => setFormData({...formData, niche: e.target.value})} 
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors" 
                    placeholder="Contoh: Villa, Salon, Gym" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Lokasi</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.location} 
                    onChange={e => setFormData({...formData, location: e.target.value})} 
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors" 
                    placeholder="Contoh: Bali, Jakarta"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Prioritas</label>
                  <select 
                    value={formData.priority} 
                    onChange={e => setFormData({...formData, priority: e.target.value})} 
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
                    onChange={e => setFormData({...formData, status: e.target.value})} 
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
                    onChange={e => setFormData({...formData, action: e.target.value})} 
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors" 
                    placeholder="Contoh: DM IG, Kirim Proposal" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Catatan Strategis</label>
                <textarea 
                  value={formData.notes} 
                  onChange={e => setFormData({...formData, notes: e.target.value})} 
                  rows={3} 
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors resize-none" 
                  placeholder="Pain points klien, angle penawaran, atau info kontak..."
                ></textarea>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-[#222]">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
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
          </div>
        </div>
      )}
    </div>
  );
}
