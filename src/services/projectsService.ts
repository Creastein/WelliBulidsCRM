import { supabase } from '../lib/supabase';

export interface ProjectAddon {
  name: string;
  price: number;
}

export interface CompletedProject {
  id: string;
  rowCode: string;
  name: string;
  domain: string;
  url: string;
  clientName: string;
  clientContact?: string;
  location: string;
  category: 'Villa' | 'Tour & Activity' | 'Resort & Bungalow' | 'Homestay & Kos' | 'Website Optimization' | string;
  price: number;
  invoiceDate?: string;
  invoiceNumber?: string;
  packageType: string;
  description: string;
  features: string[];
  addons?: ProjectAddon[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const INITIAL_COMPLETED_PROJECTS: CompletedProject[] = [
  {
    id: 'proj-1',
    rowCode: '01',
    name: 'Dea Haven Villas',
    domain: 'deahavenvillas.com',
    url: 'https://deahavenvillas.com',
    clientName: 'Bapak Andi Irfan Jaya',
    location: 'Bali',
    category: 'Villa',
    price: 2000000,
    invoiceDate: '6 Sep 2026',
    packageType: 'Paket Standar (Promo)',
    description: 'Website villa 1 halaman dengan direct booking WhatsApp, performa cepat, dan bilingual ID + EN.',
    features: ['1 Halaman Responsif', 'Direct Booking WA', 'Domain & Hosting', 'SEO Dasar', 'Bilingual ID + EN'],
    notes: 'Total Rp 2.000.000 (Lunas).'
  },
  {
    id: 'proj-2',
    rowCode: '02',
    name: 'Jumbo Gerupuk Surf Lessons',
    domain: 'surfjumbo.com',
    url: 'https://surfjumbo.com',
    clientName: 'Pak Jumbo',
    location: 'Gerupuk, Lombok',
    category: 'Tour & Activity',
    price: 2000000,
    invoiceDate: '25 Agu 2026',
    invoiceNumber: 'WLB/INV/2026/0825-JG',
    packageType: 'Website Surfing (Wisman)',
    description: 'Landing page full English untuk instruktur surfing lokal dengan katalog surf lesson, boat ride, & rental.',
    features: ['Landing Page Full English', 'Katalog Layanan', 'Domain .com', 'Hosting', 'Google Business Profile'],
    notes: 'Total deal Rp 2.000.000 (Lunas).'
  },
  {
    id: 'proj-3',
    rowCode: '03',
    name: 'Homy Home Bali Tour',
    domain: 'homyhomebalitour.com',
    url: 'https://homyhomebalitour.com',
    clientName: 'Wayan Sudarma (Owner)',
    location: 'Bali',
    category: 'Tour & Activity',
    price: 1500000,
    invoiceDate: '10 Agu 2026',
    invoiceNumber: 'WLB/INV/2026/0810-HH',
    packageType: 'Website Tour Driver Bali',
    description: 'Landing page driver wisata Bali dengan katalog paket tour, sewa mobil, dan integrasi WhatsApp booking.',
    features: ['Katalog Paket Tour', 'Galeri Destinasi', 'Kalkulator Sewa Mobil', 'Direct WhatsApp', 'Multibahasa EN/ID'],
    notes: 'Total deal Rp 1.500.000 (Lunas).'
  },
  {
    id: 'proj-4',
    rowCode: '04',
    name: 'Benoa Snorkeling Tour',
    domain: 'benoasnorkeling.com',
    url: 'https://benoasnorkeling.com',
    clientName: 'Pak Ketut',
    location: 'Tanjung Benoa, Bali',
    category: 'Tour & Activity',
    price: 2000000,
    invoiceDate: '1 Agu 2026',
    invoiceNumber: 'WLB/INV/2026/0801-BS',
    packageType: 'Website Water Sport Bali',
    description: 'Landing page water sport Tanjung Benoa dengan katalog paket snorkeling, sea walker, dan direct booking.',
    features: ['Paket Watersport', 'Direct WhatsApp Booking', 'Domain .com', 'Hosting Cepat', 'SEO Google Maps'],
    notes: 'Total deal Rp 2.000.000 (Lunas).'
  },
  {
    id: 'proj-5',
    rowCode: '05',
    name: 'Blue Lagoon Snorkeling Padangbai',
    domain: 'bluelagoonsnorkelingpadangbai.com',
    url: 'https://bluelagoonsnorkelingpadangbai.com',
    clientName: 'Pak Komang',
    location: 'Padangbai, Bali',
    category: 'Tour & Activity',
    price: 2000000,
    invoiceDate: '20 Jul 2026',
    invoiceNumber: 'WLB/INV/2026/0720-BL',
    packageType: 'Website Snorkeling Padangbai',
    description: 'Landing page snorkeling Blue Lagoon & Tanjung Jepun dengan pricelist, fasilitas, dan direct booking.',
    features: ['Pricelist Paket Snorkeling', 'Direct WA Booking', 'Domain .com', 'Fast Hosting', 'Integrasi Google Maps'],
    notes: 'Total deal Rp 2.000.000 (Lunas).'
  },
  {
    id: 'proj-6',
    rowCode: '06',
    name: 'Manta Snorkeling Nusa Penida',
    domain: 'mantasnorkelingnusapenida.com',
    url: 'https://mantasnorkelingnusapenida.com',
    clientName: 'Pak Made',
    location: 'Nusa Penida, Bali',
    category: 'Tour & Activity',
    price: 2000000,
    invoiceDate: '15 Jul 2026',
    invoiceNumber: 'WLB/INV/2026/0715-MN',
    packageType: 'Website Tour Nusa Penida',
    description: 'Landing page spesialis tour snorkeling Manta Bay & Crystal Bay dengan integrasi WhatsApp langsung.',
    features: ['Katalog 4 Spot Snorkeling', 'Pricelist Transparan', 'Domain .com', 'Hosting', 'Mobile Optimized'],
    notes: 'Total deal Rp 2.000.000 (Lunas).'
  },
  {
    id: 'proj-7',
    rowCode: '07',
    name: 'Rumah Cantik Guest House Jogja',
    domain: 'rumahcantikguesthouse.com',
    url: 'https://rumahcantikguesthouse.com',
    clientName: 'Ibu Ratna',
    location: 'Yogyakarta',
    category: 'Homestay & Kos',
    price: 1550000,
    invoiceDate: '9 Jul 2026',
    packageType: 'Paket Standard Promo',
    description: 'Website profil guest house dengan showcase kamar, fasilitas, Google Maps, dan reservasi WA.',
    features: ['Landing Page Modern', 'Galeri Foto Kamar', 'Tombol WhatsApp', 'Domain & Hosting', 'Google Maps'],
    notes: 'Total Rp 1.550.000 (Lunas).'
  },
  {
    id: 'proj-8',
    rowCode: '08',
    name: 'Grha Vege Jawi Syariah',
    domain: 'grhavegejawi.com',
    url: 'https://grhavegejawi.com',
    clientName: 'Ibu Agnes',
    location: 'Yogyakarta',
    category: 'Homestay & Kos',
    price: 2000000,
    invoiceDate: '4 Sep 2026',
    invoiceNumber: 'WB/2026/09-AGNESIA',
    packageType: 'Paket Kos Eksklusif',
    description: 'Website kos eksklusif syariah 6 kamar AC di Jogja dengan galeri fasilitas dan kontak WA pengelola.',
    features: ['Website 1 Halaman', 'Galeri Foto Fasilitas', 'WhatsApp Booking', 'Domain & Hosting', 'Google Maps'],
    notes: 'Total Rp 2.000.000 (Lunas).'
  },
  {
    id: 'proj-9',
    rowCode: '09',
    name: 'Floating Paradise Karimunjawa',
    domain: 'floatingparadise.id',
    url: 'https://floatingparadise.id',
    clientName: 'Management Floating Paradise',
    location: 'Karimunjawa, Jateng',
    category: 'Resort & Bungalow',
    price: 5750000,
    invoiceDate: '2026',
    packageType: 'Next.js + Sanity Headless CMS',
    description: 'Migrasi WordPress ke Next.js modern, Sanity CMS 6 halaman, dan integrasi engine Tripla booking.',
    features: ['Next.js + Sanity CMS', '6 Halaman Arsitektur', 'Kelola Konten Mandiri', 'Tripla Booking Engine', 'Advanced SEO'],
    notes: 'Total Rp 5.750.000 (Lunas).'
  },
  {
    id: 'proj-10',
    rowCode: '10',
    name: 'The Secret Karimunjawa',
    domain: 'thesecretkarimunjawa.com',
    url: 'https://thesecretkarimunjawa.com',
    clientName: 'The Secret Team',
    location: 'Karimunjawa, Jateng',
    category: 'Villa',
    price: 4250000,
    invoiceDate: '19 Mar 2026',
    invoiceNumber: 'INV-2026-002',
    packageType: 'Custom 11 Section + 4 Bahasa',
    description: 'Website villa overwater sunset di Karimunjawa dengan desain custom, Google Analytics 4, dan 4 bahasa.',
    features: ['Custom 11 Section', 'Hosting Vercel & Domain', 'Direct Booking WA', 'Google Analytics 4', '4 Bahasa Ekstra'],
    addons: [
      { name: 'Addon 4 Bahasa Internasional', price: 600000 },
      { name: 'Setup GA4 Sitewide', price: 150000 }
    ],
    notes: 'Total Rp 4.250.000 (Lunas).'
  },
  {
    id: 'proj-11',
    rowCode: '11',
    name: 'Green Paddy Hostel Ubud',
    domain: 'greenpaddyhostelubud.com',
    url: 'https://www.greenpaddyhostelubud.com',
    clientName: 'Green Paddy Hostel',
    location: 'Ubud, Bali',
    category: 'Website Optimization',
    price: 350000,
    invoiceDate: '23 Agu 2026',
    invoiceNumber: 'WB/2026/08-GREENPADDY',
    packageType: 'PageSpeed & CWV Optimization',
    description: 'Optimasi performa WordPress Green Paddy Hostel Ubud untuk skor Core Web Vitals dan loading kilat.',
    features: ['Caching Server', 'Optimasi WebP', 'CSS/JS Defer Minify', 'Skor Desktop 90+'],
    notes: 'Total Rp 350.000 (Lunas).'
  }
];

const LOCAL_STORAGE_KEY = 'wellibuilds_completed_projects';

function getLocalProjects(): CompletedProject[] {
  if (typeof window === 'undefined') return INITIAL_COMPLETED_PROJECTS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading local projects:', err);
  }
  return INITIAL_COMPLETED_PROJECTS;
}

function saveLocalProjects(projects: CompletedProject[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Error saving local projects:', err);
  }
}

function notifyProjectsChanged(projects: CompletedProject[]) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('wb:projects-updated', { detail: projects }));
  }
}

function mapRowToProject(row: any): CompletedProject {
  return {
    id: String(row.id),
    rowCode: row.row_code || '',
    name: row.name || '',
    domain: row.domain || '',
    url: row.url || (row.domain ? `https://${row.domain}` : ''),
    clientName: row.client_name || '',
    clientContact: row.client_contact || '',
    location: row.location || '',
    category: row.category || 'Villa',
    price: Number(row.price || 0),
    invoiceDate: row.invoice_date || '',
    invoiceNumber: row.invoice_number || '',
    packageType: row.package_type || '',
    description: row.description || '',
    features: Array.isArray(row.features) ? row.features : [],
    addons: Array.isArray(row.addons) ? row.addons : [],
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProjectToRow(project: Partial<CompletedProject>) {
  return {
    id: project.id,
    row_code: project.rowCode,
    name: project.name,
    domain: project.domain,
    url: project.url,
    client_name: project.clientName,
    client_contact: project.clientContact,
    location: project.location,
    category: project.category,
    price: project.price,
    invoice_date: project.invoiceDate,
    invoice_number: project.invoiceNumber,
    package_type: project.packageType,
    description: project.description,
    features: project.features,
    addons: project.addons,
    notes: project.notes,
    updated_at: new Date().toISOString(),
  };
}

export async function fetchProjects(): Promise<CompletedProject[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('row_code', { ascending: true });

    if (error) {
      // If table doesn't exist yet or Supabase offline, fallback to local storage
      console.info('[ProjectsService] Supabase query notice, falling back to local data:', error.message);
      return getLocalProjects();
    }

    if (data && data.length > 0) {
      const mapped = data.map(mapRowToProject);
      saveLocalProjects(mapped);
      return mapped;
    }

    // If Supabase table is empty, initialize with default projects
    return getLocalProjects();
  } catch (err) {
    console.error('[ProjectsService] Failed to fetch projects from Supabase:', err);
    return getLocalProjects();
  }
}

export async function createProject(project: Omit<CompletedProject, 'id'> & { id?: string }): Promise<CompletedProject> {
  const newId = project.id || `proj-${Date.now()}`;
  const completeProject: CompletedProject = {
    ...project,
    id: newId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Update local storage first for instant feedback
  const localList = getLocalProjects();
  const updatedList = [completeProject, ...localList];
  saveLocalProjects(updatedList);
  notifyProjectsChanged(updatedList);

  // 2. Persist to Supabase in background
  try {
    const row = mapProjectToRow(completeProject);
    const { data, error } = await supabase
      .from('projects')
      .insert([row])
      .select()
      .single();

    if (error) {
      console.warn('[ProjectsService] Could not insert to Supabase table (saved locally):', error.message);
      return completeProject;
    }
    return mapRowToProject(data);
  } catch (err) {
    console.warn('[ProjectsService] Supabase insert failed, kept locally:', err);
    return completeProject;
  }
}

export async function updateProject(id: string, updates: Partial<CompletedProject>): Promise<void> {
  // 1. Update local storage
  const localList = getLocalProjects();
  const updatedList = localList.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
  saveLocalProjects(updatedList);
  notifyProjectsChanged(updatedList);

  // 2. Update Supabase
  try {
    const row = mapProjectToRow(updates);
    delete (row as any).id; // don't update ID
    const { error } = await supabase
      .from('projects')
      .update(row)
      .eq('id', id);

    if (error) {
      console.warn('[ProjectsService] Supabase update warning:', error.message);
    }
  } catch (err) {
    console.warn('[ProjectsService] Supabase update error:', err);
  }
}

export async function deleteProject(id: string): Promise<void> {
  // 1. Update local storage
  const localList = getLocalProjects();
  const updatedList = localList.filter((p) => p.id !== id);
  saveLocalProjects(updatedList);
  notifyProjectsChanged(updatedList);

  // 2. Delete from Supabase
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('[ProjectsService] Supabase delete warning:', error.message);
    }
  } catch (err) {
    console.warn('[ProjectsService] Supabase delete error:', err);
  }
}
