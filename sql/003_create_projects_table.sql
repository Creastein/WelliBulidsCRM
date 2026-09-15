-- 003_create_projects_table.sql
-- Table for dynamic Completed Projects & Invoices in WelliBuilds CRM

CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    row_code TEXT,
    name TEXT NOT NULL,
    domain TEXT,
    url TEXT,
    client_name TEXT,
    client_contact TEXT,
    location TEXT,
    category TEXT DEFAULT 'Villa',
    price BIGINT DEFAULT 0,
    invoice_date TEXT,
    invoice_number TEXT,
    package_type TEXT,
    description TEXT,
    features TEXT[] DEFAULT '{}',
    addons JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous read & write access for CRM client
CREATE POLICY "Allow public read on projects" ON public.projects
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on projects" ON public.projects
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on projects" ON public.projects
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on projects" ON public.projects
    FOR DELETE USING (true);

-- Insert initial 11 completed projects if table is empty
INSERT INTO public.projects (id, row_code, name, domain, url, client_name, location, category, price, invoice_date, invoice_number, package_type, description, features, notes)
VALUES
('proj-1', '01', 'Dea Haven Villas', 'deahavenvillas.com', 'https://deahavenvillas.com', 'Bapak Andi Irfan Jaya', 'Bali', 'Villa', 2000000, '6 Sep 2026', 'WLB/INV/2026/09-DH', 'Paket Standar (Promo)', 'Website villa 1 halaman dengan direct booking WhatsApp, performa cepat, dan bilingual ID + EN.', ARRAY['1 Halaman Responsif', 'Direct Booking WA', 'Domain & Hosting', 'SEO Dasar', 'Bilingual ID + EN'], 'Total Rp 2.000.000 (Lunas).'),
('proj-2', '02', 'Jumbo Gerupuk Surf Lessons', 'surfjumbo.com', 'https://surfjumbo.com', 'Pak Jumbo', 'Gerupuk, Lombok', 'Tour & Activity', 2000000, '25 Agu 2026', 'WLB/INV/2026/0825-JG', 'Website Surfing (Wisman)', 'Landing page full English untuk instruktur surfing lokal dengan katalog surf lesson, boat ride, & rental.', ARRAY['Landing Page Full English', 'Katalog Layanan', 'Domain .com', 'Hosting', 'Google Business Profile'], 'Total deal Rp 2.000.000 (Lunas).'),
('proj-3', '03', 'Homy Home Bali Tour', 'homyhomebalitour.com', 'https://homyhomebalitour.com', 'Wayan Sudarma (Owner)', 'Bali', 'Tour & Activity', 1500000, '10 Agu 2026', 'WLB/INV/2026/0810-HH', 'Website Tour Driver Bali', 'Landing page driver wisata Bali dengan katalog paket tour, sewa mobil, dan integrasi WhatsApp booking.', ARRAY['Katalog Paket Tour', 'Galeri Destinasi', 'Kalkulator Sewa Mobil', 'Direct WhatsApp', 'Multibahasa EN/ID'], 'Total deal Rp 1.500.000 (Lunas).'),
('proj-4', '04', 'Benoa Snorkeling Tour', 'benoasnorkeling.com', 'https://benoasnorkeling.com', 'Pak Ketut', 'Tanjung Benoa, Bali', 'Tour & Activity', 2000000, '1 Agu 2026', 'WLB/INV/2026/0801-BS', 'Website Water Sport Bali', 'Landing page water sport Tanjung Benoa dengan katalog paket snorkeling, sea walker, dan direct booking.', ARRAY['Paket Watersport', 'Direct WhatsApp Booking', 'Domain .com', 'Hosting Cepat', 'SEO Google Maps'], 'Total deal Rp 2.000.000 (Lunas).'),
('proj-5', '05', 'Blue Lagoon Snorkeling Padangbai', 'bluelagoonsnorkelingpadangbai.com', 'https://bluelagoonsnorkelingpadangbai.com', 'Pak Komang', 'Padangbai, Bali', 'Tour & Activity', 2000000, '20 Jul 2026', 'WLB/INV/2026/0720-BL', 'Website Snorkeling Padangbai', 'Landing page snorkeling Blue Lagoon & Tanjung Jepun dengan pricelist, fasilitas, dan direct booking.', ARRAY['Pricelist Paket Snorkeling', 'Direct WA Booking', 'Domain .com', 'Fast Hosting', 'Integrasi Google Maps'], 'Total deal Rp 2.000.000 (Lunas).'),
('proj-6', '06', 'Manta Snorkeling Nusa Penida', 'mantasnorkelingnusapenida.com', 'https://mantasnorkelingnusapenida.com', 'Pak Made', 'Nusa Penida, Bali', 'Tour & Activity', 2000000, '15 Jul 2026', 'WLB/INV/2026/0715-MN', 'Website Tour Nusa Penida', 'Landing page spesialis tour snorkeling Manta Bay & Crystal Bay dengan integrasi WhatsApp langsung.', ARRAY['Katalog 4 Spot Snorkeling', 'Pricelist Transparan', 'Domain .com', 'Hosting', 'Mobile Optimized'], 'Total deal Rp 2.000.000 (Lunas).'),
('proj-7', '07', 'Rumah Cantik Guest House Jogja', 'rumahcantikguesthouse.com', 'https://rumahcantikguesthouse.com', 'Ibu Ratna', 'Yogyakarta', 'Homestay & Kos', 1550000, '9 Jul 2026', 'WLB/INV/2026/0709-RC', 'Paket Standard Promo', 'Website profil guest house dengan showcase kamar, fasilitas, Google Maps, dan reservasi WA.', ARRAY['Landing Page Modern', 'Galeri Foto Kamar', 'Tombol WhatsApp', 'Domain & Hosting', 'Google Maps'], 'Total Rp 1.550.000 (Lunas).'),
('proj-8', '08', 'Grha Vege Jawi Syariah', 'grhavegejawi.com', 'https://grhavegejawi.com', 'Ibu Agnes', 'Yogyakarta', 'Homestay & Kos', 2000000, '4 Sep 2026', 'WB/2026/09-AGNESIA', 'Paket Kos Eksklusif', 'Website kos eksklusif syariah 6 kamar AC di Jogja dengan galeri fasilitas dan kontak WA pengelola.', ARRAY['Website 1 Halaman', 'Galeri Foto Fasilitas', 'WhatsApp Booking', 'Domain & Hosting', 'Google Maps'], 'Total Rp 2.000.000 (Lunas).'),
('proj-9', '09', 'Floating Paradise Karimunjawa', 'floatingparadise.id', 'https://floatingparadise.id', 'Management Floating Paradise', 'Karimunjawa, Jateng', 'Resort & Bungalow', 5750000, '2026', 'WLB/INV/2026/06-FP', 'Next.js + Sanity Headless CMS', 'Migrasi WordPress ke Next.js modern, Sanity CMS 6 halaman, dan integrasi engine Tripla booking.', ARRAY['Next.js + Sanity CMS', '6 Halaman Arsitektur', 'Kelola Konten Mandiri', 'Tripla Booking Engine', 'Advanced SEO'], 'Total Rp 5.750.000 (Lunas).'),
('proj-10', '10', 'The Secret Karimunjawa', 'thesecretkarimunjawa.com', 'https://thesecretkarimunjawa.com', 'The Secret Team', 'Karimunjawa, Jateng', 'Villa', 4250000, '19 Mar 2026', 'INV-2026-002', 'Custom 11 Section + 4 Bahasa', 'Website villa overwater sunset di Karimunjawa dengan desain custom, Google Analytics 4, dan 4 bahasa.', ARRAY['Custom 11 Section', 'Hosting Vercel & Domain', 'Direct Booking WA', 'Google Analytics 4', '4 Bahasa Ekstra'], 'Total Rp 4.250.000 (Lunas).'),
('proj-11', '11', 'Green Paddy Hostel Ubud', 'greenpaddyhostelubud.com', 'https://www.greenpaddyhostelubud.com', 'Green Paddy Hostel', 'Ubud, Bali', 'Website Optimization', 350000, '23 Agu 2026', 'WB/2026/08-GREENPADDY', 'PageSpeed & CWV Optimization', 'Optimasi performa WordPress Green Paddy Hostel Ubud untuk skor Core Web Vitals dan loading kilat.', ARRAY['Caching Server', 'Optimasi WebP', 'CSS/JS Defer Minify', 'Skor Desktop 90+'], 'Total Rp 350.000 (Lunas).')
ON CONFLICT (id) DO NOTHING;
