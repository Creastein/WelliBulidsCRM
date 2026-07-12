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

const newClients: ClientPayload[] = [
  {
    businessName: 'Villa +62 821-9008-6501',
    category: 'villa',
    location: '',
    whatsapp: '+6282190086501',
    status: 'new',
    painPoint: 'Tertarik dengan website booking langsung',
    offerFit: 'Website booking langsung',
    notes: 'Halo, ini soal website villa saya. Lokasi belum diketahui (Welli sudah tanya Bali, Lombok, atau Labuan Bajo tapi belum ada respon).',
    score: 5,
    assignedTo: 'Greg',
  },
  {
    businessName: 'Villa Tantri',
    category: 'villa',
    location: 'Bali',
    whatsapp: '+6281805566799',
    status: 'qualified',
    painPoint: 'Booking saat ini hanya lewat WA langsung, belum punya website booking sendiri.',
    offerFit: 'Website booking langsung',
    notes: 'Villa Tantri Bali (2 lantai, view laut & airport, kolam renang). Booking saat ini lewat WA langsung. Welli sudah tawarkan GMeet untuk detail promo/kebutuhan, menunggu respon.',
    score: 8,
    assignedTo: 'Greg',
  },
  {
    businessName: 'Villa Andreas',
    name: 'Andreas',
    category: 'villa',
    location: 'Magelang',
    whatsapp: '+628112954884',
    status: 'contacted',
    painPoint: 'Belum memiliki website.',
    offerFit: 'Promo website booking langsung (Pro Booking)',
    notes: 'Nama kontak: Andreas. Lokasi: Magelang. Belum ada website. Tertarik tapi tergantung biaya. Welli tawarkan promo & jadwalkan GMeet. GMeet dijadwalkan hari Sabtu, 11 Juli pukul 15.15 - 15.45 WIB setelah diundur 15 menit. Link GMeet: https://meet.google.com/oxk-sqcm-vfy',
    score: 8,
    assignedTo: 'Greg',
  },
  {
    businessName: 'Sunrise Homestay',
    category: 'homestay',
    location: 'Sabang',
    whatsapp: '+6282363131337',
    status: 'contacted',
    painPoint: 'Memiliki 3 kamar, target tamu lokal dan turis. Booking saat ini masih lewat WA manual.',
    offerFit: 'Website booking langsung (Pro Booking)',
    notes: 'Sunrise Homestay, Sabang (3 kamar). Target tamu lokal & turis. Booking masih via WA. GMeet dijadwalkan Sabtu malam jam 22.00 WIB.',
    score: 7,
    assignedTo: 'Greg',
  },
  {
    businessName: 'Resto +62 812-8244-1174',
    category: 'restoran-cafe',
    location: '',
    whatsapp: '+6281282441174',
    status: 'new',
    painPoint: 'Mencari pembuatan website restoran.',
    notes: 'Halo, ini soal website resto saya. Welli menawarkan detail untuk info lokasi & kebutuhan (reservasi meja, menu digital, branding/SEO), belum direspon.',
    score: 5,
    assignedTo: 'Greg',
  },
  {
    businessName: 'Villa +62 817-4855-517',
    category: 'villa',
    location: '',
    whatsapp: '+628174855517',
    status: 'qualified',
    painPoint: 'Ada unit yang sedang dibuat dari nol dan ada yang sudah jalan lewat OTA. Menanyakan harga website untuk direct booking & ketersediaan fitur calendar availability.',
    offerFit: 'Premium Booking (dengan Calendar Availability)',
    notes: 'Ada unit dibuat dari nol & ada yang sudah jalan lewat OTA. Menanyakan harga website direct booking & Calendar Availability. Welli tawarkan GMeet, client akan infokan jadwal setelah diskusi internal.',
    score: 8,
    assignedTo: 'Greg',
  },
  {
    businessName: 'Villa Ubud Bali',
    category: 'villa',
    location: 'Ubud, Bali',
    whatsapp: '+6281296244300',
    status: 'new',
    painPoint: 'Dulu pernah punya website tapi sudah tidak aktif.',
    offerFit: 'Website booking langsung',
    notes: 'Villa Ubud Bali. Pernah punya website tapi tidak aktif lagi. Welli menanyakan alasannya (apakah hosting expired atau kurang efektif), belum ada respon.',
    score: 6,
    assignedTo: 'Greg',
  },
  {
    businessName: 'Villa +62 812-1050-324',
    category: 'villa',
    location: '',
    whatsapp: '+628121050324',
    status: 'new',
    painPoint: 'Sudah ada website. Menanyakan keunggulan web Welli & pengaruhnya terhadap okupansi.',
    notes: 'Sudah ada website. Menanyakan keunggulan web Welli & apakah bisa meningkatkan okupansi. Welli menjelaskan direct booking tanpa komisi OTA & data tamu sebagai aset, serta pengaruh SEO. Belum ada respon.',
    score: 6,
    assignedTo: 'Greg',
  },
  {
    businessName: 'Villa Dinar',
    category: 'villa',
    location: 'Vila Istana Bunga, Lembang, Bandung',
    website: 'https://www.villadinar.com',
    whatsapp: '+6281353539955',
    status: 'new',
    painPoint: 'Sudah punya website www.villadinar.com.',
    notes: 'Villa Dinar, Vila Istana Bunga, Lembang, Bandung. Punya website www.villadinar.com. Welli menanyakan apa yang bisa dibantu/kendala website, belum direspon.',
    score: 6,
    assignedTo: 'Greg',
  },
  {
    businessName: 'Guesthouse Labuan Bajo (Calon Client)',
    name: 'Calon Client website Labuan Bajo',
    category: 'homestay',
    location: 'Labuan Bajo',
    status: 'qualified',
    painPoint: 'Rencana buka penginapan 18 kamar 3 lantai (operasional awal 6 kamar) di gang buntu tapi dekat ke mana-mana. Belum punya IMB (sedang diurus). Bangunan diserahkan Desember 2026.',
    offerFit: 'Website booking langsung (Guesthouse)',
    notes: 'Calon Client Labuan Bajo. Bangunan 18 kamar 3 lantai (awal pakai 6 kamar). Target bule, perkiraan harga Rp 299rb/kamar. View lantai 3 bagus, udara bersih & segar. IMB sedang diproses. Bangunan baru balik kelola Desember 2026. Hubungi lagi jika sudah siap.',
    score: 8,
    assignedTo: 'Greg',
  }
];

async function insertClients() {
  console.log(`Starting insertion of ${newClients.length} clients...`);
  for (const client of newClients) {
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

insertClients().catch(console.error);
