import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  verifyAgentAuth,
  getSupabaseClient,
  serializeLead,
  deserializeLead,
  ApiLead,
} from '../_utils/agentHelpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 1. Authenticate Request
    if (!verifyAgentAuth(req)) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const supabase = getSupabaseClient();

    // Check existing leads to prevent duplicate inserts
    const { data: existingDbLeads, error: fetchError } = await supabase
      .from('leads')
      .select('name');

    if (fetchError) {
      return res.status(500).json({ success: false, message: 'Failed to fetch existing leads', error: fetchError.message });
    }

    const existingNames = new Set((existingDbLeads || []).map(l => l.name.toLowerCase().trim()));

    // Seed mock data
    const mockLeads: Partial<ApiLead>[] = [
      {
        name: 'Villa Kayu Homestay',
        businessName: 'Villa Kayu Homestay',
        category: 'homestay',
        location: 'Ubud, Gianyar, Bali',
        instagram: 'https://instagram.com/villakayubali',
        website: 'https://villakayubali.com',
        whatsapp: '+6281234567890',
        email: 'hello@villakayubali.com',
        source: 'seed',
        painPoint: 'No direct booking website, slow response on Instagram DMs.',
        offerFit: 'Modern direct booking website with WhatsApp integration and guest rooms gallery.',
        score: 8,
        status: 'new',
        notes: 'Cozy traditional homestay in Ubud. Very high potential for direct bookings if they have a dedicated website instead of relying purely on OTA.',
        estimatedValue: 3500000,
        assignedTo: 'Adrian',
        draftStatus: 'new',
        auditStatus: 'new',
        proposalStatus: 'new',
        accStatus: 'new',
        followUpCount: 0,
      },
      {
        name: 'Sunrise Oceanside Villa',
        businessName: 'Sunrise Oceanside Villa',
        category: 'villa',
        location: 'Nusa Penida, Klungkung, Bali',
        instagram: 'https://instagram.com/sunriseoceannusa',
        website: '',
        whatsapp: '+6281987654321',
        email: 'info@sunriseoceannusa.com',
        source: 'seed',
        painPoint: 'No official digital footprint besides Google Maps, no website.',
        offerFit: 'Luxury villa landing page with rooms presentation, sunset gallery, and WhatsApp direct CTA.',
        score: 9,
        status: 'qualified',
        notes: 'Stunning seaside view, high ratings on Google Maps but no official website. Perfect match for a direct booking landing page!',
        estimatedValue: 4500000,
        assignedTo: 'Greg',
        draftStatus: 'new',
        auditStatus: 'new',
        proposalStatus: 'new',
        accStatus: 'new',
        followUpCount: 0,
      },
      {
        name: 'Uluwatu Sunset Homestay',
        businessName: 'Uluwatu Sunset Homestay',
        category: 'homestay',
        location: 'Uluwatu, Badung, Bali',
        instagram: 'https://instagram.com/uluwatusunset',
        website: 'https://uluwatusunset.com',
        whatsapp: '+6281357924680',
        email: 'contact@uluwatusunset.com',
        source: 'seed',
        painPoint: 'Website is currently broken / 404, layout is outdated and not mobile-responsive.',
        offerFit: 'Responsive mobile-first website redesign focusing on local SEO and booking speed.',
        score: 7,
        status: 'contacted',
        notes: 'They already have a domain and brand but the site is broken and looks unprofessional. Ideal redesign candidate.',
        estimatedValue: 3000000,
        assignedTo: 'Rio',
        draftStatus: 'new',
        auditStatus: 'new',
        proposalStatus: 'new',
        accStatus: 'new',
        followUpCount: 1,
      },
      {
        name: 'Warung Ibu Budi',
        businessName: 'Warung Ibu Budi',
        category: 'toko-online',
        location: 'Denpasar, Bali',
        instagram: 'https://instagram.com/warungibubudi',
        website: '',
        whatsapp: '+6281224466880',
        email: 'warungibubudi@gmail.com',
        source: 'seed',
        painPoint: 'Relying 100% on GrabFood/GoFood with high commission cuts. Wants a direct digital presence.',
        offerFit: 'Online shop / landing page with direct WhatsApp ordering and digital menu catalog.',
        score: 8,
        status: 'new',
        notes: 'Popular local culinary business with high daily volume. Wants a direct menu system to escape 20% commission cuts.',
        estimatedValue: 2500000,
        assignedTo: 'Niko',
        draftStatus: 'new',
        auditStatus: 'new',
        proposalStatus: 'new',
        accStatus: 'new',
        followUpCount: 0,
      },
    ];

    const insertedIds: number[] = [];
    const skippedNames: string[] = [];

    for (const lead of mockLeads) {
      if (existingNames.has((lead.name || '').toLowerCase().trim())) {
        skippedNames.push(lead.name || '');
        continue;
      }

      const { dbRow } = serializeLead(lead, lead.notes);

      // Extra columns not part of ApiLead shape
      dbRow.address         = lead.location ?? null;
      dbRow.google_maps_url = `https://maps.google.com/?q=${encodeURIComponent(lead.name || '')}`;
      dbRow.rating          = 4.5;
      dbRow.review_count    = 24;
      dbRow.website_status  = lead.website ? 'outdated' : 'no_website';
      dbRow.created_by      = (lead.assignedTo || 'seed').toLowerCase();
      dbRow.priority        = 'Medium';
      dbRow.created_at      = new Date().toISOString();

      const { data: insertedData, error: insertError } = await supabase
        .from('leads')
        .insert([dbRow])
        .select('id')
        .single();

      if (insertError) {
        console.error('Failed to seed lead:', lead.name, insertError.message);
      } else if (insertedData) {
        insertedIds.push(insertedData.id);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Seeding finished',
      insertedCount: insertedIds.length,
      insertedIds,
      skippedCount: skippedNames.length,
      skippedNames,
    });
  } catch (error: any) {
    console.error('Seeding Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
}
