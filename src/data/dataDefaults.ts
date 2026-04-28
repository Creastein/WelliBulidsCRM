/**
 * Centralized default data for the WelliBuilds dashboard.
 * These values are used as initial/fallback data when localStorage is empty.
 * All components import from here instead of hardcoding data.
 */

// ============================================================
// TYPES
// ============================================================

export interface NicheCategory {
    id: string;
    label: string;
    iconName: string;
}

export interface Lead {
    id: number;
    name: string;
    niche: string;
    location: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Belum Dihubungi' | 'Dihubungi' | 'Follow Up' | 'Negosiasi' | 'Deal' | 'Ditolak';
    action: string;
    notes: string;
    follow_up_date?: string | null;
}

export const DEFAULT_NICHES: NicheCategory[] = [
    // --- Akomodasi & Hospitality ---
    { id: 'villa', label: 'Villa', iconName: 'Building2' },
    { id: 'hotel-resort', label: 'Hotel & Resort', iconName: 'Hotel' },
    { id: 'homestay', label: 'Homestay / Guest House', iconName: 'Home' },
    { id: 'glamping-camping', label: 'Glamping & Camping', iconName: 'TreePine' },
    { id: 'coworking', label: 'Coworking Space', iconName: 'Laptop' },

    // --- Wisata & Aktivitas Outdoor ---
    { id: 'snorkeling-diving', label: 'Snorkeling & Diving Center', iconName: 'Fish' },
    { id: 'water-sport', label: 'Water Sport & Aktivitas Air', iconName: 'Waves' },
    { id: 'surf', label: 'Surf School / Surf Camp', iconName: 'Sailboat' },
    { id: 'rafting-adventure', label: 'Rafting & Adventure', iconName: 'Mountain' },
    { id: 'boat-charter', label: 'Sewa Perahu / Boat Charter', iconName: 'Ship' },
    { id: 'travel-tour', label: 'Travel & Tour Lokal', iconName: 'Plane' },

    // --- F&B (Makanan & Minuman) ---
    { id: 'restoran-cafe', label: 'Restoran & Cafe', iconName: 'UtensilsCrossed' },
    { id: 'coffee-shop', label: 'Coffee Shop', iconName: 'Coffee' },
    { id: 'catering', label: 'Catering & Katering', iconName: 'ChefHat' },
    { id: 'bakery-pastry', label: 'Bakery & Pastry', iconName: 'CakeSlice' },

    // --- Spa, Wellness & Kecantikan ---
    { id: 'spa-massage', label: 'Spa & Massage', iconName: 'Flower2' },
    { id: 'yoga-retreat', label: 'Yoga Studio / Retreat', iconName: 'HeartPulse' },
    { id: 'salon-barbershop', label: 'Salon & Barbershop', iconName: 'Scissors' },
    { id: 'klinik-kecantikan', label: 'Klinik Kecantikan / Aesthetic', iconName: 'Syringe' },
    { id: 'gym-fitness', label: 'Gym & Fitness', iconName: 'Dumbbell' },

    // --- Jasa Kreatif & Media ---
    { id: 'fotografer-videografer', label: 'Fotografer & Videografer', iconName: 'Camera' },
    { id: 'digital-marketing', label: 'Digital Marketing Agency', iconName: 'Megaphone' },
    { id: 'percetakan-branding', label: 'Percetakan & Branding', iconName: 'Printer' },
    { id: 'interior-design', label: 'Interior Design & Dekorasi', iconName: 'Palette' },

    // --- Properti & Konstruksi ---
    { id: 'agen-properti', label: 'Agen Properti / Real Estate', iconName: 'Building' },
    { id: 'kontraktor-renovasi', label: 'Kontraktor & Renovasi', iconName: 'Hammer' },
    { id: 'arsitek', label: 'Arsitek', iconName: 'Ruler' },
    { id: 'toko-bangunan', label: 'Toko Bangunan & Material', iconName: 'Warehouse' },

    // --- Pendidikan & Kursus ---
    { id: 'kursus-bahasa', label: 'Kursus Bahasa / Les Privat', iconName: 'BookOpen' },
    { id: 'sekolah-musik', label: 'Sekolah Musik / Seni', iconName: 'Music' },

    // --- Hewan & Pet ---
    { id: 'pet-shop', label: 'Pet Shop & Grooming', iconName: 'PawPrint' },
    { id: 'klinik-hewan', label: 'Klinik Hewan', iconName: 'Heart' },

    // --- Jasa & Layanan Lainnya ---
    { id: 'rental-mobil', label: 'Rental Mobil', iconName: 'CarFront' },
    { id: 'laundry', label: 'Laundry', iconName: 'Shirt' },
    { id: 'klinik', label: 'Klinik / Dokter Praktek', iconName: 'Stethoscope' },
    { id: 'event-organizer', label: 'Event Organizer', iconName: 'Tent' },
    { id: 'wedding-vendor', label: 'Wedding Vendor', iconName: 'Gem' },
    { id: 'toko-online', label: 'Toko Online / UMKM', iconName: 'Store' },
    { id: 'cleaning', label: 'Jasa Kebersihan / Cleaning', iconName: 'Sparkles' },
    { id: 'bengkel', label: 'Bengkel & Servis Kendaraan', iconName: 'Wrench' },
    { id: 'ekspedisi', label: 'Jasa Pengiriman / Ekspedisi', iconName: 'Truck' },
    { id: 'notaris', label: 'Notaris & Konsultan Hukum', iconName: 'Scale' },
    { id: 'akuntansi-pajak', label: 'Akuntansi & Konsultan Pajak', iconName: 'Calculator' },
    { id: 'fashion-boutique', label: 'Fashion & Boutique', iconName: 'ShoppingBag' },
    { id: 'florist', label: 'Toko Bunga / Florist', iconName: 'Flower' },
];

export interface KpiItem {
    title: string;
    key: string;
    value: number;
    target: number;
    targetLabel: string;
    iconName: string;
    color: string;
    bg: string;
}

export interface PipelineItem {
    status: string;
    statusKey: string;
    action: string;
    color: string;
}

export interface ProgressData {
    target: number;
    current: number;
    clientsNeeded: number;
    targetDate: string;
    avgDealValue: number;
}

export interface ScheduleItem {
    time: string;
    activity: string;
    category: string;
    output: string;
    duration: string;
}

export interface Milestone {
    id: number;
    title: string;
    target: number;
    targetLabel: string;
    condition: string;
    action: string;
}

export interface WeeklyReview {
    week: number;
    dm: number;
    reply: number;
    closing: number;
    revenue: number;
    notes: string;
}

// ============================================================
// DEFAULT DATA
// ============================================================

export const DEFAULT_LEADS: Lead[] = [];

export const DEFAULT_KPI: KpiItem[] = [
    {
        title: 'Total DM Terkirim',
        key: 'dm_sent',
        value: 37,
        target: 800,
        targetLabel: 'Target: 800 dalam 20 hari',
        iconName: 'MessageSquare',
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
    },
    {
        title: 'Total Reply',
        key: 'total_reply',
        value: 2,
        target: 48,
        targetLabel: 'Target: ~48 reply (6%)',
        iconName: 'Reply',
        color: 'text-purple-400',
        bg: 'bg-purple-400/10',
    },
    {
        title: 'Closing / Deal',
        key: 'closing',
        value: 0,
        target: 5,
        targetLabel: 'Target: 3–5 klien',
        iconName: 'Handshake',
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10',
    },
    {
        title: 'Revenue Masuk',
        key: 'revenue',
        value: 0,
        target: 10000000,
        targetLabel: 'Target: Rp 10.000.000',
        iconName: 'DollarSign',
        color: 'text-orange-400',
        bg: 'bg-orange-400/10',
    },
];

export const DEFAULT_PIPELINE: PipelineItem[] = [
    { status: '🔁 Follow Up', statusKey: 'Follow Up', action: 'Kirim WA follow up', color: '#3b82f6' },
    { status: '🔇 Tidak Respon', statusKey: 'Tidak Respon', action: 'Follow up 7 hari lagi', color: '#6b7280' },
    { status: '📨 Sudah Dihubungi', statusKey: 'Dihubungi', action: 'Pantau & follow up', color: '#8b5cf6' },
    { status: '📤 Belum Dihubungi', statusKey: 'Belum Dihubungi', action: 'Kirim DM sekarang', color: '#f59e0b' },
    { status: '💬 Negosiasi', statusKey: 'Negosiasi', action: 'Kirim proposal + closing', color: '#ec4899' },
    { status: '✅ Deal / Closing', statusKey: 'Deal', action: 'Kerjakan project', color: '#10b981' },
    { status: '❌ Ditolak', statusKey: 'Ditolak', action: 'Archive, lanjut ke lead baru', color: '#ef4444' },
];

export const DEFAULT_PROGRESS: ProgressData = {
    target: 10000000,
    current: 0,
    clientsNeeded: 4,
    targetDate: '2026-04-26T00:00:00+07:00', // 2 bulan dari ~26 Feb 2026
    avgDealValue: 2500000,
};

export const DEFAULT_SCHEDULE: ScheduleItem[] = [
    { time: '08:00–10:30', activity: '🔍 OUTREACH SPRINT — Scraping GMaps + Kirim 40-50 DM', category: 'Tier 1 Revenue', output: '50 DM terkirim + dicatat di tracker', duration: '2.5 jam' },
    { time: '10:30–12:00', activity: '🔁 FOLLOW UP — Cek reply, negosiasi, kirim proposal', category: 'Tier 1 Revenue', output: '0 lead tanpa follow up > 3 hari', duration: '1.5 jam' },
    { time: '12:00–13:30', activity: '🍽️ Break — Makan + Istirahat', category: 'Maintenance', output: 'Tidur siang 20 mnt jika bisa', duration: '1.5 jam' },
    { time: '13:30–16:00', activity: '💻 BUILD — Kerjakan project klien / buat demo website', category: 'Tier 1/2', output: 'Progress project terdokumentasi', duration: '2.5 jam' },
    { time: '16:00–17:00', activity: '🏋️ Olahraga — 30–45 mnt (lari/bodyweight)', category: 'Maintenance', output: 'Wajib, cognitive reset sebelum malam', duration: '1 jam' },
    { time: '19:00–19:30', activity: '🎬 TikTok — 1 video (before/after website atau tips)', category: 'Tier 2 Brand', output: '1 video published atau draft selesai', duration: '30 mnt' },
    { time: '21:00–21:10', activity: '📊 Review — Cek saham 5 mnt + prep leads besok', category: 'Maintenance', output: 'List 50 leads siap untuk besok', duration: '10 mnt' },
    { time: '22:00', activity: '🔴 SHUTDOWN — Matikan layar, tidur', category: 'Server Maint.', output: 'Tidur 7–8 jam WAJIB', duration: '—' },
];

export const DEFAULT_MILESTONES: Milestone[] = [
    { id: 1, title: 'Milestone 1', target: 2500000, targetLabel: 'Rp 2.500.000', condition: 'Klien pertama closing', action: 'Validasi sistem outreach' },
    { id: 2, title: 'Milestone 2', target: 5000000, targetLabel: 'Rp 5.000.000', condition: '2 klien closing', action: "Mulai buat konten TikTok 'first client'" },
    { id: 3, title: 'Milestone 3', target: 7500000, targetLabel: 'Rp 7.500.000', condition: '3 klien closing', action: 'Naikkan harga paket 20%' },
    { id: 4, title: 'Milestone 4', target: 10000000, targetLabel: 'Rp 10.000.000', condition: 'TARGET TERCAPAI 🎯', action: 'Evaluate & scale up sistem' },
];

export const DEFAULT_WEEKLY_REVIEWS: WeeklyReview[] = [
    { week: 1, dm: 37, reply: 2, closing: 0, revenue: 0, notes: 'Target: 200 DM, 1 reply per 15 DM' },
    { week: 2, dm: 0, reply: 0, closing: 0, revenue: 0, notes: 'Target: follow up semua yang reply' },
    { week: 3, dm: 0, reply: 0, closing: 0, revenue: 0, notes: 'Target: minimal 1 closing' },
    { week: 4, dm: 0, reply: 0, closing: 0, revenue: 0, notes: 'Target: 2 closing total' },
    { week: 5, dm: 0, reply: 0, closing: 0, revenue: 0, notes: 'Target: scale up DM volume' },
    { week: 6, dm: 0, reply: 0, closing: 0, revenue: 0, notes: 'Target: 3 closing total' },
    { week: 7, dm: 0, reply: 0, closing: 0, revenue: 0, notes: 'Target: optimize conversion' },
    { week: 8, dm: 0, reply: 0, closing: 0, revenue: 0, notes: 'Target: Rp 10.000.000 tercapai!' },
];

// ============================================================
// LOCALSTORAGE KEYS
// ============================================================

export const STORAGE_KEYS = {
    LEADS: 'wellibuilds_leads',
    KPI: 'wellibuilds_kpi',
    PROGRESS: 'wellibuilds_progress',
    WEEKLY_REVIEWS: 'wellibuilds_weekly_reviews',
    LAST_MODIFIED: 'wellibuilds_last_modified',
} as const;
