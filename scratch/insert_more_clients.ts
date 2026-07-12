import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local to get Greg's agent token
const envPath = '.env.local';
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    env[match[1]] = val;
  }
});

const agentToken = env['GREG_AGENT_TOKEN'];
if (!agentToken) {
  console.error('GREG_AGENT_TOKEN not found in .env.local');
  process.exit(1);
}

const apiEndpoint = 'http://localhost:3000/api/agent/leads';

interface ClientPayload {
  businessName: string;
  name?: string;
  category?: string;
  location?: string;
  whatsapp?: string;
  website?: string;
  status?: string;
  painPoint?: string;
  offerFit?: string;
  notes?: string;
  score?: number;
  assignedTo?: string;
}

const newLeads: ClientPayload[] = [
  {
    businessName: 'Villa +62 812-3933-009',
    category: 'villa',
    location: '',
    whatsapp: '+628123933009',
    status: 'qualified',
    painPoint: 'Mengelola 35 villa dengan 1 website existing. Tertarik direct booking untuk mengurangi porsi komisi OTA.',
    offerFit: 'Website booking langsung (uji coba pilot 1 villa)',
    notes: 'Mengelola sekitar 35 villa. Ingin uji coba direct booking untuk 1 villa dulu. Jika berhasil, unit lain akan menyusul. Sudah dijadwalkan GMeet siang hari (ditunda karena main padel). Menunggu konfirmasi waktu.',
    score: 9,
    assignedTo: 'Greg',
  },
  {
    businessName: 'Sidomulyo Syariah',
    category: 'homestay',
    location: 'Pacitan',
    whatsapp: '+628123483570',
    status: 'negotiation',
    painPoint: 'Kontrak VHO RedDoorz 2 tahun, komisi mahal & tidak bisa kontrol harga. Kamar tabrakan jika offline penuh.',
    offerFit: 'Website direct booking (one-time fee Rp 3.750.000 untuk 22 kamar)',
    notes: 'Sidomulyo Syariah di Pacitan (22 kamar: 12 AC, 10 non-AC). RedDoorz potong komisi per booking. Welli menyarankan menyisihkan 4-6 kamar eksklusif di website direct booking untuk menghindari bentrok offline/online. Harga ditawarkan Rp 3.750.000. Client sedang review kontrak RedDoorz & berdiskusi dengan istri. Follow up dijadwalkan ~18 Juli.',
    score: 8,
    assignedTo: 'Greg',
  },
  {
    businessName: 'Villa +62 817-9666-777',
    category: 'villa',
    location: '',
    whatsapp: '+628179666777',
    status: 'new',
    painPoint: 'Tertarik dengan website booking langsung',
    notes: 'Halo, ini soal website villa saya. Welli membalas menanyakan lokasi & status web, belum direspon.',
    score: 5,
    assignedTo: 'Greg',
  },
  {
    businessName: 'Villa +62 821-1982-2272',
    category: 'villa',
    location: 'Bali',
    whatsapp: '+6282119822272',
    status: 'negotiation',
    painPoint: 'Punya villa 2BR, target tamu asing. Pasarkan lewat offline & OTA (komisi 15-18%). Rencana keluar dari OTA jika direct booking berjalan baik. Bertanya konversi mata uang otomatis.',
    offerFit: 'Pro Booking (Rp 3.500.000) atau Premium (Rp 6.500.000)',
    notes: 'Villa 2BR di Bali. Mayoritas tamu asing. Mau direct booking agar komisi 0%. Welli tawarkan GMeet singkat untuk demo standard/pro/premium.',
    score: 8,
    assignedTo: 'Greg',
  },
  {
    businessName: 'Villa +62 811-9721-888',
    category: 'villa',
    location: 'Bali',
    whatsapp: '+628119721888',
    status: 'new',
    painPoint: 'Menanyakan harga jasa website villa.',
    notes: 'Lokasi Bali. Menanyakan harga website. Welli menanyakan 5 detail kualifikasi (existing web, halaman, booking system, bilingual, domain), belum ada balasan.',
    score: 5,
    assignedTo: 'Greg',
  },
  {
    businessName: 'Villa Toraja',
    category: 'villa',
    location: 'Toraja',
    status: 'qualified',
    painPoint: '2 kamar, target mancanegara (bule). Saat ini 100% bergantung pada Booking.com (komisi 15-20%).',
    offerFit: 'Website booking langsung (Bilingual ID+EN)',
    notes: 'Lokasi Toraja, 2 kamar. Target tamu asing (bule). Distribusi booking masih 100% via Booking.com. Welli menawarkan GMeet untuk diskusi opsi, menunggu respon.',
    score: 7,
    assignedTo: 'Greg',
  },
  {
    name: 'Pak Freddy RUMAMBI',
    businessName: 'Rumah Freddy',
    website: 'https://www.rumahfreddy.com',
    category: 'villa',
    location: 'Jakarta',
    status: 'negotiation',
    painPoint: 'Ingin upgrade system booking dari web rumahfreddy.com. Butuh sistem kalender ketersediaan yang otomatis mengunci opsi Full Homestay jika salah satu kamar dipesan terpisah (Kamar Utama Lantai 2 vs Kamar Lantai 1).',
    offerFit: 'Custom Booking System (Promo Rp 1.500.000)',
    notes: 'Rumah Freddy (Jakarta). Kebutuhan upgrade booking system. Aturan khusus: kamar lantai 2 (utama) & lantai 1 bisa dipesan terpisah, namun jika salah satu dipesan, opsi Full Homestay terkunci. Dashboard untuk pantau kalender. Sudah GMeet. Penawaran promo Rp 1,5 juta dikirim. Client minta link contoh web (Welli kirim floatingparadise.id/en dengan penjelasan perbedaan sistem).',
    score: 8,
    assignedTo: 'Greg',
  },
  {
    businessName: 'Villa Group Portal (Multi-villa)',
    category: 'villa',
    status: 'new',
    painPoint: 'Ingin 1 website untuk beberapa villa dengan sistem booking langsung & payment.',
    notes: 'Ingin 1 website untuk beberapa villa. Menanyakan opsi booking via WA vs direct payment + availability calendar per villa. Welli menanyakan jumlah unit & lokasi, belum ada respon.',
    score: 5,
    assignedTo: 'Greg',
  },
  {
    businessName: 'Villa Management (4 Villa Bali + 1 Apart Makassar)',
    category: 'villa',
    location: 'Bali & Makassar',
    whatsapp: '+6282266216466',
    status: 'negotiation',
    painPoint: 'Memiliki 5 properti (4 villa di Bali + 1 apartemen di Makassar) yang saat ini berjalan via OTA. Ingin membuat 1 website management untuk menggandengkan web & OTA. Rencana pasang iklan Ads.',
    offerFit: 'Opsi A (Website Statis Rp 4.900.000) atau Opsi B (Website + Admin Panel Rp 8.000.000)',
    notes: '5 properti (4 villa Bali + 1 apartemen Makassar). Foto ready. Mau 1 web management untuk gandeng OTA. Welli tawarkan Opsi A (Statis Rp 4,9jt) dan Opsi B (Admin Panel Rp 8jt). Promo berlaku 3 hari setelah DP.',
    score: 8,
    assignedTo: 'Greg',
  },
  {
    businessName: 'Bungalow Lombok 5 Kamar',
    category: 'homestay',
    location: 'Lombok',
    status: 'qualified',
    painPoint: 'Bungalow 5 kamar, target mancanegara, website belum ada, booking via WA & OTA. Mau direct booking agar komisi berkurang.',
    offerFit: 'Website booking langsung (multilingual + payment gateway)',
    notes: 'Bungalow 5 kamar di Lombok. Target wisman. Booking via WA & OTA. Welli menyarankan payment gateway + multilingual, menawarkan call 15 menit.',
    score: 7,
    assignedTo: 'Greg',
  },
  {
    name: 'Paulus Sabata Bara',
    businessName: 'Aquarela Apartments',
    category: 'homestay',
    location: 'Pererenan, Bali',
    status: 'negotiation',
    painPoint: 'Apartemen 1 bangunan: 3 kamar tipe studio 1 kamar. Target turis asing. Properti masih konstruksi.',
    offerFit: 'Pro Booking (Rp 3.500.000) / Premium (Rp 6.500.000)',
    notes: 'Nama: Paulus Sabata Bara (Aquarela Apartments, Pererenan, Bali). 1 bangunan 3 kamar studio, target turis asing, masih konstruksi. Sudah setuju membuat website. Menunggu kabar selanjutnya untuk setup DP.',
    score: 9,
    assignedTo: 'Greg',
  },
  {
    name: 'Irfan Mochamad',
    businessName: 'Villa Irfan Mochamad',
    category: 'villa',
    whatsapp: '+6282146002397',
    status: 'new',
    painPoint: 'Tertarik membuat website villa.',
    notes: 'Irfan Mochamad. Halo, ini soal website villa saya (iklan Instagram). Welli membalas bertanya lokasi & status web, belum direspon.',
    score: 5,
    assignedTo: 'Greg',
  },
  {
    name: 'Lenni',
    businessName: 'Villa Lenni',
    category: 'villa',
    location: 'Belitung',
    whatsapp: '+6281316934203',
    status: 'new',
    painPoint: 'Tertarik membuat website villa.',
    notes: 'Lenni. Lokasi Belitung. Iklan Instagram. Welli membalas menanyakan status web existing, belum direspon.',
    score: 5,
    assignedTo: 'Greg',
  },
  {
    businessName: 'Villa +62 878-2128-1055',
    category: 'villa',
    whatsapp: '+6287821281055',
    status: 'new',
    painPoint: 'Tertarik membuat website villa.',
    notes: 'Halo, ini soal website villa saya. Welli membalas menanyakan status web existing, belum direspon. (Catatan: Input ganda di log nomor 14 & 15 telah digabung menjadi satu lead).',
    score: 5,
    assignedTo: 'Greg',
  },
  {
    businessName: 'Villa +62 818-354-414',
    category: 'villa',
    location: 'Bali',
    whatsapp: '+62818354414',
    status: 'qualified',
    painPoint: 'Tamu mayoritas turis asing. Saat ini ramai lewat Booking.com tapi komisi tinggi. Ingin pakai OTA dan website direct booking bersamaan.',
    offerFit: 'Website booking langsung (Bilingual ID+EN)',
    notes: 'Tamu turis asing. Lokasi Bali (https://maps.app.goo.gl/U9Y86A3xkoHqHXyb8). Komisi Booking.com tinggi. Ingin pakai OTA & Web bersamaan. Welli tawarkan GMeet, client akan hubungkan dengan timnya.',
    score: 8,
    assignedTo: 'Greg',
  },
  {
    name: 'Rafa management',
    businessName: 'Villa Rafa Management',
    category: 'villa',
    whatsapp: '+6281584067573',
    status: 'new',
    painPoint: 'Tertarik membuat website villa.',
    notes: 'Rafa management. Iklan Instagram. Welli membalas menanyakan lokasi & status web, belum direspon.',
    score: 5,
    assignedTo: 'Greg',
  },
  {
    name: 'Jo',
    businessName: 'Villa Jo',
    category: 'villa',
    whatsapp: '+6285216919947',
    status: 'new',
    painPoint: 'Meminta link portfolio website yang pernah dikerjakan.',
    notes: 'Jo. Iklan Instagram. Meminta link website portfolio yang pernah dibuat. Welli mengirimkan link portfolio (floatingparadise.id, thesecretkarimunjawa.com, subahu-villa1.vercel.app, datoya1.vercel.app).',
    score: 6,
    assignedTo: 'Greg',
  },
  {
    businessName: 'Villa +62 811-3992-267',
    category: 'villa',
    location: 'Bali',
    whatsapp: '+628113992267',
    status: 'negotiation',
    painPoint: '2 unit 2 bedroom villa. Pemasaran lewat Airbnb (komisi 15-20%), sesekali IG/WA. Ingin tau budget/biaya.',
    offerFit: 'Starter (Promo Rp 2.000.000) / Pro (Promo Rp 3.000.000)',
    notes: '2 unit 2BR villa di Bali. Pemasaran utama Airbnb. Welli mengirimkan penawaran promo (Starter Rp 2jt, Pro Rp 3jt, Premium Rp 6.5jt) yang berlaku sampai 16 Juli 2026. Menanyakan target tamu.',
    score: 8,
    assignedTo: 'Greg',
  },
  {
    businessName: 'Villa Nusa Penida',
    category: 'villa',
    location: 'Nusa Penida',
    whatsapp: '+6281338615078',
    status: 'contacted',
    painPoint: 'Sudah punya website tapi ingin ganti/rebuild karena tidak ada sistem booking langsung & susah muncul di Google.',
    offerFit: 'Redesign & Rebuild dengan Direct Booking + SEO',
    notes: 'Lokasi Nusa Penida. Sudah punya web tapi mau ganti karena tidak ada booking langsung & susah di Google. Menanyakan biaya & mengajukan pertemuan singkat. Welli setuju.',
    score: 8,
    assignedTo: 'Greg',
  }
];

async function insertLeads() {
  console.log(`Starting insertion of ${newLeads.length} leads...`);
  for (const client of newLeads) {
    try {
      console.log(`\nInserting: ${client.businessName}...`);
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${agentToken}`,
        },
        body: JSON.stringify(client),
      });

      const result = await response.json();
      if (response.ok) {
        if (result.duplicate) {
          console.log(`⚠️ Duplicate detected: ${result.message} (Type: ${result.duplicateType}, ID: ${result.prospectId})`);
        } else {
          console.log(`✅ Success! Inserted Lead ID: ${result.data?.id}`);
          if (result.warning) {
            console.log(`   Warning: ${result.warning}`);
          }
        }
      } else {
        console.error(`❌ Failed to insert ${client.businessName}. Status: ${response.status}`, result);
      }
    } catch (error: any) {
      console.error(`❌ Network error inserting ${client.businessName}:`, error.message);
    }
  }
}

insertLeads().catch(console.error);
